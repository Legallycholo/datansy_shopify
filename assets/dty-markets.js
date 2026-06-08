/**
 * Datansy Markets — country switcher helpers for localization forms and region cards.
 */
(function () {
  'use strict';

  function getLocalizationForm() {
    return document.querySelector('[data-localization-form]');
  }

  function switchCountry(countryCode) {
    var form = getLocalizationForm();
    if (!form || !countryCode) return;

    var select = form.querySelector('[data-localization-country]');
    if (!select) return;

    select.value = countryCode;
    form.submit();
  }

  function initRegionMarketSwitch() {
    document.querySelectorAll('[data-market-switch]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        switchCountry(el.getAttribute('data-market-switch'));
      });
    });
  }

  window.dtyMarkets = {
    switchCountry: switchCountry
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegionMarketSwitch);
  } else {
    initRegionMarketSwitch();
  }
})();
