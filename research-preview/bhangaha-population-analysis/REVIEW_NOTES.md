# Bhangaha interactive dashboard — peer review handoff

> Status: **UNPUBLISHED DRAFT / NOT APPROVED FOR PRODUCTION**  
> Branch: `draft/bhangaha-population-dashboard-2026`  
> Draft route in the branch: `/research-preview/bhangaha-population-analysis/`  
> Intended future article route only after approval: `/blog/posts/bhangaha-population-analysis/`  
> Reviewed: 24 November 2026

## Safety and publication

- The public website's `main` branch is unchanged by this task.
- No entry was added to `blog/posts.js`, the homepage, or the blog listing.
- This draft includes `noindex,nofollow,noarchive,nosnippet` and is not linked in navigation.
- **GitHub branches and unlisted URLs are not private access controls.** Do not presume that preview branch artifacts are confidential.
- Do not deploy to the production Cloudflare Worker until the user explicitly approves.
- Do not publish a password-free preview as "private"; add Cloudflare Access or another access control first if a confidential review link is required.
- The suggested published canonical URL is metadata only, not evidence that the page exists on production.

## Files

- `index.html`: self-contained article shell, pre-rendered data tables, 15 navigable sections, full rendered report, SEO tags and disclaimer.
- `dashboard.css`: responsive scoped styling and print view.
- `dashboard-data.js`: single source of truth for traced aggregate indicators, tabular values, dates, denominators and missing-data states.
- `dashboard.js`: tab/hash navigation, charts, filters, search, sorting, CSV download, source links, print, bilingual interactions and reconciliation checks.
- `deep-research-report.md`: **exact original provided research**, unchanged, downloadable from the report tab.

## Reconciliation checks performed

| Dataset | Expected | Summed | Result |
| --- | ---: | ---: | --- |
| Nine ward populations | 55,354 | 55,354 | Pass |
| Five-year age group population | 55,354 | 55,354 | Pass |
| Age male | 26,734 | 26,734 | Pass |
| Age female | 28,620 | 28,620 | Pass |
| Literacy age 5+ categories | 49,106 | 49,106 | Pass |
| Marital age 10+ categories | 42,481 | 42,481 | Pass |
| Employment-status categories | 22,495 | 22,495 | Pass |
| Reason absent abroad categories | 4,397 | 4,397 | Pass |
| Reduced economic activity categories | 30,066 | 30,066 | Pass |

The National Statistics Office's *Nepal Statistical Yearbook 2023*, Table 1.7, confirms Bhangaha Municipality's 2021 total population, sex, household count, area, population density and literacy. The NSO *Small Area Estimation of Poverty 2023* local table confirms FGT0 18.02%, FGT1 3.15%, FGT2 0.83%, estimated poor population 9,972 and model base 55,351. These are **different reference years / statistical systems**.

## Verified source limitations

- Primary official CSV/download landing pages were verified, but this environment could not programmatically extract the CSVs (unsupported content type); the ward and detailed demographic rows remain transcribed from the user-supplied report with arithmetic checks.
- PDF text indexing showed NSO Statistical Yearbook and poverty table entries, but PDF page screenshots timed out. A final researcher should re-open the original tables and compare printed page numbers/denominators before publication.
- The supplied report did not contain a complete 2021 Bhangaha-specific caste/ethnicity table. A district profile table reportedly totals 55,544, inconsistent with the NSO census total 55,354. Do not publish unverified caste numbers.
- Verified municipality-level detailed religion, language, occupation, sector, income, household amenities and ward-by-sex tables are missing. Missing values are deliberately not presented as zero.
- "Absent abroad" is not equivalent to "working abroad"; excluded from resident population.
- SAE 2023 model base 55,351 differs from official census population 55,354; no arbitrary adjustment was made.
- Employment status, occupation, industry, institutional sector, months worked and unemployment rate are not interchangeable.
- Full report's original research-citation tokens are preserved in its Markdown download but hidden in the readable render. Source links in the dashboard's Sources section are real URL records, not a literal mapping from every internal research citation token.

## Implemented interactions

- Fifteen keyboard-focusable topic tabs with shareable hashes, arrow/Home/End key navigation.
- Translatable Nepali/English UI with existing site preference `dk-language` and English default; original long-form research remains in Nepali.
- KPI cards with year, source and denominators; show more/less.
- Population sex split, five-year age pyramid, broad age shares, historical counts.
- Multi-ward population selection, sorting, search and CSV export.
- Sex and count/percent controls for census tables that actually contain sex counts.
- Employment, literacy, marriage, migration-reason and low-activity data tables.
- Bar lengths in percentage mode and poverty charts anchored to the actual 0–100% scale.
- Direct links to source details, copyable section links, back-to-top, full-report Markdown download, print modes.
- Complete source report also pre-rendered as readable HTML even if JavaScript is disabled.
- No caste, religion, language, housing or ward-boundary visual fabricated without data.

## Testing completed

- JS syntax parsed in a V8 runtime.
- A mocked-DOM runtime test rendered KPI cards, age chart, employment, migration and ward tables, and confirmed tab navigation and nine primary sum checks.
- Static checks: 15 tabs = 15 panels, no duplicate HTML IDs, no broken internal source IDs, source metadata on all 15 KPIs, missing data represented as null/not available, all three script/style assets referenced, print CSS and mobile breakpoint rules present.
- The original source report is preserved.
- **Not tested in a real browser:** desktop/mobile visual layout, scrolling under sticky header, PDF print output, clipboard permission, downloaded CSV in Safari, screen reader behavior, live external link status after deployment, or Cloudflare preview/production serving.

## Before publishing

1. Re-extract municipal rows from NSO ward and caste/ethnicity XLSX/CSV; add all verified groups, mother tongues, religions, employment occupations and household facilities.
2. Verify all source URLs, page numbers and table numbers, especially the 2021 provincial report and 2023 poverty appendix. Resolve competing municipal profile totals.
3. Have a peer reviewer check the denominators, interpretation, external links, and all English/Nepali text.
4. Test viewport sizes (375, 390, 768, 1024, 1440), keyboard navigation, CSV, print, hash deep links, screen readers and reduced-motion.
5. On explicit approval, move/adjust paths to `blog/posts/bhangaha-population-analysis/` and reconcile with Cloudflare Worker clean-URL routing. Recalculate relative links when moving this directory.
6. Only after approval: remove noindex, choose an actual public publication date, generate a supported 1200×630 PNG social image, add metadata and blog catalog entry, and verify Cloudflare deployment.
7. Do not mistake this draft branch or a potentially public Cloudflare preview for password-protected content.

## Editorial disclaimer

**नेपाली:** यो स्वतन्त्र व्यक्तिगत अध्ययन हो, नगरपालिका वा दलको आधिकारिक प्रतिवेदन होइन। प्रस्तुत तथ्याङ्क अनलाइन उपलब्ध नेपालका जनगणना, राष्ट्रिय तथ्याङ्क कार्यालयका प्रकाशन तथा यस लेखमा संलग्न अनुसन्धानमा आधारित छन्। प्रत्यक्ष गणना, मोडेल अनुमान र लेखकको व्याख्यालाई फरक रूपमा प्रस्तुत गरिएको छ। थप प्रमाण उपलब्ध भएपछि तथ्य संशोधन हुन सक्छ।

**English:** This independent personal research uses publicly available census material, NSO publications and the supplied research report. It is not an official municipal report or campaign document. Counts, statistical estimates and interpretations are kept distinct, and figures may be revised after further verification.
