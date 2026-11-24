# Blog publishing and design contract

The website is a static, Nepali-first editorial blog. All published articles
**must use one consistent design and interaction pattern**, irrespective of
subject or whether the article includes data charts, photos or long-form text.

## Single source of truth for visual layout

**Shared CSS:** `/blog/article-standard.css` (load LAST in the article's `<head>`). Current version query: `?v=20261124-design-system4`; bump this in every article and template after editing the shared CSS.

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
gutter (`clamp(28px,7vw,62px)` desktop; `clamp(27px,7vw,36px)` mobile).
It intentionally matches the blog design exemplified by the school essay.

Article-specific features (Bhangaha's Data Explorer and charts; Shreenagar's
photo/text stories) are **allowed**, but must be centered, constrained to the
viewport, and must NOT override the common visual frame. Ordinary figures
should align with the 790px reading column. Wide photo stories may use the
1100px visual region where needed.

**Important:** Bhangaha's KPI cards, TOC, Data Explorer, charts, section headings and paragraphs must use the **same centered 790px reading measure**. Only its hero and cover are wide. The explicit shared CSS block `Bhangaha content-column correction` is regression-tested and must not be deleted or overridden. Alternating 790px/990px/1100px internal columns are a known screenshot-confirmed defect.

**Important:** the Shreenagar article historically had
`.story-section > p { margin:0 0 25px }`, which accidentally canceled its
horizontal centering. Explicit `margin-inline:auto` in the common stylesheet
is required. Bhangaha had a separate 990px figure width and a much narrower
paragraph column; these are now aligned. Do not reintroduce either bug.

## Standard article structure

Use `posts/_template.html` (it was updated on 2026-11-24).
Keep, in this order:

1. Standard global `site-header` with DK identity and `← BLOG` button.
2. `← सबै लेखहरू`, subdued category, title, optional deck, author/date/type.
3. Optional user-provided featured cover (natural photo, no unrelated stock).
4. `<article>` with readable body sections and optional meaningful figures.
5. Shared expandable share menu and **PDF / प्रिन्ट** export (`share.css` / `share.js`).
6. Shared Like/Comment area (`engagement.css` / `engagement.js`).
7. `← अरू लेखहरू` and `मुख्य पृष्ठ` navigation.
8. Standard footer (brand, Blog, copyright).

Never introduce an individual page's second language switch unless the
site-wide article translation system and full translations for *every*
published post are implemented. Homepage language preferences and Blog
listing bilingual metadata are separate features; current published article
bodies remain in Nepali.


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
- `/blog/article-standard.css`: the canonical design system.
- `/blog/posts/_template.html`: the starter for every new published post.
- `/blog/share.css`, `/blog/share.js`: sharing and article PDF action.
- `/blog/engagement.css`, `/blog/engagement.js`: reader reactions.
- `/blog/posts.js`: list and card metadata.

Avoid ad-hoc CSS patches to individual posts for site-wide issues. Correct
the shared design system once, regression-test all posts, and document the
decision in `PROJECT_CONTEXT.md`.
