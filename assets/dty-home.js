/**
 * Datansy Homepage JS — hero rotation, FAQ accordion, coupon copy
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
    var animating = false;

    function showSet(index) {
      if (animating) return;
      animating = true;

      lines.forEach(function (line) {
        line.classList.add('is-hidden');
      });

      setTimeout(function () {
        var set = sets[index];
        lines.forEach(function (line, i) {
          line.textContent = set[i] || '';
          line.classList.add('is-entering');
          line.classList.remove('is-hidden');
        });

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            lines.forEach(function (line) {
              line.classList.remove('is-entering');
            });
            animating = false;
          });
        });
      }, 380);
    }

    setInterval(function () {
      currentSet = (currentSet + 1) % sets.length;
      showSet(currentSet);
    }, 4500);
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
        var code = btn.dataset.couponCode || window.dtySettings.couponCode;
        if (!code) return;

        navigator.clipboard.writeText(code).then(function () {
          var original = btn.textContent;
          btn.textContent = window.dtySettings.strings.couponCopied || '¡Copiado!';
          setTimeout(function () {
            btn.textContent = original;
          }, 2000);
        });
      });
    });
  }

  function initScrollReveal() {
    if (window._dtyRevealInit) return;
    window._dtyRevealInit = true;

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.dty-reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.dty-reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  function initStatCounters() {
    var statNums = document.querySelectorAll('.dty-hero__stat-number');
    if (!statNums.length) return;

    // Slight delay so entrance animations complete before counter fires
    setTimeout(function () {
      statNums.forEach(function (el) {
        var raw = el.textContent.trim();
        // Match: optional prefix, digits (with optional decimal), optional suffix
        var match = raw.match(/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/);
        if (!match) return;

        var prefix = match[1];
        var numStr = match[2].replace(',', '.');
        var suffix = match[3];
        var target = parseFloat(numStr);
        if (isNaN(target)) return;

        var duration = 1100;
        var start = performance.now();

        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          var current = Math.round(ease * target);
          el.textContent = prefix + current + suffix;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = raw; // restore original (preserves locale formatting)
          }
        }
        requestAnimationFrame(step);
      });
    }, 700);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroRotation();
    initFaqAccordion();
    initCouponCopy();
    initScrollReveal();
    initStatCounters();
  });
})();
