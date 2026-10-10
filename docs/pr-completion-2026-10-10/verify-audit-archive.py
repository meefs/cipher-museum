#!/usr/bin/env python3
"""Verify archived audit bytes, historical hash manifests and report links."""
import argparse, hashlib, json, posixpath, re, subprocess
from pathlib import Path
from urllib.parse import unquote

parser = argparse.ArgumentParser()
parser.add_argument('--repo', type=Path, default=Path.cwd())
parser.add_argument('--ref', help='Read committed/staged Git tree instead of working files')
args = parser.parse_args()
root = args.repo.resolve()

def git(*params, **kwargs):
    return subprocess.check_output(['git', *params], cwd=root, **kwargs)

def require(condition, message):
    if not condition:
        raise ValueError(message)

inventory_path = 'docs/pr-completion-2026-10-10/archive-inventory.json'
read = lambda rel: git('show', f'{args.ref}:{rel}') if args.ref else (root / rel).read_bytes()
inventory = json.loads(read(inventory_path))
if args.ref:
    paths = set(git('ls-tree', '-r', '--name-only', args.ref).decode().splitlines())
    requests = ''.join(f'{args.ref}:{p}\n' for p in inventory).encode()
    result = subprocess.run(['git', 'cat-file', '--batch'], cwd=root, input=requests, capture_output=True, check=True)
    blobs, cursor = {}, 0
    for rel in inventory:
        end = result.stdout.index(b'\n', cursor)
        header = result.stdout[cursor:end].decode().split()
        require(len(header) == 3 and header[1] == 'blob', f'Invalid archived blob: {rel}: {header}')
        size = int(header[2]); cursor = end + 1
        blobs[rel] = result.stdout[cursor:cursor + size]; cursor += size + 1
    require(cursor == len(result.stdout), 'Unexpected bytes after archived blobs')
    read = lambda rel: blobs[rel] if rel in blobs else git('show', f'{args.ref}:{rel}')
else:
    paths = {p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and 'node_modules' not in p.parts}
    blobs = {rel: read(rel) for rel in inventory}

for rel, expected in inventory.items():
    require(hashlib.sha256(blobs[rel]).hexdigest() == expected, f'Archived bytes changed: {rel}')
manifest_checks = []
for rel in inventory:
    if not rel.endswith(('evidence-sha256.json', 'original-review-hashes.json', 'original-audit-hashes.json')):
        continue
    manifest = json.loads(read(rel))
    for name, expected in manifest.items():
        target = name if name.startswith('docs/') else posixpath.join(posixpath.dirname(rel), name)
        require(hashlib.sha256(read(target)).hexdigest() == expected, f'{rel}: {target}')
    manifest_checks.append({'manifest': rel, 'entries': len(manifest)})
links = []
reports = [p for p in inventory if p.endswith('.md')]
reports.append('docs/pr-completion-2026-10-10.md')
for rel in reports:
    for href in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', read(rel).decode()):
        href = href.strip('<>')
        if re.match(r'^[a-zA-Z]+:', href) or href.startswith('//'):
            continue
        local = unquote(href.split('#')[0].split('?')[0])
        target = posixpath.normpath(posixpath.join(posixpath.dirname(rel), local)) if local else rel
        require(target in paths or any(p.startswith(target.rstrip('/') + '/') for p in paths), f'Broken report link: {rel} -> {href}')
        links.append({'report': rel, 'href': href, 'target': target})
print(json.dumps({'ref': args.ref, 'archivedFiles': len(inventory), 'allBytesPreserved': True, 'manifestChecks': manifest_checks, 'localLinks': links}, indent=2))
