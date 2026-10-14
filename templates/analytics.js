/*
  Google Analytics bootstrap - the contents of Google's inline <script> snippet,
  moved into a file of its own. GENERATED FILE; see templates/analytics.js.

  The snippet as Google supplies it is inline, which under this page's
  Content-Security-Policy would need script-src 'unsafe-inline'. That single
  addition would also permit any other inline script - including one injected
  through a bug - so the code lives here instead and the policy stays closed.
  Behaviour is identical; only the delivery changed.

  This measures page visits and the first successful tool use on each visit.
  It is never given anything about your {{ words.plural }}: no
  file, no thumbnail, no filename, no dimension, no count{{ words.analytics_extra }}. Nothing here
  can see any of that. `tool_complete` carries only the tool's static slug.

  Separately, shared/feedback.js sends
  `tool_feedback` when somebody answers the thumbs up or thumbs down that
  appears after a download. It carries three things - which tool, "up" or
  "down", and one of four fixed reasons - and it is sent only on a press of one
  of those buttons. The list above still holds: no file, no filename, no
  dimension, no count, and no free-text field that could carry one by accident.
*/

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Google's snippet stops at the line above, and this one puts back what the
// build takes away. `gtag` is a function declaration, and the deployed build
// renames declarations, so the global that every piece of documentation and
// every other script on the page expects does not exist once it is minified.
// A property name survives, so saying it this way makes the name real in both
// builds. Found when shared/feedback.js sent nothing at all in production and
// everything in every test.
window.gtag = gtag;

// An automated browser is not a visit, and says as much: Playwright, Selenium
// and Puppeteer all set navigator.webdriver. This site's own QA suite opens
// every page several times a day, and without this every one of those loads
// arrives as a session - a bounce rate, a country, an audience of robots
// averaged in with the people the numbers are kept for.
//
// `ga-disable-<id>` is Google's own switch rather than something invented
// here, and it is the reason this is two lines and not a fork in the code
// below: gtag stays defined and callable, so this file, shared/feedback.js
// and anything else that calls it carry on working unchanged. The calls
// simply stop leaving the machine.
//
// It is set before the config call below, which is what sends the page view;
// the tag script above is async and sends nothing on its own. Deliberately
// not an inline script in the head, for the same CSP reason this whole file
// exists.
//
// The same switch, thrown for the same reason, when this file is running
// anywhere but the site's own domain: a pull request's preview on Cloudflare
// Pages, a build served from a laptop. Those are the same bytes as
// production - which is what makes testing them worth anything - so the file
// cannot be built differently there; it has to notice where it is. A visit
// to a preview is a developer checking their work, not a visitor.
var notAVisit = navigator.webdriver || location.origin + '/' !== '{{ site.domain }}';

if (notAVisit) {
  window['ga-disable-{{ site.analytics_id }}'] = true;
}

// Page context is public site metadata. Invitation fragments and arbitrary
// query fields are not: a room key or pasted value must not become a page URL
// in Analytics. Keep the standard campaign fields so paid and tagged visits
// retain their attribution, and never read a tool's inputs or result DOM.
var canonical = document.querySelector('link[rel="canonical"]');
// The 404 deliberately has no canonical. A fixed error-page address keeps
// missing routes out of homepage traffic without reporting the requested path.
var measurementPage = new URL(canonical ? canonical.href : '{{ site.domain }}404.html');
var campaign = new URLSearchParams(location.search);
['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term',
  'gclid', 'dclid', 'gbraid', 'wbraid'].forEach(function (key) {
  var value = campaign.get(key);
  if (value) measurementPage.searchParams.set(key, value);
});
var measurementReferrer = '';
try {
  var referrer = new URL(document.referrer);
  if (referrer.protocol === 'https:' || referrer.protocol === 'http:') {
    measurementReferrer = referrer.origin + '/';
  }
} catch (err) { /* Direct visits have no referrer. */ }

gtag('js', new Date());
gtag('config', '{{ site.analytics_id }}', {
  page_location: measurementPage.href,
  page_title: document.title,
  page_referrer: measurementReferrer,
});

// Completion belongs to a tool's verified outcome, not a guessed button id:
// an exporter calls this after preparing a result, a copy action after the
// clipboard accepts it, and a viewer after displaying a usable analysis.
// There are no arguments on purpose. In particular this API has no place for
// a file, an entered value, an output name or an error message to go.
(function () {
  var panel = document.getElementById('feedback');
  var slug = panel && panel.getAttribute('data-tool');
  if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) return;
  var complete = false;
  window.aboxToolComplete = function () {
    if (complete) return;
    try {
      gtag('event', 'tool_complete', {
        send_to: '{{ site.analytics_id }}',
        tool_slug: slug,
      });
      complete = true;
    } catch (err) {
      // A blocked or broken counter must never break the local operation.
    }
  };
}());

// AdSense, behind the same test, for a sharper version of the same reason. It
// used to be a plain async <script> in the head, so every one of those
// automated loads asked Google for an ad as well: noise while the account is
// unapproved, and invalid traffic against our own account the moment it is
// not - thousands of requests a day from a runner that is not a person who
// could ever see one, which is how an approved account gets disabled.
//
// A <script> tag cannot test anything, and the Content-Security-Policy forbids
// the inline script that would test it for them, so the decision lives here
// beside the one it has to agree with. Verification does not run through this
// and is unaffected: that is the inert <meta name="google-adsense-account">
// tag the hub, the guides and the prose pages carry, and the ads.txt entry -
// neither of which is script, which is why they work here at all.
if (!notAVisit) {
  var ad = document.createElement('script');
  ad.async = true;
  ad.crossOrigin = 'anonymous';
  ad.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ site.adsense_client }}';
  document.head.appendChild(ad);
}
