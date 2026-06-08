(function () {
  'use strict';

  function initProductSliders() {
    document.querySelectorAll('[data-product-slider]').forEach(function (section) {
      var track = section.querySelector('[data-slider-track]');
      var prev = section.querySelector('[data-slider-prev]');
      var next = section.querySelector('[data-slider-next]');
      if (!track) return;

      var scrollAmount = function () {
        var slide = track.querySelector('.dty-product-slider__slide');
        return slide ? slide.offsetWidth + 16 : 280;
      };

      if (prev) {
        prev.addEventListener('click', function () {
          track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });
      }

      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft' && prev) {
          e.preventDefault();
          prev.click();
        } else if (e.key === 'ArrowRight' && next) {
          e.preventDefault();
          next.click();
        }
      });
    });
  }

  function initQuickAdd() {
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-product-card-form]');
      if (!form) return;
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';

      fetch(window.dtySettings.routes.cartAddUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: form.querySelector('[name="id"]').value, quantity: 1 }] })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status && data.status >= 400) throw new Error(data.description);
          btn.textContent = '✓';
          if (window.dtyCart) {
            window.dtyCart.refresh();
            if (window.dtySettings.cartType === 'drawer') window.dtyCart.open();
          }
        })
        .catch(function () {
          btn.textContent = original;
        })
        .finally(function () {
          setTimeout(function () {
            btn.textContent = original;
            btn.disabled = false;
          }, 1500);
        });
    });
  }

  function initCollectionFilters() {
    var toggle = document.querySelector('[data-filter-toggle]');
    var filters = document.querySelector('[data-collection-filters]');
    var close = document.querySelector('[data-filter-close]');
    if (!toggle || !filters) return;

    toggle.addEventListener('click', function () {
      filters.classList.add('is-open');
      document.body.classList.add('drawer-open');
    });

    function closeFilters() {
      filters.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
    }

    if (close) close.addEventListener('click', closeFilters);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initProductSliders();
    initQuickAdd();
    initCollectionFilters();
  });
})();
