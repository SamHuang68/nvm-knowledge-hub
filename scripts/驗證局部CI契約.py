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
    def test_交錯分支收據收齊並保留最近失敗(self):
        with tempfile.TemporaryDirectory(prefix='nvm-receipts-') as temporary:
            evidence = Path(temporary) / '證據'
            key_a, key_b = 'a' * 64, 'b' * 64
            runs = [{'id': i, 'conclusion': 'success', 'event': 'push', 'head_repository': {'full_name': 'fixture/nvm'}} for i in (4, 3, 2, 1)]
            downloads = []
            def response(command):
                if 'per_page=20' in command[-1]:
                    return json.dumps({'workflow_runs': runs}).encode()
                return json.dumps({'artifacts': [{'name': '收據', 'expired': False}]}).encode()
            def download(command, **kwargs):
                run_id = int(command[3]); downloads.append(run_id)
                folder = Path(command[-1]); folder.mkdir()
                records = {4: {'c'*64: 'passed'}, 3: {key_a: 'failed'}, 2: {key_a: 'passed', key_b: 'passed'}}[run_id]
                for key, status in records.items():
                    (folder / (key + '.json')).write_text(json.dumps({'status': status}), encoding='utf-8')
            with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'fixture/nvm', 'GH_TOKEN': 'fixture'}), patch.object(runner.subprocess, 'check_output', side_effect=response), patch.object(runner.subprocess, 'run', side_effect=download):
                runner.restore_ci_receipts(evidence, '收據', 'validate-and-deploy.yml', {key_a, key_b})
            self.assertEqual(downloads, [4, 3, 2], '收齊前不停止，收齊後不擴大讀取')
            self.assertEqual(json.loads((evidence / (key_a + '.json')).read_text())['status'], 'failed')
            self.assertTrue((evidence / (key_b + '.json')).is_file())

    def test_舊進行中紀錄不污染較新成功(self):
        with tempfile.TemporaryDirectory(prefix='nvm-receipts-') as temporary:
            evidence = Path(temporary) / '證據'
            key_a, key_b = 'a' * 64, 'b' * 64
            runs = [{'id': i, 'conclusion': 'success', 'event': 'push', 'head_repository': {'full_name': 'fixture/nvm'}} for i in (2, 1)]
            def response(command):
                return json.dumps({'workflow_runs': runs} if 'per_page=20' in command[-1] else {'artifacts': [{'name': '收據', 'expired': False}]}).encode()
            def download(command, **kwargs):
                folder = Path(command[-1]); folder.mkdir()
                if command[3] == '2':
                    (folder / (key_a + '.json')).write_text('{"status":"passed"}')
                else:
                    (folder / (key_a + '.active')).write_text('{"pid":123}')
                    (folder / (key_b + '.json')).write_text('{"status":"passed"}')
                    (folder / (key_b + '.active')).write_text('{"pid":456}')
            with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'fixture/nvm', 'GH_TOKEN': 'fixture'}), patch.object(runner.subprocess, 'check_output', side_effect=response), patch.object(runner.subprocess, 'run', side_effect=download):
                runner.restore_ci_receipts(evidence, '收據', 'validate-and-deploy.yml', {key_a, key_b})
            self.assertFalse((evidence / (key_a + '.active')).exists(), '舊 run 的 active 不得污染新成功')
            self.assertTrue((evidence / (key_b + '.active')).is_file(), '同一 run 的 active 必須保留以阻擋不完整案例')

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
