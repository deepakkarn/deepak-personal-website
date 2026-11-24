# Blog publishing and design contract

The website is a static, Nepali-first editorial blog. All published articles
**must use one consistent design and interaction pattern**, irrespective of
subject or whether the article includes data charts, photos or long-form text.

## Single source of truth for visual layout

**Shared CSS:** `/blog/article-standard.css` (load LAST in the article's `<head>`).

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
5. Shared expandable share menu (`share.css` / `share.js`).
6. Shared Like/Comment area (`engagement.css` / `engagement.js`).
7. `← अरू लेखहरू` and `मुख्य पृष्ठ` navigation.
8. Standard footer (brand, Blog, copyright).

Never introduce an individual page's second language switch unless the
site-wide article translation system and full translations for *every*
published post are implemented. Homepage language preferences and Blog
listing bilingual metadata are separate features; current published article
bodies remain in Nepali.

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
- `/blog/share.css`, `/blog/share.js`: sharing controls.
- `/blog/engagement.css`, `/blog/engagement.js`: reader reactions.
- `/blog/posts.js`: list and card metadata.

Avoid ad-hoc CSS patches to individual posts for site-wide issues. Correct
the shared design system once, regression-test all posts, and document the
decision in `PROJECT_CONTEXT.md`.
