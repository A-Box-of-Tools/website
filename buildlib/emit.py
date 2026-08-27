"""
Writing a file, and deciding what is minified on the way.

WHY THIS IS NOT IN build.py

build.py is one function per kind of page, and this is not a kind of page: it
is the one place that turns a string into a file on disk, used by every one of
them and by the three catalogue files beside them. It was in build.py because
that is where it was written, and the cost of leaving it there was that
build.py had to be opened to change how a byte gets written.

`write` is here rather than anywhere else because of what it refuses to do.
Every text file in this repository is LF - see .gitattributes - and Python's
own write_text() silently writes CRLF on Windows, which would make the deployed
site differ from a local build on every line of every file, on alternate
machines, for no reason a diff could explain. So there is exactly one function
that writes, and it writes bytes.

LINK sits with the emitter and not with check_links, which is its other caller,
because recording a page's links is something the emitter does AS it writes:
the links of every page are gathered on the way past rather than by reading a
thousand finished files back off the disk afterwards. On Windows that reading
was half the build - the antivirus prices the first open of a freshly written
file at tens of milliseconds. check_links borrows the pattern for the path
where it has to re-read after all.
"""

import re

from buildlib import cssmin
from buildlib import minify


LINK = re.compile(r'(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"')


def write(path, text):
    """Always LF, always UTF-8. A build that produced CRLF on Windows and LF in
    CI would show every line of every file as changed on alternate deploys.

    Returns the text as written - trailing newline included - so a caller that
    goes on to hash what the file holds can hash this instead of opening the
    file it just closed."""
    text = text if text.endswith('\n') else text + '\n'
    path.write_text(text, encoding='utf-8', newline='\n')
    return text


class Emitter:
    """Writes the HTML, CSS and JavaScript, minified or not.

    One object rather than a flag threaded everywhere, because the two things
    that have to stay together - whether to minify, and what banner to leave
    behind when we do - belong together.

    The banner is the one comment minifying does not remove. A page that spends
    four links telling you to go and read the code should not then hand you a
    file with no way back to it, so every generated file keeps one line saying
    where it came from and how to prove it.

    `page_links` records, for every page written, the links on it as written -
    check_links' input, gathered on the way past. It used to be gathered at
    the end instead, by reading every page back off the disk, and on Windows
    that was half the build: the antivirus scans a freshly written file on its
    next open, at tens of milliseconds each, a thousand pages over.
    """

    def __init__(self, minify_output, site):
        self.enabled = bool(minify_output)
        self.page_links = {}
        source = site['source_url']

        # The same sentence in three comment syntaxes. Each minifier wraps it
        # itself, so what is kept here is the text with no delimiters on it.
        verify = (f'Built from {source} by build.py. '
                  f'Verify with: python build.py --check')
        self.js_banner = f'/* {verify} */'
        self.html_banner = f' {verify} '
        self.css_banner = f' {verify} '

        # What each source text minified to, so a text seen before is not
        # minified again. Most of what the build emits is seen many times
        # over: a tool's modules are the same bytes in every language, and
        # within one language every prose page's analytics.js is the same
        # script. Minifying is deterministic - the module says so and stakes
        # its --check on it - which is what makes the answer reusable at all.
        #
        # build() fills the JavaScript and CSS caches with every tool's
        # sources before the languages start, and that placing is the point:
        # each language builds in its own process and is handed a copy of this
        # object, so work cached here once is carried into all of them, where
        # a cache warmed inside a worker would die with it.
        self._js_seen = {}
        self._css_seen = {}

    def html(self, path, text):
        text = write(path, minify.html(text, self.html_banner)
                     if self.enabled else text)
        self.page_links[path] = LINK.findall(text)
        return text

    def js(self, path, text, where):
        return write(path, self.js_text(text, where))

    def js_text(self, text, where):
        """Returns rather than writes, for the one script that is hashed before
        it is written - see the note beside lang.js in build(). Everything else
        goes through js() and never sees the string."""
        if not self.enabled:
            return text
        done = self._js_seen.get(text)
        if done is None:
            done = self._js_seen[text] = minify.js(text, self.js_banner, where)
        return done

    def css_text(self, text):
        """Returns rather than writes, because a stylesheet has to be hashed
        after minifying and before being written - the hash goes in the URL the
        page asks for it by."""
        if not self.enabled:
            return text
        done = self._css_seen.get(text)
        if done is None:
            done = self._css_seen[text] = cssmin.css(text, self.css_banner)
        return done
