/**
 * Datansy Header — mega menu, mobile nav, predictive search, cart drawer
 */
(function () {
  'use strict';

  var settings = window.gsmSettings || {};

  /* ---- Mega menu (desktop hover) ---- */
  function initMegaMenu() {
    var items = document.querySelectorAll('[data-mega-menu-item]');
    var closeTimer;

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        items.forEach(function (i) { i.classList.remove('is-open'); });
        item.classList.add('is-open');
      });

      item.addEventListener('mouseleave', function () {
        closeTimer = setTimeout(function () {
          item.classList.remove('is-open');
        }, 150);
      });

      item.addEventListener('focusin', function () {
        items.forEach(function (i) { i.classList.remove('is-open'); });
        item.classList.add('is-open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-mega-menu-item]')) {
        items.forEach(function (i) { i.classList.remove('is-open'); });
      }
    });
  }

  /* ---- Mobile navigation drill-down ---- */
  function initMobileNav() {
    var nav = document.getElementById('GsmMobileNav');
    var overlay = document.getElementById('GsmOverlay');
    var openBtn = document.querySelector('[data-mobile-nav-open]');
    var closeBtn = document.querySelector('[data-mobile-nav-close]');
    if (!nav || !openBtn) return;

    var panels = nav.querySelectorAll('[data-mobile-panel]');
    var panelStack = ['root'];

    function openNav() {
      nav.classList.add('is-open');
      overlay.classList.add('is-active');
      document.body.classList.add('drawer-open');
      openBtn.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      nav.classList.remove('is-open');
      overlay.classList.remove('is-active');
      document.body.classList.remove('drawer-open');
      openBtn.setAttribute('aria-expanded', 'false');
      panelStack = ['root'];
      showPanel('root');
    }

    function showPanel(panelId) {
      panels.forEach(function (panel) {
        var id = panel.dataset.mobilePanel;
        panel.classList.remove('is-active', 'is-previous');
        if (id === panelId) {
          panel.classList.add('is-active');
        } else if (panelStack.indexOf(id) === panelStack.length - 2) {
          panel.classList.add('is-previous');
        }
      });
    }

    openBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', function () {
      closeNav();
      closeCart();
    });

    nav.querySelectorAll('[data-mobile-nav-next]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var target = btn.dataset.mobileNavNext;
        panelStack.push(target);
        showPanel(target);
      });
    });

    nav.querySelectorAll('[data-mobile-nav-back]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (panelStack.length > 1) {
          panelStack.pop();
          showPanel(panelStack[panelStack.length - 1]);
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeNav();
        closeCart();
      }
    });
  }

  /* ---- Mobile search toggle ---- */
  function initMobileSearch() {
    var toggle = document.querySelector('[data-mobile-search-toggle]');
    var bar = document.querySelector('[data-mobile-search-bar]');
    if (!toggle || !bar) return;

    toggle.addEventListener('click', function () {
      var visible = bar.classList.toggle('is-visible');
      toggle.setAttribute('aria-expanded', visible);
      if (visible) {
        var input = bar.querySelector('input[type="search"]');
        if (input) input.focus();
      }
    });
  }

  /* ---- Localization dropdown ---- */
  function initLocalization() {
    document.querySelectorAll('[data-localization]').forEach(function (wrap) {
      var toggle = wrap.querySelector('[data-localization-toggle]');
      var dropdown = wrap.querySelector('[data-localization-dropdown]');
      var form = wrap.querySelector('[data-localization-form]');
      if (!toggle) return;

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = wrap.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
      });

      if (dropdown) {
        dropdown.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }

      if (form) {
        var countrySelect = form.querySelector('[data-localization-country]');
        var languageSelect = form.querySelector('[data-localization-language]');

        function autoSubmit() {
          if (window.gsmSettings && window.gsmSettings.localizationAutoSubmit === false) return;
          form.submit();
        }

        if (countrySelect) {
          countrySelect.addEventListener('change', autoSubmit);
        }
        if (languageSelect) {
          languageSelect.addEventListener('change', autoSubmit);
        }
      }
    });

    document.addEventListener('click', function () {
      document.querySelectorAll('[data-localization].is-open').forEach(function (wrap) {
        wrap.classList.remove('is-open');
        var t = wrap.querySelector('[data-localization-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Predictive search ---- */
  function initPredictiveSearch() {
    document.querySelectorAll('[data-predictive-search]').forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var results = form.querySelector('[data-predictive-results]');
      if (!input || !results) return;

      var debounceTimer;

      input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var query = input.value.trim();
        if (query.length < 2) {
          results.classList.remove('is-visible');
          results.innerHTML = '';
          return;
        }

        debounceTimer = setTimeout(function () {
          fetch(settings.routes.predictiveSearchUrl + '?q=' + encodeURIComponent(query) + '&resources[type]=product&resources[limit]=6&section_id=predictive-search')
            .then(function (r) { return r.text(); })
            .then(function (html) {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var content = doc.querySelector('#shopify-section-predictive-search');
              if (content) {
                results.innerHTML = content.innerHTML;
                results.classList.add('is-visible');
              }
            })
            .catch(function () {});
        }, 300);
      });

      document.addEventListener('click', function (e) {
        if (!form.contains(e.target)) {
          results.classList.remove('is-visible');
        }
      });
    });
  }

  /* ---- Cart drawer ---- */
  var cartDrawer = null;
  var cartOverlay = null;

  function getCartDrawer() {
    return document.getElementById('GsmCartDrawer');
  }

  function openCart() {
    cartDrawer = getCartDrawer();
    cartOverlay = document.getElementById('GsmOverlay');
    if (!cartDrawer) {
      window.location.href = settings.routes.cartUrl;
      return;
    }
    cartDrawer.classList.add('is-open');
    if (cartOverlay) cartOverlay.classList.add('is-active');
    document.body.classList.add('drawer-open');
    refreshCart();
  }

  function closeCart() {
    cartDrawer = getCartDrawer();
    cartOverlay = document.getElementById('GsmOverlay');
    if (cartDrawer) cartDrawer.classList.remove('is-open');
    var mobileNav = document.getElementById('GsmMobileNav');
    if (cartOverlay && mobileNav && !mobileNav.classList.contains('is-open')) {
      cartOverlay.classList.remove('is-active');
    } else if (cartOverlay && !mobileNav) {
      cartOverlay.classList.remove('is-active');
    }
    document.body.classList.remove('drawer-open');
  }

  function formatMoney(cents) {
    return '$' + Math.round(cents / 100).toLocaleString('es-CL') + ' CLP';
  }

  function updateShippingBar(subtotalCents) {
    var bar = document.querySelector('[data-shipping-bar]');
    if (!bar) return;

    var threshold = settings.freeShippingThreshold || 50000;
    var thresholdCents = threshold * 100;
    var text = bar.querySelector('[data-shipping-text]');
    var fill = bar.querySelector('[data-shipping-fill]');
    var remaining = thresholdCents - subtotalCents;
    var pct = Math.min(100, (subtotalCents / thresholdCents) * 100);

    if (fill) fill.style.width = pct + '%';

    if (remaining <= 0) {
      text.textContent = settings.strings.freeShippingAchieved;
      text.classList.add('is-achieved');
    } else {
      text.textContent = (settings.strings.freeShippingRemaining || 'Gasta {{ amount }} más y obtén envío gratis')
        .replace('{{ amount }}', formatMoney(remaining));
      text.classList.remove('is-achieved');
    }
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.dataset.count = count;
    });
  }

  function renderCart(cart) {
    var body = document.querySelector('[data-cart-body]');
    var footer = document.querySelector('[data-cart-footer]');
    if (!body) return;

    updateCartCount(cart.item_count);
    updateShippingBar(cart.total_price);

    if (cart.item_count === 0) {
      body.innerHTML = '<div class="gsm-cart-drawer__empty">' +
        '<span class="material-symbols-outlined gsm-cart-drawer__empty-icon">shopping_cart</span>' +
        '<p class="gsm-cart-drawer__empty-text">' + (settings.strings.cartEmpty || 'Tu carrito está vacío') + '</p>' +
        '<a href="/collections/all" class="btn btn--primary">' + (settings.strings.continueShopping || 'Explorar catálogo') + '</a>' +
        '</div>';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    var html = '';
    cart.items.forEach(function (item) {
      html += '<div class="gsm-cart-drawer__item" data-line-key="' + item.key + '">' +
        '<img class="gsm-cart-drawer__item-image" src="' + (item.image ? item.image.replace(/(\.[^.]*)$/, '_120x$1') : '') + '" alt="' + item.title + '" width="80" height="80" loading="lazy">' +
        '<div class="gsm-cart-drawer__item-details">' +
        '<a href="' + item.url + '" class="gsm-cart-drawer__item-title">' + item.product_title + '</a>' +
        (item.variant_title && item.variant_title !== 'Default Title' ? '<p class="gsm-cart-drawer__item-variant">' + item.variant_title + '</p>' : '') +
        '<div class="gsm-cart-drawer__item-bottom">' +
        '<span class="gsm-cart-drawer__item-price">' + formatMoney(item.final_line_price) + '</span>' +
        '<div class="gsm-cart-drawer__qty">' +
        '<button type="button" class="gsm-cart-drawer__qty-btn" data-qty-change="-1" data-line-key="' + item.key + '" aria-label="Reducir cantidad">−</button>' +
        '<span class="gsm-cart-drawer__qty-value">' + item.quantity + '</span>' +
        '<button type="button" class="gsm-cart-drawer__qty-btn" data-qty-change="1" data-line-key="' + item.key + '" aria-label="Aumentar cantidad">+</button>' +
        '</div></div>' +
        '<button type="button" class="gsm-cart-drawer__remove" data-remove-line="' + item.key + '">' + (settings.strings.remove || 'Eliminar') + '</button>' +
        '</div></div>';
    });

    body.innerHTML = html;

    var subtotalEl = document.querySelector('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    bindCartEvents();
  }

  function refreshCart() {
    fetch(settings.routes.cartUrl + '.js')
      .then(function (r) { return r.json(); })
      .then(renderCart)
      .catch(function () {});
  }

  function changeLineQuantity(key, quantity) {
    fetch(settings.routes.cartChangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(renderCart)
      .catch(function () {});
  }

  function bindCartEvents() {
    document.querySelectorAll('[data-qty-change]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.lineKey;
        var delta = parseInt(btn.dataset.qtyChange, 10);
        var item = btn.closest('[data-line-key]');
        var qtyEl = item.querySelector('.gsm-cart-drawer__qty-value');
        var newQty = parseInt(qtyEl.textContent, 10) + delta;
        if (newQty < 1) newQty = 0;
        changeLineQuantity(key, newQty);
      });
    });

    document.querySelectorAll('[data-remove-line]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        changeLineQuantity(btn.dataset.removeLine, 0);
      });
    });
  }

  function initCart() {
    document.querySelectorAll('[data-cart-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (settings.cartType === 'page') {
          window.location.href = settings.routes.cartUrl;
        } else {
          openCart();
        }
      });
    });

    document.querySelectorAll('[data-cart-close]').forEach(function (btn) {
      btn.addEventListener('click', closeCart);
    });

    refreshCart();

    document.addEventListener('cart:refresh', refreshCart);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMegaMenu();
    initMobileNav();
    initMobileSearch();
    initLocalization();
    initPredictiveSearch();
    initCart();
  });

  window.gsmCart = { open: openCart, close: closeCart, refresh: refreshCart };
})();
