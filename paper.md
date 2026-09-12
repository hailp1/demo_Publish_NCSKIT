---
title: 'NCSKit: A Serverless, WebAssembly-Powered Statistical Analysis Platform with Automated APA Interpretation'
tags:
  - WebAssembly
  - WebR
  - statistical analysis
  - structural equation modeling
  - automated interpretation
  - edge computing
  - R language
  - open science
authors:
  - name: Le Phuc Hai
    orcid: 0009-0004-1215-5023
    corresponding: true
    affiliation: 1
affiliations:
  - name: NCSKit Academy, Vietnam
    index: 1
date: 12 September 2026
bibliography: paper.bib
---

# Summary

Quantitative research in the social sciences faces a persistent tension between
accessibility and rigour. Proprietary GUI tools such as IBM SPSS and SmartPLS
are accessible but closed-source and costly; open-source environments such as R
and Python are powerful but impose steep programming barriers. Cloud-hosted
bridges (primarily R/Shiny) remove the installation barrier but introduce
server-side computational bottlenecks and data-privacy risks when sensitive
datasets must be transmitted to remote infrastructure.

`NCSKit` resolves this tension through a third architecture: *serverless edge
computing*. By compiling the R interpreter to WebAssembly via the `WebR`
library [@stagg2023webr], `NCSKit` executes a complete R statistical environment
— including `lavaan` [@rosseel2012lavaan] for covariance-based SEM, `seminr`
[@hair2021seminr] for PLS-SEM, and `psych` [@revelle2023psych] for reliability
analysis — entirely within the user's web browser. No data ever leaves the
client machine. No backend server performs any computation. A lecturer can
deploy `NCSKit` to an entire classroom via a single URL at zero marginal cost.

Beyond computation, `NCSKit` introduces the **Automated Statistical Insight
Generation (ASIG)** engine — a deterministic, rule-based system that
translates raw R output matrices into publication-ready, APA 7th Edition
narrative interpretations. Unlike Large Language Model (LLM) approaches,
ASIG is fully reproducible: identical numeric inputs always yield identical
prose outputs grounded in established methodological thresholds
[@hair2017pls; @hu1999cutoff; @nunnally1978].

# Statement of Need

## The Infrastructure Bottleneck

Traditional web-based statistical tools rely on a client–server architecture in
which every computation — from a simple correlation to a 5,000-subsample
PLS-SEM bootstrap — is transmitted to and processed by a remote server. The R
language is single-threaded; a Shiny server under concurrent load (e.g., a
university seminar with 50 students running analyses simultaneously) will
experience CPU saturation, memory crashes, or prohibitive auto-scaling costs
[@chang2015shiny]. We term this the *Shiny Scaling Problem*.

## The Data Privacy Mandate

Institutional Review Boards (IRBs) and data-protection regulations including
the GDPR and HIPAA impose strict controls on the transmission of sensitive
research data. Requiring researchers to upload non-anonymised survey or clinical
datasets to third-party cloud servers is frequently non-compliant with these
mandates [@gdpr2016; @hipaa1996].

## The Interpretation Gap

Standard statistical software outputs raw numeric matrices — p-values,
loadings, fit indices — without interpretive guidance. Novice researchers,
graduate students, and interdisciplinary scientists regularly misinterpret
these outputs [@osborne2008best]. Generative AI tools can produce fluent prose
but suffer from non-determinism and factual hallucination
[@ji2023hallucination], making them unsuitable for peer-reviewed reporting.

## How NCSKit Addresses These Problems

`NCSKit` simultaneously resolves all three barriers:

1. **Zero-infrastructure scalability.** All computation runs on the user's
   local CPU via WebAssembly. Concurrent users do not compete for shared
   server resources; scaling is linear and free.
2. **Absolute data privacy.** After the WebR runtime and R packages are cached
   locally via IndexedDB (IDBFS), all analytical sessions operate entirely
   within the browser's memory sandbox. Datasets are never transmitted over
   the network.
3. **Deterministic interpretation.** The ASIG engine maps statistical outputs
   to APA-formatted prose through hard-coded decision trees validated against
   peer-reviewed methodological thresholds. Every threshold, every citation,
   and every generated sentence is auditable in the open-source codebase.

# State of the Field

Several tools address quantitative research in the social sciences, each with
distinct trade-offs.

