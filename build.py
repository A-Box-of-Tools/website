#!/usr/bin/env python3
"""
Build the site into dist/.

    python build.py              build into dist/
    python build.py --clean      empty dist/ first
    python build.py --no-minify  leave the output readable, for debugging
    python build.py --mangle     rename identifiers too (needs esbuild)
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

WHAT IT DOES TO THE HTML, CSS AND JAVASCRIPT

By default: strips comments and whitespace, and nothing else. No bundler, no
transpiler, no renaming. Every module is still its own file, still an ES module,
still running the same statements in the same order on the same lines, and the
served code can still be read and grepped. buildlib/minify.py and
buildlib/cssmin.py do that work and explain what they will not touch and why;
minify.py checks its own output on every file, and the build fails rather than
ship something whose tokens moved.

With --mangle: identifiers are renamed as well, by esbuild, pinned to the
version in config/site.toml. That is what CI runs and what gets deployed, and it
is the one thing here that needs something installed. Plain `python build.py`
still needs nothing but Python and still produces a working, readable site -
which is the point, because a claim nobody can reproduce is not a claim.
buildlib/mangle.py sets out what that costs.

--check implies --mangle, because the deployed branch is mangled and comparing
against it any other way would report a difference on every file.

The build never reaches the network, whichever way it runs.
"""

import argparse
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from buildlib import cssmin
from buildlib import mangle
from buildlib import minify
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
    parser.add_argument('--no-minify', dest='minify', action='store_false',
                        help='leave the output readable, for debugging')
    parser.add_argument('--mangle', action='store_true',
                        help='also rename identifiers, using the pinned esbuild')
    parser.add_argument('--check', action='store_true',
                        help='fail if the output differs from the committed dist branch')
    args = parser.parse_args(argv)

    out = (ROOT / args.out).resolve()
    # --check compares against the deployed branch, and the deployed branch is
    # mangled, so checking without mangling would report a difference on every
    # file and mean nothing.
    want_mangle = args.mangle or args.check
    try:
        pages = build(out, clean=args.clean, minify_output=args.minify,
                      mangle_names=want_mangle)
    except (sitelib.ConfigError, TemplateError, minify.MinifyError,
            cssmin.CssError, mangle.MangleError) as err:
        print(f'build failed: {err}', file=sys.stderr)
        return 1

    print(f'\n  {len(pages)} pages -> {out}')
    for page in pages:
        print(f'    {page}')

    if args.check:
        return check_against_branch(out)
    return 0


def build(out, clean=False, minify_output=True, mangle_names=False):
    if clean and out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    templates = Loader(TEMPLATES)
    site = sitelib.load_toml(CONFIG / 'site.toml')
    emit = Emitter(minify_output, site, mangle_names)
    # The hub and the legal pages share one stylesheet, so they share one
    # version for it. Tool pages each hash their own assembled sheet.
    # Minified first, then hashed: the version in the URL has to be a hash of
    # the bytes a browser actually receives, or turning minifying on would serve
    # new CSS under the old version and leave returning visitors on the stale one.
    site_css = emit.css_text((SHARED / 'site.css').read_text(encoding='utf-8'))
    css_v = sitelib.text_hash(site_css)
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
        build_tool(out, templates, site, tool, footer, emit)
        written.append(f'{tool["slug"]}/index.html')

    for page in prose:
        build_page(out, templates, site, page, footer, css_v, emit)
        written.append(f'{page["slug"]}/index.html')

    build_hub(out, templates, site, planned, by_slug, footer, css_v, emit)
    written.append('index.html')

    build_sitemap(out, templates, site, tools, prose)
    written.append('sitemap.xml')

    copy_shared(out)
    write(out / 'site.css', site_css)
    return written


# ---------------------------------------------------------------------------
# One tool


