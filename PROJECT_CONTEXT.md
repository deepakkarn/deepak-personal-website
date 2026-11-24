# PROJECT_CONTEXT.md

> Living project handoff for deepakkarn.com. Read this file and inspect the current repository before making changes.
>
> Last reviewed: 2026-11-24  
> Repository: https://github.com/deepakkarn/deepak-personal-website  
> Default branch: `main`  
> Latest commit reviewed: `224d8b29bc857b384e928f8d27ade08546308055`

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

The latest GitHub commit `8eda453` is titled **“Use selected hero, about, and community photos on homepage.”**

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

## 7. Recent verified GitHub activity

As of 2026-11-21, recent commits on `main` include:

| Commit | Description |
| --- | --- |
| `8eda453` | Use selected hero, about, and community photos on homepage |
| `cbb79d8` | Refine homepage spacing and surface latest blog writing |
| `a49853d` | Publish Madhesh school learning environment essay with verified references and original cover |
| `803b197` | Redesign blog index with compact intro and featured article above the fold |
| `43d69e4` | Fix analytics for Cloudflare clean article URLs without `.html` |
| `362269f` | Count blog article views on Worker navigation and prevent duplicate client counts |
| `84f4bba` | Split private portal into Comment Management and Web Analytics tabs |
| `dcc78c2` | Keep dashboard runtime variables across GitHub Wrangler deployments |

These are **confirmed commit messages**, not independent proof of correct production behavior.

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
- Inspect latest `main` commit and changes since `8eda453`.
- Confirm the latest Cloudflare deployment and open the live site.
- Compare current desktop/mobile homepage to desired tighter layout.
- Verify three approved photo placements and mobile crops.
- Smoke-test English/Nepali toggle, navigation, gallery/lightbox, blog index and articles, social links, and private portal access.
- Review comment moderation and analytics after any relevant code change.
- Choose a single next improvement based on observed behavior, not assumptions.

## 11. Maintenance log

