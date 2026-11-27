# PROJECT_CONTEXT.md

> Living project handoff for deepakkarn.com. Read this file and inspect the current repository before making changes.
>
> Last reviewed: 2026-11-27  
> Repository: https://github.com/deepakkarn/deepak-personal-website  
> Default branch: `main`  
> Latest revision: follow the current `main` branch (do not rely on a stale pinned SHA)

## Project documentation policy: ONE canonical context file

**`PROJECT_CONTEXT.md` is the sole project-wide record of development rules, architecture, decisions, issues, verification, and maintenance history.** On 24 November 2026, the former short `context.md` was consolidated here and retired. Do not recreate it or introduce a parallel `CONTEXT.md`, handoff, or rules tracker. The repository's `README.md` may link here, but must not become another project history.

**Before any future development:** read this file, inspect the latest `main` branch and relevant implementation, then follow the applicable technical references. **After substantial changes:** update this same file with what changed, why, how it was checked, and what remains unverified. Keep decisions current without deleting useful historical context or rewriting facts as production verification.

The former `context.md`'s mandatory requirements are preserved in this file: one shared design across all five published Blog posts; the 1100px hero/790px reading-column contract; equal mobile gutters without page-wide overflow; a shared, accessible and high-contrast floating Back-to-top/Reactions stack; no one-off article language switch; shared article template and regression checks; and truthful separation of static tests from live Cloudflare/device validation. Full specifications are in section 0 and the dated implementation records below. `blog/README.md`, `blog/article-standard.css`, `blog/posts/_template.html` and `blog/check_article_design.py` remain **implementation resources**, not competing project-wide context documents.

## 0. MANDATORY BLOG DESIGN RULE (read before any article change)

**User confirmed on 24 November 2026 that every published blog article must have the same layout, theme, typography, header, footers and mobile reading margins. This is a hard requirement, not a styling suggestion.**

- The **single source of truth** is `/blog/article-standard.css`, with the current query version taken from the template and regression guard. It MUST be the **last stylesheet loaded** on every published post (after any per-page CSS).
- Every published article uses `<body class="blog-article">` (or `class="blog-article bhangaha-article"` when specialized data components exist).
- New posts **MUST** start from the rewritten `/blog/posts/_template.html`, NOT fresh ad-hoc HTML. Read `/blog/README.md` for the complete publishing contract/checklist.
- Unified design: warm paper `#fbf7f0`, deep green-black typography, subtle warm brown accents, Noto Sans Devanagari / DM Sans, 1100px shared outer frame across homepage, Blog, mastheads and covers, **790px maximum prose measure; preserve article-specific alignment**, consistent section heading rhythm; shared side gutter `clamp(17px,4vw,44px)` on every viewport.
- Shared article anatomy: consistent six-link DK navigation (About, Focus, Journey, Blog, Data, Connect) and theme/language controls, `← सबै लेखहरू`, neutral category, large heading, optional subtitle, author/date/type, optional real cover, reading-column text, shared expandable Share menu, shared Like/Comments, `← अरू लेखहरू` / `मुख्य पृष्ठ`, standard footer.
- Specialized content (Bhangaha demographics data tables/charts, Shreenagar photographs/split layouts) may keep distinct visualizations, **but cannot change the overall layout or theme**. Bhangaha chart cards should align to the 790px reading width, not extend to 990px next to narrower paragraphs. Prevent page-wide overflow; keep table overflow inside scrollable containers.
- Shreenagar uses independently centered 790px narrative and 1100px photo frames, with paired rows stacking at 800px. Bhangaha retains its protected left-aligned 790px research column. Never apply universal nested left-edge reflow. Preserve unified mobile gutters, typography, section headings and navigation.
- All five public articles have been attached to the same design sheet: `bhangaha-population-analysis.html`, `vidyalaya-chha-tara-sikne-batawaran-kasto-chha.html`, `eutai-palika-dui-nirwachan-kshetra.html`, `shreenagar-tin-mudha-ek-khola.html`, `rsp-naya-netritwa.html`. The obsolete `_template.html` was replaced; do not revert it.
- **Any future design change:** fix the shared CSS once, update its cache version in ALL affected articles and the template, then regression-check **every post**, not just the one requested.
- Do not add a unique per-post English/Nepali toggle; published body text is Nepali-only until an actual site-wide full translation system is designed. Homepage/Blog listing language switch is separate.
- Every published article must provide the shared **PDF / प्रिन्ट** action using `/blog/share.js` and `/blog/share.css`; A4 print styles live in the last-loaded `/blog/article-standard.css`. PDFs must include complete article text, sources and all nine Bhangaha Data Explorer panels, even those hidden on screen. Do not create separate page-level print handlers or a homepage-only PDF button.
- Automated static regression guard: run `python3 blog/check_article_design.py` from the repository root whenever changing any published post or its stylesheet. This command is documented in `blog/README.md`; it is a source validation aid, not a substitute for real responsive/browser screenshots.
- QA viewport matrix: **320, 375, 390, 430, 768, 1024, 1440px**, check full-page horizontal overflow, equal horizontal gutters, centered content, legible headings and chart labels, image cropping, share/comments, links, table scrolling, contrast and keyboard navigation. Preserve content and references.
- GitHub source/static tests were run on 24 November 2026: five posts + template each import shared style last; duplicate IDs 0, broken internal anchors 0, structural tag imbalance 0, sharing/comments/navigation present. Shared CSS braces matched; Bhangaha nine tabs and ten references intact. **Live Cloudflare page and real-device screenshot verification could not be completed from the available tools. Never claim it has been completed.**

