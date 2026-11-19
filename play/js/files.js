/* Enregistrement / partage de fichiers : navigateur (téléchargement) et APK Capacitor (Filesystem + Share). */
(function () {
  'use strict';
  function native() { var C = window.Capacitor; return !!(C && ((C.isNativePlatform && C.isNativePlatform()) || (C.getPlatform && C.getPlatform() !== 'web'))); }
  /* Plugin natif : proxy @capacitor/core s'il est chargé ; sinon (page sans bundle, comme ici) on appelle directement le pont natif
     (Capacitor.nativePromise) pour les méthodes déclarées dans PluginHeaders. */
  function plug(n) {
    var C = window.Capacitor; if (!C) { return null; }
    if (C.Plugins && C.Plugins[n]) { return C.Plugins[n]; }
    var H = C.PluginHeaders && C.PluginHeaders.filter(function (h) { return h.name === n; })[0];
    if (!H || typeof C.nativePromise !== 'function') { return null; }
    var o = {}; (H.methods || []).forEach(function (m) { if (m.rtype === 'promise') { o[m.name] = function (a) { return C.nativePromise(n, m.name, a || {}); }; } });
    return o;
  }
  function toBlob(o) {
    if (o.blob) { return o.blob; }
    if (o.dataUrl) { var m = /^data:([^;]+);base64,(.*)$/.exec(o.dataUrl), bin = atob(m[2]), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) { u[i] = bin.charCodeAt(i); } return new Blob([u], { type: m[1] }); }
    return new Blob([o.text || ''], { type: o.mime || 'text/plain' });
  }
  /* o = { filename, mime, text | dataUrl | blob, title }
     résultat (promesse) : 'native' (feuille de partage ouverte), 'download', ou rejet */
  function save(o) {
    var Fs = plug('Filesystem'), Sh = plug('Share');
    if (native() && Fs && Sh) {
      var data, opts = { path: o.filename, directory: 'CACHE', recursive: true };
      if (o.dataUrl) { data = o.dataUrl.split(',')[1]; } else if (o.blob) { return blobToB64(o.blob).then(function (b) { return nativeWrite(Fs, Sh, o, b, null); }); } else { data = o.text || ''; opts.encoding = 'utf8'; }
      return nativeWrite(Fs, Sh, o, data, opts.encoding || null);
    }
    return new Promise(function (res, rej) {
      try {
        var b = toBlob(o), url = URL.createObjectURL(b), a = document.createElement('a');
        a.href = url; a.download = o.filename; a.rel = 'noopener'; a.style.display = 'none'; document.body.appendChild(a); a.click();
        setTimeout(function () { try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) { /* déjà retiré */ } }, 4000); res('download');
      } catch (e) { rej(e); }
    });
  }
  function blobToB64(b) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(b); }); }
  function nativeWrite(Fs, Sh, o, data, enc) {
    var args = { path: o.filename, data: data, directory: 'CACHE', recursive: true }; if (enc) { args.encoding = enc; }
    return Fs.writeFile(args).then(function (r) {
      return Sh.share({ title: o.title || o.filename, text: o.title || '', url: r.uri, dialogTitle: o.dialog || 'Enregistrer ou partager' });
    }).then(function () { return 'native'; });
  }
  /* copie dans le presse-papiers (avec repli execCommand pour les WebView / file://) */
  function copy(text, el) {
    return new Promise(function (res, rej) {
      function legacy() {
        try {
          var t = el || document.createElement('textarea'); if (!el) { t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); }
          t.focus(); t.select(); t.setSelectionRange(0, text.length + 1); var ok = document.execCommand('copy'); if (!el) { document.body.removeChild(t); } ok ? res(true) : rej(new Error('copy'));
        } catch (e) { rej(e); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) { navigator.clipboard.writeText(text).then(function () { res(true); }, legacy); } else { legacy(); }
    });
  }
  window.Files = { save: save, copy: copy, native: native };
})();