def build_tool(out, templates, site, tool, footer, emit):
    dest = out / tool['slug']
    dest.mkdir(parents=True, exist_ok=True)

    # The app code. Every module keeps its own file and its own name; only the
    # comments and the indentation come out. See buildlib/minify.py.
    src_dir = tool['dir'] / 'src'
    if not src_dir.is_dir():
        raise sitelib.ConfigError(f'{tool["slug"]}: no src/ folder')
    assets = sorted(src_dir.glob('*.js'))
    if not any(path.name == 'main.js' for path in assets):
        raise sitelib.ConfigError(f'{tool["slug"]}: src/main.js is required')
    (dest / 'src').mkdir(exist_ok=True)
    for asset in assets:
        emit.js(dest / 'src' / asset.name,
                asset.read_text(encoding='utf-8'),
                where=f'{tool["slug"]}/src/{asset.name}')
    for extra in sorted(src_dir.iterdir()):
        if extra.is_file() and extra.suffix != '.js':
            shutil.copy2(extra, dest / 'src' / extra.name)

    body_path = tool['dir'] / 'body.html'
    if not body_path.is_file():
        raise sitelib.ConfigError(f'{tool["slug"]}: no body.html')

    # Assembled first, so the page can ask for it by a URL carrying a hash of
    # what is in it. The service worker below precaches that same URL: it
    # matches on the whole request, query and all, so a mismatch would leave a
    # tool styled online and bare offline.
    css = emit.css_text(tool_css(tool))
    css_href = f'styles.css?v={sitelib.text_hash(css)}'

    emit.html(dest / 'index.html', templates.render('tool.html', {
        'site': site,
        'tool': tool,
        'footer': footer,
        'base': '../',
        'csp': sitelib.render_csp(site['csp'], site.get('tool_csp', {}), tool['csp']),
        'css_href': css_href,
        'jsonld': sitelib.tool_jsonld(site, tool),
        'body': body_path.read_text(encoding='utf-8').rstrip('\n'),
    }))

    write(dest / 'styles.css', css)

    emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': site,
        'words': tool['words'],
    }), where=f'{tool["slug"]}/analytics.js')

    # The service worker caches './', its own src/*.js, and analytics.js. The
    # list is read off the disk rather than written down, so a new module is
    # cached the moment it exists.
    #
    # Hashed from the files as emitted, not as authored: minifying changes the
    # bytes a browser receives, so turning it on or off has to invalidate the
    # cache. Hashing the sources instead would leave a visitor holding the old
    # copy of a file that had genuinely changed.
    cached = ([dest / 'index.html', dest / 'styles.css', dest / 'analytics.js']
              + [dest / 'src' / asset.name for asset in assets])
    emit.js(dest / 'sw.js', templates.render('sw.js', {
        'tool': tool,
        'assets': ['index.html', css_href] + [f'src/{p.name}' for p in assets],
        'cache_hash': sitelib.cache_hash(cached),
    }), where=f'{tool["slug"]}/sw.js')

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


