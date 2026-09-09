/* =============================================
   SPARKCHARGE - Realtime Custom Dropdown
   Converts native <select> elements into fully
   animated, app-style dropdowns. The native
   <select> stays in the DOM (synced value +
   forwarded change events) so forms and existing
   JS keep working untouched.
   ============================================= */
(function () {
  'use strict';

  var triggers = [];

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  function initOnce() {
    document.querySelectorAll('.select-wrap select, .dash-filter select, select[data-dropdown]')
      .forEach(enhance);
  }

  function enhance(select) {
    if (select.dataset.scDropdown === 'true') return;
    var wrap = select.closest('.select-wrap, .dash-filter') || select.parentElement;
    if (!wrap || wrap.querySelector('.sc-dropdown')) return;

    var options = Array.prototype.slice.call(select.options).map(function (o) {
      return { value: o.value, text: o.text, disabled: o.disabled };
    });
    if (!options.length) return;

    select.dataset.scDropdown = 'true';
    select.classList.add('sc-native-select');
    select.setAttribute('tabindex', '-1');
    if (wrap.querySelector(':scope > i')) wrap.classList.add('has-icon');

    var label = function (v) {
      var hit = options.filter(function (o) { return o.value === v; })[0];
      return hit ? hit.text : (options[0] ? options[0].text : '');
    };

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sc-dropdown';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.id = (select.id || 'sc-select') + '-trigger';

    var valueSpan = document.createElement('span');
    valueSpan.className = 'sc-dropdown-value';
    valueSpan.textContent = label(select.value);

    var arrow = document.createElement('i');
    arrow.className = 'fas fa-chevron-down sc-dropdown-arrow';

    btn.appendChild(valueSpan);
    btn.appendChild(arrow);

    var menu = document.createElement('ul');
    menu.className = 'sc-dropdown-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-labelledby', btn.id);
    menu.setAttribute('tabindex', '-1');

    options.forEach(function (opt, i) {
      var li = document.createElement('li');
      var active = opt.value === select.value;
      li.className = 'sc-dropdown-item' + (active ? ' active' : '') + (opt.disabled ? ' disabled' : '');
      li.dataset.value = opt.value;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(active));
      li.id = btn.id + '-opt-' + i;

      var text = document.createElement('span');
      text.className = 'sc-dropdown-item-text';
      text.textContent = opt.text;

      var check = document.createElement('i');
      check.className = 'fas fa-check sc-dropdown-check';

      li.appendChild(text);
      li.appendChild(check);
      menu.appendChild(li);
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    var items = Array.prototype.slice.call(menu.children);
    btn.__scOpen = false;
    menu.__scBtn = btn;
    var activeIndex = items.findIndex ? items.findIndex(function (li) { return li.dataset.value === select.value; }) : 0;
    if (activeIndex < 0) activeIndex = 0;

    function positionMenu() {
      var rect = btn.getBoundingClientRect();
      var width = Math.max(rect.width, 190);
      var left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      var gap = 10;
      var spaceBelow = window.innerHeight - rect.bottom - gap;
      var spaceAbove = rect.top - gap;
      var dropUp = spaceAbove > spaceBelow;
      var menuH = Math.min(264, Math.max(0, Math.floor(dropUp ? spaceAbove : spaceBelow)));

      menu.style.width = width + 'px';
      menu.style.maxHeight = menuH + 'px';
      menu.style.left = Math.round(left) + 'px';
      menu.style.top = dropUp ? 'auto' : Math.round(rect.bottom + gap) + 'px';
      menu.style.bottom = dropUp ? Math.round(window.innerHeight - rect.top + gap) + 'px' : 'auto';
      menu.classList.toggle('drop-up', dropUp);
    }

    function syncFromNative() {
      var idx = items.findIndex
        ? items.findIndex(function (li) { return li.dataset.value === select.value; })
        : items.indexOf(items.filter(function (li) { return li.dataset.value === select.value; })[0]);
      if (idx < 0) idx = 0;
      valueSpan.textContent = label(select.value);
      items.forEach(function (li, i) {
        var active = i === idx;
        li.classList.toggle('active', active);
        li.setAttribute('aria-selected', String(active));
      });
      activeIndex = idx;
    }

    function setValue(value) {
      if (select.value === value) return;
      select.value = value;
      syncFromNative();
      valueSpan.classList.remove('sc-pop');
      void valueSpan.offsetWidth;
      valueSpan.classList.add('sc-pop');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function openMenu() {
      if (btn.__scOpen) return;
      triggers.forEach(function (t) { if (t !== btn && t.__scOpen) closeBy(t); });
      btn.__scOpen = true;
      document.body.appendChild(menu);
      positionMenu();
      menu.classList.add('show');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      var active = menu.querySelector('.sc-dropdown-item.active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function detach(menuEl) {
      var t = menuEl.__scBtn;
      setTimeout(function () {
        if (t && !t.__scOpen && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
      }, 280);
    }

    function hideMenu(menuEl, triggerBtn) {
      menuEl.classList.remove('show');
      if (triggerBtn) {
        triggerBtn.classList.remove('open');
        triggerBtn.setAttribute('aria-expanded', 'false');
      }
      detach(menuEl);
    }

    function closeMenu() {
      if (!btn.__scOpen) return;
      btn.__scOpen = false;
      hideMenu(menu, btn);
    }

    function closeBy(triggerBtn) {
      var paired = triggerBtn.__scMenu;
      if (!paired) return;
      triggerBtn.__scOpen = false;
      hideMenu(paired, triggerBtn);
    }

    function toggle() {
      if (btn.__scOpen) { closeMenu(); } else { openMenu(); }
    }

    function moveActive(step) {
      var n = items.length;
      for (var i = 0; i < n; i++) {
        activeIndex = (activeIndex + step + n) % n;
        if (!items[activeIndex].classList.contains('disabled')) break;
      }
      clearHover();
      items[activeIndex].classList.add('hover');
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function clearHover() {
      items.forEach(function (li) { li.classList.remove('hover'); });
    }

    var searchBuffer = '';
    var searchTimeout = null;

    function typeAhead(char) {
      searchBuffer = (searchBuffer + char).slice(-40);
      var q = searchBuffer.toLowerCase();
      var match = -1;
      items.forEach(function (li, i) {
        if (match < 0 && !li.classList.contains('disabled') && li.textContent.toLowerCase().indexOf(q) === 0) {
          match = i;
        }
      });
      if (match < 0) {
        items.forEach(function (li, i) {
          if (match < 0 && !li.classList.contains('disabled') && li.textContent.toLowerCase().indexOf(q) > -1) {
            match = i;
          }
        });
      }
      if (match > -1) {
        activeIndex = match;
        clearHover();
        items[activeIndex].classList.add('hover');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () { searchBuffer = ''; }, 800);
    }

    btn.__scMenu = menu;
    triggers.push(btn);

    /* --- events --- */
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    menu.addEventListener('click', function (e) {
      var item = e.target.closest('.sc-dropdown-item');
      if (!item || item.classList.contains('disabled')) return;
      setValue(item.dataset.value);
      clearHover();
      closeMenu();
      btn.focus();
    });

    items.forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        items.forEach(function (x) { x.classList.remove('hover'); });
        li.classList.add('hover');
      });
    });

    btn.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!btn.__scOpen) { openMenu(); } else { moveActive(1); }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!btn.__scOpen) { openMenu(); } else { moveActive(-1); }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (btn.__scOpen && items[activeIndex]) {
            setValue(items[activeIndex].dataset.value);
            items[activeIndex].classList.remove('hover');
            closeMenu();
          } else {
            openMenu();
          }
          break;
        case 'Home':
          e.preventDefault();
          if (btn.__scOpen) { activeIndex = 0; moveActive(0); }
          break;
        case 'End':
          e.preventDefault();
          if (btn.__scOpen) { activeIndex = items.length - 1; moveActive(0); }
          break;
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        default:
          if (btn.__scOpen && e.key && e.key.length === 1) { typeAhead(e.key); }
          break;
      }
    });

    menu.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (items[activeIndex]) {
          e.preventDefault();
          setValue(items[activeIndex].dataset.value);
          items[activeIndex].classList.remove('hover');
          closeMenu();
          btn.focus();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        btn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (btn.__scOpen && !btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });

    document.addEventListener('scroll', debounce(function () {
      if (btn.__scOpen) positionMenu();
    }, 60), true);

    window.addEventListener('resize', debounce(function () {
      if (btn.__scOpen) positionMenu();
    }, 100));

    var form = select.form;
    if (form) {
      form.addEventListener('reset', function () {
        setTimeout(syncFromNative, 0);
      });
    }
  }

  /* Run on load or as early as the DOM allows */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnce);
  } else {
    initOnce();
  }
})();