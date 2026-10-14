/**
 * Favorites belong to the browser, not a language or a particular page.
 * Canonical slugs keep a saved tool attached to its translated address. Only
 * existing catalogue cards supply links and markup; stored values never do.
 */
(function () {
  'use strict';

  var KEY = 'abox-favorites';
  var buttons = Array.from(document.querySelectorAll('[data-favorite]'));
  if (!buttons.length) return;
  var section = document.getElementById('favorites');
  var grid = document.getElementById('favorite-tools');
  var note = document.getElementById('favorites-note');
  var unavailable = document.getElementById('favorites-unavailable');
  var catalogue = new Map();
  var copies = new Map();
  var saved = [];
  var persistent = true;
  var failed = false;

  document.querySelectorAll('.category .tool-grid > li').forEach(function (row) {
    var card = row.querySelector('a[data-tool]');
    if (card) catalogue.set(card.getAttribute('data-tool'), row);
  });

  function parse(raw) {
    try {
      var values = JSON.parse(raw);
      if (!Array.isArray(values)) return [];
      return Array.from(new Set(values.filter(function (value) {
        return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
      })));
    } catch (error) {
      return [];
    }
  }

  function read() {
    if (!persistent) return;
    try {
      saved = parse(window.localStorage.getItem(KEY));
    } catch (error) {
      persistent = false;
    }
  }

  function write() {
    try {
      if (!persistent) throw new Error();
      if (saved.length) window.localStorage.setItem(KEY, JSON.stringify(saved));
      else window.localStorage.removeItem(KEY);
    } catch (error) {
      // A blocked write still permits a selection on this page, without a
      // claim that it will survive a reload or reach another tab.
      persistent = false;
      failed = true;
    }
  }

  function render() {
    buttons.forEach(function (button) {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(saved.indexOf(button.getAttribute('data-favorite')) !== -1));
    });
    if (unavailable) unavailable.hidden = !failed;
    if (note) note.hidden = !persistent;
    if (!section || !grid) return;

    copies.forEach(function (row, slug) {
      if (saved.indexOf(slug) !== -1) return;
      if (row.contains(document.activeElement)) {
        var next = Array.from(copies).find(function (entry) {
          return entry[0] !== slug && saved.indexOf(entry[0]) !== -1;
        });
        var target = next ? next[1].querySelector('[data-favorite]')
          : catalogue.get(slug).querySelector('[data-favorite]');
        // A search may have hidden the original card. The search field is a
        // visible destination when the last favorite disappears in that case.
        if (target.closest('[hidden]')) target = document.getElementById('tool-filter-input');
        if (target) target.focus();
      }
      row.remove();
      copies.delete(slug);
    });

    var previous = null;
    catalogue.forEach(function (source, slug) {
      if (saved.indexOf(slug) === -1) return;
      var row = copies.get(slug);
      if (!row) {
        row = source.cloneNode(true);
        row.hidden = false;
        bind(row.querySelector('[data-favorite]'));
        copies.set(slug, row);
        grid.insertBefore(row, previous ? previous.nextElementSibling : grid.firstElementChild);
      }
      row.querySelector('[data-favorite]').setAttribute('aria-pressed', 'true');
      previous = row;
    });
    section.hidden = copies.size === 0;
  }

  function bind(button) {
    button.addEventListener('click', function () {
      // Read just before writing so a click cannot overwrite a newer choice
      // in a second tab whose storage event has not been delivered yet.
      read();
      var slug = button.getAttribute('data-favorite');
      var index = saved.indexOf(slug);
      if (index === -1) saved.push(slug);
      else saved.splice(index, 1);
      write();
      render();
    });
  }

  buttons.forEach(bind);
  window.addEventListener('storage', function (event) {
    if (event.key !== KEY && event.key !== null) return;
    read();
    render();
  });
  window.addEventListener('pageshow', function () {
    read();
    render();
  });
  read();
  render();
})();
