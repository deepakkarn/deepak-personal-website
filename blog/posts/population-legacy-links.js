/* Preserve previously shared explorer-tab bookmarks without redirecting readers away. */
(() => {
  const legacy = /^#(?:overview|data-(?:overview|population|wards|education|employment|migration|poverty|household|projection))$/;
  function reveal() {
    if (!legacy.test(location.hash)) return;
    const card = document.getElementById('data-explorer');
    const link = card?.querySelector('.population-explorer-cta');
    if (!link) return;
    link.href = '/data/population/' + (location.hash === '#data-overview' ? '#overview' : location.hash);
    card.scrollIntoView({block:'start', behavior:'instant'});
  }
  window.addEventListener('hashchange', reveal);
  reveal();
})();
