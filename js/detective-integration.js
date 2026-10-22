'use strict';
// Corpus actions use the museum's tools. Pass the text in the URL fragment,
// without depending on clipboard permission or sending it in an HTTP query.
window.openInDetective = function (ciphertext) {
  const url = new URL('cipher-detective.html', location.href);
  url.hash = encodeURIComponent(ciphertext);
  window.open(url.href, '_blank', 'noopener');
};

window.openInWorkbench = function (ciphertext) {
  const url = new URL('lab/workbench.html', location.href);
  url.hash = 'ct=' + encodeURIComponent(ciphertext);
  window.open(url.href, '_blank', 'noopener');
};
// Buttons are owned by cipher-corpus.js when each card is rendered. Do not
// append another set at DOMContentLoaded: fetch timing and pagination differ.
