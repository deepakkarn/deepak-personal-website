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
VERSION = "20261124-design-system2"


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
