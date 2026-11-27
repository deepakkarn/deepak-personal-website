#!/usr/bin/env python3
"""Static regression guard for shared deepakkarn.com Blog design.

Run from repo root:
    python3 blog/check_article_design.py

This is intentionally dependency-free. It cannot replace mobile/browser visual
tests, a deployment check, or article fact-checking.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "blog" / "posts"
POST_NAMES = (
    "bhangaha-population-analysis.html",
    "vidyalaya-chha-tara-sikne-batawaran-kasto-chha.html",
    "eutai-palika-dui-nirwachan-kshetra.html",
    "shreenagar-tin-mudha-ek-khola.html",
    "rsp-naya-netritwa.html",
)
VERSION = "20261126-story-restore1"
BLOG_LISTING_VERSION = "20261126-site-grid2"
EDITORIAL_VERSION = "20261127-blog-accent1"
ARTICLE_HEADER_VERSION = "20261126-data-nav1"
THEME_SCRIPT_VERSION = "20261126-theme1"
THEME_CSS_VERSION = "20261126-theme3"
PDF_VERSION = "20261124-article-pdf1"
FLOATING_VERSION = "20261124-floating-nav2"


def check(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def read(filename: str) -> str:
    return (ROOT / filename).read_text(encoding="utf-8")


def inspect_page(filename: str, failures: list[str]) -> None:
    html = read(f"blog/posts/{filename}")
    note = f"[{filename}] "
    body = re.search(r"<body\b([^>]*)>", html, flags=re.I)
    check(bool(body and re.search(r'class=["\'][^"\']*\bblog-article\b', body.group(1))),
          note + "missing body.blog-article", failures)
    head = html.split("</head>", 1)[0]
    stylesheets = re.findall(r'<link\s+rel=["\']stylesheet["\']\s+href=["\']([^"\']+)', head)
    standard = [url for url in stylesheets if "article-standard.css" in url]
    check(len(standard) == 1, note + "must load exactly one article-standard.css", failures)
    check(bool(stylesheets and "article-standard.css" in stylesheets[-1]),
          note + "shared CSS must be the LAST stylesheet", failures)
    check(bool(standard and VERSION in standard[0]),
          note + "stale shared CSS query version", failures)
    check(('styles.css?v=' + EDITORIAL_VERSION) in head,
          note + "shared site CSS cache key is stale", failures)
    for label, pattern in (
        ("all-articles back link", r"← सबै लेखहरू"),
        ("share menu", r"data-article-share"),
        ("shared share JS", r"share\.js"),
        ("Like/Comment panel", r"data-blog-engagement"),
        ("other articles navigation", r"← अरू लेखहरू"),
        ("homepage navigation", r"मुख्य पृष्ठ"),
    ):
        check(bool(re.search(pattern, html)), note + "missing " + label, failures)
    ids = re.findall(r'\bid=["\']([^"\']+)["\']', html)
    check(len(ids) == len(set(ids)), note + "duplicate DOM IDs", failures)
    missing = sorted(set(re.findall(r'href=["\']#([a-zA-Z0-9_-]+)', html)) - set(ids))
    check(not missing, note + "unresolved in-page anchor(s): " + str(missing), failures)
    for tag in ("main", "header", "article", "footer", "nav"):
        opens = len(re.findall(rf"<{tag}(?:\s|>)", html))
        closes = len(re.findall(rf"</{tag}>", html))
        check(opens == closes, note + f"unbalanced {tag} tags", failures)
    # Article headers use the same six-link main-site navigation as Blog.
    header = re.search(r'<header class="site-header"[^>]*>(.*?)</header>', html, flags=re.S)
    desktop = header.group(1) if header else ""
    mobile_match = re.search(r'<nav id="mobile-nav"[^>]*>(.*?)</nav>', html, flags=re.S)
    mobile_text = mobile_match.group(1) if mobile_match else ""
    check(bool(header and mobile_match), note + "shared header/mobile nav missing", failures)
    check('class="header-actions"' in desktop, note + "missing shared header actions", failures)
    for key, dest in (
        ("navAbout", "/#about"), ("navFocus", "/#focus"),
        ("navJourney", "/#journey"), ("navBlog", "/blog/"),
        ("navData", "/data/"), ("navConnect", "/#connect"),
    ):
        for section, label in ((desktop, "desktop"), (mobile_text, "mobile")):
            check(('href="' + dest + '"') in section and ('data-i18n="' + key + '"') in section,
                  note + "shared " + label + " nav missing " + key, failures)
    for control in ("language-toggle", "language-label", "menu-toggle", "mobile-nav"):
        check(html.count('id="' + control + '"') == 1,
              note + "missing/duplicate header control " + control, failures)
    check('aria-current="location"' in desktop,
          note + "article Blog section does not have active-link semantics", failures)
    check(('article-header.js?v=' + ARTICLE_HEADER_VERSION) in head,
          note + "missing shared header controller", failures)
    check("Home</a>" not in desktop and "Connect</a>" not in desktop,
          note + "obsolete English-only article header", failures)
    check("article-language-switch" not in html, note + "one-off translation control", failures)
    check(('theme.js?v=' + THEME_SCRIPT_VERSION) in head,
          note + "missing early shared theme controller", failures)
    check(('theme.css?v=' + THEME_CSS_VERSION) in head,
          note + "missing shared theme stylesheet", failures)
    check(bool(stylesheets and len(stylesheets) >= 2
               and "theme.css" in stylesheets[-2]),
          note + "theme CSS must precede LAST canonical article stylesheet", failures)
    check(head.find('theme.js?v=') < head.find('article-standard.css?v='),
          note + "theme controller must load before page styles", failures)
    check(("share.css?v=" + PDF_VERSION) in html, note + "stale PDF/share CSS version", failures)
    check(("share.js?v=" + PDF_VERSION) in html, note + "stale PDF/share JS version", failures)
    check(("engagement.css?v=" + FLOATING_VERSION) in html,
          note + "outdated shared floating navigation CSS", failures)
    check(("engagement.js?v=" + FLOATING_VERSION) in html,
          note + "outdated shared floating navigation JavaScript", failures)
    check('id="back-to-top"' not in html,
          note + "obsolete article-only Up button would duplicate shared control", failures)
    check(".site-header{position:relative}" not in html,
          note + "article-only mobile header must not override shared sticky navigation", failures)
    if filename == "bhangaha-population-analysis.html":
        check("data-dx-tab=" not in html, note + "duplicate explorer tabs", failures)
        check("data-dx-panel=" not in html, note + "duplicate explorer panels", failures)
        check('href="/data/population/#overview" target="_blank" rel="noopener noreferrer"' in html, note + "missing safe standalone explorer link", failures)
        check(len(re.findall(r'<li id="source-S\d+"', html)) == 10,
              note + "expected 10 numbered source items", failures)


def main() -> int:
    failures: list[str] = []
    stylesheet = read("blog/article-standard.css")
    check(stylesheet.count("{") == stylesheet.count("}"),
          "blog/article-standard.css has unbalanced CSS braces", failures)
    check("--blog-reading: 790px" in stylesheet and "--blog-wide: var(--editorial-wide, 1100px)" in stylesheet,
          "canonical reading/hero widths changed unexpectedly", failures)
    site_css = read("styles.css")
    blog_css = read("blog/blog.css")
    listing = read("blog/index.html")
    home = read("index.html")
    # ONE 1100px outer grid governs homepage, Blog listing, mastheads,
    # covers, headers and footers. Reading text remains 790px, left-aligned
    # to the outer frame, without stretching paragraphs to the cover width.
    check("--wrap:var(--editorial-wide);" in site_css and
          "--editorial-wide:1100px;" in site_css,
          "homepage and Blog editorial widths diverged", failures)
    check("--editorial-gutter:clamp(17px, 4vw, 44px);" in site_css,
          "shared mobile/desktop gutter changed", failures)
    check(".wrap{width:min(var(--wrap), calc(100% - var(--editorial-gutter)" in site_css,
          "shared site-wide .wrap is not the single width source", failures)
    check(".wrap{" not in blog_css and "width: min(var(--editorial-wide" not in blog_css,
          "Blog-specific .wrap width override was reintroduced", failures)
    check(".site-header{height:96px;padding-inline:max(var(--editorial-gutter)" in site_css and
          "grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)" in site_css,
          "header not aligned to content grid", failures)
    check(".site-header .header-actions{grid-column:3;justify-self:end}" in site_css,
          "mobile/header actions no longer anchored to right grid column", failures)
    check(".wrap{width:calc(100% - 56px)}" not in site_css and
          ".wrap{width:calc(100% - 34px)}" not in site_css,
          "old tablet/mobile conflicting gutters returned", failures)
    check("--blog-gutter: var(--editorial-gutter," in stylesheet and
          "--blog-wide: var(--editorial-wide, 1100px)" in stylesheet,
          "article is not inheriting the global outer grid", failures)
    # A previous universal article reflow damaged Shreenagar's carefully
    # arranged alternating photo/text story. NEVER force nested story-content
    # into a second outer frame or independently left-anchor its paragraphs.
    check("main > .story-content" not in stylesheet and
          "--blog-frame-start" not in stylesheet,
          "unsafe nested story-container reflow returned", failures)
    check("--section-heading-size:clamp(36px, 4.1vw, 60px);" in site_css and
          "var(--section-heading-size)" in blog_css,
          "shared section heading rhythm was lost", failures)
    check("body.blog-article { --blog-gutter: 0px; }" in stylesheet,
          "A4 print gutter contract changed", failures)
    check(("blog.css?v=" + BLOG_LISTING_VERSION) in listing,
          "Blog listing still using stale site-grid CSS", failures)
    check(("styles.css?v=" + EDITORIAL_VERSION) in listing and
          ("styles.css?v=" + EDITORIAL_VERSION) in home,
          "homepage/Blog common stylesheet cache key is outdated", failures)
    check("theme.css?v=" + THEME_CSS_VERSION in listing and
          "theme.js?v=" + THEME_SCRIPT_VERSION in listing,
          "Blog listing theme assets unexpectedly changed", failures)

    check("body.blog-article .story-section > p { margin-inline: auto; }" in stylesheet,
          "Shreenagar centered story text was lost", failures)
    story = read("blog/posts/shreenagar-tin-mudha-ek-khola.html")
    for label, needle, count in (
        ("alternating photo/text rows", 'class="story-split ', 5),
        ("photographic figures", 'class="story-figure ', 6),
        ("story sections", 'class="story-section"', 7),
        ("large photograph", 'class="story-figure story-wide"', 1),
    ):
        check(story.count(needle) == count,
              "Shreenagar " + label + " structure changed", failures)
    check('.story-section > p { margin-left:auto; margin-right:auto; }' in story,
          "Shreenagar local centered prose safeguard missing", failures)
    # A user screenshot showed inconsistent 760/790px text columns and
    # 990/1100/1150px photo rows. Keep one SCOPED story grid, not a
    # universal wrapper that also affects research and essay articles.
    required_story_rules = (
        "Shreenagar story layout contract, 2026-11-26",
        "--shreenagar-wide: var(--editorial-wide, 1100px)",
        "--shreenagar-reading: 790px",
        "--shreenagar-gutter: var(--editorial-gutter",
        "--shreenagar-image-gap: clamp(24px, 4vw, 58px)",
        "body.blog-article .story-layout .story-split {",
        "grid-template-columns: repeat(2, minmax(0, 1fr))",
        "body.blog-article .story-layout .story-split .story-figure {",
        "body.blog-article .story-layout .story-split .story-split-copy {",
        "body.blog-article .story-layout .story-section > p {",
        "body.blog-article .story-layout .story-wide img {",
    )
    for required in required_story_rules:
        check(required in story,
              "Shreenagar scoped grid contract missing: " + required, failures)
    check(story.count("Shreenagar story layout contract") == 1,
          "Shreenagar duplicate story grid blocks", failures)
    check(story.count("<style") == 1 and story.count("</style>") == 1,
          "Shreenagar stylesheet structure changed unexpectedly", failures)

    # Bhangaha had multiple alternating 790/990/1100px columns. The
    # specific CSS contract below keeps all reading components aligned;
    # only the feature cover and the article masthead are deliberately wide.
    for selector in (
        "main > .reading-wrap:not(.article-mast):not(.bhangaha-post-cover)",
        "main > .article-body.reading-wrap",
        "main > .reading-wrap .dx-explorer",
        "main > .reading-wrap .kpi-grid",
        ".article-body .figure",
        ".article-body .section-paragraph",
    ):
        check(selector in stylesheet,
              "Bhangaha unified content-column rule missing: " + selector, failures)
    check("Bhangaha content-column correction" in stylesheet,
          "Bhangaha column regression fix was removed", failures)

    article_nav = read("blog/article-header.js")
    for required in (
        "dk-language", "data-i18n", "navData", "language-toggle", "menu-toggle",
        "mobile-nav", "aria-expanded", "Escape", "localStorage.setItem",
    ):
        check(required in article_nav,
              "shared article header script missing: " + required, failures)
    check('body.blog-article .desktop-nav a[aria-current="location"]' in stylesheet,
          "article Blog section highlight missing", failures)

    # Universal PDF handling must be shared, accessible and print all data.
    share_js = read("blog/share.js")
    share_css = read("blog/share.css")
    check(share_css.count("{") == share_css.count("}"),
          "blog/share.css has unbalanced CSS braces", failures)
    for token in (
        "article-pdf-button", "window.print()", "beforeprint", "afterprint",
        "main details:not([open])", "data-ward",
    ):
        check(token in share_js,
              "shared PDF behavior missing: " + token, failures)
    for token in (".article-pdf-button", ".share-widget", ":focus-visible"):
        check(token in share_css,
              "shared PDF styling missing: " + token, failures)
    for token in (
        "@page { size: A4", "body.blog-article.bhangaha-article .dx-panel[hidden]",
        "body.blog-article.bhangaha-article [data-ward-row][hidden]",
        "body.blog-article main::before",
        "body.blog-article details.more-table",
    ):
        check(token in stylesheet,
              "shared print layout/data completeness missing: " + token, failures)

    engagement_js = read("blog/engagement.js")
    engagement_css = read("blog/engagement.css")
    check(engagement_css.count("{") == engagement_css.count("}"),
          "blog/engagement.css has unbalanced braces", failures)
    for token in (
        "backToTop.hidden = window.scrollY < 320",
        "jumpLink.hidden = reactionsTop <= window.innerHeight - 72",
        "floatingActions.append(backToTop, jumpLink)",
        "window.addEventListener('scroll', queueFloatingActions",
        "window.addEventListener('pageshow', queueFloatingActions",
    ):
        check(token in engagement_js,
              "shared floating button JS missing: " + token, failures)
    for token in (
        "body.blog-article .blog-floating-actions",
        "flex-direction: column",
        "body.blog-article .blog-floating-actions .engagement-jump-label",
        "background: #253d34",
        "color: #fff",
        "body.blog-article .blog-floating-actions .blog-back-to-top",
        ".blog-floating-actions[hidden]",
    ):
        check(token in engagement_css,
              "shared floating button CSS missing: " + token, failures)

    # One theme controller and color system covers homepage, listing, posts and
    # future articles. Existing page layout, data and PDF contracts stay intact.
    theme_js = read("theme.js")
    theme_css = read("theme.css")
    check(theme_css.count("{") == theme_css.count("}"),
          "theme.css has unbalanced braces", failures)
    for needle in (
        "dk-theme", "prefers-color-scheme: dark", "data-theme",
        "aria-pressed", "MutationObserver", "localStorage.setItem",
        "theme-article-actions", "change",
    ):
        check(needle in theme_js,
              "shared theme JS requirement missing: " + needle, failures)
    for needle in (
        '--chart-primary', '--chart-secondary', '--chart-tertiary',
        '.dx-shell', '.dx-table', '.dx-tab', '.blog-engagement',
        '.site-header', '@media print', '@media screen',
    ):
        check(needle in theme_css,
              "shared dark style requirement missing: " + needle, failures)
    # User-reported homepage contrast regressions: dark details inside
    # About cards and near-white text on unchanged pastel Focus cards.
    for needle in (
        'html[data-theme="dark"] .about-intro-card .about-bullets li span',
        'html[data-theme="dark"] .idea-card.idea-saffron',
        'html[data-theme="dark"] .idea-card.idea-blue',
        'html[data-theme="dark"] .idea-card.idea-green',
        'html[data-theme="dark"] .idea-card :is(h3,p)',
        'html[data-theme="dark"] .journey-perspective {',
        'html[data-theme="dark"] .journey-perspective h3 {',
        'html[data-theme="dark"] .journey-perspective .perspective-body p {',
        'html[data-theme="dark"] .journey-perspective .perspective-path > span:not(.perspective-connector) {',
        'html[data-theme="dark"] .journey-perspective .perspective-link {',
    ):
        check(needle in theme_css,
              "homepage dark card contrast regression: " + needle, failures)
    check("Theme v20261126-theme1" in stylesheet,
          "last article stylesheet missing dark typography", failures)
    check("body.blog-article .theme-toggle { display:none!important; }" in stylesheet,
          "theme toggle must not appear in PDFs", failures)
    for path in ("index.html", "blog/index.html"):
        page = read(path)
        head = page.split("</head>", 1)[0]
        check("theme.js?v=" + THEME_SCRIPT_VERSION in head,
              path + " does not load shared theme JS", failures)
        check("theme.css?v=" + THEME_CSS_VERSION in head,
              path + " does not load shared theme CSS", failures)
        check(head.find("theme.js?v=") < head.find("theme.css?v="),
              path + " theme JS must be before CSS", failures)

    # The new public /data/ section must not disappear from the sitewide
    # navigation or be omitted from the homepage/Blog language switch.
    for path in ("index.html", "blog/index.html"):
        page = read(path)
        check(page.count('data-i18n="navData"') == 2,
              path + " missing Data navigation on desktop/mobile", failures)
    check("navData:" in read("script.js") and
          "navData:" in read("blog/blog.js") and
          "navData:" in article_nav,
          "Missing bilingual shared Data navigation label", failures)
    check("script.js?v=20261126-data-nav1" in read("index.html") and
          "blog.js?v=20261126-data-nav1" in read("blog/index.html"),
          "Data navigation script cache keys not refreshed", failures)

    for filename in POST_NAMES:
        inspect_page(filename, failures)
    inspect_page("_template.html", failures)

    if failures:
        print("Blog design regression checks FAILED:", file=sys.stderr)
        for issue in failures:
            print(" -", issue, file=sys.stderr)
        return 1
    print(f"PASS: common design contract applied to {len(POST_NAMES)} posts and starter template.")
    print("Reminder: real browser, mobile and Cloudflare checks are still required.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
