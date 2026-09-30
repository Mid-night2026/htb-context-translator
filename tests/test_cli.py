import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('api', Path(__file__).resolve().parents[1] / 'HTB-Context-Translator' / 'atualizar_api.py')
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)

class KeyUpdateTest(unittest.TestCase):
    def test_atomic_private_key_with_timestamp_and_rejects_invalid_input(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'config.js'
            with patch.object(api, 'CAMINHO_CONFIG', str(target)), patch.object(api, 'garantir_gitignore'):
                api.atualizar_config('test-credential-only')
                self.assertEqual(target.stat().st_mode & 0o777, 0o600)
                text = target.read_text()
                data = json.loads(text.split('const CONFIG = ', 1)[1].rstrip(';\n'))
                self.assertEqual(data['GEMINI_API_KEY'], 'test-credential-only')
                self.assertGreater(data['UPDATED_AT'], 0)
                self.assertEqual(target.stat().st_mode & 0o777, 0o600)
                with self.assertRaises(ValueError):
                    api.atualizar_config("'; alert(1); //")
                self.assertEqual(target.read_text(), text)

if __name__ == '__main__':
    unittest.main()
