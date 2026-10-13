/**
 * Type to narrow the hub to the tool you came for.
 *
 * GENERATED FILE - do not edit; see shared/hub-filter.js.
 *
 * WHY THE FRONT PAGE NEEDS THIS
 *
 * Three tools from each category show what is in the box without making a
 * visitor read the whole catalogue first. Every card still ships in the page:
 * "View all" reveals the rest, and a search always checks them all.
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
 *      localStorage. Searching and expanding are ways of looking at one page,
 *      not preferences.
 *   3. IT IS AN ENHANCEMENT, STRICTLY. The field and expansion buttons carry
 *      `hidden` until this script is ready. With JavaScript off every tool
 *      remains visible, rather than leaving a search box or button that does
 *      nothing.
 *
 * WHAT IT MATCHES ON
 *
 * The name, compact tagline and full description, plus the name and note of
 * the category the card sits in. The full description stays in data-search
 * when the visible card is shortened, so a detail that found a tool before
 * still finds it now. Accents are stripped from both sides before comparing,
 * because a reader typing in a hurry should not have to get them right.
 * Format identifiers also find tools when the card says "format change".
 * Multiple words may occur anywhere in that text; a task need not be a
 * quotation from a card.
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

  /* Index before collapsing anything. Searching only the preview would make a
     tool vanish from the box for the reader who knows exactly what they need. */
  var groups = [];
  var items = [];
  Array.prototype.forEach.call(
    document.querySelectorAll('main .category'), function (section) {
      var heading = section.querySelector('h2');
      var note = section.querySelector('.category-note');
      var toggle = section.querySelector('.category-toggle');
      var groupText = fold(
        (heading ? heading.textContent : '') + ' ' + (note ? note.textContent : ''));
      var rows = [];
      Array.prototype.forEach.call(
        section.querySelectorAll('.tool-grid > li'), function (row) {
          var card = row.querySelector('a.tool-card');
          var slug = card ? card.getAttribute('data-tool') : '';
          var capability = formats[slug];
          var description = card ? card.getAttribute('data-search') || '' : '';
          var entry = { row: row, slug: slug, capability: capability,
            text: fold(row.textContent + ' ' + description) + ' ' + groupText
              + ' ' + (capability ? capability.join(' ') : '') };
          rows.push(entry);
          items.push(entry);
        });
      groups.push({
        section: section,
        rows: rows,
        toggle: toggle,
        more: section.querySelector('.category-more'),
        less: section.querySelector('.category-less'),
        expanded: !toggle
      });
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
      group.rows.forEach(function (entry, index) {
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
        entry.row.hidden = !match || (!query && !group.expanded && index >= 3);
        if (match) visible++;
      });
      /* Searching reveals every match, and clearing it returns to the way
         each category was being browsed. The hidden button keeps that state
         without suggesting that some search results have been held back. */
      if (group.toggle) {
        group.toggle.hidden = !!query || group.rows.length <= 3;
        group.toggle.setAttribute('aria-expanded', String(group.expanded));
      }
      if (group.more) group.more.hidden = group.expanded;
      if (group.less) group.less.hidden = !group.expanded;

      /* A heading with nothing under it is worse than no heading: it reads as
         a category that has lost its tools rather than as one nothing in the
         search matched. */
      group.section.hidden = visible === 0;
      shown += visible;
    });

    /* Announced rather than merely drawn: this sentence sits inside a live
       region that has been in the page since it loaded, so revealing it is a
       change the screen reader is already watching for. */
    empty.hidden = shown !== 0;
  }

  groups.forEach(function (group) {
    if (!group.toggle) return;
    group.toggle.addEventListener('click', function () {
      group.expanded = !group.expanded;
      apply();
    });
  });

  /* A category link promises the whole category. Clear a filter that could
     hide its target before the browser follows the ordinary fragment link.
     The same promise holds when a saved link opens the page, or Back restores
     a fragment whose category a later search had hidden. */
  function expandHash(hash, scroll) {
    var id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch (error) {
      return false;
    }
    var group = groups.find(function (candidate) {
      return candidate.section.getAttribute('id') === id;
    });
    if (!group) return false;
    input.value = '';
    group.expanded = true;
    apply();
    if (scroll) group.section.scrollIntoView({ block: 'start' });
    return true;
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('.hub-categories a'), function (anchor) {
      anchor.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey
            || event.shiftKey || event.altKey
            || (typeof event.button === 'number' && event.button !== 0)) return;
        var hash = anchor.getAttribute('href') || '';
        if (hash.charAt(0) === '#') expandHash(hash, false);
      });
    });
  window.addEventListener('hashchange', function () {
    expandHash(window.location.hash, true);
  });

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

  /* A restored search is applied before the field is revealed. An explicit
     category fragment takes precedence so the browser has a visible target. */
  if (!expandHash(window.location.hash, true)) apply();
  box.hidden = false;
})();