**JASP** [@love2019jasp] and **Jamovi** [@the2022jamovi] provide SPSS-like GUIs
over an R backend and support a broad range of analyses. However, both require
local installation, which creates barriers for Chromebook users, institutional
IT restrictions, and remote-learning environments. Neither supports PLS-SEM
natively; users must install additional modules. Critically, both execute R on
the user's machine rather than in a sandboxed browser environment, exposing the
host OS to package dependency conflicts.

**RStudio Server** and **Posit Cloud** bring R to the browser but retain a
server-side architecture, reintroducing the data-privacy and scalability
concerns that `NCSKit` is designed to eliminate.

**SmartPLS** [@ringle2022smartpls] is the dominant tool for PLS-SEM but is
commercial, closed-source, and requires per-user licensing.

**R/Shiny** [@chang2015shiny] enables rapid web application development around R
but inherits the Shiny Scaling Problem: a single R process handles all concurrent
users, leading to CPU saturation under classroom-scale loads.

`NCSKit` was built rather than extending existing tools for three reasons.
First, no existing open-source tool combines browser-native R execution with
automated APA interpretation — the ASIG engine is a novel contribution that
does not map onto any existing package's architecture. Second, the WebAssembly
compilation pipeline (`WebR`) is a fundamentally different execution model than
any existing statistical GUI, requiring architectural decisions (PostMessage
channel, self-hosted WASM packages, IDBFS caching) that are incompatible with
the designs of JASP or Jamovi. Third, `NCSKit` targets a specific underserved
audience: researchers in developing nations and resource-constrained institutions
who cannot afford commercial licenses or reliable cloud connectivity.

# Software Design

## WebR Integration and the PostMessage Bridge

`NCSKit` is built on Next.js 16 (React 19) and integrates `WebR` 0.5
[@stagg2023webr], which compiles the R interpreter to WebAssembly using
Emscripten [@haas2017webassembly]. Upon initialisation, the browser fetches
the pre-compiled `R.wasm` binary (~15 MB compressed via Brotli) and mounts a
virtual UNIX filesystem (VFS) in browser memory. R packages are compiled to
WASM binaries and hosted in the repository's `public/webr_repo_v6/` directory
to comply with Vercel's Content Security Policy, eliminating reliance on
external CDNs at runtime.

Communication between the JavaScript (V8) execution context and the WASM R
environment uses **WebR Channel Type 3 (PostMessage)** with the browser's
Structured Clone Algorithm for data serialisation. While Channel Type 0
(SharedArrayBuffer, zero-copy) offers lower overhead, extensive compatibility
testing revealed conflicts with modern COEP `credentialless` security headers
required by Vercel deployments. The PostMessage channel incurs approximately
10% computational overhead relative to SharedArrayBuffer but guarantees
cross-browser stability across Chrome, Firefox, Edge, and Safari.

$$\text{Overhead}_{\text{PostMessage}} \approx 0.10 \times T_{\text{compute}}$$

## Memory Lifecycle Management

Running iterative algorithms (e.g., 5,000-subsample PLS-SEM bootstrapping)
inside a WASM sandbox risks exhausting the browser's 4 GB memory limit with
unreleased R objects (`SEXP` pointers). `NCSKit` implements four mitigations:

1. **Lexical scoping:** R scripts execute inside temporary environments, not
   `.GlobalEnv`, preventing object accumulation.
2. **Explicit garbage collection:** `webR.evalR("gc()")` is called after each
   result extraction; for bootstrapping, every five iterations.
3. **Worker cleanup:** `rm(list = ls(all.names = TRUE)); gc()` is executed
   between analysis cycles.
4. **Self-healing:** Consecutive WebR initialisation failures (detected via
   `sessionStorage`) trigger a deep reset that purges IDBFS cache and
   reinitialises the R environment from scratch.

## The ASIG Engine

The ASIG engine is implemented in TypeScript (`lib/asig/`) as a set of pure
functions with no external AI dependencies. It operates through a three-stage
pipeline:

1. **Extraction:** WebR serialises R output objects (`SEXP`) to a standardised
   JSON schema transferred across the PostMessage bridge.
2. **Threshold evaluation:** Each metric is evaluated against decision trees
   encoding peer-reviewed thresholds. For example, Cronbach's Alpha
   [@nunnally1978] is classified as *excellent* ($\alpha \geq .90$), *good*
   ($\alpha \geq .80$), *adequate* ($\alpha \geq .70$), *exploratory-only*
   ($\alpha \geq .60$), or *inadequate* ($\alpha < .60$). CFA fit indices
   follow @hu1999cutoff: CFI $\geq .95$ (excellent), $\geq .90$ (acceptable);
   RMSEA $\leq .06$ (excellent), $\leq .08$ (acceptable).
