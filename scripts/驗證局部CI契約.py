"""只驗證本次導入的 CI 選案、證據重用與完整掃描阻擋，不執行產品全套。"""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import shutil
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('impact_runner', ROOT / 'tools/codex/變更驗證.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class CIContract(unittest.TestCase):
    def test_明列案例及相同輸入重用(self):
        with tempfile.TemporaryDirectory(prefix='nvm-ci-') as temporary:
            folder = Path(temporary)
            root = folder / 'repo'
            root.mkdir()
            subprocess.run(['git', 'init', '-q', str(root)], check=True)
            script = root / '案例.mjs'
            script.write_text("console.log('局部案例');\n", encoding='utf-8')
            subprocess.run(['git', 'add', '--', '案例.mjs'], cwd=root, check=True)
            subprocess.run(['git', '-c', 'user.name=局部驗證', '-c', 'user.email=qa@example.invalid', 'commit', '-qm', '驗證基準'], cwd=root, check=True)
            base = runner.git(root, 'rev-parse', 'HEAD')
            script.write_text("console.log('局部案例完成');\n", encoding='utf-8')
            case = {'id': '範例', 'kind': 'node', 'targets': ['案例.mjs'], 'changes': ['案例.mjs'], 'inputs': ['案例.mjs'], 'reason': '僅明列變更', 'timeoutSeconds': 10}
            plan = {'schemaVersion': 1, 'scope': 'targeted', 'project': 'fixture/nvm', 'baseCommit': base, 'cases': [case]}
            plan_path = folder / '計畫.json'
            plan_path.write_text(json.dumps(plan), encoding='utf-8')
            with patch.dict(os.environ, {'GITHUB_REPOSITORY': '', 'VALIDATION_BASE': '', 'CODEX_VERIFICATION_REUSE_ONLY': ''}):
                first = runner.run_plan(root, plan_path, folder / '證據')
                self.assertEqual(first['cases'][0]['decision'], 'EXECUTED')
                second = runner.run_plan(root, plan_path, folder / '證據')
                self.assertEqual(second['cases'][0]['decision'], 'REUSE')
                (root / '未對應.js').write_text('// 尚未對應', encoding='utf-8')
                with self.assertRaisesRegex(ValueError, '尚未對應驗證'):
                    runner.read_plan(root, plan_path)

    def test_完整範圍不可冒充局部(self):
        gate = runner.gate_module()
        for command in [['node', '--test'], ['npm', 'test'], ['python', '-m', 'unittest', 'discover']]:
            with self.assertRaises(ValueError):
                gate.reject_broad_targeted(command)

    def test_CI環境不再豁免完整授權(self):
        result = subprocess.run(['node', 'scripts/verify-site-regression.mjs'], cwd=ROOT,
            env={**os.environ, 'CI': 'true', 'GITHUB_ACTIONS': 'true'}, capture_output=True, text=True, encoding='utf-8', timeout=10)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('完整回歸須提供 --plan', result.stderr)

    def test_未授權完整計畫不執行(self):
        with tempfile.TemporaryDirectory(prefix='nvm-gate-') as temporary:
            folder = Path(temporary)
            script = folder / '不可執行.mjs'
            script.write_text("throw new Error('不應啟動');", encoding='utf-8')
            plan = {'scope': 'full', 'reason': '負向案例', 'full_necessity': '驗證缺少明確授權會阻擋',
                'command': [shutil.which('node'), str(script)], 'cwd': str(folder), 'inputs': [str(script)],
                'artifact': 'fixture', 'environment': 'fixture', 'verification_id': '拒絕未授權',
                'expected_seconds': 1, 'timeout_seconds': 5, 'evidence_dir': str(folder / '證據')}
            plan_path = folder / '計畫.json'
            plan_path.write_text(json.dumps(plan), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, '明確授權'):
                runner.gate_module().main(plan_path, workspace_root=folder)


if __name__ == '__main__':
    unittest.main()
