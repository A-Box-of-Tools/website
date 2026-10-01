/**
 * Type to narrow the hub to the tool you came for.
 *
 * GENERATED FILE - do not edit; see shared/hub-filter.js.
 *
 * WHY THE FRONT PAGE NEEDS THIS AND DID NOT USED TO
 *
 * The hub is four categories a reader scrolls through in full. That was the
 * right shape at a dozen tools and it is the wrong one at thirty-seven:
 * somebody who already knows they want "the hash one" reads three headings and
 * part of a fourth to find it, and somebody who does not know what this site
 * has still gets the categories, unchanged, because nothing here is removed
 * until they type.
 *
 * THREE RULES, WHICH ARE THE SAME RULE THE REST OF THE SITE FOLLOWS
 *
 *   1. NOTHING LEAVES THE PAGE. There is no request, no suggestion endpoint,
 *      no index fetched from anywhere. It reads the cards the build already
 *      wrote into the page and sets `hidden` on the ones that do not match.
 *      A search box is the control a visitor most reasonably expects to be
 *      wired to somebody's server, so on this site of all sites it has to be
 *      obviously not.
 *   2. NOTHING IS REMEMBERED. No history entry, no query string, no
 *      localStorage. The filter is a way of looking at one page, not a
 *      preference, and the language switcher next to it deliberately stores
 *      nothing either.
 *   3. IT IS AN ENHANCEMENT, STRICTLY. The field is in the markup but carries
 *      `hidden`, and this script is the only thing that reveals it. With
 *      JavaScript off - which, on a site whose whole argument is that you
 *      should not have to trust it, people really do - the page is exactly the
 *      page it was, rather than a search box that does nothing.
 *
 * WHAT IT MATCHES ON
 *
 * The name and the one-line description, both already on the card, plus the
 * name of the category the card sits in - so "video" finds the whole group and
 * "pdf" finds the four that say so. Accents are stripped from both sides
 * before comparing, because a reader typing in a hurry in French or Portuguese
 * should not have to get them right to find their own language's page. Format
 * identifiers also find the tools that handle them, even when the card says
 * "format change" rather than spelling out JPG and PNG. Multiple words may
 * occur anywhere in that text; a task need not be a quotation from a card.
 */

