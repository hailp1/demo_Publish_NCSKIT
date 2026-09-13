/**
 * ASIG — Automated Statistical Insight Generation
 * Shared utilities and type definitions
 *
 * All output conforms to APA 7th Edition reporting standards:
 *  - No leading zero for values bounded between −1 and 1 (p, r, α, ω, β, η²)
 *  - Italic statistics in prose: t, F, r, p, M, SD, χ², df
 *  - p < .001 floor; exact p otherwise
 *  - Effect size reported alongside inferential statistics
 */

// ─── APA FORMATTING UTILITIES ────────────────────────────────────────────────

/**
 * Format a p-value per APA 7 style.
 * Values < .001 are reported as "p < .001"; all others as exact "p = .xxx".
 */
export function formatPValue(p: number): string {
    if (p < 0.001) return 'p < .001';
    const rounded = p.toFixed(3).replace('0.', '.');
    return `p = ${rounded}`;
}

/**
 * Format coefficients bounded in (−1, 1): drop the leading zero.
 * e.g., 0.847 → ".85",  −0.312 → "−.31"
 */
export function formatCoef(val: number, decimals = 2): string {
    if (Math.abs(val) < 1) {
        const str = val.toFixed(decimals);
        return str.replace('0.', '.').replace('-0.', '−.');
    }
    return val.toFixed(decimals);
}

/**
 * Format regular numbers with a leading zero (counts, F, χ², etc.).
 */
export function formatNum(val: number, decimals = 2): string {
    return val.toFixed(decimals);
}

/**
 * Render a percentage string from a proportion (0–1).
 * e.g., 0.3412 → "34.1%"
 */
export function formatPct(proportion: number, decimals = 1): string {
    return `${(proportion * 100).toFixed(decimals)}%`;
}

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

export type AnalysisType =
    | 'cronbach_alpha'
    | 'cronbach'
    | 'omega'
    | 'correlation'
    | 'ttest_independent'
    | 'ttest_paired'
    | 'anova'
    | 'two_way_anova'
    | 'efa'
    | 'cfa'
    | 'linear_regression'
    | 'regression'
    | 'logistic_regression'
    | 'logistic'
    | 'mann_whitney'
    | 'kruskal_wallis'
    | 'wilcoxon_signed'
    | 'wilcoxon'
    | 'chi_square'
    | 'chisquare'
    | 'chi-square'
    | 'mediation'
    | 'moderation'
    | 'cluster'
    | 'descriptive'
    | 'vif'
    | 'outlier'
    | 'htmt'
    | 'pls-sem';

/**
 * Standardised return type for every ASIG interpreter.
 *
 * - summary         : One-paragraph APA-style prose interpretation.
 * - details         : Bullet-level breakdown of individual statistics.
 * - warnings        : Assumption violations or caveats requiring researcher attention.
 * - citations       : Inline APA 7 references supporting the decision thresholds used.
 * - verdict         : Overall assessment badge — 'pass' | 'warning' | 'fail'.
 * - apaStatement    : 1–2 sentences ready to copy directly into a manuscript methods/results section.
 * - recommendations : Ordered list of concrete next steps for the researcher.
 */
export interface InterpretationResult {
    summary:          string;
    details:          string[];
    warnings:         string[];
    citations:        string[];
    verdict?:         'pass' | 'warning' | 'fail';
    apaStatement?:    string;
    recommendations?: string[];
}
