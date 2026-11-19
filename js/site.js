/* Ascension official site — light, no framework. Compatible ES5-ish (var, no modules). */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---- Nav ---- */
  var nav = $('.nav');
  var toggle = $('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.nav-links a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---- Massif tabs ---- */
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var panels = $$('[role="tabpanel"]', root);
    function go(id, focusTab) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('aria-controls') === id;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on && focusTab) t.focus();
      });
      panels.forEach(function (p) { p.hidden = p.id !== id; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { go(t.getAttribute('aria-controls'), false); });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); go(next.getAttribute('aria-controls'), true); }
      });
    });
  });

  /* ---- Lightbox ---- */
  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('#lbImg', lb);
    var lbCap = $('#lbCap', lb);
    var items = $$('[data-gallery] button');
    var idx = 0;
    var lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var btn = items[idx];
      var img = btn.querySelector('img');
      lbImg.src = btn.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = btn.getAttribute('data-caption') || img.alt || '';
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      $('#lbClose', lb).focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    items.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });
    $('#lbClose', lb).addEventListener('click', close);
    $('#lbPrev', lb).addEventListener('click', function () { show(idx - 1); });
    $('#lbNext', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX == null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (dx > 40) show(idx - 1);
      if (dx < -40) show(idx + 1);
      touchX = null;
    });
  }

  /* ---- Copy SHA-256 ---- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      function ok() {
        var prev = btn.textContent;
        btn.textContent = 'Copié';
        setTimeout(function () { btn.textContent = prev; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---- Device recommendation ---- */
  (function () {
    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/i.test(ua);
    var target = isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop');
    $$('[data-rec]').forEach(function (el) {
      if (el.getAttribute('data-rec') === target) el.hidden = false;
    });
  })();

  /* ---- PWA install ---- */
  var deferredPrompt = null;
  var installBtns = $$('[data-install]');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    installBtns.forEach(function (b) { b.hidden = false; });
  });
  installBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
      } else {
        var g = $('#installGuide');
        if (g) {
          if (g.tagName === 'DETAILS') g.open = true;
          if (g.scrollIntoView) g.scrollIntoView({ block: 'center' });
        }
      }
    });
  });

  /* ---- Service worker (site pages) ---- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }

  /* ---- Soft parallax (disabled if reduced motion) ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ridges = $$('.ridge');
  if (!reduce && ridges.length && !window.matchMedia('(pointer: coarse)').matches) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        ridges.forEach(function (r) {
          var f = parseFloat(r.getAttribute('data-depth') || '0.15');
          r.style.transform = 'translateY(' + Math.round(y * f) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }
})();
