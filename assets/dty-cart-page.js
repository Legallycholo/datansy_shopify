(function () {
  'use strict';

  var settings = window.dtySettings || {};

  function formatMoney(cents) {
    return '$' + Math.round(cents / 100).toLocaleString('es-CL') + ' CLP';
  }

  function updateCartShippingBar(subtotalCents) {
    var bar = document.querySelector('[data-cart-page-shipping]');
    if (!bar) return;

    var threshold = (settings.freeShippingThreshold || 50000) * 100;
    var text = bar.querySelector('[data-shipping-text]');
    var fill = bar.querySelector('[data-shipping-fill]');
    var remaining = threshold - subtotalCents;
    var pct = Math.min(100, (subtotalCents / threshold) * 100);

    if (fill) fill.style.width = pct + '%';

    if (!text) return;

    if (remaining <= 0) {
      text.textContent = settings.strings.freeShippingAchieved || '¡Envío gratis!';
      text.classList.add('is-achieved');
    } else {
      var msg = settings.strings.freeShippingRemaining || 'Gasta {{ amount }} más y obtén envío gratis';
      text.textContent = msg.replace('{{ amount }}', formatMoney(remaining));
      text.classList.remove('is-achieved');
    }
  }

  function updateSummary(cart) {
    var totalEl = document.querySelector('.dty-cart-page__summary-total');
    if (totalEl) totalEl.textContent = formatMoney(cart.total_price);

    var countEl = document.querySelector('.dty-cart-page__count');
    if (countEl && settings.strings && cart.item_count !== undefined) {
      var tpl = cart.item_count === 1 ? '{{ count }} artículo' : '{{ count }} artículos';
      countEl.textContent = tpl.replace('{{ count }}', cart.item_count);
    }

    updateCartShippingBar(cart.total_price);

    if (window.dtyCart && typeof window.dtyCart.refresh === 'function') {
      window.dtyCart.refresh();
    }
  }

  function changeLineQuantity(key, quantity) {
    return fetch(settings.routes.cartChangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then(function (r) { return r.json(); });
  }

  function handleCartUpdate(cart) {
    if (cart.item_count === 0) {
      window.location.reload();
      return;
    }

    cart.items.forEach(function (item) {
      var row = document.querySelector('[data-line-qty="' + item.key + '"]');
      if (!row) return;
      var line = row.closest('.dty-cart-page__item');
      if (!line) return;

      if (item.quantity === 0) {
        line.remove();
        return;
      }

      row.value = item.quantity;
      var priceEl = line.querySelector('.dty-cart-page__item-price');
      if (priceEl) priceEl.textContent = formatMoney(item.final_line_price);
    });

    updateSummary(cart);
  }

  function initCartPage() {
    var form = document.querySelector('[data-cart-page-form]');
    if (!form) return;

    updateCartShippingBar(parseInt(form.dataset.cartTotal || '0', 10));

    form.querySelectorAll('[data-cart-qty-change]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.lineKey;
        var input = form.querySelector('[data-line-qty="' + key + '"]');
        if (!input) return;
        var delta = parseInt(btn.dataset.cartQtyChange, 10);
        var val = parseInt(input.value, 10) + delta;
        if (val < 0) val = 0;

        btn.disabled = true;
        changeLineQuantity(key, val)
          .then(handleCartUpdate)
          .catch(function () { window.location.reload(); })
          .finally(function () { btn.disabled = false; });
      });
    });

    form.querySelectorAll('[data-cart-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.lineKey;
        btn.disabled = true;
        changeLineQuantity(key, 0)
          .then(handleCartUpdate)
          .catch(function () { window.location.reload(); });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initCartPage);
})();
