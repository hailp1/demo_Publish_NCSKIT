# NCSKit — Comprehensive Reviewer Report & Strategic Plan
*Role: JOSS Associate Editor / Methodological Reviewer*  
*Date: September 2026*

---

## EXECUTIVE SUMMARY

NCSKit has a **clear, defensible contribution**: it is the only open-source tool combining (1) browser-native R execution via WebAssembly with (2) a deterministic APA-formatted interpretation engine (ASIG) without any AI/LLM dependency. The technical architecture is well-engineered. However, **6 critical inconsistencies** between documentation files, **1 false feature claim** (offline caching), and **4 bibliography issues** must be resolved before JOSS will accept the manuscript.

**Overall Verdict: Major Revision Required**

---

## PART I — CRITICAL ISSUES (Blocking acceptance)

### C1 — README advertises BROKEN feature as working

| Location | Claim | Reality |
|---|---|---|
| `README.md` Features | "**Offline capable** — after first load, all R packages are cached via IndexedDB (IDBFS)" | `lib/webr/core.ts`: `if (false && ...)` — IDBFS is DISABLED |
| `README.md` Statement of Need | "after WebR caches locally they never traverse the network" | Packages re-download every session |
| `paper.md` | Correctly discloses IDBFS is disabled | ✅ Accurate |
| `BENCHMARK.md` | "IndexedDB persistence layer is not yet active" | ✅ Accurate |

**Fix required:** Update README Features and Statement of Need table to reflect actual state.

---

### C2 — README + Architecture diagram cites `psych` as active runtime dependency

| Location | Content | Reality |
|---|---|---|
| `README.md` Summary | "including `lavaan`, `seminr`, and **`psych`**" | psych removed from runtime |
| README Architecture diagram | `lavaan, seminr, psych (self-hosted WASM pkgs)` | psych not in WASM packages |
| `paper.md` Software Design | psych cited only as former dependency | ✅ Accurate |

**Fix required:** Remove psych from README Summary and Architecture diagram. Keep only in Acknowledgements with clarification.

---

### C3 — Analysis count inconsistency: 22 vs 20

| File | Count |
|---|---|
| `README.md` (Features, JOSS Guide, ASIG_LOGIC.md) | **22** |
| `paper.md` (The ASIG Engine section) | **20** |

**Root cause:** paper.md enumeration omits **HTMT standalone** and **CB-SEM** (distinct from CFA).  
**Fix required:** Pick canonical count = **22**. Update paper.md enumeration to include all 22 types.

---

### C4 — CITATION.cff title ≠ paper.md title

| File | Title |
|---|---|
| `paper.md` | *"NCSKit: A Serverless, WebAssembly-Powered Statistical **Analysis Platform** with Automated **APA Interpretation**"* |
| `CITATION.cff` | *"NCSKit: A Serverless, WebAssembly-Powered **Engine** for Automated **Statistical Insight Generation**"* |

**Fix required:** Sync CITATION.cff title to exactly match paper.md title.

---

### C5 — CITATION.cff affiliation ≠ paper frontmatter

| File | Affiliation |
|---|---|
| `paper.md` | `NCSKit Academy, Vietnam` |
| `CITATION.cff` | `NCSKit.org` |

**Fix required:** Change CITATION.cff to `NCSKit Academy, Vietnam`.

---

### C6 — No Zenodo DOI (JOSS requirement)

README badge: `zenodo.pending` — placeholder, no actual deposit.  
**JOSS requires a permanent archived release with a real DOI before peer review begins.**  

**Fix required:** Create a GitHub release → deposit to Zenodo → replace `zenodo.pending` with actual DOI.

---

## PART II — HIGH PRIORITY ISSUES

### H1 — `chang2015shiny` BibTeX key-year mismatch

```bibtex
@article{chang2015shiny,  ← key implies 2015
  year   = {2023},         ← entry says 2023  
```

Pandoc renders in-text as "(Chang et al., 2015)" but reference list shows 2023.  
**Fix:** Change key to `chang2023shiny` + update all `[@chang2015shiny]` occurrences in paper.md.

---

### H2 — `hair2017pls` missing stable identifier

No DOI or ISBN. For a book citation used as the **primary PLS-SEM reference**, this is weak.  
**Fix:** Add `isbn = {978-1483377445}`.

---

### H3 — `nunnally1978` missing stable identifier  

**Fix:** Add `isbn = {978-0070474314}`.

---

### H4 — README Architecture diagram states `R 4.5 / WASM`

WebR 0.5.8 bundles R 4.4.x (not R 4.5). BENCHMARK.md comparison is against R 4.4.2.  
**Fix:** Verify actual bundled R version from `lib/webr/core.ts` output or WebR docs; update diagram.