**Canonical instructions:** `blog/README.md` + `blog/article-standard.css` + `blog/posts/_template.html`. Read these and inspect existing posts BEFORE editing, even for small fixes. No standalone reinvention of the article format.

## 1. Project purpose

**deepakkarn.com** is Deepak Kumar Karn's personal website: an approachable, credible, bilingual home for his background, software-testing career, writing, ideas, and connection with the community in Bhangaha, Mahottari, Nepal.

It is a **personal website, not an election campaign website**. Civic subjects can be covered thoughtfully and independently, using observation, questions, sources, and respect for people.

Primary goals:
- Introduce Deepak as an engineer, software-testing professional, writer, and engaged community member.
- Make his work and writing easy to discover.
- Share grounded personal perspectives on education, local governance, public services, and civic life.
- Provide a friendly way to connect.
- Remain simple, fast, readable, and maintainable.

## 2. Source of truth and architecture

- **GitHub:** `deepakkarn/deepak-personal-website`, branch `main`.
- **Website:** https://deepakkarn.com
- **DNS/domain:** domain managed through Namecheap; deployment uses Cloudflare.
- **Technology confirmed:** HTML, CSS, and JavaScript (see `README.md`, `index.html`). Do not assume React, Next.js, or a `package.json`-based build.
- **Verified root files:** `README.md`, `index.html`.
- **Homepage assets/scripts referenced from `index.html`:** `styles.css`, `script.js`, `home-writing.js`, `blog/posts.js`, `analytics.js`, and `assets/`.
- **Blog:** available at `/blog/`, with individual article routes under `/blog/posts/`.
- **Cloudflare Workers/Wrangler:** indicated by recent GitHub commit messages. Inspect deployment configuration and worker code before changing this part.
- **Private portal:** recent commits mention separate Comment Management and Web Analytics tabs. Verify its routes, access controls, storage, and configuration in actual source before editing.

This file provides project intent and handoff notes, **not** a substitute for reading code or testing the deployed website.

## 3. Design direction

**Visual identity:** minimal editorial design, warm, contemporary, community-oriented, polished but natural.

Keep:
- Established palette, font choices, and overall design language unless change is expressly requested.
- Clean hierarchy, readable sections, measured whitespace, and a comfortable mobile layout.
- A personal, sincere tone. Avoid generic corporate phrases, exaggerated hero claims, and campaign-style presentation.
- Authentic, natural photography. Do not edit people's appearance in ways that look fabricated.
- Functional navigation, gallery/lightbox, blog, language switch, portal, and responsive behavior.

