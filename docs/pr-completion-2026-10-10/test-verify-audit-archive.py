#!/usr/bin/env python3
"""Exercise the actual archive verifier against disposable Git trees."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

verifier = Path(__file__).with_name('verify-audit-archive.py').resolve()
inventory_path = 'docs/pr-completion-2026-10-10/archive-inventory.json'
report_path = 'docs/pr-review-2026-10-10.md'
evidence_path = 'docs/pr-review-2026-10-10/browser.log'
manifest_path = 'docs/pr-review-2026-10-10/evidence-sha256.json'
original_files = {
    report_path: f'[evidence](pr-review-2026-10-10/browser.log)\n'.encode(),
    evidence_path: b'Original captured evidence\r\n',
    manifest_path: json.dumps({'browser.log': hashlib.sha256(b'Original captured evidence\r\n').hexdigest()}).encode(),
    'docs/pr-completion-2026-10-10.md': f'[review](pr-review-2026-10-10.md)\n'.encode(),
}

def run_git(repo, *args):
    return subprocess.check_output(['git', *args], cwd=repo, stderr=subprocess.PIPE).decode().strip()

results = []
with tempfile.TemporaryDirectory(prefix='cipher-archive-verifier-') as temporary:
    repo = Path(temporary)
    run_git(repo, 'init', '-q')
    run_git(repo, 'config', 'core.autocrlf', 'false')
    for case in ('valid', 'corrupt-evidence', 'corrupt-manifest-target', 'broken-link', 'missing-blob'):
        files = dict(original_files)
        inventory = {name: hashlib.sha256(data).hexdigest() for name, data in files.items() if name != 'docs/pr-completion-2026-10-10.md'}
        if case in ('corrupt-evidence', 'corrupt-manifest-target'):
            files[evidence_path] = b'Corrupted evidence\n'
            if case == 'corrupt-manifest-target':
                inventory[evidence_path] = hashlib.sha256(files[evidence_path]).hexdigest()
        elif case == 'broken-link':
            files[report_path] = b'[missing evidence](missing.log)\n'
            inventory[report_path] = hashlib.sha256(files[report_path]).hexdigest()
        elif case == 'missing-blob':
            del files[evidence_path]
        for name in original_files:
            path = repo / name
            if path.exists():
                path.unlink()
        for name, data in files.items():
            path = repo / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        (repo / inventory_path).parent.mkdir(parents=True, exist_ok=True)
        (repo / inventory_path).write_text(json.dumps(inventory))
        run_git(repo, 'add', '-A')
        tree = run_git(repo, 'write-tree')
        expected_message = {
            'valid': None,
            'corrupt-evidence': 'Archived bytes changed:',
            'corrupt-manifest-target': f'{manifest_path}: {evidence_path}',
            'broken-link': 'Broken report link:',
            'missing-blob': 'Invalid archived blob:',
        }[case]
        for optimization in ('0', '1'):
            environment = dict(os.environ, PYTHONOPTIMIZE=optimization)
            command = [sys.executable, str(verifier), '--repo', str(repo), '--ref', tree]
            result = subprocess.run(command, env=environment, capture_output=True, text=True)
            if case == 'valid':
                passed = result.returncode == 0 and json.loads(result.stdout)['allBytesPreserved'] is True
            else:
                passed = result.returncode != 0 and expected_message in result.stderr and 'allBytesPreserved' not in result.stdout
            if not passed:
                raise RuntimeError(f'{case}, PYTHONOPTIMIZE={optimization}: exit {result.returncode}\n{result.stdout}\n{result.stderr}')
            results.append({'case': case, 'PYTHONOPTIMIZE': optimization, 'exit': result.returncode, 'expectedResultConfirmed': True})
print(json.dumps({'verifier': str(verifier), 'checksPassed': len(results), 'results': results}, indent=2))