| Date | Note |
| --- | --- |
| 2026-11-21 | Added Instagram `https://www.instagram.com/krndpk98/` and Threads `https://www.threads.com/@krndpk98` in Connect, using existing Bootstrap icons and descriptive accessible link labels. Adjusted desktop contact grid to four columns, preserving two-column tablet/mobile and single-column narrow-phone breakpoints. Versioned homepage CSS URL; verified changes by re-reading `index.html`/`styles.css` on `main`. Live site/deployment not independently verified. |
| 2026-11-24 | Added the user's two **original uploaded personal photos** to the homepage Journey section without changing the approved hero (`outdoor.webp`), About (`about-thumb.avif`) or community (`comm-4.webp`) photos. Optimized untouched scenes to two lightweight WebP files `assets/journey-evening.webp` (600×1046, 17 KB) and `assets/journey-portrait.webp` (540×792, 26 KB), committed as binary Git blobs. Created a compact two-photo editorial pair below the existing community gallery, with original portrait aspect ratios, lightbox reuse via `.band-photo`, accessible Nepali/English alt text and heading, and mobile layout. Modified `index.html`, `styles.css`, `script.js`, cache version `20261124-personalframes1`. Verified assets present on GitHub, original images preserved, JS parse, existing lightbox selector, and both translations; real-browser layout/deployment not independently checked. Binary asset commit `73aaba1`, HTML/CSS/JS commits through `faec5df1`. |
| 2026-11-24 | Added a minimal bilingual **floating Connect ↓ shortcut** on the homepage, inspired by the well-received blog reactions jump. Right-bottom pill (also compact on mobile), hidden as `#connect` enters the viewport or when the mobile navigation is open; automatically hidden behind the photo lightbox. Smooth scroll to existing Contact/Connect section, with heading focus and reduced-motion support; fallback anchor remains. Labels and accessible names localized via `script.js` (`Connect` / `सम्पर्क`), versioned CSS/JS as `20261124-connect-jump1`. Preserved all existing page sections, photos, social links, and prior photo-layout rollback. Re-fetched source and verified syntax and selectors; production browser rendering and Cloudflare deployment unconfirmed. Commits `61b8877`, `a9c12f5`, `224d8b2`. |
| 2026-11-24 | Added a compact **floating jump-to-reactions shortcut** to all four published article pages through shared `blog/engagement.js` and `blog/engagement.css`. Fixed bottom-right pill on desktop (`प्रतिक्रिया ↓`), circular down-arrow on <=650px mobile, hidden once reactions section is visible or passed. Clicking focuses the reactions heading and scrolls to the existing Like/Comments panel, respecting `prefers-reduced-motion`. Passive, animation-frame-throttled scroll listener; no changes to comment API, Like behavior, homepage, blog index, or unpublished draft. Versioned shared assets (`20261124-reaction-jump1`) on all four published HTML articles, validated re-fetched source and JS syntax. Browser layout and Cloudflare deployment have not been visually verified. Commits through `e67c331`. |
| 2026-11-24 | At user's explicit request, **reverted the two extra homepage photo placements completely** after screenshots showed broken spacing and cramped crops. Removed evening photo from `01 / What should stay with you?` and wall portrait from the four-card About grid; removed overriding `.memory-inner` and `.about-embedded-photo` CSS, and unused photo translation keys. No standalone photo gallery remains. Restored original Memory two-column layout and original four About cards while preserving selected hero, About thumbnail, community gallery, and engineering perspective section. CSS and JS cache versions updated to `20261124-photo-revert3`. Assets may remain in GitHub unused, but neither is displayed. Verified source files and JS syntax; live Cloudflare/browser not checked. Source commits `cab485b`, `0eb2990`, `3f73775`. Do not re-add these photos unless user explicitly asks and approves a precise placement. |
| 2026-11-24 | User rejected a standalone `personal-moments` section for two supplied photographs. Retained the image assets (`assets/journey-evening.webp`, `assets/journey-portrait.webp`) but **removed the standalone personal gallery entirely**. The evening/wooden-house portrait is embedded in `01 / What should stay with you?` (`memory-strip` right of text); the weathered-wall portrait is integrated immediately beneath the four About cards inside `.about-grid`. No new title, personal-glimpses caption or numbered photo badges. Existing hero, About thumbnail, community gallery, lightbox and engineering panel preserved. Added responsive 1100px/700px crops and translated accessible button labels. Bumped homepage CSS/JS versions to `20261124-embeddedphotos2`, re-fetched HTML/CSS/JS and verified both image files, 4 About cards, and JS syntax. Commits `2efccba`, `22aefc1`, `685adc4`. Production browser layout not yet visually verified. |
| 2026-11-24 | Reviewed reference https://pradeeppariyar.com.np/ and existing homepage. Preserved current palette, photos, sections, navigation, default English and Nepali translations. Added a compact editorial perspective panel inside Journey to connect software testing's observation/questioning with listening to people's everyday concerns, without making leadership, party or candidacy claims. A subtle two-context path and anchored link to recent writing help explain why the engineering background matters. Updated `index.html`, `styles.css`, `script.js` including mobile breakpoints at 980/700px and cache-busted links. GitHub source confirmed and JS parses; current live website was inaccessible to remote checks, so visual/browser testing and deployment status remain unverified. |
| 2026-11-22 | Redesigned reader comment presentation on **all four published articles** after screenshot review: each approved comment now a standalone warm-neutral card with initial avatar, reader label, accessible date `<time>`, and distinct message. Author replies remain threaded within the parent card, with avatar, Author label, and warmer inset background. Responsive <=550px layouts prevent name/date collisions. Public content still uses `textContent` to guard HTML injection. Shared `blog/engagement.js` and `blog/engagement.css` updated; versioned references in four published article pages (`20261122-comment-cards1`). Verified JS parsing, source selectors, mobile CSS, and all references on default branch. No D1 schema/moderation/API changes. Live deployment and browser viewport testing still unverified. |
| 2026-11-21 | Updated **same unlisted draft** again based on user's new, more personal review manuscript. Introduction now 'नौ वर्षपछि पनि मनमा उही प्रश्न'; 12 renumbered substantive sections plus conclusion covering budget, audit, roads, bridges, health, education, agriculture, sanitation, outcomes, transparency, shared government responsibility, and citizen questions. Added factual school composition donut (46 schools: 30 community, 9 madrasa, 7 institutional, as per municipal education plan), preserved 4 validated financial graphs, removed old flood housing and unneeded detail, and updated to 10 directly linked references. Kept earlier corrected 2080/81 budget/expenditure figures, noindex metadata, random URL, and exclusion from blog index/catalog/homepage. Source fetched and structural checks passed. Not password-protected; deployment and interactive browser rendering not verified. Commits `1caecf6`, `e5ce1f1`, `a3b9138`. |
| 2026-11-21 | Updated the **same unlisted review draft** (opaque path under `unpublished/articles/`) to reflect the user's revised text: distinct village-interconnecting vs inner-village roads, drainage/monsoon usability, agricultural electricity vs household electricity, agricultural meters/poles/wires, expanded measurable indicators and ten document requests, rewritten conclusion. Preserved 4 financial charts, existing monetary corrections, OAG discrepancy warning, `noindex` metadata, and exclusion from blog catalogue. Verified 2021 Naya Patrika source explicitly names Bhangaha 10-bed hospital; linked source [10]. Source re-fetch confirmed 13 sections, 14 references and no duplicate IDs. Still no field verification or password protection. GitHub commits `86fce17` and `3c08c63` (sidebar numbering refinement). |
| 2026-11-21 | Created an **unlisted municipal-accountability review draft** under `unpublished/articles/` with an opaque slug (not recorded here). Standalone responsive HTML, 12 numbered sections plus conclusion, 14 reference entries, four financial charts, and peer-review flags. Excluded from `blog/posts.js` and homepage; meta robots=noindex/nofollow. NOT private: public GitHub source and anyone with the URL can access it. Corrected FY 2080/81 government figures to total expenditure 42.75 crore and capital expenditure 12.70 crore; two-year totals now 85.21 and 27.46 crore. Original OAG report has an internally inconsistent irregularity-category breakdown, so no pie from those categories. Education plan's pupil sex counts conflict; hospital historical news URL not found. Live deployment not verified. Do not add to Blog before the user's explicit peer review approval. |
| 2026-11-21 | Initial context file created using project preferences, repository `README.md` / `index.html`, and recent GitHub commit history. Production behavior not independently verified. |
| 2026-11-21 | Homepage code review (desktop/mobile CSS, image placements, gallery, mobile navigation, language switch). Production website was not reachable from available network tools, so no live viewport/crop verification was possible. Added gallery animation pause on keyboard focus and focus-visible styles; Escape now closes the mobile menu; language switch gets action-specific accessible label and consistent pressed state; homepage CSS/JS URLs versioned. Source re-fetch verified changes. Commits through `9fa09ac`; visually validate mobile and desktop before further crop/spacing adjustments. |
| 2026-11-21 | Corrected भंगाहा spelling and nonbreaking spaces in homepage/translations. Improved photo lightbox keyboard focus handling: focus moves to Close on open, Tab stays inside, Escape closes, and focus returns to the triggering photo. Changes committed to `main` through `e4faa58`; source re-read confirmed changes. Live browser inspection and Cloudflare deployment remain unverified. |

