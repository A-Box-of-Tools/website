#!/usr/bin/env python3
"""
Build the site into dist/.

    python build.py              build into dist/
    python build.py --clean      empty dist/ first
    python build.py --check      build, then fail if dist/ differs from git's
                                 copy of the branch it is committed on

Nothing to install: this uses only the Python standard library, on 3.11 or
newer (for tomllib). That is the same bargain the tools themselves make - if
you have to fetch a tree of dependencies before you can check what a page
claims, the claim is not really checkable.

WHAT THIS DOES, AND WHY IT EXISTS

Three tool pages were written out by hand, and the frame around them - the
Content-Security-Policy, the header, the privacy pledge, the live check, the
FAQ, the footer - was the same on all three, give or take a noun. Keeping them
in step was a manual job, and the repository was full of comments admitting it:
"keep this list in step with the other pages", "EDIT BOTH OR NEITHER", "bump
CACHE_NAME whenever any listed file changes".

Every one of those is now a thing the build does:

  * the CSP is written once, in config/site.toml, and copied to every page;
  * the FAQ renders both as the questions at the foot of a page and as the
    FAQPage structured data in its head, from one set of answers;
  * the hub's tool cards, its ItemList structured data and sitemap.xml are all
    derived from the tools that exist in tools/;
  * a service worker's asset list is read off the disk, and its cache name is a
    hash of those files, so it changes exactly when they do.

WHAT IT DOES NOT DO

It does not touch the JavaScript. src/*.js is copied byte for byte: there is no
bundler, no minifier and no transpiler, so the code a visitor's browser runs is
still, character for character, the code in this repository. The build only ever
assembles HTML, CSS and the two small generated JS files (sw.js, analytics.js),
and it never reaches the network.
"""

import argparse
import filecmp
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from buildlib import site as sitelib
from buildlib.template import Loader, TemplateError

ROOT = Path(__file__).parent.resolve()
TEMPLATES = ROOT / 'templates'
CONFIG = ROOT / 'config'
TOOLS = ROOT / 'tools'
PAGES = ROOT / 'pages'
SHARED = ROOT / 'shared'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[1])
    parser.add_argument('--out', default='dist', help='where to write (default: dist)')
    parser.add_argument('--clean', action='store_true', help='empty the output first')
    parser.add_argument('--check', action='store_true',
                        help='fail if the output differs from the committed dist branch')
    args = parser.parse_args(argv)

    out = (ROOT / args.out).resolve()
    try:
        pages = build(out, clean=args.clean)
    except (sitelib.ConfigError, TemplateError) as err:
        print(f'build failed: {err}', file=sys.stderr)
        return 1

    print(f'\n  {len(pages)} pages -> {out}')
    for page in pages:
        print(f'    {page}')

    if args.check:
        return check_against_branch(out)
    return 0


def build(out, clean=False):
    if clean and out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    templates = Loader(TEMPLATES)
    site = sitelib.load_toml(CONFIG / 'site.toml')
    planned = sitelib.load_toml(CONFIG / 'planned.toml')

    tools = [sitelib.load_tool(path, site)
             for path in sorted(TOOLS.glob('*/tool.toml'))]
    if not tools:
        raise sitelib.ConfigError(f'no tools found under {TOOLS}')
    by_slug = {tool['slug']: tool for tool in tools}

    prose = [sitelib.load_page(path, site)
             for path in sorted(PAGES.glob('*/page.toml'))]

    # What the footer on every page is built from. Derived from the folders that
    # exist rather than written down anywhere, so a new tool or a new legal page
    # reaches every footer on the site without a second edit.
    # Tools in the order the hub shows them, not the order the folders happen to
    # sort in, so the footer and the cards above it agree. A slug named here that
    # has no tool, or a tool named nowhere, is caught by build_hub below.
    ordered = [by_slug[slug]
               for category in site['hub']['categories']
               for slug in category['order'] if slug in by_slug]
    footer = {
        'tools': [{'name': tool['name'], 'slug': tool['slug']} for tool in ordered],
        'pages': [{'nav': page['nav'], 'slug': page['slug']} for page in prose],
    }

    written = []
    for tool in tools:
        build_tool(out, templates, site, tool, footer)
        written.append(f'{tool["slug"]}/index.html')

    for page in prose:
        build_page(out, templates, site, page, footer)
        written.append(f'{page["slug"]}/index.html')

    build_hub(out, templates, site, planned, by_slug, footer)
    written.append('index.html')

    build_sitemap(out, templates, site, tools, prose)
    written.append('sitemap.xml')

    copy_shared(out)
    return written


