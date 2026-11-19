/*global navigator*/
(function () {
  'use strict';
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    navigator.serviceWorker.register('../sw.js').catch(function () {});
  }
})();
