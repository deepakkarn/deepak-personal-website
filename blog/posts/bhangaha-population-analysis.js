/* Minimal blog article enhancements. All charts and numbers remain visible without JavaScript. */
(() => {
  'use strict';
  // Editorial policy: all published articles are presented in Nepali.
  // English translation attributes remain in the source for a future site-wide
  // feature, but no single-post translation toggle or global preference applies.
  const language = 'ne';

  // Shared /blog/engagement.js owns BOTH floating article shortcuts.
  // Blog share interactions are provided by /blog/share.js.
  const preferReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One shared data viewport; the article below remains an ordinary reading experience.
  const explorer = document.getElementById('data-explorer');
  const dataTabs = Array.from(explorer?.querySelectorAll('[data-dx-tab]') || []);
  const dataPanels = Array.from(explorer?.querySelectorAll('[data-dx-panel]') || []);
  const tabViewport = document.getElementById('dx-tab-viewport');
  const panelByTopic = new Map(dataPanels.map(panel => [panel.dataset.dxPanel, panel]));
  let activeTopic = 'overview';
  let wardSelection = 'all';

  function activateTopic(topic, updateHash = false) {
    if (!explorer || !panelByTopic.has(topic)) return;
    activeTopic = topic;
    for (const tab of dataTabs) {
      const selected = tab.dataset.dxTab === topic;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const panel of dataPanels) {
      const selected = panel.dataset.dxPanel === topic;
      panel.dataset.active = String(selected);
      panel.hidden = !selected;
    }
    const activeTab = dataTabs.find(tab => tab.dataset.dxTab === topic);
    if (activeTab && tabViewport) {
      const start = activeTab.offsetLeft - tabViewport.offsetLeft;
      const end = start + activeTab.offsetWidth;
      if (start < tabViewport.scrollLeft) {
        tabViewport.scrollTo({left: Math.max(0, start - 12), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
      } else if (end > tabViewport.scrollLeft + tabViewport.clientWidth) {
        tabViewport.scrollTo({left: Math.max(0, end - tabViewport.clientWidth + 12), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
      }
    }
    if (updateHash) {
      const hash = topic === 'overview' ? '#overview' : '#data-' + topic;
      if (window.location.hash !== hash) {
        window.history.pushState(null, '', hash);
      }
    }
  }

  for (let index = 0; index < dataTabs.length; index++) {
    const tab = dataTabs[index];
    tab.addEventListener('click', () => {
      activateTopic(tab.dataset.dxTab, true);
    });
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % dataTabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + dataTabs.length) % dataTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = dataTabs.length - 1;
      else return;
      event.preventDefault();
      const next = dataTabs[nextIndex];
      next.focus({preventScroll: true});
      activateTopic(next.dataset.dxTab, true);
    });
  }

  function topicFromHash() {
    if (window.location.hash === '#overview') return 'overview';
    const match = /^#data-([a-z]+)$/.exec(window.location.hash);
    return match && panelByTopic.has(match[1]) ? match[1] : null;
  }

  function updateFromHash() {
    const topic = topicFromHash();
    if (topic) activateTopic(topic, false);
  }
  window.addEventListener('hashchange', updateFromHash);
  window.addEventListener('popstate', updateFromHash);
  document.getElementById('dx-left')?.addEventListener('click', () => {
    tabViewport?.scrollBy({left: -Math.max(160, tabViewport.clientWidth * .68), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
  });
  document.getElementById('dx-right')?.addEventListener('click', () => {
    tabViewport?.scrollBy({left: Math.max(160, tabViewport.clientWidth * .68), behavior: preferReducedMotion() ? 'auto' : 'smooth'});
  });

  const wardButtons = Array.from(explorer?.querySelectorAll('[data-ward]') || []);
  const wardRows = Array.from(explorer?.querySelectorAll('[data-ward-row]') || []);
  const wardFigure = document.getElementById('dx-ward-figure');
  const wardDescription = document.getElementById('dx-ward-description');

  function displayWard() {
    for (const button of wardButtons) {
      button.setAttribute('aria-pressed', button.dataset.ward === wardSelection ? 'true' : 'false');
    }
    for (const row of wardRows) {
      row.hidden = wardSelection !== 'all' && row.dataset.wardRow !== wardSelection;
    }
    if (!wardFigure || !wardDescription) return;
    if (wardSelection === 'all') {
      const sum = wardRows.reduce((total, row) => {
        const number = Number((row.cells[1]?.textContent || '').replaceAll(',', '').trim());
        return Number.isFinite(number) ? total + number : total;
      }, 0);
      wardFigure.textContent = sum.toLocaleString('en-US');
      wardDescription.textContent = language === 'ne' ? 'सबै नौ वडा, जनगणना २०२१' : 'All nine wards, Census 2021';
    } else {
      const selected = wardRows.find(row => row.dataset.wardRow === wardSelection);
      if (!selected) return;
      wardFigure.textContent = selected.cells[1]?.textContent.trim() || '';
      const share = selected.cells[2]?.textContent.trim() || '';
      wardDescription.textContent = language === 'ne'
        ? 'वडा ' + wardSelection + ' · कुल जनसंख्याको ' + share
        : 'Ward ' + wardSelection + ' · ' + share + ' of residents';
    }
  }
  for (const button of wardButtons) {
    button.addEventListener('click', () => {
      wardSelection = button.dataset.ward;
      displayWard();
    });
  }

  if (explorer && dataTabs.length === 9 && dataPanels.length === 9) {
    document.body.classList.add('dx-enhanced');
    const topic = topicFromHash();
    activateTopic(topic || 'overview', !topic && !window.location.hash);
    displayWard();
  }
})();