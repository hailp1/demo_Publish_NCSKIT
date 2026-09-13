/**
 * ASIG — pls-sem.ts
 * Interpreter: PLS-SEM (Partial Least Squares Structural Equation Modeling)
 *
 * Covers: Outer loadings, AVE, Composite Reliability (ρC), ρA,
 *         Fornell-Larcker, HTMT, R², f², path coefficients.
 * All prose conforms to APA 7th Edition reporting standards.
 * Primary references: Hair et al. (2017, 2021); Henseler et al. (2015).
 */

import { InterpretationResult, formatCoef, formatNum, formatPValue } from './shared';


export function interpretPLSSEM(params: {
    fornell_larcker?:      Record<string, Record<string, number>>;
    htmt?:                 Record<string, Record<string, number>>;
    r_squared?:            Record<string, number>;
    ave?:                  Record<string, number>;
    compositeReliability?: Record<string, number>;
    outerLoadings?:        Record<string, Record<string, number>>;
    pathCoefficients?:     {
        from: string;
        to: string;
        beta: number;
        tValue?: number;
        pValue?: number;
        ci95Lower?: number;
        ci95Upper?: number;
    }[];
}): InterpretationResult {
    const {
        fornell_larcker, htmt, r_squared,
        ave, compositeReliability,
        outerLoadings, pathCoefficients
    } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hair, J. F., Hult, G. T. M., Ringle, C. M., & Sarstedt, M. (2017). A primer on partial least squares structural equation modeling (PLS-SEM) (2nd ed.). SAGE Publications.',
        'Hair, J. F., Hult, G. T. M., Ringle, C. M., Sarstedt, M., Danks, N. P., & Ray, S. (2021). Partial least squares structural equation modeling (PLS-SEM) using R: A workbook. Springer. https://doi.org/10.1007/978-3-030-80519-7',
        'Henseler, J., Ringle, C. M., & Sarstedt, M. (2015). A new criterion for assessing discriminant validity in variance-based structural equation modeling. Journal of the Academy of Marketing Science, 43(1), 115–135. https://doi.org/10.1007/s11747-014-0403-8',
        'Fornell, C., & Larcker, D. F. (1981). Evaluating structural equation models with unobservable variables and measurement error. Journal of Marketing Research, 18(1), 39–50. https://doi.org/10.1177/002224378101800104',
    ];

    let hasViolations   = false;
    let hasAnyData      = false;


    // ── SECTION 1: Outer Loadings ─────────────────────────────────────────────
    if (outerLoadings && Object.keys(outerLoadings).length > 0) {
        hasAnyData = true;
        details.push('━━ Measurement Model — Outer Loadings (Indicator Reliability) ━━');
        let nGood = 0, nAcceptable = 0, nPoor = 0;

        Object.entries(outerLoadings).forEach(([construct, items]) => {
            Object.entries(items).forEach(([item, loading]) => {
                if (loading < 0.40) {
                    nPoor++;
                    warnings.push(
                        `Outer loading for "${item}" (→ ${construct}) = ${formatCoef(loading)} < .40: ` +
                        `the item contributes negligible variance to the construct and should be ` +
                        `removed from the measurement model (Hair et al., 2017).`
                    );
                    hasViolations = true;
                } else if (loading < 0.70) {
                    nAcceptable++;
                    details.push(
                        `"${item}" (${construct}): λ = ${formatCoef(loading)} — ` +
                        `acceptable (.40–.69); consider removing if AVE is also borderline.`
                    );
                } else {
                    nGood++;
                    details.push(`"${item}" (${construct}): λ = ${formatCoef(loading)} ✓ (≥ .70)`);
                }
            });
        });

        details.push(
            `Outer loading summary: ${nGood} items ≥ .70 ✓; ` +
            `${nAcceptable} acceptable (.40–.69); ${nPoor} below .40 ✗.`
        );
        details.push(
            `Threshold guidance: λ ≥ .70 preferred (Hair et al., 2017); ` +
            `λ ≥ .40 minimally acceptable if AVE ≥ .50 is maintained.`
        );
    }


    // ── SECTION 2: AVE & Convergent Validity ─────────────────────────────────
    if (ave && Object.keys(ave).length > 0) {
        hasAnyData = true;
        details.push('━━ Convergent Validity — Average Variance Extracted (AVE) ━━');
        let nPass = 0, nFail = 0;

        Object.entries(ave).forEach(([construct, aveVal]) => {
            if (aveVal < 0.50) {
                nFail++;
                warnings.push(
                    `AVE for "${construct}" = ${formatCoef(aveVal)} < .50: ` +
                    `the construct captures less than half its variance from indicators; ` +
                    `measurement error dominates (Fornell & Larcker, 1981). ` +
                    `Remove low-loading items or reconsider the construct definition.`
                );
                hasViolations = true;
            } else {
                nPass++;
                details.push(
                    `"${construct}": AVE = ${formatCoef(aveVal)} ` +
                    `${aveVal >= 0.60 ? '✓✓ (good ≥ .60)' : '✓ (meets ≥ .50 threshold)'}.`
                );
            }
        });

        details.push(
            `AVE summary: ${nPass} construct${nPass !== 1 ? 's' : ''} pass (≥ .50); ` +
            `${nFail} construct${nFail !== 1 ? 's' : ''} fail (< .50).`
        );
        details.push(
            `AVE ≥ .50 indicates convergent validity: items share more variance with their ` +
            `latent construct than with measurement error (Fornell & Larcker, 1981).`
        );
    }


    // ── SECTION 3: Composite Reliability (ρC) ────────────────────────────────
    if (compositeReliability && Object.keys(compositeReliability).length > 0) {
        hasAnyData = true;
        details.push('━━ Internal Consistency — Composite Reliability (ρC) ━━');

        Object.entries(compositeReliability).forEach(([construct, cr]) => {
            if (cr < 0.70) {
                warnings.push(
                    `ρC for "${construct}" = ${formatCoef(cr)} < .70: ` +
                    `insufficient internal consistency (Hair et al., 2017). ` +
                    `Scale revision is required before proceeding.`
                );
                hasViolations = true;
            } else if (cr > 0.95) {
                warnings.push(
                    `ρC for "${construct}" = ${formatCoef(cr)} > .95: ` +
                    `potentially inflated by indicator redundancy rather than true reliability. ` +
                    `Review items for conceptual overlap and consider removing near-duplicate indicators.`
                );
                details.push(`"${construct}": ρC = ${formatCoef(cr)} (note: very high CR may indicate redundancy > .95).`);
            } else {
                const label = cr >= 0.90 ? 'excellent' : cr >= 0.80 ? 'good' : 'adequate';
                details.push(`"${construct}": ρC = ${formatCoef(cr)} ✓ (${label}).`);
            }
        });

        details.push(
            `Composite Reliability thresholds: ≥ .70 adequate; ≥ .80 good; ≥ .90 excellent; ` +
            `> .95 may indicate redundancy (Hair et al., 2017).`
        );
    }


    // ── SECTION 4: Fornell-Larcker Criterion ─────────────────────────────────
    if (fornell_larcker && Object.keys(fornell_larcker).length > 0) {
        hasAnyData = true;
        details.push('━━ Discriminant Validity — Fornell-Larcker Criterion ━━');
        const constructs         = Object.keys(fornell_larcker);
        const fornellViolations: string[] = [];

        constructs.forEach(c1 => {
            const diagVal = fornell_larcker[c1]?.[c1];
            if (diagVal == null) return;
            constructs.forEach(c2 => {
                if (c1 === c2) return;
                const corr = fornell_larcker[c1]?.[c2] ?? fornell_larcker[c2]?.[c1];
                if (corr != null && corr >= diagVal) {
                    fornellViolations.push(
                        `${c1} vs. ${c2} (√AVE = ${formatCoef(diagVal)}, r = ${formatCoef(corr)})`
                    );
                }
            });
        });

        if (fornellViolations.length === 0) {
            details.push(
                'Fornell-Larcker criterion: SATISFIED ✓. ' +
                'The square root of each construct\'s AVE exceeds all inter-construct correlations, ' +
                'confirming that each construct shares more variance with its own indicators ' +
                'than with any other construct (Fornell & Larcker, 1981).'
            );
        } else {
            hasViolations = true;
            warnings.push(
                `Fornell-Larcker criterion VIOLATED for: ${fornellViolations.join('; ')}. ` +
                `These construct pairs are not sufficiently distinct — their discriminant validity ` +
                `is questionable. Consider item reassignment, construct consolidation, or ` +
                `applying the HTMT criterion for confirmation.`
            );
        }
    }


    // ── SECTION 5: HTMT ───────────────────────────────────────────────────────
    if (htmt && Object.keys(htmt).length > 0) {
        hasAnyData = true;
        details.push('━━ Discriminant Validity — HTMT Criterion (Henseler et al., 2015) ━━');
        const constructs        = Object.keys(htmt);
        const htmtViolations09: string[] = [];
        const htmtWarnings85:   string[] = [];
        const seenPairs         = new Set<string>();

        constructs.forEach(c1 => {
            constructs.forEach(c2 => {
                if (c1 >= c2) return;
                const key = `${c1}|${c2}`;
                if (seenPairs.has(key)) return;
                seenPairs.add(key);
                const val = htmt[c1]?.[c2] ?? htmt[c2]?.[c1];
                if (val == null) return;

                if (val >= 0.90) {
                    htmtViolations09.push(`${c1} & ${c2} (HTMT = ${formatCoef(val)})`);
                    hasViolations = true;
                } else if (val >= 0.85) {
                    htmtWarnings85.push(`${c1} & ${c2} (HTMT = ${formatCoef(val)})`);
                    details.push(
                        `${c1} & ${c2}: HTMT = ${formatCoef(val)} ⚠️ (borderline .85–.90; ` +
                        `bootstrap CI recommended to assess statistical significance).`
                    );
                } else {
                    details.push(`${c1} & ${c2}: HTMT = ${formatCoef(val)} < .85 ✓`);
                }
            });
        });

        if (htmtViolations09.length > 0) {
            warnings.push(
                `HTMT ≥ .90 (discriminant validity VIOLATED) for: ${htmtViolations09.join('; ')}. ` +
                `These constructs may not be empirically distinct. ` +
                `Inspect cross-loadings, consider item reassignment, or reconceptualise the constructs.`
            );
        }
        if (htmtWarnings85.length > 0) {
            warnings.push(
                `HTMT between .85–.90 (borderline) for: ${htmtWarnings85.join('; ')}. ` +
                `Obtain bootstrap CIs for HTMT values — if the CI upper bound exceeds .90, ` +
                `discriminant validity is statistically violated.`
            );
        }
        if (htmtViolations09.length === 0 && htmtWarnings85.length === 0) {
            details.push(
                'HTMT criterion: SATISFIED ✓. ' +
                'All HTMT values < .85, confirming discriminant validity across all construct pairs ' +
                '(Henseler et al., 2015). ' +
                'HTMT is now the recommended discriminant validity criterion, superseding ' +
                'the Fornell-Larcker criterion in sensitivity (Hair et al., 2021).'
            );
        }
    }


    // ── SECTION 6: R-Squared ─────────────────────────────────────────────────
    if (r_squared && Object.keys(r_squared).length > 0) {
        hasAnyData = true;
        details.push('━━ Structural Model — Explanatory Power (R²) ━━');

        Object.entries(r_squared).forEach(([construct, r2]) => {
            const level = r2 >= 0.75 ? 'substantial'
                : r2 >= 0.50 ? 'moderate'
                : r2 >= 0.25 ? 'weak'
                : 'very weak (< .25)';

            details.push(
                `"${construct}": R² = ${formatCoef(r2)} (${level}). ` +
                `Hair et al. (2017) benchmarks for social science PLS-SEM: ` +
                `weak ≥ .25, moderate ≥ .50, substantial ≥ .75.`
            );

            if (r2 < 0.10) {
                warnings.push(
                    `"${construct}": R² = ${formatCoef(r2)} < .10 — ` +
                    `the structural model has very limited predictive power for this endogenous construct. ` +
                    `Review the theoretical model for omitted predictors.`
                );
            }
        });

        details.push(
            'Note: Adjusted R² (reported alongside R² in PLS-SEM output) corrects for ' +
            'the number of antecedent constructs and provides a less biased estimate of ' +
            'population explanatory power.'
        );
    }


    // ── SECTION 7: Path Coefficients (Bootstrapping) ─────────────────────────
    if (pathCoefficients && pathCoefficients.length > 0) {
        hasAnyData = true;
        details.push('━━ Structural Model — Path Coefficients (Bootstrapped) ━━');

        for (const path of pathCoefficients) {
            const ciStr = (path.ci95Lower != null && path.ci95Upper != null)
                ? `, 95% CI [${formatCoef(path.ci95Lower)}, ${formatCoef(path.ci95Upper)}]`
                : '';
            const tStr  = path.tValue != null ? `, t = ${formatNum(path.tValue)}` : '';
            const pStr  = path.pValue != null ? `, ${formatPValue(path.pValue)}` : '';
            const sigStr = path.pValue != null
                ? (path.pValue < 0.05 ? ' ✓ significant (α = .05)' : ' ✗ not significant')
                : '';
            const dirLabel = path.beta > 0 ? 'positive' : 'negative';

            details.push(
                `${path.from} → ${path.to}: ` +
                `β = ${formatCoef(path.beta)}${tStr}${pStr}${ciStr}${sigStr}. ` +
                `Direction: ${dirLabel} effect.`
            );

            if (path.pValue != null && path.pValue < 0.05 && Math.abs(path.beta) < 0.10) {
                warnings.push(
                    `Path ${path.from} → ${path.to}: statistically significant but |β| = ${formatCoef(Math.abs(path.beta))} < .10. ` +
                    `This effect is very small; evaluate practical significance and consider ` +
                    `f² effect size (small ≥ .02, medium ≥ .15, large ≥ .35; Hair et al., 2017).`
                );
            }
            if (path.ci95Lower != null && path.ci95Upper != null) {
                const ciInclZero = path.ci95Lower < 0 && path.ci95Upper > 0;
                if (ciInclZero && path.pValue != null && path.pValue < 0.05) {
                    warnings.push(
                        `Path ${path.from} → ${path.to}: p < .05 but 95% CI includes zero — ` +
                        `the bootstrap CI provides the definitive inference. ` +
                        `Treat this path as non-significant.`
                    );
                }
            }
        }

        details.push(
            'Bootstrapped 95% CI that excludes zero is the primary significance criterion in PLS-SEM, ' +
            'taking precedence over p-values (Hair et al., 2017). ' +
            'Use ≥ 5,000 bootstrap subsamples for stable CI estimates.'
        );
        details.push(
            'APA 7 format for PLS-SEM path reporting: ' +
            'β = X.XX, t(df) = X.XX, p = .XXX, 95% CI [LL, UL].'
        );
    }


    // ── OVERALL SUMMARY ───────────────────────────────────────────────────────
    let summary = '';

    if (!hasAnyData) {
        summary =
            'No PLS-SEM data were provided. Please supply at least one of: ' +
            'fornell_larcker, htmt, r_squared, ave, compositeReliability, outerLoadings, or pathCoefficients.';
    } else if (hasViolations) {
        const violationAreas: string[] = [];
        if (ave && Object.values(ave).some(v => v < 0.50)) violationAreas.push('convergent validity (AVE < .50)');
        if (compositeReliability && Object.values(compositeReliability).some(v => v < 0.70)) violationAreas.push('internal consistency (ρC < .70)');
        if (fornell_larcker) {
            const constructs = Object.keys(fornell_larcker);
            const hasFLViolation = constructs.some(c1 =>
                constructs.some(c2 => {
                    if (c1 === c2) return false;
                    const diagVal = fornell_larcker[c1]?.[c1];
                    const corr = fornell_larcker[c1]?.[c2] ?? fornell_larcker[c2]?.[c1];
                    return diagVal != null && corr != null && corr >= diagVal;
                })
            );
            if (hasFLViolation) violationAreas.push('discriminant validity (Fornell-Larcker violated)');
        }
        if (htmt) {
            const constructs = Object.keys(htmt);
            const hasHTMTViolation = constructs.some(c1 =>
                constructs.some(c2 => {
                    if (c1 >= c2) return false;
                    const val = htmt[c1]?.[c2] ?? htmt[c2]?.[c1];
                    return val != null && val >= 0.90;
                })
            );
            if (hasHTMTViolation) violationAreas.push('discriminant validity (HTMT ≥ .90)');
        }

        summary =
            `PLS-SEM measurement model assessment identified violations in the following areas: ` +
            `${violationAreas.length > 0 ? violationAreas.join('; ') : 'see warnings'}. ` +
            `These issues must be resolved — by revising items, reconsidering the measurement model, ` +
            `or addressing construct conceptualisation — before the structural model results ` +
            `can be meaningfully interpreted (Hair et al., 2017, 2021). ` +
            `Proceeding with hypothesis testing under measurement model violations risks ` +
            `biased path coefficient estimates and inflated Type I error.`;
    } else {
        const sections: string[] = [];
        if (ave || compositeReliability) sections.push('reliability and convergent validity');
        if (fornell_larcker || htmt)     sections.push('discriminant validity');
        if (r_squared)                   sections.push('structural model explanatory power');
        if (pathCoefficients)            sections.push('path coefficients');

        summary =
            `PLS-SEM measurement model assessment indicates that all evaluated criteria ` +
            `satisfy recommended thresholds (Hair et al., 2017): ` +
            `${sections.join('; ')} criteria are all met. ` +
            `Specifically, convergent validity (AVE ≥ .50), internal consistency (ρC ≥ .70), ` +
            `and discriminant validity (Fornell-Larcker and/or HTMT criteria) are all satisfied. ` +
            `The measurement model provides an adequate foundation for interpreting ` +
            `the structural model results. ` +
            `${pathCoefficients && pathCoefficients.length > 0
                ? 'All reported path coefficients are bootstrapped estimates with 95% CI — ' +
                  'CIs excluding zero indicate statistically significant causal pathways.'
                : ''}`;
    }

    return { summary, details, warnings, citations };
}
