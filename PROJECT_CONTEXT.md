# PROJECT_CONTEXT.md

> Living project handoff for deepakkarn.com. Read this file and inspect the current repository before making changes.
>
> Last reviewed: 2026-11-21  
> Repository: https://github.com/deepakkarn/deepak-personal-website  
> Default branch: `main`  
> Latest commit reviewed: `a3b9138cda3b04490330e875cd89f475b21e3e6a`

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
| 2026-11-21 | Updated **same unlisted draft** again based on user's new, more personal review manuscript. Introduction now 'नौ वर्षपछि पनि मनमा उही प्रश्न'; 12 renumbered substantive sections plus conclusion covering budget, audit, roads, bridges, health, education, agriculture, sanitation, outcomes, transparency, shared government responsibility, and citizen questions. Added factual school composition donut (46 schools: 30 community, 9 madrasa, 7 institutional, as per municipal education plan), preserved 4 validated financial graphs, removed old flood housing and unneeded detail, and updated to 10 directly linked references. Kept earlier corrected 2080/81 budget/expenditure figures, noindex metadata, random URL, and exclusion from blog index/catalog/homepage. Source fetched and structural checks passed. Not password-protected; deployment and interactive browser rendering not verified. Commits `1caecf6`, `e5ce1f1`, `a3b9138`. |
| 2026-11-21 | Updated the **same unlisted review draft** (opaque path under `unpublished/articles/`) to reflect the user's revised text: distinct village-interconnecting vs inner-village roads, drainage/monsoon usability, agricultural electricity vs household electricity, agricultural meters/poles/wires, expanded measurable indicators and ten document requests, rewritten conclusion. Preserved 4 financial charts, existing monetary corrections, OAG discrepancy warning, `noindex` metadata, and exclusion from blog catalogue. Verified 2021 Naya Patrika source explicitly names Bhangaha 10-bed hospital; linked source [10]. Source re-fetch confirmed 13 sections, 14 references and no duplicate IDs. Still no field verification or password protection. GitHub commits `86fce17` and `3c08c63` (sidebar numbering refinement). |
| 2026-11-21 | Created an **unlisted municipal-accountability review draft** under `unpublished/articles/` with an opaque slug (not recorded here). Standalone responsive HTML, 12 numbered sections plus conclusion, 14 reference entries, four financial charts, and peer-review flags. Excluded from `blog/posts.js` and homepage; meta robots=noindex/nofollow. NOT private: public GitHub source and anyone with the URL can access it. Corrected FY 2080/81 government figures to total expenditure 42.75 crore and capital expenditure 12.70 crore; two-year totals now 85.21 and 27.46 crore. Original OAG report has an internally inconsistent irregularity-category breakdown, so no pie from those categories. Education plan's pupil sex counts conflict; hospital historical news URL not found. Live deployment not verified. Do not add to Blog before the user's explicit peer review approval. |
| 2026-11-21 | Initial context file created using project preferences, repository `README.md` / `index.html`, and recent GitHub commit history. Production behavior not independently verified. |
| 2026-11-21 | Homepage code review (desktop/mobile CSS, image placements, gallery, mobile navigation, language switch). Production website was not reachable from available network tools, so no live viewport/crop verification was possible. Added gallery animation pause on keyboard focus and focus-visible styles; Escape now closes the mobile menu; language switch gets action-specific accessible label and consistent pressed state; homepage CSS/JS URLs versioned. Source re-fetch verified changes. Commits through `9fa09ac`; visually validate mobile and desktop before further crop/spacing adjustments. |
| 2026-11-21 | Corrected भंगाहा spelling and nonbreaking spaces in homepage/translations. Improved photo lightbox keyboard focus handling: focus moves to Close on open, Tab stays inside, Escape closes, and focus returns to the triggering photo. Changes committed to `main` through `e4faa58`; source re-read confirmed changes. Live browser inspection and Cloudflare deployment remain unverified. |

---

### Prompt to use in a new chat

> Continue development of https://deepakkarn.com. The repository is `deepakkarn/deepak-personal-website` on `main`. Start by reading `PROJECT_CONTEXT.md`, checking the latest commits, and inspecting the relevant source code. Preserve the existing bilingual minimal-editorial design and features. Verify code and live behavior before making claims; make targeted changes and update the context file after major decisions.