# ---------------------------------------------------------------------------
# One tool


def build_tool(out, templates, site, tool, footer):
    dest = out / tool['slug']
    dest.mkdir(parents=True, exist_ok=True)

    # The app code, copied byte for byte. Nothing here rewrites JavaScript.
    src_dir = tool['dir'] / 'src'
    if not src_dir.is_dir():
        raise sitelib.ConfigError(f'{tool["slug"]}: no src/ folder')
    assets = sorted(src_dir.glob('*.js'))
    if not any(path.name == 'main.js' for path in assets):
        raise sitelib.ConfigError(f'{tool["slug"]}: src/main.js is required')
    shutil.copytree(src_dir, dest / 'src', dirs_exist_ok=True)

    body_path = tool['dir'] / 'body.html'
    if not body_path.is_file():
        raise sitelib.ConfigError(f'{tool["slug"]}: no body.html')

    write(dest / 'index.html', templates.render('tool.html', {
        'site': site,
        'tool': tool,
        'footer': footer,
        'base': '../',
        'csp': sitelib.render_csp(site['csp'], site.get('tool_csp', {}), tool['csp']),
        'jsonld': sitelib.tool_jsonld(site, tool),
        'body': body_path.read_text(encoding='utf-8').rstrip('\n'),
    }))

    write(dest / 'styles.css', tool_css(tool))

    write(dest / 'analytics.js', templates.render('analytics.js', {
        'site': site,
        'words': tool['words'],
    }))

    # The service worker caches './', its own src/*.js, and analytics.js. The
    # list is read off the disk rather than written down, so a new module is
    # cached the moment it exists.
    cached = [dest / 'index.html', dest / 'styles.css', dest / 'analytics.js'] + assets
    write(dest / 'sw.js', templates.render('sw.js', {
        'tool': tool,
        'assets': ['index.html', 'styles.css'] + [f'src/{p.name}' for p in assets],
        'cache_hash': sitelib.cache_hash(cached),
    }))

    og = tool['dir'] / 'og.png'
    if og.is_file():
        shutil.copy2(og, dest / 'og.png')


def tool_css(tool):
    """The shared frame, then any optional parts this tool asked for, then the
    tool's own rules. Order matters: the tool's own rules come last so that a
    tool can override the frame, and never the other way round."""
    parts = [(SHARED / 'css' / 'tool-frame.css').read_text(encoding='utf-8')]
    for name in tool.get('css_parts', []):
        path = SHARED / 'css' / f'{name}.css'
        if not path.is_file():
            raise sitelib.ConfigError(f'{tool["slug"]}: no such css part: {name}')
        parts.append(path.read_text(encoding='utf-8'))
    own = tool['dir'] / 'styles.css'
    if own.is_file():
        parts.append(own.read_text(encoding='utf-8'))
    banner = ('/*\n'
              '  GENERATED FILE - do not edit.\n'
              '\n'
              '  Assembled by build.py from shared/css/tool-frame.css (the frame every\n'
              '  tool page wears), any shared/css parts this tool asked for, and\n'
              f'  tools/{tool["slug"]}/styles.css (the rules only this tool needs).\n'
              '*/\n\n')
    return banner + '\n'.join(part.strip('\n') + '\n' for part in parts)


# ---------------------------------------------------------------------------
# One prose page (the legal ones)


def build_page(out, templates, site, page, footer):
    """A legal page: the site frame around a body.html, and nothing else.

    No service worker, because there is nothing here worth keeping offline, and
    no CSP of its own - it gets the site policy unchanged, which is the point.
    When these pages were written by hand they carried a hand-narrowed copy that
    left out the donate button's origins; one policy in one file ended that
    argument by making it impossible to have."""
    dest = out / page['slug']
    dest.mkdir(parents=True, exist_ok=True)

    body_path = page['dir'] / 'body.html'
    if not body_path.is_file():
        raise sitelib.ConfigError(f'{page["slug"]}: no body.html')

    write(dest / 'index.html', templates.render('page.html', {
        'site': site,
        'page': page,
        'footer': footer,
        'base': '../',
        'csp': sitelib.render_csp(site['csp']),
        'body': body_path.read_text(encoding='utf-8').rstrip('\n'),
    }))

    write(dest / 'analytics.js', templates.render('analytics.js', {
        'site': site,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }))


# ---------------------------------------------------------------------------
# The hub


