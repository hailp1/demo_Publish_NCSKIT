/**
 * ASIG v2 -- Automated Statistical Insight Generation
 * Shared utilities, types, and domain-calibrated benchmark data.
 *
 * Domain focus: Economics - Management - Marketing
 * (Social-science conventions, Hair et al., Cohen, APA 7th Edition)
 */

// ── APA FORMATTING UTILITIES ──────────────────────────────────────────────────

function toFinite(val: unknown, fallback = 0): number {
    const n = Number(val);
    return isFinite(n) ? n : fallback;
}

export function safeNum(val: unknown, fallback = 0): number {
    return toFinite(val, fallback);
}

export function formatPValue(p: unknown): string {
    const n = toFinite(p, 1);
    if (n < 0.001) return 'p < .001';
    const rounded = n.toFixed(3).replace('0.', '.');
    return `p = ${rounded}`;
}

export function formatCoef(val: unknown, decimals = 2): string {
    const n = toFinite(val);
    if (Math.abs(n) < 1) {
        const str = n.toFixed(decimals);
        return str.replace('0.', '.').replace('-0.', '-.');
    }
    return n.toFixed(decimals);
}

export function formatNum(val: unknown, decimals = 2): string {
    return toFinite(val).toFixed(decimals);
}

export function formatPct(proportion: unknown, decimals = 1): string {
    return `${(toFinite(proportion) * 100).toFixed(decimals)}%`;
}


// ── DOMAIN BENCHMARK LIBRARY ──────────────────────────────────────────────────
//
// Economics, Management, and Marketing calibrated benchmarks.
// Sources: Peterson & Brown (2005), Cohen (1988/1992), Hair et al. (2019/2021),
//          Falk & Miller (1992), Henseler et al. (2015).

export const DOMAIN_BENCHMARKS = {
    correlation: {
        // Peterson & Brown (2005) meta-analysis: median |r| in management ~ .21
        // Marketing Science: median |r| ~ .27
        typical: {
            management: { low: 0.10, median: 0.21, high: 0.35 },
            marketing:  { low: 0.12, median: 0.27, high: 0.40 },
            economics:  { low: 0.08, median: 0.15, high: 0.28 },
        },
        publishability: {
            apa_small:   0.10,
            apa_medium:  0.30,
            apa_large:   0.50,
        },
    },
    regression: {
        // Falk & Miller (1992): R^2 >= .10 minimum for social science
        // Cohen (1988): f^2 = .02 small, .15 medium, .35 large
        r2: {
            negligible: 0.02,
            small:      0.10,
            moderate:   0.25,
            large:      0.50,
        },
        typical_management: 0.30,
        typical_marketing:  0.35,
    },
    plssem: {
        // Hair et al. (2021) benchmarks for variance-based SEM in business
        r2: { weak: 0.25, moderate: 0.50, substantial: 0.75 },
        ave: 0.50,
        cr:  0.70,
        htmt_strict:  0.85,
        htmt_liberal: 0.90,
        loading_preferred: 0.70,
        loading_minimum:   0.40,
        f2: { small: 0.02, medium: 0.15, large: 0.35 },
    },
    cronbach: {
        // Nunnally & Bernstein (1994) + Hair et al. (2019)
        inadequate:        0.60,
        acceptable:        0.70,
        good:              0.80,
        excellent:         0.90,
        typical_published: 0.82,
    },
    effectSize: {
        cohens_d: { negligible: 0.20, small: 0.50, medium: 0.80 },
        eta2:     { small: 0.01, medium: 0.06, large: 0.14 },
        cramersV: { small: 0.10, medium: 0.30, large: 0.50 },
        r_rank:   { small: 0.10, medium: 0.30, large: 0.50 },
    },
    sampleSize: {
        ttest:      30,
        anova:      20,
        regression: 50,
        efa:        100,
        cfa:        150,
        plssem:     100,
    },
} as const;


// ── INSIGHT HELPERS ────────────────────────────────────────────────────────────

export function correlationPracticalNote(r: number): string {
    const abs = Math.abs(r);
    const dir = r > 0 ? 'positive' : 'negative';
    if (abs < 0.10)
        return `This ${dir} association (|r| = ${formatCoef(abs)}) is below the typical threshold for practical significance in management research.`;
    if (abs < 0.20)
        return `This ${dir} association (|r| = ${formatCoef(abs)}) is in the weak-but-practical range typical in management surveys with large N.`;
    if (abs < 0.30)
        return `This ${dir} association (|r| = ${formatCoef(abs)}) is consistent with the typical median correlation (r ~ .21) in management meta-analyses (Peterson & Brown, 2005).`;
    if (abs < 0.50)
        return `This ${dir} moderate association (|r| = ${formatCoef(abs)}) is above the median in business research, indicating a substantively meaningful relationship.`;
    return `This ${dir} strong association (|r| = ${formatCoef(abs)}) is notably larger than typical in business research -- a highly robust relationship.`;
}

export function sampleAdequacyNote(n: number, analysis: keyof typeof DOMAIN_BENCHMARKS['sampleSize']): string {
    const min = DOMAIN_BENCHMARKS.sampleSize[analysis];
    if (n < min)
        return `Sample size (N = ${n}) is below the recommended minimum of ${min} for ${analysis}. Results should be interpreted cautiously.`;
    if (n < min * 2)
        return `Sample size (N = ${n}) meets the minimum for ${analysis}. Power to detect medium effects is adequate.`;
    return `Sample size (N = ${n}) is adequate for ${analysis}, providing good statistical power.`;
}