def build_page(out, templates, site, page, footer, css_v, emit):
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

    emit.html(dest / 'index.html', templates.render('page.html', {
        'site': site,
        'page': page,
        'footer': footer,
        'base': '../',
        'css_href': f'../site.css?v={css_v}',
        'csp': sitelib.render_csp(site['csp']),
        'body': body_path.read_text(encoding='utf-8').rstrip('\n'),
    }))

    emit.js(dest / 'analytics.js', templates.render('analytics.js', {
        'site': site,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where=f'{page["slug"]}/analytics.js')


# ---------------------------------------------------------------------------
# The hub


def build_hub(out, templates, site, planned, by_slug, footer, css_v, emit):
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

    emit.html(out / 'index.html', templates.render('hub.html', {
        'site': site,
        'planned': planned,
        'categories': categories,
        'footer': footer,
        'base': './',
        'css_href': f'site.css?v={css_v}',
        'csp': sitelib.render_csp(site['csp']),
        'jsonld': sitelib.hub_jsonld(site, ordered),
    }))

    emit.js(out / 'analytics.js', templates.render('analytics.js', {
        'site': site,
        'words': {'plural': 'files', 'analytics_extra': ''},
    }), where='analytics.js')


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
        # shared/css is an input to the stylesheets the build assembles, not a
        # file anyone fetches; site.css is written separately, minified, by the
        # caller - copying the source over it here would undo that.
        if path.name in ('css', 'site.css'):
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


class Emitter:
    """Writes the HTML, CSS and JavaScript, minified or not.

    One object rather than a flag threaded everywhere, because the two things
    that have to stay together - whether to minify, and what banner to leave
    behind when we do - belong together.

    The banner is the one comment minifying does not remove. A page that spends
    four links telling you to go and read the code should not then hand you a
    file with no way back to it, so every generated file keeps one line saying
    where it came from and how to prove it.
    """

    def __init__(self, minify_output, site, mangle_names=False):
        self.enabled = bool(minify_output)
        source = site['source_url']

        # Mangling is opt-in and needs esbuild at the pinned version. Resolved
        # once, here, so a missing or wrong esbuild stops the build before it
        # has written half a site rather than partway through.
        self.esbuild = None
        if mangle_names:
            if not self.enabled:
                raise mangle.MangleError(
                    '--mangle and --no-minify contradict each other: mangling is '
                    'minifying, and more of it.')
            pinned = site.get('build', {}).get('esbuild_version')
            if not pinned:
                raise mangle.MangleError(
                    'no esbuild_version pinned under [build] in config/site.toml, '
                    'so the build could not be reproduced from it.')
            self.esbuild = mangle.resolve(pinned)
            mangle.require_version(self.esbuild, pinned)
        # The same sentence in three comment syntaxes. Each minifier wraps it
        # itself, so what is kept here is the text with no delimiters on it.
        verify = (f'Built from {source} by build.py. '
                  f'Verify with: python build.py --check')
        self.js_banner = f'/* {verify} */'
        self.js_mangled_banner = f'/* {verify} (names mangled by esbuild) */'
        self.html_banner = f' {verify} '
        self.css_banner = f' {verify} '

    def html(self, path, text):
        write(path, minify.html(text, self.html_banner) if self.enabled else text)

    def js(self, path, text, where):
        if self.esbuild:
            # esbuild does the whitespace as well as the names, so the Python
            # minifier stands aside rather than running first and being redone.
            write(path, mangle.js(text, self.esbuild, self.js_mangled_banner, where))
        elif self.enabled:
            write(path, minify.js(text, self.js_banner, where))
        else:
            write(path, text)

    def css_text(self, text):
        """Returns rather than writes, because a stylesheet has to be hashed
        after minifying and before being written - the hash goes in the URL the
        page asks for it by."""
        return cssmin.css(text, self.css_banner) if self.enabled else text


def check_against_branch(out, branch='dist'):
    """Compare a fresh build with what is committed on the dist branch. This is
    the command the pages point at: it answers "is the deployed site really a
    build of these sources?", which matters more now that what is served is
    minified and no longer pleasant to read straight off.

    A fresh clone has the branch only as origin/dist, so try that too rather
    than shrugging and reporting success.
    """
    for ref_name in (branch, f'origin/{branch}'):
        found = subprocess.run(['git', 'rev-parse', '--verify', f'{ref_name}^{{tree}}'],
                               capture_output=True, text=True, cwd=ROOT)
        if found.returncode == 0:
            branch = ref_name
            break
    else:
        print(f'\n  no {branch} branch here to check against '
              f'(try: git fetch origin {branch})', file=sys.stderr)
        return 0

    differences = compare(out, branch)
    if differences:
        print(f'\n  {branch} is not this build ({len(differences)} files differ):',
              file=sys.stderr)
        for name in differences[:20]:
            print(f'    {name}', file=sys.stderr)
        if len(differences) > 20:
            print(f'    ... and {len(differences) - 20} more', file=sys.stderr)
        return 1
    print(f'\n  {branch} matches a fresh build of these sources')
    return 0


def compare(built, branch):
    """Which files differ between the build and a branch, by content.

    Read out of the object store rather than checked out into a worktree.
    Checking out runs the files through Git's end-of-line filters, and on a
    machine with core.autocrlf on that rewrites every text file on the way to
    disk - which made this report all sixty-odd files as changed when not one
    of them was. A blob id is the bytes as committed, and nothing can filter
    it on the way past.
    """
    listing = subprocess.run(['git', 'ls-tree', '-r', '-z', branch],
                             capture_output=True, text=True, cwd=ROOT, check=True)
    committed = {}
    for entry in listing.stdout.split('\0'):
        if not entry:
            continue
        info, path = entry.split('\t', 1)
        committed[path] = info.split()[2]

    fresh = {path.relative_to(built).as_posix(): blob_id(path)
             for path in built.rglob('*') if path.is_file()}

    names = sorted(set(committed) | set(fresh))
    return [name for name in names if committed.get(name) != fresh.get(name)]


def blob_id(path):
    """The id Git would give this file's contents: sha1 over the bytes with
    Git's blob header in front. The same rule Git uses, so the two are
    comparable without shelling out once per file."""
    data = path.read_bytes()
    return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


if __name__ == '__main__':
    sys.exit(main())
