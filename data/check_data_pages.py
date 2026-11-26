#!/usr/bin/env python3
"""Regression checks for the public Bhangaha data library.

Run from repository root:
    python3 data/check_data_pages.py

Checks source consistency and explicit incompleteness labels.
Not a substitute for actual browser, Cloudflare, or source fact-checking.
"""
from pathlib import Path
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
FAILURES = []
PUBLIC = (
    "index.html", "blog/index.html",
    "blog/posts/bhangaha-population-analysis.html",
    "blog/posts/vidyalaya-chha-tara-sikne-batawaran-kasto-chha.html",
    "blog/posts/eutai-palika-dui-nirwachan-kshetra.html",
    "blog/posts/shreenagar-tin-mudha-ek-khola.html",
    "blog/posts/rsp-naya-netritwa.html",
    "blog/posts/_template.html",
    "data/index.html", "data/population/index.html", "data/elections/index.html",
)
ELECTION_DATA_SHA256 = "07645271cc3a017165ccba17271e5fad840ecce4711b371460d9af6e9e7702b7"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def check(ok, message):
    if not ok:
        FAILURES.append(message)


def fragment(html, start, end, include_end=False):
    a = html.find(start)
    if a < 0:
        return None
    b = html.find(end, a)
    if b < 0:
        return None
    return html[a:b + (len(end) if include_end else 0)]


