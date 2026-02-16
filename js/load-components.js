/**
 * Load header and footer from components and inject into page.
 * Place script at end of body; ensure elements #header-placeholder and #footer-placeholder exist.
 * Mobile menu uses event delegation so it works after header is injected.
 */
(function () {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  // Paths relative to current page (works when served from any subpath)
  const base = window.location.pathname.replace(/\/[^/]*$/, '') || '';
  const headerPath = base + (base ? '/' : '') + 'components/header.html';
  const footerPath = base + (base ? '/' : '') + 'components/footer.html';

  // Event delegation: handle hamburger and mobile menu links (works for injected header)
  document.addEventListener('click', function (e) {
    var menu = document.getElementById('mobile-menu');
    var btn = document.getElementById('mobile-menu-btn');
    if (!menu || !btn) return;

    // Click on hamburger button
    if (e.target.closest && e.target.closest('#mobile-menu-btn')) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      var iconOpen = document.getElementById('menu-icon-open');
      var iconClose = document.getElementById('menu-icon-close');
      if (iconOpen) iconOpen.classList.toggle('hidden', !isOpen);
      if (iconClose) iconClose.classList.toggle('hidden', isOpen);
      return;
    }

    // Click on a link inside mobile menu -> close menu
    if (e.target.closest && e.target.closest('#mobile-menu a')) {
      menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      var iconOpen = document.getElementById('menu-icon-open');
      var iconClose = document.getElementById('menu-icon-close');
      if (iconOpen) iconOpen.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    }
  });

  function inject(placeholder, html) {
    if (!placeholder) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    const first = wrap.firstChild;
    if (first) {
      placeholder.parentNode.replaceChild(first, placeholder);
      if (window.feather) window.feather.replace();
    }
  }

  if (headerPlaceholder) {
    fetch(headerPath)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (html) { inject(headerPlaceholder, html); })
      .catch(function () {
        headerPlaceholder.innerHTML = '<p class="p-4 text-center text-stone-500">Header could not be loaded.</p>';
      });
  }

  if (footerPlaceholder) {
    fetch(footerPath)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (html) { inject(footerPlaceholder, html); })
      .catch(function () {
        footerPlaceholder.innerHTML = '<p class="p-4 text-center text-stone-500">Footer could not be loaded.</p>';
      });
  }

  if (window.feather) window.feather.replace();
})();
