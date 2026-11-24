# Project context: deepakkarn.com

This file is a short entry point. The authoritative, detailed handoff is
**[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)**. Read that file before changing
the site.

## Critical Blog design rule (24 November 2026)

**All five published Blog posts must look and behave like one website.**

- Visual source of truth: **[blog/article-standard.css](blog/article-standard.css)**.
- Publishing and regression rules: **[blog/README.md](blog/README.md)**.
- Starter for every new article: **[blog/posts/_template.html](blog/posts/_template.html)**.
- Published pages MUST use `body.blog-article` and load
  `/blog/article-standard.css?v=20261124-design-system3` **LAST**.
- Keep the same DK/Blog header, 1100px hero, 790px reading column, balanced
  side gutters, warm colors, typography, image treatment, sharing, comments,
  article navigation and footer. On phones (320–430px), left/right margins
  must be equal and there must not be page-wide horizontal overflow.
- Preserve per-article content and purpose: Bhangaha charts/Data Explorer and
  Shreenagar's photo narratives are allowed but MUST follow the shared frame.
- Never add ad-hoc sitewide CSS to one article. Fix the shared stylesheet,
  version its cache and verify all five current posts together.
- No article-only English/Nepali switch until complete sitewide translations.
- Run static and, when possible, real device/browser tests. Do not claim
  Cloudflare deployment or live visual tests without actually verifying them.

**Reason this exists:** Repeated inconsistent margins, typography and footer
designs had been introduced by editing each Blog HTML independently. On
2026-11-24 all five posts and the outdated starter template were migrated to
a shared design system. The detailed decisions and previous work are in
`PROJECT_CONTEXT.md`.

This is a pointer, not a duplicate project specification. Maintain the
canonical context and Blog README for future changes.

**Bhangaha-specific verified layout fix (2026-11-24):** Bhangaha's KPI cards, TOC, Data Explorer and every analysis figure/section all use a 790px centered reading measure now. ONLY the hero/featured image stays wide. See the `Bhangaha content-column correction` block in `blog/article-standard.css`. Avoid reintroducing 1100px wrappers or 990px chart cards, even if each alone is centered.

## Required floating navigation on all Blog posts

**Hard rule (24 November 2026):** Every published article (and `blog/posts/_template.html`) must load `blog/engagement.css` and `blog/engagement.js` with `?v=20261124-floating-nav2`. These files, **not individual post scripts**, own the persistent floating controls:
- A high-contrast dark-green ↑ button with white icon, visible whenever readers scroll more than 320px, including all article sections and past the Like/Comments area.
- A clearly readable `प्रतिक्रिया ↓` shortcut, visible until the Like/Comments section enters view; on narrow phones this becomes an accessible ↓ icon.
- Both are stacked together at bottom-right with safe-area spacing, keyboard focus styles and reduced-motion support. **No overlap, low-contrast text, or separate custom `#back-to-top` buttons.**
- All five current posts and the template have been updated. The Bhangaha-only duplicate handler, DOM button and styles have been removed.
- Update `blog/check_article_design.py` and run it for changes. The canonical implementation and history are in `PROJECT_CONTEXT.md` and `blog/README.md`. Don't add a page-only floating shortcut or forget its CSS/JS version on other pages.
- Only code/scroll simulations are currently verified; live Cloudflare/mobile visual verification is still required.

