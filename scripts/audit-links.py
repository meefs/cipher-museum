#!/usr/bin/env python3
"""Read-only museum link inventory; optional bounded external GET checks.

Local checks cover HTML href/src/srcset, CSS url(), navigation literals in JS,
and link fields in JSON. Dynamic expressions are listed for manual review.
Network results are evidence, not semantic validation: 403/429/challenges and
timeouts are inconclusive; a 200 can still be the wrong book or a soft 404.
Never submits forms or calls action-like URLs. No third-party dependencies.
"""
import argparse
import concurrent.futures
import datetime
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import threading
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', 'tests', 'scripts', 'docs'}
OWN_HOSTS = {'ciphermuseum.com', 'www.ciphermuseum.com'}
URL_RE = re.compile(r'https?://[^\s<>"\x27`\\]+')
LITERAL_RE = re.compile(r'''["']((?:\.\./|\./|/)?[\w./-]+\.html(?:[?#][^"'\s]*)?)["']''')
ACTION_RE = re.compile(r'/(?:logout|signout|delete|remove|unsubscribe|issues/new|pull/new)(?:/|$)|[?&](?:action|do)=(?:delete|remove|logout)', re.I)
CHALLENGE_RE = re.compile(r'Just a moment|Access Denied|Attention Required|Client Challenge|Oh noes!|Making sure you.re not a bot', re.I)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.forms = [], set(), []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('id', 'name' if tag == 'a' else 'id'):
            if attrs.get(key): self.ids.add(attrs[key])
        for key in ('href', 'src', 'poster'):
            if attrs.get(key): self.links.append((attrs[key], self.getpos()[0], tag + ':' + key))
        if attrs.get('srcset'):
            for item in attrs['srcset'].split(','):
                if item.strip(): self.links.append((item.strip().split()[0], self.getpos()[0], tag + ':srcset'))
        if tag == 'form' and attrs.get('action'): self.forms.append(attrs['action'])


def source_files():
    return sorted(p for p in ROOT.rglob('*') if p.is_file()
                  and not set(p.relative_to(ROOT).parts).intersection(SKIP)
                  and p.suffix in {'.html', '.js', '.json', '.jsonl', '.css', '.ts'}
                  and p.name not in {'package.json', 'package-lock.json'}
                  and '.test.' not in p.name)


def inventory():
    files = source_files()
    pages, texts = {}, {}
    for p in files:
        if p.suffix == '.jsonl': continue
        texts[p] = p.read_text(errors='replace')
        if p.suffix == '.html':
            pages[p] = Page()
            pages[p].feed(texts[p])
    refs, seen = [], set()
    def add(p, url, line, kind, base=None):
        url = html.unescape(url).strip()
        key = (str(p), url, kind)
        if not url or key in seen: return
        seen.add(key)
        refs.append({'file': str(p.relative_to(ROOT)), 'line': line, 'url': url, 'kind': kind,
                     'base': str((base or p.parent).relative_to(ROOT))})
    for p, text in texts.items():
        if p in pages:
            for u, line, kind in pages[p].links: add(p, u, line, kind)
        # Include visible citations, inline scripts, JSON-LD, JS and JSON data.
        for m in URL_RE.finditer(text):
            u = m.group().rstrip('.,;')
            if '${' not in u and '{search_term' not in u: u = u.rstrip('}')
            if (str(p), u, 'url-literal') in seen: continue
            add(p, u, text.count('\n', 0, m.start())+1, 'url-literal')
        if p.suffix in {'.html', '.js', '.json', '.ts'}:
            for m in LITERAL_RE.finditer(text):
                # JSON tour hrefs are page-relative; shared JS/search links are root-relative.
                base = p.parent if p.suffix == '.html' or p.parts[-2] == 'tours' or m.group(1).startswith('../') else ROOT
                add(p, m.group(1), text.count('\n', 0, m.start())+1, 'navigation-literal', base)
        if p.suffix == '.css':
            for m in re.finditer(r'url\(\s*["\x27]?([^\s)"\x27]+)', text):
                add(p, m.group(1), text.count('\n', 0, m.start())+1, 'css-url')
    # Published corpus releases are large; stream their citations, retaining only
    # the first occurrence of each destination per file. Never rewrite releases.
    for p in files:
        if p.suffix != '.jsonl': continue
        with p.open(errors='replace') as stream:
            for line_number, line in enumerate(stream, 1):
                for m in URL_RE.finditer(line):
                    u=m.group().rstrip('.,;')
                    if '${' not in u: u=u.rstrip('}')
                    add(p, u, line_number, 'url-literal')
    external, local, skipped = {}, [], []
    for ref in refs:
        u = ref['url']
        if '${' in u or '{search_term' in u or u.endswith('='):
            skipped.append(dict(ref, reason='dynamic-expression')); continue
        parts = urllib.parse.urlsplit(u)
        if parts.scheme not in {'', 'http', 'https'}:
            skipped.append(dict(ref, reason='non-http-scheme')); continue
        if parts.netloc and parts.hostname not in OWN_HOSTS:
            fetch = urllib.parse.urlunsplit((parts.scheme or 'https', parts.netloc, parts.path, parts.query, ''))
            external.setdefault(fetch, []).append(ref)
            continue
        path = urllib.parse.unquote(parts.path)
        if not path:
            target = ROOT / ref['file']
        elif path.startswith('/') or parts.hostname in OWN_HOSTS:
            target = ROOT / path.lstrip('/')
        else:
            target = ROOT / ref['base'] / path
        target = target.resolve()
        if target.is_dir(): target /= 'index.html'
        status = 'ok'
        if not target.is_file(): status = 'missing-target'
        elif parts.fragment and target.suffix == '.html':
            fragment = urllib.parse.unquote(parts.fragment)
            if not fragment.startswith(':~:text='):
                if target not in pages:
                    pg=Page(); pg.feed(target.read_text(errors='replace')); pages[target]=pg
                if fragment not in pages[target].ids: status = 'missing-anchor'
        local.append(dict(ref, resolved=str(target.relative_to(ROOT)) if target.is_relative_to(ROOT) else str(target), status=status))
    return {'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'html_files': len([p for p in files if p.suffix == '.html']),
            'source_files': len(files), 'local': local, 'external': external, 'skipped': skipped,
            'form_actions_not_requested': [{'file':str(p.relative_to(ROOT)), 'actions':pg.forms} for p,pg in pages.items() if pg.forms]}