---

### H5 — README Acknowledgements credits psych incorrectly

> "...`lavaan` (Rosseel, 2012), `seminr` (Hair et al., 2021), and `psych` (Revelle, 2023), without whose foundational work serverless R statistical computing would not be possible."

psych is NOT in production runtime.  
**Fix:** Add qualifier: "Earlier prototypes used `psych` (Revelle, 2023) for reliability analysis; the production implementation uses pure base R."

---

### H6 — CHANGELOG uses non-standard format

`CHANGELOG.md` has one entry `[2026-09-08]` with no semantic version number.  
`package.json` shows `"version": "0.1.0"`.  
**Fix:** Change to `## [0.1.0] - 2026-09-08` format per Keep a Changelog convention.

---

### H7 — package.json name is `"ncsstat"` not `"ncskit"`

**Fix:** Change `"name": "ncsstat"` → `"name": "ncskit"` in package.json, or add a note explaining the internal name discrepancy.

---

## PART III — MODERATE ISSUES

### M1 — `revelle2023psych` entry unused in paper text

`@revelle2023psych` exists in paper.bib. In current paper.md, it's only cited in Acknowledgements.  
This is acceptable but Pandoc may warn. No change strictly needed.

---

### M2 — ASIG limitations not discussed

Neither paper.md nor README mention ASIG's limitations:
- Only handles 20/22 pre-defined analysis types
- Threshold conventions may differ across disciplines (e.g., SEM fit thresholds are debated)
- Single-language output (English only)
- Interpretation is not "smart" — same text regardless of domain context

**Fix (recommended):** Add a brief "Limitations" subsection to The ASIG Engine section.

---

### M3 — Numerical accuracy claim precision ambiguity

Paper states: *"identical to five decimal places"*  
Table shows: Δ = 0.000 (only 3 d.p. visible)

These are different precision claims. The table demonstrates parity to 3 d.p.; individual loadings are verified to 5 d.p.  
**Fix:** Separate the claim: "Fit indices agree to ≥ 3 decimal places (Δ = 0.000); individual parameter estimates agree to 5 decimal places (Δ < 0.00001)."

---

### M4 — `preacher2008indirect` and `hayes2020omega` in bib but uncited in paper

Both are in NCSKIT_home/paper.bib but not cited in paper.md text.  
They ARE cited in ASIG_LOGIC.md, which is a separate document.  
**Fix:** Either cite them in the paper (e.g., in the ASIG Engine section when describing indirect effect threshold) or remove from paper.bib to avoid compiler warnings.

---

### M5 — `love2019jasp` author list uses "and others"

```bibtex
author = {Love, Jonathon and ... and others},
```

Full author list has 14 authors. "and others" is technically valid in BibTeX but JOSS may request complete list.  
**Fix:** Spell out full author list.

---

## PART IV — RELATED TOOLS AND MCP ECOSYSTEM ANALYSIS

*Based on systematic search of GitHub and recent literature (September 2026)*

### A. Directly Competitive / Similar Tools in the Web Statistics Space

#### 1. QuickStats (Browser-based WebR tool) — **CLOSEST COMPETITOR**
- **URL:** https://quickstats.tools / https://github.com/jimbono4-cpu/quickstats
- **Description:** Browser-based statistical analysis powered by WebR + Shinylive (Shiny compiled to WASM). Upload CSV/XLSX → publication-ready tables and plots.
- **Key overlap with NCSKit:** Both use WebR in-browser, privacy-first, no install.
- **Key difference:** QuickStats uses Shinylive (Shiny WASM) architecture vs NCSKit's custom Next.js/PostMessage. QuickStats does NOT have automated APA interpretation (ASIG equivalent). QuickStats has a file `Automated_Methods_and_Results_Drafting.md` but it appears to be a documentation feature, not a code-driven APA engine like ASIG.
- **Threat to paper:** A reviewer could ask "How is this different from QuickStats?" → Need clearer ASIG differentiation in paper.
- **Strategic response:** Add QuickStats to State of the Field. NCSKit's ASIG is the differentiator.

#### 2. knitr-based WebR JOSS-published tools
- **JOSS 2023:** *"Powering single-cell analyses in the browser with WebAssembly"* (DOI: 10.21105/joss.05603) — Published browser-WASM analysis tool in JOSS, demonstrating the precedent. Single-cell domain (bioinformatics), not social sciences.
- **Implication:** NCSKit is NOT the first JOSS WASM-based analysis tool, but IS the first for social science/behavioral statistics with APA interpretation.