---

### Prompt to use in a new chat

> Continue development of https://deepakkarn.com. The repository is `deepakkarn/deepak-personal-website` on `main`. Start by reading `PROJECT_CONTEXT.md`, checking the latest commits, and inspecting the relevant source code. Preserve the existing bilingual minimal-editorial design and features. Verify code and live behavior before making claims; make targeted changes and update the context file after major decisions.

## 12. New unpublished data-journalism research dashboard (2026-11-24)

- **Branch only:** `draft/bhangaha-population-dashboard-2026`. This development was deliberately kept off `main` and out of public Blog catalog. Do not merge, deploy, or list before explicit user approval.
- Draft files: `research-preview/bhangaha-population-analysis/`. Entry `index.html`; scoped `dashboard.css`, `dashboard.js`, separately source-traceable `dashboard-data.js`, unchanged uploaded `deep-research-report.md`, and detailed `REVIEW_NOTES.md`.
- The separate branch is NOT a password-private preview; access controls required for confidential preview. Meta `noindex` is not privacy protection.
- 15 working source-code tab panels, bilingual dashboard controls, hash links, KPI cards, population / age / ward / literacy / employment / migration / poverty graphs, gender and percentage toggles where supported, searchable sortable datasets, ward multi-filter, CSV download, print, and 20 references. Full research report rendered plus original download.
- Nine independent population/status table totals reconcile, and mocked-DOM smoke test rendered components successfully. Browser/device/Cloudflare preview not tested. Some official NSO data-file extractions remain unavailable; caste/religion/language/housing/ward social data are explicitly marked missing, never guessed.
- For review requirements, critical verification issues, planned publication integration and disclaimer, **read `research-preview/bhangaha-population-analysis/REVIEW_NOTES.md` before touching the article**.
- Future intended route `/blog/posts/bhangaha-population-analysis/` is NOT live. Relative assets, Worker routes, OG image, Blog listing, source verification, peer review, and noindex removal only after user approves publication.