def main():
    home = read("data/index.html")
    population = read("data/population/index.html")
    election = read("data/elections/index.html")
    original = read("blog/posts/bhangaha-population-analysis.html")

    for path in PUBLIC:
        html = read(path)
        check(html.count('data-i18n="navData"') == 2,
              path + ": Data link must appear once in desktop and mobile nav")
        check('href="/data/"' in html, path + ": Data landing link missing")
        ids = re.findall(r'\bid="([^"]+)"', html)
        check(len(ids) == len(set(ids)), path + ": duplicate DOM id")
        check("theme.js?v=20261126-theme1" in html,
              path + ": theme controller not found")

    for label, text in (("home", read("script.js")),
                        ("blog", read("blog/blog.js")),
                        ("article", read("blog/article-header.js"))):
        check("navData:" in text or "navData :" in text,
              label + ": missing bilingual Data label")

    check('href="/data/population/"' in home and
          'href="/data/elections/"' in home,
          "Landing page links to both datasets")
    # The Data portal presents subjects with CSS/SVG icons, not a personal
    # portrait. Bars are illustrative and must not be mistaken for real data.
    check('bhangaha-population-story-hq.jpg' not in home,
          "Population card must not display the author's photograph")
    check(home.count('class="data-card-bars" aria-hidden="true"') == 2,
          "Both dataset cards need accessible decorative bars")
    check(home.count('class="data-card-icon"') == 2,
          "Dataset card SVG icons missing")
    check('data-card-art--population' in home and
          'data-card-art--elections' in home,
          "Population and election illustrations are not paired")
    check("वास्तविक तथ्याङ्कको चार्ट होइन" in home and
          "वास्तविक मत परिणामको चार्ट होइन" in home,
          "Decorative graphics need accurate accessible descriptions")
    check("data.css?v=20261126-data2" in home and
          "data.css?v=20261126-data2" in population,
          "New Data illustration styles must use the refreshed cache key")
    check("आंशिक अभिलेख" in home and "उपलब्ध · Available" in home,
          "Landing must distinguish complete-looking and partial datasets")

    # Crucial: copied population KPI values, nine-tab data payload, and
    # ten original source links must match the published research article.
    a = fragment(original, '<div class="dx-shell">', '<div class="dx-bottom">')
    b = fragment(population, '<div class="dx-shell">', '<div class="dx-bottom">')
    check(bool(a and b and a == b), "Population nine-tab data shell drifted from article")
    a = fragment(original, '<ol class="reference-list">', '</ol>', True)
    b = fragment(population, '<ol class="reference-list">', '</ol>', True)
    check(bool(a and b and a == b), "Population original ten source links drifted")
    a = fragment(original, '<div class="kpi-grid">', '</p>', True)
    b = fragment(population, '<div class="kpi-grid">', '</p>', True)
    check(bool(a and b and a == b), "Population KPI block diverged from blog")

    check(population.count('data-dx-tab="') == 9,
          "Population: expected nine topic buttons")
    check(population.count('data-dx-panel="') == 9,
          "Population: expected nine topic panels")
    check(len(re.findall(r'<li id="source-S\d+"', population)) == 10,
          "Population: expected ten numbered research sources")
    check("/blog/posts/bhangaha-population-analysis.js?" in population,
          "Population must reuse original interaction logic")
    check("आधिकारिक प्रक्षेपण होइनन्" in population and
          "प्रत्यक्ष पुनःमिलान गर्न बाँकी" in population,
          "Population caveats must remain visible")
    pop_ids = set(re.findall(r'\bid="([^"]+)"', population))
    missing = set(re.findall(r'href="#([^"]+)"', population)) - pop_ids
    check(not missing, "Population broken internal links: " + str(sorted(missing)))

    # Election source is a research subset, NOT a final official ECI/ECN roll.
    # Hash protects the exact historical records supplied in the user's v4 file.
    raw = re.search(r'<script id="data" type="application/json">([\s\S]*?)</script>', election)
    check(bool(raw), "Election embedded data missing")
    if raw:
        payload = raw.group(1)
        check(hashlib.sha256(payload.encode("utf-8")).hexdigest() == ELECTION_DATA_SHA256,
              "Election source candidate data changed: review and re-audit first")
        try:
            data = json.loads(payload)
            check(len(data.get("candidates", [])) == 148,
                  "Election candidate row count changed")
            check(len(data.get("poll", [])) == 15,
                  "Election 2074 polling-site rows changed")
            check(len(data.get("repeat", [])) == 28,
                  "Election repeat-candidate rows changed")
        except json.JSONDecodeError:
            check(False, "Election source JSON is invalid")
    check(election.count('data-tab="') == 8,
          "Election: expected eight research tabs")
    check("अपूर्ण ऐतिहासिक अभिलेख" in election and
          "आधिकारिक डेटाबेस होइन" in election,
          "Election incompleteness notice missing")
    check('content="noindex,follow"' in election,
          "Partial election archive should remain noindex until reviewed")
    check("bhangaha-theme" not in election and
          'theme.js?v=20261126-theme1' in election,
          "Election Explorer must use shared theme controller")
    check("/blog/article-header.js?v=20261126-data-nav1" in election,
          "Election Explorer must use shared header controls")
    check("data/elections/explorer.css" in election,
          "Election Explorer dedicated color overrides missing")
    check("document.getElementById('data')" in election,
          "Election candidate table app script missing")
    check("data/elections/explorer.css" not in population,
          "Election styles must not leak into population article")

    css = read("data/data.css")
    election_css = read("data/elections/explorer.css")
    for label, value in (("data", css), ("election", election_css)):
        check(value.count("{") == value.count("}"),
              label + " stylesheet braces mismatch")
        check("@media" in value, label + " responsive styles missing")
    check('html[data-theme="dark"]' in election_css and
          'html[data-theme="dark"]' in css,
          "Both data views must support dark mode")
    check('html[data-theme="dark"] body.blog-article.data-page .data-card-art' in css,
          "Decorative card art missing dark-mode colors")
    check('body.blog-article.data-page .data-card-art--population .data-card-bars' in css and
          'body.blog-article.data-page .data-card-art--elections .data-card-bars' in css,
          "Decorative dataset bars missing themed CSS")

    if FAILURES:
        print("DATA PAGES FAILED:", file=sys.stderr)
        for problem in FAILURES:
            print(" -", problem, file=sys.stderr)
        return 1
    print("PASS: Data landing, 9-tab population archive and partial election explorer match protected sources.")
    print("Live browser, deployment and real-world election-source validation remain necessary.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