def build_hub(out, templates, site, planned, by_slug, footer):
    categories = []
    listed = set()
    for category in site['hub']['categories']:
        chosen = []
        for slug in category['order']:
            if slug not in by_slug:
                raise sitelib.ConfigError(
                    f'config/site.toml lists {slug!r} in category {category["id"]!r}, '
                    f'but there is no tools/{slug}/tool.toml')
            tool = by_slug[slug]
            if tool['category'] != category['id']:
                raise sitelib.ConfigError(
                    f'{slug} says category = {tool["category"]!r} but is listed under '
                    f'{category["id"]!r} in config/site.toml')
            chosen.append(tool)
            listed.add(slug)
        categories.append({**category, 'tools': chosen})

    stray = sorted(set(by_slug) - listed)
    if stray:
        raise sitelib.ConfigError(
            'these tools exist but are not listed in any [[hub.categories]] order, '
            f'so nothing would link to them: {", ".join(stray)}')

    ordered = [tool for category in categories for tool in category['tools']]
    for group in planned['group']:
        group['items'] = [{'name': name, 'desc': desc} for name, desc in group['items']]

    write(out / 'index.html', templates.render('hub.html', {
        'site': site,
        'planned': planned,
        'categories': categories,
        'footer': footer,
        'base': './',
        'csp': sitelib.render_csp(site['csp']),
        'jsonld': sitelib.hub_jsonld(site, ordered),
    }))

    write(out / 'analytics.js', templates.render('analytics.js', {
        'site': site,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }))


def build_sitemap(out, templates, site, tools, prose):
    pages = [{'url': site['domain'], 'lastmod': site['lastmod'],
              'changefreq': 'weekly', 'priority': '1.0'}]
    pages += [{'url': tool['url'], 'lastmod': tool['lastmod'],
               'changefreq': 'monthly', 'priority': '0.8'} for tool in tools]
    # The legal pages last, and low: they matter for trust, not for search.
    pages += [{'url': page['url'], 'lastmod': page['lastmod'],
               'changefreq': 'yearly', 'priority': '0.3'} for page in prose]
    write(out / 'sitemap.xml', templates.render('sitemap.xml', {'pages': pages}))


def copy_shared(out):
    """Everything in shared/ that is served as-is. shared/css is not: it is an
    input to the stylesheets the build assembles, not a file anyone fetches."""
    for path in sorted(SHARED.iterdir()):
        if path.name == 'css':
            continue
        if path.is_dir():
            shutil.copytree(path, out / path.name, dirs_exist_ok=True)
        else:
            shutil.copy2(path, out / path.name)


# ---------------------------------------------------------------------------


def write(path, text):
    """Always LF, always UTF-8. A build that produced CRLF on Windows and LF in
    CI would show every line of every file as changed on alternate deploys."""
    path.write_text(text if text.endswith('\n') else text + '\n',
                    encoding='utf-8', newline='\n')


def check_against_branch(out, branch='dist'):
    """Compare a fresh build with what is committed on the dist branch. Used by
    CI to answer "is the deployed site really a build of these sources?"."""
    ref = subprocess.run(['git', 'rev-parse', '--verify', f'{branch}^{{tree}}'],
                         capture_output=True, text=True, cwd=ROOT)
    if ref.returncode != 0:
        print(f'\n  no {branch} branch to check against yet', file=sys.stderr)
        return 0
    with_worktree = ROOT / '.dist-check'
    subprocess.run(['git', 'worktree', 'add', '--detach', str(with_worktree), branch],
                   check=True, cwd=ROOT, capture_output=True)
    try:
        differences = compare(out, with_worktree)
    finally:
        subprocess.run(['git', 'worktree', 'remove', '--force', str(with_worktree)],
                       cwd=ROOT, capture_output=True)
    if differences:
        print(f'\n  dist branch is out of date ({len(differences)} files):', file=sys.stderr)
        for name in differences[:20]:
            print(f'    {name}', file=sys.stderr)
        return 1
    print(f'\n  dist branch matches a fresh build')
    return 0


def compare(built, committed):
    def files(root):
        return {p.relative_to(root).as_posix() for p in root.rglob('*')
                if p.is_file() and '.git' not in p.parts}
    a, b = files(built), files(committed)
    out = sorted((a ^ b))
    for name in sorted(a & b):
        if not filecmp.cmp(built / name, committed / name, shallow=False):
            out.append(name)
    return out


if __name__ == '__main__':
    sys.exit(main())