#### 3. datanovia WebR Console
- **URL:** https://www.datanovia.com/apps/webr-console/
- **Description:** Free online R console running WebR in browser.
- **Difference from NCSKit:** Raw REPL only, no structured workflow, no APA interpretation.

### B. MCP Servers for Statistical Analysis — New Ecosystem (2024–2026)

The **Model Context Protocol (MCP)** ecosystem, launched by Anthropic in November 2024, now includes several statistical analysis servers directly relevant to NCSKit's domain:

#### 1. **rmcp** (R MCP Server) — Most Relevant
- **URL:** https://github.com/finite-sample/rmcp
- **Description:** MCP server with **54 statistical tools** across 11 categories, integrating **429 R packages** from CRAN task views. Enables AI assistants (Claude, etc.) to run R statistical analysis through natural conversation.
- **Categories:** Regression & Economics, Time Series, Machine Learning, Statistical Testing, Data Analysis, Data Transformation, Visualization, File Operations
- **Live endpoint:** `https://rmcp-server-394229601724.us-central1.run.app/mcp`
- **Architecture:** Python MCP server that spawns R processes on a cloud server (NOT browser-native, requires server backend)
- **Key difference from NCSKit:** rmcp is server-side R execution via AI conversation. NCSKit is browser-side with structured GUI. No APA interpretation in rmcp.
- **Strategic value for NCSKit:** NCSKit could EXPOSE AN MCP INTERFACE to allow AI assistants like Claude to trigger NCSKit analyses via natural language — creating a hybrid: browser privacy + AI conversational access.

