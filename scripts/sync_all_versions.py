#!/usr/bin/env python3
"""
Anything Ecosystem - Universal Version Synchronizer & Bumper
Synchronizes version numbers across all 6 applications in the ecosystem,
including package.json, version.txt, installer templates, UI title bars, and headers.
"""

import os
import sys
import json
import re
from pathlib import Path

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def get_default_version():
    try:
        pkg_path = Path(__file__).resolve().parent.parent / 'package.json'
        if pkg_path.exists():
            with open(pkg_path, 'r', encoding='utf-8') as f:
                return json.load(f).get('version', '26.10.30')
    except Exception:
        pass
    return '26.10.30'

TARGET_VERSION = sys.argv[1] if len(sys.argv) > 1 else get_default_version()

APPS_CONFIG = [
    {
        'id': 'anything',
        'name': 'Anything Master Hub',
        'path': Path(r'C:\Users\Burhanuddin\OneDrive\Desktop\Anything\Anything'),
        'type': 'electron',
        'repo': 'BSFrameWorks5253/Anything',
        'has_own_repo': True
    },
    {
        'id': 'mediaflow-studio',
        'name': 'MediaFlow Studio',
        'path': Path(r'C:\Users\Burhanuddin\OneDrive\Desktop\Anything Apps\MediaFlow-Studio'),
        'type': 'electron',
        'repo': 'BSFrameWorks5253/MediaFlow-Studio',
        'has_own_repo': True
    },
    {
        'id': 'one-tap',
        'name': 'One Tap Workstation',
        'path': Path(r'C:\Users\Burhanuddin\OneDrive\Desktop\Anything Apps\One Tap'),
        'type': 'electron',
        'repo': 'BSFrameWorks5253/onetap-workstation',
        'has_own_repo': True
    },
    {
        'id': 'docuflow-studio',
        'name': 'DocuFlow Studio Pro',
        'path': Path(r'C:\Users\Burhanuddin\OneDrive\Desktop\DocuFlow'),
        'type': 'electron',
        'repo': 'BSFrameWorks5253/DocuFlow-',
        'has_own_repo': True
    },
    {
        'id': 'auto-copier',
        'name': 'Auto Copier Pro',
        'path': Path(r'C:\Users\Burhanuddin\OneDrive\Desktop\Auto Copier'),
        'type': 'electron',
        'repo': '',
        'has_own_repo': False
    },
    {
        'id': 'anything-data-manage',
        'name': 'Anything Data Manage',
        'path': Path(r'C:\Users\Burhanuddin\OneDrive\Desktop\Anything Data Manage'),
        'type': 'python',
        'repo': '',
        'has_own_repo': False
    }
]