Improve:
- Avoid large unused gaps and disproportionately tall sections when content is short.
- Give the homepage more visual rhythm and compactness without overcrowding it.
- Use legible text, especially Nepali/Devanagari on mobile.
- Prioritize real content over decoration.

**Fonts confirmed in `index.html`:** DM Sans, Noto Sans Devanagari, and Playfair Display. Bootstrap Icons are referenced. Treat these as existing dependencies, not suggestions to replace them.

## 4. Languages and writing

- Site supports **English and Nepali**.
- **Preferred default:** English, with easy switching to Nepali. Check the current implementation to ensure this remains true.
- Use correct spelling and typography for **भंगाहा** in new content, and check existing content for inconsistent variants or accidental nonbreaking spaces.
- About Me text should be concise, personal, and scan-friendly, preferably with bullets.
- Profile includes **12+ years of professional experience** in software testing/engineering, and writing at **LifeOfQA**.
- For civic writing: clear observations, fair questions, verified facts when making factual claims, and no unsupported accusations or personal attacks.
- Do not conflate software testing with automated checking. Focus on learning, exploring, questioning, observation, risk, and judgment when relevant.

## 5. Homepage content and photography

Current homepage sections visible in `index.html` include:
- Header/navigation, hero, introduction or memory strip, About, Focus/Ideas, Journey, and Connect (plus other elements to confirm from the remainder of the file).
- Links into `/blog/`.
- Social/contact links and gallery elements should be preserved where implemented.

**Photo selections approved on 2026-11-21:**
1. **Photo 3:** main hero photo.
2. **Photo 1:** About Me photo.
3. **Photo 12:** Journey/Community photo featuring interaction with locals.

The historical photo-selection commit `8eda453` is titled **“Use selected hero, about, and community photos on homepage.”**

The homepage code examined points to:
- Hero image: `assets/outdoor.webp`
- About thumbnail: `assets/about-thumb.avif`
- Journey/community image: `assets/comm-4.webp`

Before replacing these assets, confirm their actual visual contents and mappings, not just filenames. Photo numbering belongs to the selection conversation and might not match asset filenames.

## 6. Blog and editorial features

- There is a separate blog index at `/blog/`, with article pages at `/blog/posts/...`.
- The latest development history includes a more compact blog index, featured writing above the fold, article-view analytics, comments management, and analytics UI work.
- Recent articles/topics include:
  - “विद्यालय छ, तर सिक्ने वातावरण कस्तो छ?”
  - “म राजनीतितिर किन आएँ?”
  - “एउटै पालिका, दुई निर्वाचन क्षेत्र”
- Blog content should be thoughtful, readable, evidence-based when factual, and natural in Nepali.
- Articles may have thumbnails or social-sharing images. Ensure the actual thumbnail and social preview work rather than assuming a commit means a successful deployment.
- Confirm the current comment moderation, public visibility, analytics counting, and clean article URL behavior by inspecting the relevant code and performing tests.

## 7. Revision and asset policy

Use current `main` and actual HTML asset references, not historical commit IDs or cache keys in prose. Change cache keys only when asset bytes change; update all consumers and corresponding regression expectations together. Git history retains earlier implementation records.

## 8. Known preferences and issues to check

**Preferred improvements / historical issues:**
- Homepage had too much empty space; a compactness refinement was committed. Visually review desktop and mobile results.
- Keep the selected hero/About/community images and make cropping work at varied viewport sizes.
- Gallery should support automatic sliding, a two-row photo presentation, and opening photos larger.
- Header brand mark (“DK”) should navigate or scroll reliably to the top, including when the user is at Connect.
- Use recognizable icons for Facebook, LinkedIn, WhatsApp, and email.
- Make hero imagery bright enough without looking overprocessed.
- Blog links and clean URL routes should work.
- Check `www.deepakkarn.com` redirect/DNS behavior; it was an earlier unresolved point, **not a newly verified defect**.
- Verify Cloudflare production deployment after commits; a GitHub commit does not prove live deployment.

**Do not silently reintroduce** over-spaced sections, generic biography language, broken anchors, incorrect local spellings, or intrusive political branding.

## 9. Working rules for future coding assistants