def classify(result):
    """Normalize new and cached evidence without treating restrictions as rot."""
    if result.get('classification') == 'not-requested-action-url': return result
    result['challenge'] = bool(result.get('challenge') or CHALLENGE_RE.search(result.get('title') or ''))
    code = result.get('status')
    if code in {404, 410}: result['classification'] = 'candidate-broken'
    elif code in {401, 403, 429} or result['challenge']: result['classification'] = 'restricted-inconclusive'
    elif re.search(r'^(?:Site Unavailable|Service Unavailable)', result.get('title') or '', re.I): result['classification'] = 'inconclusive'
    elif code and 200 <= code < 400 and result.get('bytes_read', 1) > 0: result['classification'] = 'retrieved-needs-identity-review'
    else: result['classification'] = 'inconclusive'
    return result


def check_external(inv, prior, workers, timeout):
    hosts = {urllib.parse.urlsplit(u).netloc: threading.Semaphore(2) for u in inv['external']}
    cached = {}
    for filename in prior:
        data = json.loads(Path(filename).read_text())
        for item in (data if isinstance(data,list) else data.get('http',[])):
            if item.get('url'): cached[item['url']] = item
    def check(url):
        if ACTION_RE.search(url): return {'url':url, 'classification':'not-requested-action-url'}
        if url in cached:
            return classify(dict(cached[url], reused_from_prior=True))
        with hosts[urllib.parse.urlsplit(url).netloc]:
            result = {'url':url}
            try:
                req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 (compatible; CipherMuseumLinkAudit/1.0)', 'Accept':'text/html,application/pdf;q=0.9,*/*;q=0.8'})
                with urllib.request.urlopen(req, timeout=timeout) as response:
                    body=response.read(196608)
                    result.update(status=response.status, final=response.geturl(), content_type=response.headers.get('Content-Type',''), bytes_read=len(body))
                    if 'html' in result['content_type']:
                        txt=body.decode('utf-8','replace')
                        title=re.search(r'<title[^>]*>(.*?)</title>',txt,re.I|re.S)
                        result['title']=html.unescape(re.sub('<[^>]+>','',title.group(1))).strip() if title else None
                        result['challenge']=bool(re.search(r'verify that you.re not a robot',txt,re.I))
            except urllib.error.HTTPError as e:
                result.update(status=e.code, final=e.geturl(), error=str(e))
            except Exception as e:
                result.update(error=type(e).__name__+': '+str(e))
            return classify(result)
    output=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for i,result in enumerate(pool.map(check,inv['external']),1):
            output.append(result)
            if i%25==0: print(f'Checked {i}/{len(inv["external"])} external destinations',flush=True)
    return output


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--output', required=True)
    ap.add_argument('--http',action='store_true')
    ap.add_argument('--reuse',action='append',default=[])
    ap.add_argument('--workers',type=int,default=8)
    ap.add_argument('--timeout',type=int,default=15)
    args=ap.parse_args()
    inv=inventory()
    out=Path(args.output); out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(inv,indent=2))
    print(f'{inv["html_files"]} HTML files; {len(inv["local"])} local refs; {len(inv["external"])} external destinations',flush=True)
    if args.http:
        inv['http']=check_external(inv,args.reuse,args.workers,args.timeout)
        out.write_text(json.dumps(inv,indent=2))
    bad=[r for r in inv['local'] if r['status']!='ok']
    print(f'{len(bad)} local candidates need review; evidence: {out}',flush=True)


if __name__=='__main__': main()
