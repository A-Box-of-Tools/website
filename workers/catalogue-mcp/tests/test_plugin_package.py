"""Keep a submission draft honest about its source and unfinished review."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "chatgpt_package", ROOT / "integrations/chatgpt/build.py"
)
package_builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(package_builder)


class PluginPackageTests(unittest.TestCase):
    def test_draft_uses_real_assets_without_inventing_review_or_publisher(self):
        with tempfile.TemporaryDirectory() as folder:
            archive, report = package_builder.build("2.0.5", output_dir=folder)
            self.assertEqual(report["status"], "draft_not_submission_ready")
            self.assertFalse(report["developerNameSupplied"])
            self.assertFalse(report["reviewCasesIncluded"])
            with zipfile.ZipFile(archive) as package:
                self.assertEqual(set(package.namelist()), {
                    "plugin.json", "mcp.json", "assets/icon.png", "assets/logo.png",
                    "LICENSE", "THIRD-PARTY-NOTICES.md",
                })
                manifest = json.loads(package.read("plugin.json"))
                extension = manifest["extensions"]["com.openai"]
                self.assertNotIn("author", manifest)
                self.assertNotIn("developerName", extension["interface"])
                self.assertNotIn("review", extension)
                self.assertNotIn("publication", extension)
                self.assertEqual(manifest["version"], "2.0.5")
                self.assertEqual(package.read("assets/icon.png"),
                                 (ROOT / "shared/icon-192.png").read_bytes())
                self.assertEqual(package.read("assets/logo.png"),
                                 (ROOT / "shared/icon-512.png").read_bytes())

    def test_source_guard_rejects_development_endpoints_or_embedded_credentials(self):
        source = ROOT / "integrations/chatgpt"
        plugin = json.loads((source / "plugin.json").read_bytes())
        cases = json.loads((source / "review-cases.json").read_bytes())
        for change in (
            {"url": "https://mcp-dev.abox.tools/mcp"},
            {"headers": {"Authorization": "Bearer synthetic-test-value"}},
        ):
            with self.subTest(change=change):
                mcp = json.loads((source / "mcp.json").read_bytes())
                mcp["mcpServers"]["abox-tools"].update(change)
                with self.assertRaises(ValueError):
                    package_builder.validate_sources(plugin, mcp, cases)