def sync_app_version(app: dict, new_version: str) -> dict:
    app_path = app['path']
    app_name = app['name']
    results = {'app': app_name, 'path': str(app_path), 'old_version': '', 'new_version': new_version, 'files_updated': []}

    if not app_path.exists():
        results['error'] = 'Path does not exist'
        return results

    if app['type'] == 'electron':
        pkg_file = app_path / 'package.json'
        if pkg_file.exists():
            try:
                pkg_data = json.loads(pkg_file.read_text(encoding='utf-8'))
                results['old_version'] = pkg_data.get('version', 'unknown')
                pkg_data['version'] = new_version

                # Update artifactName if customized
                if 'build' in pkg_data:
                    build_conf = pkg_data['build']
                    if 'artifactName' in build_conf and isinstance(build_conf['artifactName'], str):
                        # Replace hardcoded versions or variables
                        art = build_conf['artifactName']
                        if not '${version}' in art:
                            build_conf['artifactName'] = re.sub(r'\d+\.\d+(\.\d+)*', new_version, art)
                
                pkg_file.write_text(json.dumps(pkg_data, indent=2), encoding='utf-8')
                results['files_updated'].append('package.json')
            except Exception as e:
                print(f"  [Error] {pkg_file}: {e}")

        # Scan code files in src/ and electron/ for hardcoded versions
        for dir_name in ['src', 'electron']:
            target_sub = app_path / dir_name
            if target_sub.exists():
                for ext in ['*.ts', '*.tsx', '*.js', '*.cjs', '*.html']:
                    for code_file in target_sub.rglob(ext):
                        try:
                            content = code_file.read_text(encoding='utf-8', errors='ignore')
                            # Look for vX.Y.Z or version strings
                            changed = False
                            for old_pattern in [r'v\s*6\.0\.0', r'v\s*1\.0\.0', r'v\s*26\.10\.\d+', r'version\s*:\s*["\'](6\.0\.0|1\.0\.0|26\.10\.\d+)["\']']:
                                if re.search(old_pattern, content):
                                    content = re.sub(r'v\s*(6\.0\.0|1\.0\.0|26\.10\.\d+)', f'v{new_version}', content)
                                    content = re.sub(r'version\s*:\s*["\'](6\.0\.0|1\.0\.0|26\.10\.\d+)["\']', f'version: "{new_version}"', content)
                                    changed = True
                            if changed:
                                code_file.write_text(content, encoding='utf-8')
                                results['files_updated'].append(str(code_file.relative_to(app_path)))
                        except Exception:
                            pass

    elif app['type'] == 'python':
        v_file = app_path / 'version.txt'
        if v_file.exists():
            results['old_version'] = v_file.read_text(encoding='utf-8').strip()
            v_file.write_text(new_version, encoding='utf-8')
            results['files_updated'].append('version.txt')

        # frontend/index.html
        f_html = app_path / 'frontend' / 'index.html'
        if f_html.exists():
            c = f_html.read_text(encoding='utf-8', errors='ignore')
            c = re.sub(r'v\s*\d+\.\d+(\.\d+)*', f'v {new_version}', c)
            f_html.write_text(c, encoding='utf-8')
            results['files_updated'].append('frontend/index.html')

        # frontend/js/components/react_components.js
        rc = app_path / 'frontend' / 'js' / 'components' / 'react_components.js'
        if rc.exists():
            c = rc.read_text(encoding='utf-8', errors='ignore')
            c = re.sub(r'v\s*\d+\.\d+(\.\d+)*', f'v {new_version}', c)
            rc.write_text(c, encoding='utf-8')
            results['files_updated'].append('frontend/js/components/react_components.js')

        # installer scripts
        for inst_path in [app_path / 'installer.py', app_path / 'build_scripts' / 'installer.py']:
            if inst_path.exists():
                c = inst_path.read_text(encoding='utf-8', errors='ignore')
                c = re.sub(r'VERSION\s*=\s*["\']\d+\.\d+(\.\d+)*["\']', f'VERSION = "{new_version}"', c)
                inst_path.write_text(c, encoding='utf-8')
                results['files_updated'].append(str(inst_path.relative_to(app_path)))

        # installer html templates
        for html_name in ['Installerv2.html', 'installer.html']:
            h_file = app_path / 'build_scripts' / html_name
            if h_file.exists():
                c = h_file.read_text(encoding='utf-8', errors='ignore')
                c = re.sub(r'v\s*\d+\.\d+(\.\d+)*', f'v{new_version}', c)
                h_file.write_text(c, encoding='utf-8')
                results['files_updated'].append(f'build_scripts/{html_name}')

    return results

def main():
    print(f"\n=======================================================")
    print(f"🚀 Anything Creative Ecosystem - Universal Version Sync")
    print(f"📌 Target Version: {TARGET_VERSION}")
    print(f"=======================================================\n")

    summary = []
    for app in APPS_CONFIG:
        res = sync_app_version(app, TARGET_VERSION)
        summary.append(res)
        print(f"✓ {res['app']}")
        print(f"   Old: {res['old_version']} -> New: {res['new_version']}")
        print(f"   Files Updated ({len(res['files_updated'])}): {', '.join(res['files_updated'][:4])}{'...' if len(res['files_updated']) > 4 else ''}\n")

    print(f"🎉 Successfully synchronized all {len(APPS_CONFIG)} apps to version {TARGET_VERSION}!\n")

if __name__ == '__main__':
    main()