(function () {
  'use strict';

  var box = document.getElementById('tool-filter');
  var input = document.getElementById('tool-filter-input');
  var empty = document.getElementById('tool-filter-none');
  if (!box || !input || !empty) return;

  /* Diacritics off both sides, so "compresion" finds "Compresión" and a German
     reader is not stopped by an umlaut they did not type.

     Hyphens go the same way, for the same reason. The time-lapse tool is
     called "Time-Lapse Maker" and nobody types it that way - they type
     timelapse, which is what its own address says - and until this line that
     search found nothing at all. A reader should not have to guess where a
     name keeps its punctuation any more than where it keeps its accents. */
  function fold(text) {
    return text.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-\u2010-\u2015\u2212]/g, '')
      .replace(/\bjpeg\b/g, 'jpg');
  }

  /* These are file identifiers, shared by the translated interfaces. The
     stable source slug keeps them attached to the same capability when a
     language gives the page a different address. */
  var formats = {
    'resize-image': ['jpg png webp gif bmp avif', 'jpg png webp'],
    'heic-to-jpg': ['heic heif', 'jpg png webp'],
    'webp-to-jpg': ['webp', 'jpg'],
    'png-to-webp': ['png', 'webp'],
    'avif-to-jpg': ['avif', 'jpg'],
    'svg-to-image': ['svg', 'png jpg webp'],
    'image-to-svg': ['jpg png webp', 'svg'],
    'image-to-ico': ['jpg png webp', 'ico icns'],
    'convert-to-mp4': ['webm mkv mov mp4', 'mp4'],
    'gif-to-mp4': ['gif', 'mp4'],
    'video-to-gif': ['mp4 webm mov', 'gif'],
    'yaml-to-json': ['yaml yml json', 'yaml yml json'],
    'xml-formatter': ['xml json', 'xml json'],
    'json-formatter': ['json xml html css yaml yml', 'json xml html css yaml yml']
  };
  var connectors = /^(to|into|a|al|para|de|em|en|zu|in|nach|convert|convertir|converter|umwandeln)$/;
  var fileFormat = /^(jpg|png|webp|gif|bmp|avif|heic|heif|svg|ico|icns|webm|mkv|mov|mp4|yaml|yml|json|xml|html|css)$/;

  /* Every card, with the text it can be found by worked out once. Reading this
     on each keystroke would be re-reading the whole page thirty-seven times a
     second for an answer that cannot have changed. */
  var groups = [];
  var items = [];
  Array.prototype.forEach.call(
    document.querySelectorAll('main .category'), function (section) {
      var heading = section.querySelector('h2');
      var note = section.querySelector('.category-note');
      var groupText = fold(
        (heading ? heading.textContent : '') + ' ' + (note ? note.textContent : ''));
      var rows = [];
      Array.prototype.forEach.call(
        section.querySelectorAll('.tool-grid > li'), function (row) {
          var card = row.querySelector('a.tool-card');
          var slug = card ? card.getAttribute('data-tool') : '';
          var capability = formats[slug];
          var entry = { row: row, slug: slug, capability: capability,
            text: fold(row.textContent) + ' ' + groupText
              + ' ' + (capability ? capability.join(' ') : '') };
          rows.push(entry);
          items.push(entry);
        });
      groups.push({ section: section, rows: rows });
    });

  if (!items.length) return;

  function apply() {
    var query = fold(input.value.trim());
    var terms = query.split(/\s+/).filter(function (term) {
      return term && !connectors.test(term);
    });
    var conversion = terms.length === 2 && fileFormat.test(terms[0])
      && fileFormat.test(terms[1]) && query.split(/\s+/).length > 2;
    var shown = 0;

    groups.forEach(function (group) {
      var visible = 0;
      group.rows.forEach(function (entry) {
        var match = !query || entry.text.indexOf(query) !== -1
          || (terms.length > 0 && terms.every(function (term) {
            return entry.text.indexOf(term) !== -1;
          }));
        if (conversion) {
          match = !!entry.capability
            && entry.capability[0].split(' ').indexOf(terms[0]) !== -1
            && entry.capability[1].split(' ').indexOf(terms[1]) !== -1;
          if (entry.slug === 'json-formatter' && terms[0] !== terms[1]) {
            match = (terms[0] === 'json' && /^(xml|yaml|yml)$/.test(terms[1]))
              || (terms[1] === 'json' && /^(xml|yaml|yml)$/.test(terms[0]));
          }
        }
        entry.row.hidden = !match;
        if (match) visible++;
      });
      /* A heading with nothing under it is worse than no heading: it reads as
         a category that has lost its tools rather than as one nothing in the
         search matched. */
      group.section.hidden = visible === 0;
      shown += visible;
    });

    /* Announced rather than merely drawn: this sentence sits inside a live
       region that has been in the page since it loaded, so revealing it is a
       change the screen reader is already watching for. A reader who cannot
       see the grid go empty is told that it has. */
    empty.hidden = shown !== 0;
  }

  input.addEventListener('input', apply);

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && input.value) {
      input.value = '';
      apply();
    }
  });

  /* The shortcut every search field on a code-hosting site has, and the reason
     the field draws a "/" at its end. Ignored while the visitor is typing
     somewhere else, or holding a modifier, so it can never eat a real
     keystroke. */
  document.addEventListener('keydown', function (event) {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    var active = document.activeElement;
    if (active && (active.isContentEditable
        || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return;
    event.preventDefault();
    input.focus();
  });

  box.hidden = false;
  /* The page may have been restored with a value already in the field - a
     back-button return keeps it - so the grid is brought into line with
     whatever is in there before anybody touches a key. */
  if (input.value) apply();
})();