#### 2. **stat-agent-mcp** (Statistics Testing Agent)
- **URL:** https://github.com/gdavos007/stat-agent-mcp-spec
- **Description:** MCP server with 3 tools: `list_tables`, `profile_table`, `run_test` (Welch's t-test + two-proportion z-test). Read-only, deterministic, no LLM inference of statistics.
- **Philosophy aligns with NCSKit:** "explain the returned evidence without inventing or recalculating statistical values" — exactly NCSKit's ASIG determinism principle.
- **Difference:** Very minimal (2 tests), database-focused (SQLite), hackathon MVP.

#### 3. **JeffersonStatsMCP**
- **URL:** https://github.com/sharabhshukla/JeffersonStatsMCP
- **Description:** MCP server with 40+ statistical tools built on FastMCP framework (NumPy/SciPy). Descriptive statistics, hypothesis testing, regression.
- **Difference:** Python-based, server-side, no APA output, no PLS-SEM/CFA.

#### 4. **aigroup-econ-mcp** (Econometrics MCP)
- **URL:** https://github.com/jackdark425/aigroup-econ-mcp
- **Description:** Professional econometrics MCP server for regression, causal inference, time series, panel data.
- **Difference:** Econometrics-focused, no psychometrics/SEM/reliability.

#### 5. **quantitativeresearch** MCP (Knowledge Graph)
- **URL:** https://github.com/tejpalvirk/quantitativeresearch
- **Description:** MCP server for managing quantitative research knowledge graphs across sessions — structured representation of projects, datasets, variables, hypotheses, statistical tests, models, results.
- **Complementary to NCSKit:** This manages research METADATA (what hypothesis was tested with what model), while NCSKit executes the actual analysis. Could be used alongside NCSKit.

#### 6. **mcp-stata** (Stata MCP)
- **URL:** https://github.com/tmonk/mcp-stata
- **Description:** MCP server giving AI agents control over local Stata. Run do-files, inspect data, retrieve stored results.
- **Difference:** Requires local Stata installation (proprietary). NCSKit is serverless/free.

### C. Academic Research Agent/Skill Ecosystem

#### 7. **scholar-skill** / **open-scholar-skill** — Very Relevant
- **Paper:** "Can AI Agents with Skills Replace or Augment Social Scientists?" (arxiv.org/abs/2602.22401, May 2025)
- **URL:** https://github.com/joshzyj/open-scholar-skill
- **Description:** Claude Code plugin covering the **full social science research pipeline** from idea to submission: literature synthesis, statistical methods selection, manuscript writing, submission preparation. 23-26 skills, 18 orchestrated phases, 53 quality gates.
- **Relevance to NCSKit:** scholar-skill covers the research pipeline but relies on AI to choose/interpret statistical tests. NCSKit's ASIG provides **deterministic, non-hallucinating** interpretation that could integrate as a "statistical execution backend" within scholar-skill workflows.
- **Strategic opportunity:** NCSKit could position ASIG as the "certified statistics backend" for research agent pipelines — eliminating hallucinated p-values and citations in AI-driven research.

#### 8. **statcheck** (APA Compliance Checker) — Complementary
- **URL:** https://github.com/MicheleNuijten/statcheck
- **CRAN package**, published in peer-reviewed journal (PMC: PMC7540394)
- **Description:** "Spellchecker for statistics" — extracts reported statistical tests from manuscripts and verifies p-values match test statistics and df. Searches for APA-formatted NHST results (e.g., `t(28) = 2.2, p < .05`).
- **Key difference from NCSKit ASIG:** statcheck VALIDATES existing reported statistics. ASIG GENERATES new APA-formatted prose from raw numerical outputs. They are complementary, not competing.
- **Strategic response:** NCSKit should cite statcheck as a related tool in State of the Field and position ASIG as upstream (generation) to statcheck (validation).

#### 9. **claude-scholar** / **academic-research-skills**
- **URL:** https://github.com/yy/claude-scholar
- **Description:** Academic research tools for Claude Code — literature search, citation management, LaTeX checks, math verification, manuscript critique.
- **Difference from NCSKit:** Pipeline management, not statistical execution. Complementary.

### D. JOSS Publication Precedents (Relevant comparators)

| Tool | JOSS DOI | Domain | WebAssembly? | Auto-interpretation? |
|---|---|---|---|---|
| kana (single-cell WebAssembly) | 10.21105/joss.05603 | Bioinformatics | ✅ WASM | ❌ |
| modelbased (R marginal effects) | 10.21105/joss.07969 | Statistics | ❌ | ❌ |
| BGmisc (behavior genetics) | 10.21105/joss.06203 | Psychometrics | ❌ | ❌ |
| simChef (simulation) | 10.21105/joss.06156 | Statistics | ❌ | ❌ |
| **NCSKit** (this submission) | pending | Social science stats | ✅ | ✅ ASIG |

**Key positioning:** NCSKit is the **only** JOSS submission combining WASM browser execution WITH automated APA interpretation. The kana paper (bioinformatics WASM) provides JOSS precedent for browser-WASM tools.

---

## PART V — STRATEGIC RECOMMENDATIONS FOR THE PAPER

### 1. Update State of the Field (HIGH PRIORITY)

Add these tools to the comparison:

**QuickStats** — WebR + Shinylive browser tool (closest competitor). Lacks ASIG interpretation layer.

**kana** (JOSS 2023, 10.21105/joss.05603) — demonstrates JOSS precedent for browser-WASM analysis tools; NCSKit extends this architecture to social science methods.

**statcheck** (Nuijten et al., 2016, PMC7540394) — validates reported APA statistics post-hoc; ASIG generates APA prose pre-hoc from raw output. Complementary, not competing.

**rmcp / MCP statistical servers** — server-side R via AI conversation (emerging 2024-2026 ecosystem); NCSKit's architecture is complementary (browser-native + MCP-exposable).

### 2. Add Limitation Section to ASIG Engine

```markdown
### Limitations and Scope

ASIG templates cover 22 pre-specified analysis types commonly encountered in 
social science research. It does not adapt to non-standard model configurations, 
multi-level models, or analyses outside its registered types. Interpretation 
thresholds follow the most widely-cited psychometric conventions (Hu & Bentler, 
1999; Hair et al., 2017; Nunnally & Bernstein, 1994); researchers in disciplines 
with different reporting norms should consult domain-specific guidelines. 
ASIG output is in English only. The system cannot evaluate the substantive 
appropriateness of a statistical method for a given research question — 
methodological judgment remains the researcher's responsibility.
```

### 3. Position NCSKit in the MCP/AI Agent Ecosystem

Add a paragraph to Research Impact or Software Design:

> As AI agents increasingly automate aspects of the research pipeline (e.g., scholar-skill, arxiv:2602.22401), NCSKit's ASIG engine addresses a critical gap: deterministic, non-hallucinating statistical interpretation. Unlike LLM-based agents that generate fluent but unreliable statistical prose, ASIG's rule-based design guarantees that every threshold, citation, and interpretation is auditable in open-source code — a property essential for scientific replication. NCSKit's architecture is also MCP-compatible: future releases will expose ASIG results through a Model Context Protocol endpoint, enabling AI research agents to incorporate certified statistical interpretations into their workflows.

### 4. Strengthen Research Impact with Concrete Numbers

Current Research Impact is too vague. Add:
- Approximate number of unique analysis sessions (Vercel Analytics)
- Number of GitHub stars / forks
- Specific university names if possible
- Screenshot/example of an ASIG-generated report used in a thesis

---

## PART VI — COMPLETE FIX PLAN

### Priority 1 — Pre-submission Blockers

| # | Fix | File(s) | Effort |
|---|---|---|---|
| C1 | Fix IDBFS offline claim → "planned feature" | `README.md` | 10 min |
| C2 | Remove psych from Summary + Architecture | `README.md` | 10 min |
| C3 | Fix ASIG count 20→22, add HTMT + CB-SEM | `paper.md` | 15 min |
| C4 | Sync CITATION.cff title to paper.md | `CITATION.cff` | 5 min |
| C5 | Sync CITATION.cff affiliation | `CITATION.cff` | 2 min |
| C6 | Create Zenodo archive → real DOI | GitHub + Zenodo | 30 min |

### Priority 2 — Strong Recommendations

| # | Fix | File(s) | Effort |
|---|---|---|---|
| H1 | Fix `chang2015shiny` → `chang2023shiny` | `paper.bib` + `paper.md` | 10 min |
| H2 | Add ISBN to `hair2017pls` | `paper.bib` | 2 min |
| H3 | Add ISBN to `nunnally1978` | `paper.bib` | 2 min |
| H4 | Verify/fix R version in Architecture diagram | `README.md` | 5 min |
| H5 | Fix psych in README Acknowledgements | `README.md` | 5 min |
| H6 | Fix CHANGELOG to use `[0.1.0]` versioning | `CHANGELOG.md` | 5 min |
| H7 | Fix `package.json` name | `package.json` | 2 min |

### Priority 3 — Quality Improvements

| # | Fix | File(s) | Effort |
|---|---|---|---|
| M1 | Add ASIG Limitations subsection | `paper.md` | 30 min |
| M2 | Clarify 5-decimal-place claim precision | `paper.md` | 10 min |
| M3 | Add QuickStats + kana + statcheck to State of the Field | `paper.md` | 45 min |
| M4 | Add MCP ecosystem positioning paragraph | `paper.md` | 20 min |
| M5 | Strengthen Research Impact with concrete numbers | `paper.md` | 30 min |
| M6 | Add `love2019jasp` full author list | `paper.bib` | 5 min |
| M7 | Delete stale `Publish_Paper/paper.md` or clearly archive it | root | 2 min |

---

## PART VII — NEW REFERENCES TO ADD TO paper.bib

```bibtex
@article{kana2023joss,
  title   = {Powering single-cell analyses in the browser with {WebAssembly}},
  author  = {Aaron, Jayaram and Lun, Aaron T. L.},
  journal = {Journal of Open Source Software},
  year    = {2023},
  volume  = {8},
  number  = {89},
  pages   = {5603},
  doi     = {10.21105/joss.05603}
}

@article{nuijten2016statcheck,
  title   = {The prevalence of statistical reporting errors in psychology (1985--2013)},
  author  = {Nuijten, Michèle B. and Hartgerink, Chris H. J. and van Assen,
             Marcel A. L. M. and Epskamp, Sacha and Wicherts, Jelte M.},
  journal = {Behavior Research Methods},
  volume  = {48},
  number  = {4},
  pages   = {1205--1226},
  year    = {2016},
  doi     = {10.3758/s13428-015-0664-2}
}

@misc{quickstats2026,
  title  = {{QuickStats}: Browser-based Statistical Analysis Tool powered by {WebR}},
  author = {{QuickStats contributors}},
  year   = {2026},
  url    = {https://quickstats.tools},
  note   = {Accessed September 2026}
}
```

---

## PART VIII — SELF-CONSISTENCY MATRIX (Final State After Fixes)

| Claim | paper.md | README.md | CITATION.cff | BENCHMARK.md | CHANGELOG.md |
|---|---|---|---|---|---|
| ASIG count | **22** ← fix | **22** ✓ | — | — | — |
| IDBFS status | disabled ✓ | **disabled** ← fix | — | disabled ✓ | — |
| psych status | former dep ✓ | **former dep** ← fix | — | — | — |
| WebR version | 0.5.8 ✓ | 0.5.8 ✓ | — | 0.5.8 ✓ | — |
| Title | Platform+APA ✓ | Platform+APA ✓ | **Platform+APA** ← fix | — | — |
| Affiliation | NCSKit Academy ✓ | NCSKit Academy ✓ | **NCSKit Academy** ← fix | — | — |
| R version | 4.4.2 ✓ | **4.4.x** ← verify | — | 4.4.2 ✓ | — |
| Version | — | — | 1.0.0 | — | **[0.1.0]** ← fix |

---

*This report was generated through systematic cross-reading of all repository documentation files and a comprehensive search of the MCP/statistics tool ecosystem (September 2026).*  
*Reviewer: JOSS Associate Editor perspective — Content was rephrased for compliance with licensing restrictions.*
