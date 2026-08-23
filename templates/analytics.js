/*
  Google Analytics bootstrap - the contents of Google's inline <script> snippet,
  moved into a file of its own. GENERATED FILE; see templates/analytics.js.

  The snippet as Google supplies it is inline, which under this page's
  Content-Security-Policy would need script-src 'unsafe-inline'. That single
  addition would also permit any other inline script - including one injected
  through a bug - so the code lives here instead and the policy stays closed.
  Behaviour is identical; only the delivery changed.

  This measures page visits. It is never given anything about your {{ words.plural }}: no
  file, no thumbnail, no filename, no dimension, no count{{ words.analytics_extra }}. Nothing here
  can see any of that, and there is no custom event in this file to carry it.

  One event does exist, and it is not in this file: shared/feedback.js sends
  `tool_feedback` when somebody answers the thumbs up or thumbs down that
  appears after a download. It carries three things - which tool, "up" or
  "down", and one of four fixed reasons - and it is sent only on a press of one
  of those buttons. The list above still holds: no file, no filename, no
  dimension, no count, and no free-text field that could carry one by accident.
*/

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('js', new Date());
gtag('config', '{{ site.analytics_id }}');
