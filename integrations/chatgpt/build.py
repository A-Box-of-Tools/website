"""Package a local inspection draft; never connect, submit or publish it."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import zipfile


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SCHEMA_BASE = "https://agent-plugins.org/schemas/1.0.0/"
SEMVER = re.compile(
    r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)"
    r"(?:-((?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def public_text(value, limit, label):
    require(isinstance(value, str) and value.strip() == value and value,
            f"{label} must be nonempty text without outer whitespace")
    require(len(value) <= limit and all(ord(char) >= 32 for char in value)
            and "\u2028" not in value and "\u2029" not in value,
            f"{label} exceeds its listing limit or contains a control character")


def validate_sources(plugin, mcp, cases):
    # These checks cover this package's documented constraints, not the complete
    # upstream schemas or the portal's scans, identity checks and review policy.
    require(plugin.get("$schema") == SCHEMA_BASE + "plugin.schema.json",
            "Use the documented portable plugin schema")
    require(plugin.get("name") == "abox-tools", "Keep the stable package identity")
    public_text(plugin.get("description"), 1024, "description")
    require("author" not in plugin and "version" not in plugin,
            "Supply the release version at build time; do not invent an author")
    extension = plugin["extensions"]["com.openai"]
    require(set(extension) == {"interface"}, "This draft contains listing metadata only")
    interface = extension["interface"]
    require("developerName" not in interface,
            "Supply the actual verified publisher name at build time, when known")
    for field, limit in (("displayName", 30), ("shortDescription", 30),
                         ("longDescription", 4000)):
        public_text(interface.get(field), limit, field)
    expected_urls = {
        "websiteURL": "https://abox.tools/",
        "supportURL": "https://abox.tools/contact/",
        "privacyPolicyURL": "https://abox.tools/privacy/",
        "termsOfServiceURL": "https://abox.tools/terms/",
    }
    for field, expected in expected_urls.items():
        require(interface.get(field) == expected, f"Unexpected {field}")
    require(interface.get("category") == "Productivity", "Review the real portal category before changing it")
    prompts = interface.get("defaultPrompt", [])
    require(1 <= len(prompts) <= 3 and len(set(prompts)) == len(prompts),
            "Supply at most three distinct starter prompts")
    for prompt in prompts:
        public_text(prompt, 128, "starter prompt")
        require("@" not in prompt, "Starter prompts cannot contain app mentions")
    require(interface.get("composerIcon") == "./assets/icon.png"
            and interface.get("logo") == "./assets/logo.png", "Use the real bundled site icons")
    require(mcp == {
        "$schema": SCHEMA_BASE + "mcp.schema.json",
        "mcpServers": {"abox-tools": {
            "type": "streamable-http", "url": "https://mcp.abox.tools/mcp",
            "extensions": {"com.openai": {"auth": {"type": "none"}}},
        }},
    }, "Package only the public production endpoint, without credentials or headers")
    require(set(cases) == {"positive", "negative"}
            and len(cases["positive"]) == 5 and len(cases["negative"]) == 3,
            "Review proposals must contain five positive and three negative cases")
    for group in cases.values():
        for case in group:
            public_text(case.get("description"), 1000, "case description")
            public_text(case.get("prompt"), 4000, "case prompt")
    for case in cases["positive"]:
        require(case.get("tools_triggered") == "find_browser_tools", "Use the real public tool name")
        public_text(case.get("expected_behavior"), 4000, "expected behavior")


def site_icon(relative):
    data = (ROOT / relative).read_bytes()
    require(data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR",
            f"{relative} must be an actual PNG")
    width, height = struct.unpack(">II", data[16:24])
    require(width == height and 48 <= width <= 4096 and len(data) <= 5 * 1024 * 1024,
            f"{relative} does not meet the documented icon bounds")
    return data


def build(version, developer_name=None, output_dir=None):
    require(isinstance(version, str) and len(version) <= 64 and SEMVER.fullmatch(version),
            "Use an actual release tag's semantic version, without a leading v")
    plugin = json.loads((HERE / "plugin.json").read_bytes())
    mcp = json.loads((HERE / "mcp.json").read_bytes())
    cases = json.loads((HERE / "review-cases.json").read_bytes())
    validate_sources(plugin, mcp, cases)
    plugin["version"] = version
    if developer_name is not None:
        public_text(developer_name, 80, "verified developer name")
        plugin["extensions"]["com.openai"]["interface"]["developerName"] = developer_name
    files = {
        "plugin.json": json_bytes(plugin),
        "mcp.json": json_bytes(mcp),
        "assets/icon.png": site_icon("shared/icon-192.png"),
        "assets/logo.png": site_icon("shared/icon-512.png"),
        "LICENSE": (ROOT / "LICENSE").read_bytes(),
        "THIRD-PARTY-NOTICES.md": (ROOT / "THIRD-PARTY-NOTICES.md").read_bytes(),
    }
    out = Path(output_dir) if output_dir is not None else HERE / "build"
    out.mkdir(exist_ok=True)
    archive = out / "abox-tools-draft.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for name, data in sorted(files.items()):
            entry = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            package.writestr(entry, data)
    with zipfile.ZipFile(archive) as package:
        require(package.testzip() is None and set(package.namelist()) == set(files),
                "Package integrity or allowlist check failed")
        require(all(package.read(name) == data for name, data in files.items()),
                "Package bytes differ from their reviewed sources")
    report = {
        "status": "draft_not_submission_ready",
        "version": version,
        "archive": archive.name,
        "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "files": sorted(files),
        "developerNameSupplied": developer_name is not None,
        "reviewCasesIncluded": False,
        "pending": [
            "Publisher identity, organization/project access and country availability decisions",
            "Actual ChatGPT desktop/mobile tool and UI tests",
            "Execute the five positive and three negative review-case proposals",
            "Accessible demonstration recording and review release notes",
            "Published privacy/terms coverage and actual service retention verification",
            "Portal domain challenge, current tool scan and policy attestations",
            "Directory review, approval and a separate owner publication decision",
        ],
    }
    (out / "readiness.json").write_bytes(json_bytes(report))
    return archive, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True,
                        help="An existing site release tag's semantic version, without v")
    parser.add_argument("--developer-name",
                        help="The actual directory publisher name from the verified OpenAI identity")
    args = parser.parse_args()
    try:
        archive, report = build(args.version, args.developer_name)
    except (ValueError, KeyError, OSError, json.JSONDecodeError) as error:
        parser.exit(1, f"Draft package failed: {error}\n")
    print(f"Wrote {archive} ({archive.stat().st_size} bytes)")
    print(f"SHA-256: {report['sha256']}")
    print("Draft only. Read build/readiness.json and README.md before any upload.")


if __name__ == "__main__":
    main()