export function publishabilitySignal(
    pValue: number,
    effectMagnitude: number,
    effectType: 'r' | 'd' | 'eta2' | 'f2'
): 'strong' | 'moderate' | 'weak' | 'insufficient' {
    if (pValue >= 0.05) return 'insufficient';
    const thresholds = {
        r:    { med: 0.30, lg: 0.50 },
        d:    { med: 0.50, lg: 0.80 },
        eta2: { med: 0.06, lg: 0.14 },
        f2:   { med: 0.15, lg: 0.35 },
    }[effectType];
    const abs = Math.abs(effectMagnitude);
    if (abs >= thresholds.lg) return 'strong';
    if (abs >= thresholds.med) return 'moderate';
    return 'weak';
}

export function writingTip(analysisType: string): string {
    const tips: Record<string, string> = {
        correlation:
            'In your thesis methodology section, justify Pearson/Spearman by referencing the measurement scale level and normality of your data. Report both r and p alongside the 95% CI.',
        ttest_independent:
            'When reporting in a thesis, use a table format: Group, N, M, SD, t, df, p, Cohen\'s d. The effect size is as important as the p-value for committee evaluation.',
        anova:
            'Report eta-squared alongside F. Vietnamese thesis committees increasingly expect post-hoc comparisons with adjusted p-values (Tukey HSD or Games-Howell).',
        linear_regression:
            'Report the full regression table: B, SE, beta, t, p, 95% CI[B], and VIF. Discuss standardised beta to compare relative predictor importance.',
        mediation:
            'State clearly whether you used bootstrap CI (preferred) or Sobel test. PROCESS macro with 5,000 resamples and bias-corrected CI is the gold standard.',
        moderation:
            'Always report the interaction term delta-R-squared as the primary effect size. Create an interaction plot at +/-1SD of the moderator.',
        'pls-sem':
            'For Vietnamese doctoral theses using PLS-SEM, report in two stages: (1) Measurement model: outer loadings, AVE, CR, HTMT; (2) Structural model: beta, t (bootstrapped), p, 95% CI, R-squared, f-squared. Cite Hair et al. (2021).',
        cronbach:
            'Report alpha alongside n items and the scale name. If any item has CITC < .30, explain your decision to retain or remove it. McDonald\'s omega is increasingly preferred in top journals.',
        efa:
            'Justify factor retention using Parallel Analysis, not Kaiser\'s eigenvalue > 1 criterion (which over-extracts). Report KMO, Bartlett, total variance explained, and the rotated factor matrix.',
        cfa:
            'Report four fit indices: CFI, TLI, RMSEA (with 90% CI), and SRMR. Vietnamese management journals follow Hu & Bentler (1999) thresholds. Mention if you used MLR estimator for robustness.',
    };
    return tips[analysisType] ?? 'Report test statistics, effect sizes, and confidence intervals alongside p-values for APA 7-compliant manuscript writing.';
}


// ── TYPE DEFINITIONS ───────────────────────────────────────────────────────────

export type AnalysisType =
    | 'cronbach_alpha' | 'cronbach' | 'omega'
    | 'correlation'
    | 'ttest_independent' | 'ttest_paired'
    | 'anova' | 'two_way_anova'
    | 'efa' | 'cfa'
    | 'linear_regression' | 'regression'
    | 'logistic_regression' | 'logistic'
    | 'mann_whitney' | 'kruskal_wallis' | 'wilcoxon_signed' | 'wilcoxon'
    | 'chi_square' | 'chisquare' | 'chi-square'
    | 'mediation' | 'moderation' | 'cluster'
    | 'descriptive'
    | 'vif' | 'outlier' | 'htmt'
    | 'pls-sem';

/**
 * ASIG v2 InsightLayer -- domain-calibrated insight for Economics/Management/Marketing.
 *
 * Layer 1: verdict             -- pass / warning / fail badge
 * Layer 2: summary             -- APA 7 prose paragraph
 * Layer 3: apaStatement        -- single manuscript-ready sentence
 * Layer 4: details             -- statistical detail bullets
 * Layer 5: warnings            -- assumption / methodological alerts
 * Layer 6: recommendations     -- actionable next steps
 * Layer 7: insight (NEW v2)    -- domain benchmarks + practical significance
 */
export interface InsightLayer {
    /** Where this result sits relative to published research in management/marketing */
    benchmarkContext: string;
    /** Practical significance beyond statistical significance */
    practicalSignificance: string;
    /** Signal strength for journal submission or thesis committee */
    publishabilityNote: string;
    /** Writing tip for Vietnamese economics/management thesis */
    writingTip: string;
    /** What this means for the broader research model or hypotheses */
    researchImplication: string;
}

export interface InterpretationResult {
    summary:           string;
    details:           string[];
    warnings:          string[];
    citations:         string[];
    verdict?:          'pass' | 'warning' | 'fail';
    apaStatement?:     string;
    recommendations?:  string[];
    /** NEW in v2: domain-calibrated insight */
    insight?:          InsightLayer;
}
