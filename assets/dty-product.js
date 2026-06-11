(function () {
  'use strict';

  function initProductPage() {
    var settings = window.dtySettings || {};
    var section = document.querySelector('[data-product-section]');
    if (!section) return;

    var productJson = section.querySelector('[data-product-json]');
    if (!productJson) return;

    var product = JSON.parse(productJson.textContent);
    var form = section.querySelector('[data-product-form]');
    var mainImage = section.querySelector('[data-gallery-main]');
    var priceEl = section.querySelector('[data-product-price]');
    var stickyBar = document.querySelector('[data-product-sticky]');
    var stickyPrice = document.querySelector('[data-sticky-price]');
    var stickyBtn = document.querySelector('[data-sticky-atc]');

    function getSelectedOptions() {
      var options = [];
      section.querySelectorAll('[data-option-input]:checked').forEach(function (input) {
        options.push(input.value);
      });
      return options;
    }

    function findVariant() {
      var selected = getSelectedOptions();
      return product.variants.find(function (v) {
        return v.options.every(function (opt, i) { return opt === selected[i]; });
      });
    }

    function shopifyImageAtWidth(url, width) {
      if (!url) return '';
      if (url.indexOf('width=') !== -1) {
        return url.replace(/width=\d+/, 'width=' + width);
      }
      return url.replace(/(\.[^.?]+)(\?.*)?$/, '_' + width + 'x$1$2');
    }

    function buildSrcset(url) {
      return [400, 800, 1200].map(function (w) {
        return shopifyImageAtWidth(url, w) + ' ' + w + 'w';
      }).join(', ');
    }

    function setGalleryMainImage(url, alt) {
      if (!mainImage || !url) return;
      mainImage.src = url;
      mainImage.srcset = buildSrcset(url);
      if (alt != null) mainImage.alt = alt;
    }

    function activateGalleryThumb(mediaId) {
      var matched = false;
      section.querySelectorAll('[data-gallery-thumb]').forEach(function (btn) {
        var isMatch = String(btn.dataset.mediaId) === String(mediaId);
        btn.classList.toggle('is-active', isMatch);
        if (isMatch) matched = true;
      });
      return matched;
    }

    function updateVariant(variant) {
      if (!variant) return;

      var idInput = form.querySelector('[name="id"]');
      if (idInput) idInput.value = variant.id;

      if (priceEl) {
        var html = '';
        var onSale = variant.compare_at_price > variant.price;
        if (onSale) {
          html = '<span class="dty-price__current dty-price__current--sale">' + formatMoney(variant.price) + '</span>';
          html += '<s class="dty-price__compare">' + formatMoney(variant.compare_at_price) + '</s>';
          html += '<span class="dty-price__savings">Ahorrar ' + formatMoney(variant.compare_at_price - variant.price) + '</span>';
        } else {
          html = '<span class="dty-price__current">' + formatMoney(variant.price) + '</span>';
        }
        priceEl.innerHTML = html;
      }

      if (stickyPrice) stickyPrice.textContent = formatMoney(variant.price);

      var submit = form.querySelector('[data-product-submit]');
      if (submit) {
        submit.disabled = !variant.available;
        var submitLabel = submit.querySelector('.dty-product-form__submit-text');
        var newLabel = variant.available ? submit.dataset.availableText : submit.dataset.soldOutText;
        if (submitLabel) submitLabel.textContent = newLabel;
        else submit.textContent = newLabel;
      }
      if (stickyBtn) {
        stickyBtn.disabled = !variant.available;
        stickyBtn.textContent = variant.available ? stickyBtn.dataset.availableText : stickyBtn.dataset.soldOutText;
      }

      var shippingInfo = section.querySelector('[data-product-shipping-info]');
      if (shippingInfo) {
        var threshold = (window.dtySettings.freeShippingThreshold || 50000) * 100;
        var badge = shippingInfo.querySelector('.dty-product-shipping-info__badge');
        if (badge) {
          if (variant.price >= threshold) {
            badge.classList.add('dty-product-shipping-info__badge--free');
            badge.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>Envío gratis incluido';
          } else {
            badge.classList.remove('dty-product-shipping-info__badge--free');
            badge.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>Envío gratis sobre $50.000';
          }
        }
      }

      var sku = section.querySelector('[data-product-sku]');
      if (sku) sku.textContent = variant.sku ? 'SKU: ' + variant.sku : '';

      var stockText = variant.available
        ? (settings.strings && settings.strings.warehouseInStock || 'En stock')
        : (settings.strings && settings.strings.soldOut || 'Agotado');
      var importText = variant.available
        ? (settings.strings && settings.strings.warehouseAvailable || 'Disponible')
        : (settings.strings && settings.strings.soldOut || 'Agotado');
      section.querySelectorAll('[data-warehouse-stock]').forEach(function (el) {
        el.textContent = stockText;
      });
      section.querySelectorAll('[data-warehouse-import]').forEach(function (el) {
        el.textContent = importText;
      });

      if (variant.featured_media && mainImage) {
        var media = product.media.find(function (m) { return m.id === variant.featured_media.id; });
        if (media) {
          setGalleryMainImage(shopifyImageAtWidth(media.preview_image.src, 800), media.alt || product.title);
          activateGalleryThumb(media.id);
        }
      }
    }

    function formatMoney(cents) {
      return '$' + Math.round(cents / 100).toLocaleString('es-CL') + ' CLP';
    }

    section.querySelectorAll('[data-option-input]').forEach(function (input) {
      input.addEventListener('change', function () {
        updateVariant(findVariant());
      });
    });

    section.querySelectorAll('[data-gallery-thumb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateGalleryThumb(btn.dataset.mediaId);
        var src = btn.dataset.fullSrc;
        if (src) setGalleryMainImage(src);
      });
    });

    if (mainImage) {
      mainImage.addEventListener('click', function () {
        mainImage.closest('.dty-product-gallery__main').classList.toggle('is-zoomed');
      });
    }

    /* Mobile swipe on gallery */
    var galleryMain = section.querySelector('.dty-product-gallery__main');
    var thumbBtns = Array.from(section.querySelectorAll('[data-gallery-thumb]'));
    if (galleryMain && thumbBtns.length > 1) {
      var touchStartX = 0;
      galleryMain.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      galleryMain.addEventListener('touchend', function (e) {
        var delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) < 40) return;
        var activeThumb = section.querySelector('[data-gallery-thumb].is-active');
        var currentIndex = thumbBtns.indexOf(activeThumb);
        var nextIndex = delta < 0
          ? Math.min(currentIndex + 1, thumbBtns.length - 1)
          : Math.max(currentIndex - 1, 0);
        if (nextIndex !== currentIndex) thumbBtns[nextIndex].click();
      }, { passive: true });
    }

    section.querySelectorAll('[data-tab-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.dataset.tabBtn;
        section.querySelectorAll('[data-tab-btn]').forEach(function (b) { b.classList.remove('is-active'); });
        section.querySelectorAll('[data-tab-panel]').forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var panel = section.querySelector('[data-tab-panel="' + tab + '"]');
        if (panel) panel.classList.add('is-active');
      });
    });

    if (!form) {
      updateVariant(findVariant());
      return;
    }

    var qtyInput = form.querySelector('[data-qty-input]');
    form.querySelectorAll('[data-qty-change]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var delta = parseInt(btn.dataset.qtyChange, 10);
        var val = parseInt(qtyInput.value, 10) + delta;
        if (val < 1) val = 1;
        qtyInput.value = val;
      });
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var idInput = form.querySelector('[name="id"]');
        var qtyInput = form.querySelector('[name="quantity"]');
        var submit = form.querySelector('[data-product-submit]');
        var submitLabel = submit ? submit.querySelector('.dty-product-form__submit-text') : null;
        var originalText = submitLabel ? submitLabel.textContent.trim() : (submit ? submit.textContent : '');

        if (submit) {
          submit.disabled = true;
          var loadingText = settings.strings && settings.strings.loading || '...';
          if (submitLabel) submitLabel.textContent = loadingText;
          else submit.textContent = loadingText;
        }

        fetch(window.dtySettings.routes.cartAddUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{
              id: idInput ? idInput.value : '',
              quantity: qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1
            }]
          })
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.status && data.status >= 400) {
              throw new Error(data.description || 'Add to cart failed');
            }
            if (window.dtyCart) {
              window.dtyCart.refresh();
              if (window.dtySettings.cartType === 'drawer') window.dtyCart.open();
            }
          })
          .catch(function () {
            form.submit();
          })
          .finally(function () {
            if (submit) {
              submit.disabled = false;
              if (submitLabel) submitLabel.textContent = originalText;
              else submit.textContent = originalText;
            }
          });
      });
    }

    if (stickyBtn && form) {
      stickyBtn.addEventListener('click', function () {
        var submit = form.querySelector('[data-product-submit]');
        if (!submit || submit.disabled) return;
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit(submit);
        } else {
          submit.click();
        }
      });
    }

    if (stickyBar) {
      var infoBlock = section.querySelector('.dty-product-info');
      if (infoBlock) {
        var observer = new IntersectionObserver(function (entries) {
          stickyBar.classList.toggle('is-visible', !entries[0].isIntersecting);
        }, { threshold: 0 });
        observer.observe(infoBlock);
      }
    }

    updateVariant(findVariant());
  }

  function loadRecommendations() {
    var container = document.querySelector('[data-product-recommendations]');
    if (!container) return;
    if (container.querySelector('.dty-product-recommendations__grid')) return;

    var productId = container.dataset.productId;
    var sectionId = container.dataset.sectionId;
    if (!productId || !sectionId) return;

    fetch('/recommendations/products?product_id=' + productId + '&limit=4&section_id=' + sectionId)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var section = doc.querySelector('[data-product-recommendations]');
        if (section && section.innerHTML.trim()) {
          container.innerHTML = section.innerHTML;
        }
      })
      .catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    initProductPage();
    loadRecommendations();
  });
})();
