/**
 * GSMPRO Homepage JS — hero rotation, FAQ accordion, coupon copy
 * Full section wiring in Phase 5
 */
(function () {
  'use strict';

  function initHeroRotation() {
    var hero = document.querySelector('[data-hero-rotation]');
    if (!hero) return;

    var sets = [];
    try {
      sets = JSON.parse(hero.dataset.sloganSets || '[]');
    } catch (e) {
      return;
    }

    if (sets.length < 2) return;

    var lines = hero.querySelectorAll('[data-hero-line]');
    var currentSet = 0;

    function showSet(index) {
      var set = sets[index];
      lines.forEach(function (line, i) {
        line.textContent = set[i] || '';
        line.classList.remove('is-hidden');
      });
    }

    setInterval(function () {
      lines.forEach(function (line) {
        line.classList.add('is-hidden');
      });
      setTimeout(function () {
        currentSet = (currentSet + 1) % sets.length;
        showSet(currentSet);
      }, 400);
    }, 4000);

    showSet(0);
  }

  function initFaqAccordion() {
    var items = document.querySelectorAll('[data-faq-item]');
    items.forEach(function (item) {
      var btn = item.querySelector('[data-faq-toggle]');
      var answer = item.querySelector('[data-faq-answer]');
      if (!btn || !answer) return;

      function setOpen(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          answer.classList.add('is-open');
          answer.removeAttribute('hidden');
        } else {
          answer.classList.remove('is-open');
          answer.setAttribute('hidden', '');
        }
      }

      setOpen(false);

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        document.querySelectorAll('[data-faq-item]').forEach(function (otherItem) {
          var otherBtn = otherItem.querySelector('[data-faq-toggle]');
          var otherAnswer = otherItem.querySelector('[data-faq-answer]');
          if (!otherBtn || !otherAnswer) return;
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.classList.remove('is-open');
          otherAnswer.setAttribute('hidden', '');
        });

        if (!isOpen) {
          setOpen(true);
        }
      });
    });
  }

  function initCouponCopy() {
    document.querySelectorAll('[data-coupon-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = btn.dataset.couponCode || window.gsmSettings.couponCode;
        if (!code) return;

        navigator.clipboard.writeText(code).then(function () {
          var original = btn.textContent;
          btn.textContent = window.gsmSettings.strings.couponCopied || '¡Copiado!';
          setTimeout(function () {
            btn.textContent = original;
          }, 2000);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroRotation();
    initFaqAccordion();
    initCouponCopy();
  });
})();
