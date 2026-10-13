"""將手動事件的原始授權欄位轉成共用 gate 計畫，不執行驗證。"""
import json
import os
from pathlib import Path
import subprocess
import sys

root = Path.cwd()
plan = {
    'scope': 'full',
    'reason': '依明確授權執行知識中心原有完整驗證。',
    'full_necessity': os.environ['FULL_NECESSITY'],
    'full_consent': {'explicit': True, 'user_quote': os.environ['FULL_USER_QUOTE'], 'source': os.environ['FULL_SOURCE']},
    'command': ['node', '.github/工具/完整驗證.mjs'],
    'cwd': '.',
    'inputs': subprocess.check_output(['git', 'ls-files', '-z']).decode('utf-8').strip('\0').split('\0'),
    'environment': subprocess.check_output(['node', '--version']).decode().strip() + ' / Chromium / ' + sys.platform,
    'artifact': subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip(),
    'verification_id': 'nvm-hub-full',
    'expected_seconds': 900,
    'timeout_seconds': 1200,
    'evidence_dir': '完整驗證證據',
}
Path(sys.argv[1]).write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding='utf-8')
