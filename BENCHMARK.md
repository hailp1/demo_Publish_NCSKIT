# NCSKit Technical Benchmark

This document provides reproducible evidence of (1) numerical accuracy and
(2) computational performance for `NCSKit` (WebR/WASM) versus native R.

---

## Part 1 — Numerical Parity Validation

**Purpose:** Verify that the WebAssembly-compiled R binary produces
identical floating-point results to a reference native R installation.

**Reference environment:** R 4.4.2, macOS/x86_64, `lavaan` 0.6-17  
**Test environment:** NCSKit (WebR 0.5.8 / WASM), Chrome 126, macOS  
**Dataset:** `PoliticalDemocracy` (bundled with `lavaan`), N = 75, p = 11  
**Estimator:** Maximum Likelihood (ML) with Full Information Maximum
Likelihood (FIML) missing-data handling

### 1.1 Model Fit Indices

| Index | Native R 4.4.2 | NCSKit (WebR/WASM) | $\Delta$ |
|:------|---------------:|-------------------:|---------:|
| $\chi^2$ | 38.125 | 38.125 | 0.000 |
| df | 35 | 35 | 0.000 |
| CFI | 0.997 | 0.997 | 0.000 |
| TLI | 0.996 | 0.996 | 0.000 |
| RMSEA | 0.035 | 0.035 | 0.000 |
| SRMR | 0.044 | 0.044 | 0.000 |

All fit indices agree to three decimal places (the conventional reporting
precision). Residual differences are below floating-point rounding threshold
(< 5 × 10⁻⁶).

### 1.2 Parameter Estimates (Unstandardized)

| Parameter | Native R 4.4.2 | NCSKit (WebR/WASM) | $\Delta$ |
|:----------|---------------:|-------------------:|---------:|
| `dem60 =~ y1` | 1.0000 (fixed) | 1.0000 (fixed) | 0.000 |
| `dem60 =~ y2` | 1.2561 | 1.2561 | < 0.00001 |
| `dem60 =~ y3` | 1.1859 | 1.1859 | < 0.00001 |
| `dem65 =~ y5` | 1.0000 (fixed) | 1.0000 (fixed) | 0.000 |
| `dem65 =~ y6` | 1.1857 | 1.1857 | < 0.00001 |
| `ind60 ~~ ind60` | 0.4483 | 0.4483 | < 0.00001 |

**Conclusion:** NCSKit achieves complete numerical parity with native R for
point estimates and fit indices. The WASM-compiled R binary preserves
IEEE 754 double-precision arithmetic identically to the reference environment.

---

## Part 2 — Computational Performance Benchmark

**Purpose:** Characterise wall-clock performance of NCSKit versus a
representative cloud-hosted Shiny Server deployment for a graduate-research
PLS-SEM workload.

**Workload:** Five latent constructs, 25 indicators, 1,000 observations,
5,000 bootstrap subsamples.

**NCSKit environment:**
- Hardware: Apple M1 MacBook Air, 8 GB RAM
- Browser: Chrome 126
- WebR: 0.5.8, PostMessage channel (Type 3)
- R packages: `seminr` (self-hosted WASM binary)

**Shiny Server environment:**
- Instance: AWS t3.medium (2 vCPUs, 4 GB RAM)
- OS: Ubuntu 22.04 LTS
- R: 4.3.1, `seminr` 2.3.2

> **Hardware note:** Apple M1 and AWS t3.medium differ materially in
> single-core performance. These benchmarks characterise representative
> *real-world deployment scenarios* (researcher's laptop vs. low-cost cloud
> instance), not hardware-controlled conditions. An ARM-based cloud comparison
> (AWS c7g.large) is planned for future work.

### 2.1 Results (N = 10 independent runs, Mean ± SD)

| Metric | NCSKit (M1, Chrome 126) | Shiny Server (t3.medium) |
|:-------|------------------------:|-------------------------:|
| Network payload transfer | 0 ± 0 ms | 1,198 ± 43 ms |
| Bootstrap execution time | 14.8 ± 1.2 s | 49.1 ± 3.7 s |
| Result serialisation | 261 ± 18 ms | 1,823 ± 95 ms |
| **Total turnaround** | **15.1 ± 1.3 s** | **52.1 ± 4.1 s** |
| Peak RAM | ~860 MB | ~355 MB |
| Turnaround, 50 concurrent users | ~15 s (each, independent) | >10 min (queued) |

### 2.2 Interpretation

NCSKit completes the workload in approximately 3.5× less wall-clock time
than the cloud baseline for a single user. The advantage grows
super-linearly under concurrent load because each NCSKit user's computation
runs independently on their own hardware.

**Trade-offs:**
1. **Higher peak RAM** (~860 MB vs. ~355 MB): The WASM sandbox maintains a
   copy of the R heap in browser memory. Mitigated by the garbage-collection
   strategy (`gc()` after each extraction; per-worker `rm()` + `gc()` in the
   pool).
2. **Per-session initialisation** (~15 s first load): R packages are currently
   loaded into RAM on each session because the IndexedDB persistence layer is
   not yet active. Subsequent analyses within the same session incur zero
   initialisation overhead.

### 2.3 WASM-to-Native Overhead Interpretation

| Workload | WASM overhead vs. native R desktop |
|:---------|------------------------------------:|
| Political Democracy CFA (N=75, tiny model) | ~15× |
| PLS-SEM bootstrap (N=1,000, 5,000 subsamples) | ~1.5–2× (estimated) |

The 15× figure for the tiny CFA model reflects fixed WASM sandbox startup
cost dominating a 0.012-second native computation. As model size and
computation time grow, this fixed cost becomes negligible and the ratio
converges toward 1×. For real graduate-research workloads (the intended
use case), WASM overhead is modest and outweighed by the elimination of
network round-trips and infrastructure costs.

The ~10% figure cited in the paper refers specifically to the **channel
serialisation overhead** of PostMessage (Type 3) relative to
SharedArrayBuffer (Type 0) — measured during the data-transfer phase only,
not total wall-clock time.

---

## Part 3 — Reproducibility

All benchmark measurements can be reproduced using the end-to-end test suite:

```bash
# Install Playwright dependencies
npx playwright install

# Run the WebR performance test suite
npx playwright test tests/e2e/webr-auto-test.spec.ts --reporter=list
```

The test dataset is provided at `tests/e2e/test_data.csv`.  
The `lavaan` Political Democracy parity test uses the dataset bundled within
the `lavaan` WASM package at `public/webr_repo_v6/`.

---

*Last updated: September 2026. Benchmark conditions and raw run data
available in `tests/e2e/benchmark-results/` (generated by the test suite).*
