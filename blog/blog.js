const translations = {
  ne: {
    skip:'मुख्य सामग्रीमा जानुहोस्', navAbout:'मेरो बारेमा', navFocus:'मुख्य सोच', navJourney:'यात्रा', navBlog:'ब्लग', navData:'तथ्याङ्क', navConnect:'सम्पर्क',
    eyebrow:'विचार · अनुभव · लेखन', title:'लेखहरू<span class="blog-accent">.</span>',
    intro:'समाज, स्थानीय जीवन, प्रविधि र अनुभवबाट उठेका प्रश्नहरूबारे मेरा लेखहरू।', viewArticles:'नयाँ लेखहरू पढ्नुहोस् <span aria-hidden="true">↓</span>',
    back:'← मुख्य पृष्ठ', sectionLabel:'लेखन', sectionTitle:'नयाँ लेखहरू', sectionHint:'समयसँगै थपिँदै जाने विचार र अनुभवहरू।',
    emptyTitle:'यहाँ लेखहरू आउँदैछन्।', emptyText:'अहिले यो नयाँ ठाउँ तयार गरेको छु। चाँडै आफ्ना लेख, परियोजनाका अनुभव र विचारहरू यहीँ साझा गर्नेछु।',
    noteLabel:'अरू लेखन', noteTitle:'सफ्टवेयर परीक्षणबारे मेरा लेखहरू', noteText:'Testing, engineering र सोच्ने तरिकाबारे मैले LifeOfQA मा पनि लेख्दै आएको छु।',
    lifeofqa:'LifeOfQA हेर्नुहोस्', footerNote:'सुन्ने। बुझ्ने। काम गर्ने।', read:'पूरा पढ्नुहोस् ↗'
  },
  en: {
    skip:'Skip to content',navAbout:'About',navFocus:'Focus',navJourney:'Journey',navBlog:'Blog',navData:'Data',navConnect:'Connect',
    eyebrow:'IDEAS · EXPERIENCES · WRITING',title:'The blog<span class="blog-accent">.</span>',
    intro:'Essays on community, public life, technology and questions shaped by experience.', viewArticles:'Explore latest articles <span aria-hidden="true">↓</span>',
    back:'← Home',sectionLabel:'Writing',sectionTitle:'Latest articles',sectionHint:'A growing collection of reflections and experiences.',
    emptyTitle:'Stories are on their way.',emptyText:'This new space is ready. I will be sharing articles, project experiences, and ideas here soon.',
    noteLabel:'Elsewhere',noteTitle:'My writing about software testing',noteText:'I also write about testing, engineering, and the way we think at LifeOfQA.',
    lifeofqa:'Explore LifeOfQA',footerNote:'Listen. Understand. Act.',read:'Read article ↗'
  }
};
const toggle = document.getElementById('language-toggle');
const languageLabel = document.getElementById('language-label');
const menu = document.getElementById('menu-toggle');
const mobile = document.getElementById('mobile-nav');
const list = document.getElementById('blog-list');
const empty = document.getElementById('blog-empty');

function renderPosts(lang) {
  list.replaceChildren();
  const posts = Array.isArray(window.DK_BLOG_POSTS) ? window.DK_BLOG_POSTS : [];
  const safePosts = posts.filter(post => post && typeof post.url === 'string' && /^posts\/[a-z0-9_-]+\.html$/.test(post.url));
  empty.hidden = safePosts.length > 0;
  safePosts.sort((a,b) => (b.date || '').localeCompare(a.date || '')).forEach((post, index) => {
    const card = document.createElement('a'); card.className = index === 0 ? 'blog-card blog-card--featured' : 'blog-card'; card.href = post.url;
    const meta = document.createElement('div'); meta.className = 'blog-card-meta';
    const category = document.createElement('span'); category.textContent = post.category?.[lang] || post.category?.en || '';
    const date = document.createElement('time'); date.dateTime = post.date || ''; 
    const d = new Date((post.date || '2026-01-01') + 'T00:00:00');
    date.textContent = Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat(lang === 'ne' ? 'ne-NP' : 'en-GB',{year:'numeric',month:'short',day:'numeric'}).format(d);
    meta.append(category, date);
    const title = document.createElement('h3'); title.textContent = post.title?.[lang] || post.title?.en || '';
    const excerpt = document.createElement('p'); excerpt.textContent = post.excerpt?.[lang] || post.excerpt?.en || '';
    const read = document.createElement('span'); read.className = 'blog-card-link'; read.textContent = translations[lang].read;
    if (post.image && /^assets\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(avif|webp|jpg|jpeg|png)(\?v=[a-z0-9_-]+)?$/.test(post.image)) {
      const cover = document.createElement('img');
      cover.className = 'blog-card-cover';
      cover.src = post.image;
      cover.alt = '';
      cover.loading = 'lazy';
      cover.width = 800;
      cover.height = 450;
      card.append(cover);
    }
    card.append(meta,title,excerpt,read); list.append(card);
  });
}
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n'); const value = translations[lang][key];
    if (value === undefined) return;
    if (key === 'title' || key === 'viewArticles') el.innerHTML = value; else el.textContent = value;
  });
  languageLabel.textContent = lang === 'ne' ? 'EN' : 'नेपाली';
  toggle.setAttribute('aria-pressed', String(lang === 'en'));
  renderPosts(lang);
  try { localStorage.setItem('dk-language',lang); } catch (_) {}
}
let initial = 'en';
try { if (localStorage.getItem('dk-language') === 'ne') initial = 'ne'; } catch (_) {}
setLanguage(initial);
toggle.addEventListener('click',()=>setLanguage(document.documentElement.lang === 'ne' ? 'en' : 'ne'));
menu.addEventListener('click',()=>{
  const opened = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!opened));
  menu.setAttribute('aria-label', opened ? 'Open menu' : 'Close menu');
  mobile.hidden = opened;
});
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobile.hidden = true;
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Open menu');
}));
document.getElementById('year').textContent = String(new Date().getFullYear());