3. **Natural language generation:** Evaluated states are combined with
   pre-authored APA 7th Edition linguistic templates to produce structured
   narrative reports including inline citations.

The deterministic design means ASIG output can be reproduced exactly from any
given numeric input — a property that generative AI tools cannot guarantee.
The current engine supports 22 analysis types: descriptive statistics,
Pearson/Spearman/Kendall correlation, independent and paired t-tests,
one-way and two-way ANOVA, Mann-Whitney U, Kruskal-Wallis H, Wilcoxon
Signed-Rank, chi-square, EFA, CFA, linear regression, logistic regression,
mediation, moderation, cluster analysis, PLS-SEM (Fornell-Larcker, HTMT,
path coefficients), VIF diagnostics, and multivariate outlier detection.

The following pseudocode illustrates the Fornell-Larcker discriminant validity
evaluator within ASIG:

```typescript
function evaluateFornellLarcker(
  matrix: Record<string, Record<string, number>>
): string[] {
  const violations: string[] = [];
  for (const c1 of Object.keys(matrix)) {
    const sqrtAVE = matrix[c1][c1]; // diagonal = √AVE
    for (const c2 of Object.keys(matrix)) {
      if (c1 !== c2) {
        const r = matrix[c1][c2] ?? matrix[c2][c1];
        if (r >= sqrtAVE) violations.push(`${c1} vs ${c2}`);
      }
    }
  }
  return violations; // empty → criterion satisfied
}
```

# Performance Benchmarks

To validate the computational viability of the WebAssembly approach, we
benchmarked `NCSKit` against a standard Shiny Server deployment on a
controlled PLS-SEM workload: a model with five latent constructs, 25
indicators, 1,000 observations, and 5,000 bootstrap subsamples.

| Metric | NCSKit (Client, Apple M1) | Shiny Server (AWS t3.medium) |
|:---|---:|---:|
| Network payload transfer | 0 ms | ~1,200 ms |
| Bootstrap execution time | ~14.5 s | ~48.2 s |
| Result serialisation | ~250 ms | ~1,800 ms |
| **Total turnaround** | **~14.75 s** | **~51.2 s** |
| Peak RAM | ~850 MB | ~350 MB |
| Turnaround at 50 concurrent users | ~14.75 s (each) | >10 min (queued) |

: Benchmark results for a 5,000-subsample PLS-SEM bootstrap. Client hardware:
Apple M1, 8 GB RAM, Chrome 118. Server: AWS t3.medium, 2 vCPUs, 4 GB RAM,
R 4.3.1. \label{tab:benchmark}

The client-side execution is 3.5× faster for a single user, with the
advantage growing super-linearly under concurrent load. The primary trade-off
is higher peak RAM consumption in the WASM sandbox (~850 MB vs. ~350 MB for a
native R session), mitigated by the garbage-collection strategy described above.

*Reproducibility note:* The figures in \autoref{tab:benchmark} represent
single-run measurements. A reproducible benchmark script is provided in
`tests/e2e/webr-auto-test.spec.ts`. Future work will report Mean ± SD across
≥ 30 independent runs on standardised hardware, and will include a fairer
ARM-based cloud instance (e.g., AWS c7g.large) as a second baseline.

# Research Impact Statement

`NCSKit` is actively deployed at [https://ncskit.org](https://ncskit.org) and
has been used in graduate research methods courses and thesis supervision at
Vietnamese universities. Numerical accuracy has been validated against native
R 4.4.2 on the standard `lavaan` Political Democracy dataset: all point
estimates and fit indices are identical to five decimal places (see
`BENCHMARK.md` in the repository). The `/demo` route provides a zero-login,
zero-configuration entry point for peer reviewers and new users.

# Acknowledgements

The authors acknowledge the pioneering work of George Stagg and the WebR
project team at Posit PBC, and the authors of the `lavaan`, `seminr`, and
`psych` R packages, without whose foundational efforts serverless R execution
would not be possible.

# AI Usage Disclosure

Generative AI tools (Claude, Kiro IDE) were used to assist with code
refactoring, documentation drafting, and copy-editing of this manuscript.
All AI-assisted outputs were reviewed, edited, and validated by the author.
All core architectural decisions, methodological threshold choices, and ASIG
logic design were made by the human author. The author takes full
responsibility for the accuracy and originality of all submitted materials.

# References
