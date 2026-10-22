/* ─── Cipher Museum — Image & Diagram Lightbox ─── */
document.addEventListener('DOMContentLoaded', function () {
  // Build overlay
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged image');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  var lbImg = document.createElement('img');
  lbImg.src = '';
  lbImg.alt = '';

  // Inline SVG figures are enlarged by cloning the node, not via src
  var svgHolder = document.createElement('div');

  var caption = document.createElement('div');
  caption.className = 'lightbox-caption';

  overlay.appendChild(closeBtn);
  overlay.appendChild(lbImg);
  overlay.appendChild(svgHolder);
  overlay.appendChild(caption);
  document.body.appendChild(overlay);

  var lastTrigger = null; // focus returns here on close
  var previousOverflow = '';
  function lockScroll(){
    if(!overlay.classList.contains('active')) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function openLightbox(src, alt, cap) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbImg.style.display = '';
    caption.textContent = cap || '';
    lockScroll();
    overlay.classList.add('active');
    closeBtn.focus();
  }

  function openLightboxSvg(svgEl, cap) {
    var clone = svgEl.cloneNode(true);
    // The in-page figure caps its own width; let the enlarged copy fill the viewport
    clone.style.maxWidth = '92vw';
    clone.style.maxHeight = '90vh';
    clone.style.width = '1100px';
    clone.style.height = 'auto';
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    svgHolder.innerHTML = '';
    svgHolder.appendChild(clone);
    lbImg.style.display = 'none';
    caption.textContent = cap || '';
    lockScroll();
    overlay.classList.add('active');
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = previousOverflow;
    lbImg.src = '';
    svgHolder.innerHTML = '';
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }

  // Close handlers
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target !== lbImg && !svgHolder.contains(e.target)) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault(); closeLightbox();
    } else if (e.key === 'Tab') {
      // Images/diagrams are display content; Close is the sole dialog control.
      e.preventDefault(); closeBtn.focus();
    }
  });

  function captionFor(el) {
    var fig = el.closest('figure') || el.closest('.figure');
    var capEl = fig ? fig.querySelector('.figure-caption') : null;
    return capEl ? capEl.textContent : '';
  }

  // Make a figure openable by mouse and keyboard alike
  function attach(el, open) {
    el.style.cursor = 'zoom-in';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var base = el.getAttribute('aria-label') || el.getAttribute('alt') || 'figure';
    el.setAttribute('aria-label', 'Enlarge: ' + base);
    function fire(e) {
      e.preventDefault();
      e.stopPropagation();
      lastTrigger = el;
      open();
    }
    el.addEventListener('click', fire);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') fire(e);
    });
  }

  document.querySelectorAll('.figure img').forEach(function (img) {
    attach(img, function () { openLightbox(img.src, img.alt, captionFor(img)); });
  });

  document.querySelectorAll('.figure svg').forEach(function (svg) {
    attach(svg, function () { openLightboxSvg(svg, captionFor(svg)); });
  });
});
