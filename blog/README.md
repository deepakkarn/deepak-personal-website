# Blog publishing and design contract

The website is a static, Nepali-first editorial blog. All published articles
**must use one consistent design and interaction pattern**, irrespective of
subject or whether the article includes data charts, photos or long-form text.

## Single source of truth for visual layout

**Shared CSS:** `/blog/article-standard.css` (load LAST in the article's `<head>`). Current version query: `?v=20261126-story-restore1`; bump this in every article and template after editing the shared CSS.

Published article `<body>` must have `class="blog-article"`. An article may
keep a second specialized class, e.g. `class="blog-article bhangaha-article"`.

Do not duplicate the following in individual article CSS or invent another
bespoke reading layout:

- Page background, typography, title scale, category label, byline/date layout.
- Hero/back-to-blog header, reading width, outside gutters, margins.
- Featured image width/rounding/spacing and long-form heading rhythm.
- Share, reader reactions, end-of-article links and footer.

The shared design uses a **1100px wide hero and cover**, a **790px narrative
reading column**, restrained warm editorial colors, and consistent responsive
gutter (`--editorial-gutter: clamp(17px, 4vw, 44px)` on every viewport).
It intentionally matches the blog design exemplified by the school essay.

Article-specific features (Bhangaha's Data Explorer and charts; Shreenagar's
photo/text stories) are **allowed** and may have different internal composition.
Maintain the shared navigation, typography, responsive safe gutters and
outer article width. Long-form paragraphs remain at a readable 790px measure,
but Shreenagar's alternating photograph/text story must keep its **centered**
reading column and wider photo sequences. Do not force its nested story
sections into a second 1100px container.

**Important:** Bhangaha's KPI cards, TOC, Data Explorer, charts, section headings and paragraphs must use the **same 790px reading measure, aligned to the masthead's left edge**. Only its hero and cover are wide. The explicit shared CSS block `Bhangaha content-column correction` is regression-tested and must not be deleted or overridden. Alternating 790px/990px/1100px internal columns are a known screenshot-confirmed defect.

**Important:** Shreenagar's centered narrative and alternating photograph/text
layout is deliberately preserved. The previous site-grid2 `main > .story-content`
and `--blog-frame-start` rules were rolled back because they narrowed
nested photographs and shifted text. Do not reintroduce that universal
left-edge reflow without genuine responsive browser screenshots and tests.
It has five story-split rows, six story figures, and seven story sections.
Bhangaha's own 790px research column remains a separate protected layout.

**Shreenagar-specific layout contract (2026-11-26):** The article's one
inline stylesheet now includes a screen-only, `body.blog-article .story-layout`-
scoped correction after its historical rules. It defines exactly **two**
widths, `--shreenagar-wide:1100px` for cover, alternating photo/text rows,
and full-width photographs, and `--shreenagar-reading:790px` for headings,
prose, footnotes, sharing and footer navigation. It uses
`--shreenagar-gutter` from the shared site and a consistent image gap.
These frames are centered independently on the viewport, **never nested**.
On widths at or below 800px, alternating rows stack image first, text second.
Keep these scoped rules screen-only so the pre-existing PDF print layout remains
intact. Do not add global `main > .story-content` rules to mimic this.


## One website-wide grid: homepage, Blog and articles

Use a single outer **1100px maximum** content frame. The homepage, every
homepage section, its header and footer, the Blog listing, and every article
masthead and cover must have the same horizontal start and outer margins.

- `styles.css` is the source of truth: `--editorial-wide:1100px`,
  `--wrap:var(--editorial-wide)` and
  `--editorial-gutter:clamp(17px, 4vw, 44px)`.
  `.wrap` consumes the shared tokens at all viewport widths. The header
  uses a centered three-column grid with the same outer start.
  **Do not reintroduce page-specific `.wrap` or breakpoint gutters.**
- Home, Blog and article section headings share
  `--section-heading-size`; homepage section spacing uses
  `--section-space`. Content types may keep distinct heading
  hierarchy and layout (e.g., hero vs research article).
- **Long Nepali text stays no wider than 790px.** This is a reading
  measure, not an instruction to left-align every nested content block.
  Preserve the existing article-specific internal rhythm where it is already
  designed (particularly the centered Shreenagar story).
  Common alignment comes from shared masthead, cover, header, navigation
  and site gutters, not forced repositioning of arbitrary article descendants.
- Bhangaha's Data Explorer, KPI cards, tables and references remain unchanged.
  Its 790px analysis content must not be replaced with screenshots.
- Never use a broad `main > .story-content` width override or a new
  `--blog-frame-start` to reflow Shreenagar's story sequence. Changes to
  photo-story layout require desktop/tablet/mobile rendered tests.

- Current CSS query keys: take `styles.css` and `blog/blog.css` versions from the current page references and regression guard;
  `20261126-story-restore1` for `blog/article-standard.css`
  (all articles and starter template).
- Validate 320, 375, 390, 430, 768, 1024, 1440px widths for equal outer
  margins, scroll containment and touch targets. Print remains white
  A4 with its own zero-gutter rules. Source-level checks do not constitute
  browser screenshot verification.

## Standard article structure

Use `posts/_template.html` (it was updated on 2026-11-24).
Keep, in this order:

1. Standard global `site-header`, identical to the Blog listing: DK logo, all six shared site links, language button, theme toggle and responsive mobile menu. The Blog section link is active; use `aria-current="location"` on article pages.
2. `← सबै लेखहरू`, subdued category, title, optional deck, author/date/type.
3. Optional user-provided featured cover (natural photo, no unrelated stock).
4. `<article>` with readable body sections and optional meaningful figures.
5. Shared expandable share menu and **PDF / प्रिन्ट** export (`share.css` / `share.js`).
6. Shared Like/Comment area (`engagement.css` / `engagement.js`).
7. `← अरू लेखहरू` and `मुख्य पृष्ठ` navigation.
8. Standard footer (brand, Blog, copyright).

The shared article header language control changes only the six navigation
labels (Nepali/English), using the same `dk-language` browser preference as
the homepage and Blog listing. **It does not translate article bodies.**
Keep `<html lang="ne">` and all existing Nepali article text, citations,
titles, source links and metadata unchanged. Do not introduce a separate
article-body translation widget unless all published articles are actually
translated.


## Consistent header and navigation across all articles

Use the **same visible header structure as `blog/index.html`**. Published
articles and the starter template must contain all six links:
`/#about`, `/#focus`, `/#journey`, `/blog/`, `/data/`, `/#connect`.
The DK logo links to `/`. Their mobile navigation uses the same labels,
links and a `menu-toggle` button with working `aria-expanded` behavior.

The header's language button is a genuine button, not a `← BLOG` link,
and is wired through the shared `/blog/article-header.js?v=20261126-data-nav1`.
Its `dk-language` preference affects shared navigation labels only, since
article bodies are Nepali. The existing `← सबै लेखहरू` link stays at the
top of each article body, and the shared end-of-article Blog navigation
remains. `theme.js` inserts the same Sun/Moon control in `.header-actions`.
Keep `header-actions` and `mobile-nav` in the article template.

The canonical `article-standard.css` highlights Blog links with
`aria-current="location"` on article pages; `blog/index.html` uses
`aria-current="page"` for its listing itself. Do not reintroduce separate
`HOME / BLOG / CONNECT` article headers or a second top-right back button.

## Shared light / dark theme (mandatory)

The entire site (homepage, Blog listing, all five published posts, and
`posts/_template.html`) uses **`/theme.js?v=20261126-theme1`**
and **`/theme.css?v=20261126-theme3`**.

- Load `theme.js` synchronously in `<head>`, before page CSS, to apply
  `html[data-theme="light"|"dark"]` without a flash. It follows the
  operating-system setting on first use and stores explicit selection in
  `localStorage` under `dk-theme`. If storage fails, it still works during
  the current page. The theme toggle is automatically inserted in the shared
  header. Its accessible labels follow the current page language.
- The shared theme CSS handles header, mobile menu, homepage, Blog cards,
  comments, sharing controls and Bhangaha Data Explorer presentation. The homepage's About detail rows must remain legible on dark surfaces and its three Focus cards must switch from pastel backgrounds to dark palette surfaces. The homepage's Journey perspective panel must also use a dark surface behind its pale heading, body text, badges and links. It uses
  Amber for prominent figures, Muted Teal for comparisons and Slate Blue
  for supporting graphics. Color alone must **never** encode chart meaning.
- On articles, load `theme.css` **immediately before the LAST stylesheet**
  `article-standard.css`. The canonical stylesheet owns shared dark reading
  typography, article widths and print. Do not add bespoke theme toggles or
  separate per-post dark styles.
- Dark mode must NEVER change the nine Bhangaha Data Explorer tabs, values,
  calculations, filters, source links or charts' data. Avoid screenshot
  substitutes for graphs. Test 320px through desktop, overflow, labels, active
  tab/chip states, color contrast, Like/Comment, Share and PDF.
- The shared A4 Print / Save as PDF layout stays light/white paper
  regardless of screen mode; dark overrides apply to `@media screen` only.
- When adjusting the theme, update shared assets and all page query versions
  together, then run `python3 blog/check_article_design.py` and browser QA.
  Static source checks do not establish a successful deployment.

## PDF / Print on every article (mandatory)

Every published article, including articles created from the starter template,
loads the versioned shared `share.js` and `share.css` assets
(`?v=20261124-article-pdf1`). These automatically add a
**PDF / प्रिन्ट** button beside the standard Share button at the end
of the article. **Do not implement a separate PDF handler in each post.**

The button calls the browser's native print dialog. Readers choose **Save as
PDF** as the printer/destination. This generates a PDF locally through the
browser; it is **not** a direct-download PDF endpoint or a third-party service.
The main homepage intentionally has no PDF action.

The shared LAST stylesheet (`article-standard.css`) provides A4 print
formatting, legible Nepali typography, original headline, author/date, cover,
text, source links and supporting images. Hide navigation, sharing UI, reaction
controls and comments in the PDF. Preserve actual article content and citations.

For **Bhangaha population analysis**, PDF output must include all nine Data
Explorer panels, not just the active on-screen tab. Print all ward rows,
open detailed data tables temporarily, and restore the visitor's selected ward
and closed details when printing ends. Never turn 2026 scenarios into official
figures or drop source limitations. Keep data tables inside the A4 page.

When updating the print/share functionality, change the shared files, bump
their query versions in all five posts plus the template, then run the
regression script. Test browser print preview on both a regular essay and the
population analysis, and check long-table pagination in a real PDF before
claiming visual verification.

## Universal floating buttons (mandatory)

All five current articles and `posts/_template.html` use:
- `/blog/engagement.css?v=20261124-floating-nav2`
- `/blog/engagement.js?v=20261124-floating-nav2`

The shared engagement script creates a bottom-right fixed stack:
`↑ Back to top` (after 320px; remains available in every article section,
including below the comment area) and `प्रतिक्रिया ↓` (visible until the
Like/Comments section is reached). They automatically adjust to phone widths,
respect safe-area insets, keyboard focus and reduced motion. The reaction text
is explicitly white on deep green for high contrast (approximately 11.69:1).
CSS specifically overrides article-level link colors, including visited links.

**Do not build page-specific `#back-to-top` buttons or duplicate scroll
handlers.** The Bhangaha implementation was removed after it caused
inconsistent availability across Blog posts. If floating UX changes, modify
the shared `engagement.js` and `engagement.css`, bump the version in
ALL five published posts and the template, then test the controls at:
top, mid-article, close to feedback, below feedback and after clicking ↑/↓.
At every viewport the two controls must be readable and never overlap.
`blog/check_article_design.py` protects this contract in static checks.
Live browser/device and deployed Cloudflare verification are separate.

## Publishing

1. Copy `posts/_template.html` to `posts/your-article-slug.html`.
2. Fill in real title, subtitle, publication date, category and content.
3. Insert a supplied cover image only if available. Add accurate alt text.
4. For **public** release only when approved: remove `noindex`, add canonical,
   OG/Twitter share preview (using the real cover), then list the article in
   `posts.js` with Nepali/English titles/excerpts and a valid thumbnail.
5. Keep articles unlisted/noindex during editorial review. `noindex` is not
   access control or password protection.
6. Bump the version query on the shared stylesheet or assets when changed, in
   every affected article, so cached old CSS does not persist.
7. Confirm GitHub deployment and check the live Cloudflare page if tools allow.

## Quality checks before any Blog release

Run the dependency-free static regression command from the repository root:

```bash
python3 blog/check_article_design.py
```

This checks consistent article classes/styles/links and a few critical data counts. It does **not** replace browser-based responsive, deployment or factual checks.

- Compare **all five current published posts** and the new post for the
  same hero, category, title, deck, byline, image, body, footer and spacing.
- Check viewport widths 320, 375, 390, 430, 768, 1024 and 1440px.
- At every width: matching left/right gutter, centered paragraphs, no
  page-wide horizontal overflow, no clipped headline, no cropped photos
  unless editorially intended, readable data charts, and table scrolling
  INSIDE its own viewport.
- Check hash navigation, links, share toggles, reactions, mobile menus,
  contrast, visible focus states, and print where supported.
- Validate code structure: unique IDs, valid source anchors, CSS braces, JS
  syntax, structural HTML tag balance and expected data sums.
- Do NOT claim real-browser or Cloudflare verification if only code/static
  checks were possible.
- Preserve factual research, images, source citations and article-specific
  interactive behavior unless user explicitly requests content edits.

## Related files

- `/PROJECT_CONTEXT.md`: long-term project handoff, decisions and history.
- `/blog/article-standard.css`: the canonical article layout and dark reading design.
- `/theme.js`, `/theme.css`: shared site-wide light/dark mode control and palette.
- `/blog/posts/_template.html`: the starter for every new published post.
- `/blog/article-header.js`: consistent responsive navigation and language control across all articles.
- `/blog/share.css`, `/blog/share.js`: sharing and article PDF action.
- `/blog/engagement.css`, `/blog/engagement.js`: reader reactions.
- `/blog/posts.js`: list and card metadata.

Avoid ad-hoc CSS patches to individual posts for site-wide issues. Correct
the shared design system once, regression-test all posts, and document the
decision in `PROJECT_CONTEXT.md`.

## Civic Data Explorer integration (2026-11-26)

The public Data Explorer at `/data/` is a separate interface from the Blog.
All six shared navigation links (including `तथ्याङ्क` / Data) must be
present in home, Blog listing and both desktop/mobile article menus.
Do not modify article-specific numbers or share/PDF behavior just to
update the navigation. See canonical `PROJECT_CONTEXT.md` and execute
`python3 data/check_data_pages.py` when modifying data pages.