1. **Read this file, `README.md`, recent commits, and the relevant source files first.**
2. Inspect the existing implementation before proposing a rewrite. Prefer targeted, maintainable changes.
3. Preserve visual identity and existing behavior unless the request explicitly authorizes a change.
4. Keep the English/Nepali experience intact; check both languages after content/layout edits.
5. Test desktop and mobile layouts, image cropping, accessibility basics, and navigation paths.
6. For blog or portal changes, also inspect routing, data storage, authentication, security, moderation, and analytics edge cases.
7. Avoid leaking tokens, passwords, API keys, environment secrets, or private user information into the repository or chat summaries.
8. Avoid speculative claims: distinguish **implemented in code**, **confirmed in production**, **requested**, and **unverified**.
9. For meaningful changes, summarize files changed, rationale, verification performed, potential risks, and anything needing deployment checks.
10. Update **this file** after substantial decisions, architecture changes, or completed work. Keep it useful and concise rather than turning it into a full chat transcript.

## 10. Next-session checklist

When returning to the project:
- Inspect latest `main` commit and relevant recent changes; historical SHAs are not baseline requirements.
- Confirm the latest Cloudflare deployment and open the live site.
- Compare current desktop/mobile homepage to desired tighter layout.
- Verify three approved photo placements and mobile crops.
- Smoke-test English/Nepali toggle, navigation, gallery/lightbox, blog index and articles, social links, and private portal access.
- Review comment moderation and analytics after any relevant code change.
- Choose a single next improvement based on observed behavior, not assumptions.

## 11. Current data architecture and integrity

- /data/ is the public dataset library; /data/population/ and /data/elections/ are separate explorers. Blog remains the narrative area. Data cards use neutral decorative SVG artwork, not quantitative graphs or the author's portrait.
- Population: nine tabs, ten source references, existing interaction script and print behavior. The article and standalone explorer currently duplicate markup; preserve byte-for-byte parity until a build-time single-source refactor is validated. Do not switch to asynchronous fragments without protecting PDF, accessibility and indexing.
- Elections: 148 published candidate records, 15 reported polling places in 2074, 28 matched repeated-candidate records, eight tabs. Master audit reportedly has 161 rows; the difference is unresolved until the actual master records are compared. Preserve original JSON hash, noindex, and partial archive notice. Never infer missing turnout or convert unknowns to zero.

## 12. Verification and unresolved work

- Run both `python3 blog/check_article_design.py` and `python3 data/check_data_pages.py` on a checkout. Static source parity and isolated Chromium checks were previously reported; neither proves production rendering.
- Verify live Cloudflare routes in both themes at 320, 375, 390, 430, 768, 1024 and 1440px; check navigation, layout, tabs, filtering, CSV, PDF and interactions. No completed live browser pass is recorded.
- Reconcile election records with the master audit and original sources before changing counts or indexing policy.
- Consolidate Population markup only with regression coverage for both rendered outputs.

## 13. Maintenance summary

- 2026-11-21: approved hero/About/community photos, compact homepage and Blog, analytics and portal improvements. See Git history for implementation details.
- 2026-11-24: standardized article template, navigation, reactions, print/PDF and population research; retired duplicate context file. Extra homepage photo placements were reverted at user request.
- 2026-11-25: population evidence-led article and sharper thumbnail.
- 2026-11-26: site-wide theme and six-link navigation, shared outer grid, Shreenagar scoped restoration after universal reflow regression, standalone Data library and explorers, decorative dataset cards. Latest scoped Shreenagar rules supersede older global left-edge instructions.
- 2026-11-27: consolidated active project rules and historical notes. Full prior history remains in Git at [pre-consolidation revision](https://github.com/deepakkarn/deepak-personal-website/blob/88c0fa184bb602bac3876b0050dadd6528a28cf7/PROJECT_CONTEXT.md). No production behavior or dataset changed by this documentation edit. Local checkout was blocked by DNS resolution; verification remains open.

- 2026-11-27: Added Data landing social preview PNG (1200×630), Open Graph image metadata and Twitter large-card metadata. Descriptions explicitly refer to available election records. No page body or research data changed. Live Facebook scrape not verified.
