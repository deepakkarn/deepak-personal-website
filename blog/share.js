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

  // Browser-native article PDF export, shared by every published post.
  // The button is created here so future articles inherit it automatically.
  const pdfButton = document.createElement('button');
  pdfButton.type = 'button';
  pdfButton.className = 'article-pdf-button';
  pdfButton.setAttribute('aria-label', 'प्रिन्ट वा PDF मा सुरक्षित गर्नुहोस्');
  pdfButton.title = 'PDF बनाउन प्रिन्ट संवादमा Save as PDF छान्नुहोस्';
  pdfButton.innerHTML = '<i class="bi bi-file-earmark-pdf" aria-hidden="true"></i><span>PDF / प्रिन्ट</span>';
  widget.insertBefore(pdfButton, menu);
  pdfButton.addEventListener('click', () => {
    setOpen(false);
    window.print();
  });

  // Print everything the article contains, including closed source tables
  // and every demographic tab. Restore the reader's interactive state after.
  const temporarilyOpened = new Set();
  let wardToRestore = null;
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('main details:not([open])').forEach(details => {
      temporarilyOpened.add(details);
      details.open = true;
    });
    const allWards = document.querySelector('[data-ward="all"]');
    const selectedWard = document.querySelector('[data-ward][aria-pressed="true"]');
    if (allWards && !wardToRestore && selectedWard && selectedWard !== allWards) {
      wardToRestore = selectedWard;
      allWards.click();
    }
  });
  window.addEventListener('afterprint', () => {
    temporarilyOpened.forEach(details => {
      if (details.isConnected) details.open = false;
    });
    temporarilyOpened.clear();
    if (wardToRestore && wardToRestore.isConnected) wardToRestore.click();
    wardToRestore = null;
  });


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
