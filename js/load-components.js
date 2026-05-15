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

  function setFooterYear() {
    var yearEl = document.getElementById('footer-year');
    if (!yearEl) return;
    var y = String(new Date().getFullYear());
    yearEl.textContent = y;
    if (yearEl.tagName === 'TIME') {
      yearEl.setAttribute('datetime', y);
    }
  }

  /** Tailwind Play CDN may need a nudge after injecting partial HTML. */
  function notifyTailwindDomUpdated() {
    window.requestAnimationFrame(function () {
      try {
        var tw = window.tailwind;
        if (tw && typeof tw.refresh === 'function') {
          tw.refresh();
        }
      } catch (e) {}
    });
  }

  if (headerPlaceholder) {
    fetch(headerPath)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (html) {
        inject(headerPlaceholder, html);
        notifyTailwindDomUpdated();
      })
      .catch(function () {
        headerPlaceholder.innerHTML = '<p class="p-4 text-center text-stone-500">Header could not be loaded.</p>';
      });
  }

  if (footerPlaceholder) {
    fetch(footerPath)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (html) {
        inject(footerPlaceholder, html);
        setFooterYear();
        notifyTailwindDomUpdated();
      })
      .catch(function () {
        footerPlaceholder.innerHTML =
          '<footer id="site-footer" style="background:#0c1929;color:#c6b289;padding:2.5rem 1rem;font-family:system-ui,-apple-system,sans-serif;">' +
          '<div style="max-width:80rem;margin:0 auto">' +
          '<p style="font-weight:700;margin:0 0 0.5rem">Honzi Tours &amp; Travel</p>' +
          '<p style="margin:0 0 0.75rem;font-size:0.9rem;line-height:1.5">Dubai, UAE</p>' +
          '<p style="margin:0 0 0.75rem;font-size:0.9rem"><a href="mailto:info@honzitoursandtravel.com" style="color:#c6b289">info@honzitoursandtravel.com</a> · ' +
          '<a href="tel:+971551352382" style="color:#c6b289">+971 55 135 2382</a></p>' +
          '<p style="margin:0 0 1rem;font-size:0.9rem"><a href="index.html" style="color:#c1a061">Home</a> · <a href="contact.html" style="color:#c1a061">Contact</a></p>' +
          '<p style="font-size:0.8rem;opacity:0.9;line-height:1.45">Use a local web server for the full site (e.g. run <code style="background:rgba(0,0,0,0.25);padding:0.15rem 0.35rem;border-radius:4px">npx serve .</code> in the project folder).</p>' +
          '<p style="margin-top:1rem;font-size:0.8rem">© <time id="footer-year"></time> Honzi Tours &amp; Travel.</p>' +
          '</div></footer>';
        setFooterYear();
      });
  }

  if (window.feather) window.feather.replace();
})();

/** Scroll-triggered [data-reveal] — pairs with css/scroll-animations.css and html.js-reveal */
(function () {
  function initReveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;

    function reveal(el) {
      el.classList.add('is-revealed');
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(reveal);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach(reveal);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          io.unobserve(el);
          var ms = parseInt(el.getAttribute('data-reveal-delay'), 10);
          if (ms > 0) {
            window.setTimeout(function () {
              reveal(el);
            }, ms);
          } else {
            reveal(el);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );

    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
