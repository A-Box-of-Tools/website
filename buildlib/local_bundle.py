"""A local tool needs its page and pairing helper together, without the
public site's platform scripts or a download-time network dependency."""

from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo
import io


def write_bundle(dest, templates, tool, body, css, base_css, js_version, lang):
    if not tool.get('local_bundle'):
        return
    helper = tool['dir'] / 'local' / 'helper.py'
    if not helper.is_file():
        raise ValueError(f'{tool["slug"]}: local bundle needs local/helper.py')
    page = templates.render('local-tool.html', {
        'tool': tool, 'body': body + '\n</main>', 'lang': lang,
        'js_v': js_version,
    })
    files = {
        'index.html': page.encode('utf-8'),
        'styles.css': css.encode('utf-8'),
        'site.css': base_css.read_bytes(),
        'helper.py': helper.read_bytes(),
        'README.txt': (tool['dir'] / 'README.md').read_bytes(),
    }
    for path in sorted((dest / 'src').rglob('*.js')):
        files[path.relative_to(dest).as_posix()] = path.read_bytes()
    # A fixed timestamp makes the package describe source bytes rather than
    # the wall-clock time a build happened to run.
    buffer = io.BytesIO()
    with ZipFile(buffer, 'w', compression=ZIP_DEFLATED) as archive:
        for name, data in sorted(files.items()):
            entry = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            archive.writestr(entry, data)
    (dest / f'{tool["slug"]}.zip').write_bytes(buffer.getvalue())
