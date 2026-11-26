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
VERSION = "20261126-theme1"
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
    for label, pattern in (
        ("blog return button", r"← BLOG"),
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
    if filename == "bhangaha-population-analysis.html":
        check(len(re.findall(r'data-dx-tab=', html)) == 9, note + "expected 9 data tabs", failures)
        check(len(re.findall(r'data-dx-panel=', html)) == 9, note + "expected 9 data panels", failures)
        check(len(re.findall(r'<li id="source-S\d+"', html)) == 10,
              note + "expected 10 numbered source items", failures)


def main() -> int:
    failures: list[str] = []
    stylesheet = read("blog/article-standard.css")
    check(stylesheet.count("{") == stylesheet.count("}"),
          "blog/article-standard.css has unbalanced CSS braces", failures)
    check("--blog-reading: 790px" in stylesheet and "--blog-wide: 1100px" in stylesheet,
          "canonical reading/hero widths changed unexpectedly", failures)
    check(".story-section > p { margin-inline: auto; }" in stylesheet,
          "Shreenagar margin centering regression returned", failures)
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
