/* Small static share menu. Uses the canonical URL; no analytics or backend. */
(function () {
  const widget = document.querySelector('[data-article-share]');
  if (!widget) return;

  const toggle = widget.querySelector('.share-toggle');
  const menu = widget.querySelector('.share-menu');
  const status = widget.querySelector('.share-status');
  const native = widget.querySelector('[data-share="native"]');
  if (!toggle || !menu) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical?.href || location.href.split('#')[0];
  const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
  const targets = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
    whatsapp: 'https://wa.me/?text=' + encodeURIComponent(title + '\n' + url),
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)
  };
  for (const [service, href] of Object.entries(targets)) {
    const link = widget.querySelector('[data-share="' + service + '"]');
    if (link) link.href = href;
  }
  if (native && typeof navigator.share === 'function') native.hidden = false;

  function setOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open && status) status.textContent = '';
  }

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  document.addEventListener('click', event => {
    if (!widget.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));

  const copy = widget.querySelector('[data-share="copy"]');
  if (copy) copy.addEventListener('click', async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(url);
      success = true;
    } catch (_) {
      try {
        const field = document.createElement('textarea');
        field.value = url;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        success = document.execCommand('copy');
        field.remove();
      } catch (_) {}
    }
    setOpen(false);
    if (status) status.textContent = success ? 'लिंक कपी भयो ✓' : 'लिंक कपी हुन सकेन। Browser बाट copy गर्नुहोस्।';
    toggle.focus();
  });

  if (native) native.addEventListener('click', async () => {
    if (typeof navigator.share !== 'function') return;
    try {
      await navigator.share({title, url});
      setOpen(false);
    } catch (error) {
      if (error.name !== 'AbortError' && status) {
        setOpen(false);
        status.textContent = 'Share गर्न सकिएन। अर्को विकल्प प्रयोग गर्नुहोस्।';
      }
    }
  });
})();
