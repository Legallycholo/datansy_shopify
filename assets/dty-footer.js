/**
 * Datansy Footer — collapsible columns on mobile
 */
(function () {
  'use strict';

  function initFooterAccordion() {
    var columns = document.querySelectorAll('[data-footer-column]');
    if (!columns.length) return;

    var mq = window.matchMedia('(min-width: 768px)');

    function setup() {
      columns.forEach(function (col, i) {
        var toggle = col.querySelector('[data-footer-toggle]');
        if (!toggle) return;

        if (mq.matches) {
          col.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        } else if (i === 0) {
          col.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          col.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    columns.forEach(function (col) {
      var toggle = col.querySelector('[data-footer-toggle]');
      if (!toggle) return;

      toggle.addEventListener('click', function () {
        if (mq.matches) return;
        var isOpen = col.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
      });
    });

    setup();
    mq.addEventListener('change', setup);
  }

  function initBackToTop() {
    var btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFooterAccordion();
    initBackToTop();
  });
})();
