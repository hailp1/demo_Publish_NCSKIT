/**
 * ASIG — factor.ts
 * Interpreters: Cronbach's Alpha / McDonald's Omega, EFA, CFA
 *
 * All prose conforms to APA 7th Edition reporting standards.
 * Outputs publication-ready narrative for psychometric and factor-analytic results.
 */

import { formatPValue, formatCoef, formatNum, formatPct, safeNum, InterpretationResult } from './shared';


// ─── RELIABILITY ANALYSIS (Cronbach α / McDonald's ω) ────────────────────────

export function interpretCronbachAlpha(params: {
    scaleName:       string;
    nItems:          number;
    alpha:           number;
    omega?:          number;
    badItems?:       string[];
    isOmegaPrimary?: boolean;
}): InterpretationResult {
    const { scaleName, nItems, badItems, isOmegaPrimary } = params;
    const alpha  = safeNum(params.alpha);
    const omega  = params.omega != null ? safeNum(params.omega) : params.omega;

    const primaryCoef = isOmegaPrimary && omega != null ? omega : alpha;
    const primaryStr  = formatCoef(primaryCoef);
    const primaryName = isOmegaPrimary && omega != null
        ? "McDonald's Omega (ω)"
        : "Cronbach's Alpha (α)";
    const alphaStr    = formatCoef(alpha);
    const omegaStr    = omega != null ? formatCoef(omega) : '';

    const details:   string[] = [];
    const warnings:  string[] = [];

    // Build citations depending on mode
    const citations: string[] = isOmegaPrimary
        ? [
            'Hayes, A. F., & Coutts, J. J. (2020). Use omega rather than Cronbach\'s alpha for estimating reliability. Communication Methods and Measures, 14(1), 1–24. https://doi.org/10.1080/19312458.2020.1718629',
            'Nunnally, J. C., & Bernstein, I. H. (1994). Psychometric theory (3rd ed.). McGraw-Hill.',
            'Sijtsma, K. (2009). On the use, the misuse, and the very limited usefulness of Cronbach\'s alpha. Psychometrika, 74(1), 107–120. https://doi.org/10.1007/s11336-008-9101-0',
          ]
        : [
            'Nunnally, J. C., & Bernstein, I. H. (1994). Psychometric theory (3rd ed.). McGraw-Hill.',
            'Sijtsma, K. (2009). On the use, the misuse, and the very limited usefulness of Cronbach\'s alpha. Psychometrika, 74(1), 107–120. https://doi.org/10.1007/s11336-008-9101-0',
            'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2019). Multivariate data analysis (8th ed.). Cengage Learning.',
          ];

    // Build summary with full methodological context
    let summary = '';
    if (primaryCoef >= 0.90) {
        summary =
            `Reliability analysis of the "${scaleName}" scale (${nItems} items) yielded ` +
            `${primaryName} = ${primaryStr}, indicating excellent internal consistency ` +
            `well above the conventional threshold of .70 (Nunnally & Bernstein, 1994). ` +
            `The scale demonstrates strong psychometric cohesion and is suitable for ` +
            `confirmatory research and hypothesis testing.`;
    } else if (primaryCoef >= 0.80) {
        summary =
            `Reliability analysis of the "${scaleName}" scale (${nItems} items) yielded ` +
            `${primaryName} = ${primaryStr}, indicating good internal consistency ` +
            `exceeding the conventional threshold of .70 (Nunnally & Bernstein, 1994). ` +
            `The scale is suitable for confirmatory research contexts.`;
    } else if (primaryCoef >= 0.70) {
        summary =
            `Reliability analysis of the "${scaleName}" scale (${nItems} items) yielded ` +
            `${primaryName} = ${primaryStr}, which meets the widely accepted minimum ` +
            `threshold of .70 (Nunnally & Bernstein, 1994). The scale demonstrates ` +
            `adequate internal consistency for research use, though values ≥ .80 ` +
            `are preferable for published research.`;
    } else if (primaryCoef >= 0.60) {
        summary =
            `Reliability analysis of the "${scaleName}" scale (${nItems} items) yielded ` +
            `${primaryName} = ${primaryStr}. Although this value falls below the ` +
            `conventional threshold of .70 (Nunnally & Bernstein, 1994), it remains ` +
            `within the acceptable range (.60–.70) for exploratory research ` +
            `(Hair et al., 2019). Scale refinement is recommended before confirmatory use. ` +
            `Examine item-total statistics to identify underperforming items.`;
        citations.push('Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2019). Multivariate data analysis (8th ed.). Cengage Learning.');
        warnings.push(
            `${primaryName} = ${primaryStr} (.60–.70 range) is acceptable for exploratory research only. ` +
            `Confirmatory use or hypothesis testing requires α / ω ≥ .70. ` +
            `Review item-total correlations and consider removing items with CITC < .30.`
        );
    } else {
        summary =
            `Reliability analysis of the "${scaleName}" scale (${nItems} items) yielded ` +
            `${primaryName} = ${primaryStr}, which falls below the minimum acceptable ` +
            `threshold of .60 (Nunnally & Bernstein, 1994; Hair et al., 2019). ` +
            `The scale does not demonstrate sufficient internal consistency for research use. ` +
            `Substantial item revision or scale reconceptualisation is strongly recommended ` +
            `before proceeding with any inferential analyses.`;
        warnings.push(
            `${primaryName} = ${primaryStr} is critically low (< .60). ` +
            `This scale should not be used for statistical inference until revised. ` +
            `Consider qualitative review of item content and re-piloting before further data collection.`
        );
    }

    // Supplementary coefficient
    if (isOmegaPrimary && omega != null) {
        summary +=
            ` McDonald's Omega was selected as the primary reliability index because it does not ` +
            `assume tau-equivalence (equal factor loadings), making it a more appropriate ` +
            `and generally less biased estimator than Cronbach's Alpha for most psychometric scales.`;
        details.push(`Reference Cronbach's Alpha (α) = ${alphaStr} (reported for comparison).`);
        details.push(
            `The difference between ω (${omegaStr}) and α (${alphaStr}) indicates ` +
            `${Math.abs(primaryCoef - alpha) < 0.02
                ? 'minimal departure from tau-equivalence — items have approximately equal factor loadings.'
                : 'meaningful departure from tau-equivalence — items differ in their factor loadings, supporting the use of ω.'}`
        );
    } else if (!isOmegaPrimary && omega != null && omega > 0) {
        details.push(
            `Supplementary McDonald's Omega (ω) = ${omegaStr}. ` +
            `The difference ω − α = ${formatCoef(omega - alpha)} indicates ` +
            `${Math.abs(omega - alpha) < 0.02
                ? 'approximate tau-equivalence.'
                : 'non-tau-equivalence; ω provides a less biased reliability estimate for this scale.'}`
        );
    }

    // Problematic items
    if (badItems && badItems.length > 0) {
        warnings.push(
            `Item(s) with corrected item-total correlation (CITC) below .30: ` +
            `${badItems.join(', ')}. ` +
            `These items contribute negligible shared variance to the scale and should be ` +
            `reviewed for content relevance and considered for removal or revision. ` +
            `Removing poor items typically increases α / ω.`
        );
    }

    details.push(
        `Internal consistency benchmarks (Nunnally & Bernstein, 1994): ` +
        `< .60 inadequate; .60–.69 exploratory only; .70–.79 adequate; .80–.89 good; ≥ .90 excellent.`
    );
    details.push(
        `APA 7 reporting: "${scaleName}" (${nItems} items), ${primaryName} = ${primaryStr}` +
        `${omega != null && !isOmegaPrimary ? `, ω = ${omegaStr}` : ''}.`
    );

    return {
        summary, details, warnings, citations,
        verdict: primaryCoef >= 0.70 ? 'pass' : primaryCoef >= 0.60 ? 'warning' : 'fail',
        apaStatement: `Reliability analysis of the "${scaleName}" scale (${nItems} items) yielded ${primaryName} = ${primaryStr}${omega != null && !isOmegaPrimary ? `, ω = ${omegaStr}` : ''}, indicating ${primaryCoef >= 0.90 ? 'excellent' : primaryCoef >= 0.80 ? 'good' : primaryCoef >= 0.70 ? 'adequate' : primaryCoef >= 0.60 ? 'borderline' : 'insufficient'} internal consistency.`,
        recommendations: primaryCoef >= 0.70
            ? [
                'Report both α and ω when both are computed — ω is the preferred index for scales with unequal loadings.',
                'Include item-total statistics (CITC) in supplementary materials for replication.',
                badItems && badItems.length > 0
                    ? `Review items with CITC < .30 (${badItems.join(', ')}) — removing these may improve reliability.`
                    : 'Examine the corrected item-total correlation (CITC) matrix; items with CITC < .30 should be reviewed.',
              ]
            : [
                'Conduct item analysis: identify and remove items with CITC < .30 to improve reliability.',
                'Review item wording for ambiguity, double-barrelling, or poor relevance to the construct.',
                'Consider collecting additional data or piloting revised items before confirmatory analysis.',
              ],
    };
}


// ─── EXPLORATORY FACTOR ANALYSIS ─────────────────────────────────────────────

export function interpretEFA(params: {
    kmo:             number;
    bartlettP:       number;
    nFactors:        number;
    factorMethod:    string;
    rotationMethod?: string;
    totalVariance?:  number;
    communalities?:  { item: string; value: number }[];
}): InterpretationResult {
    const { factorMethod, rotationMethod, communalities } = params;
    const kmo           = safeNum(params.kmo);
    const bartlettP     = safeNum(params.bartlettP, 1);
    const nFactors      = safeNum(params.nFactors, 1);
    const totalVariance = params.totalVariance != null ? safeNum(params.totalVariance) : params.totalVariance;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Kaiser, H. F. (1974). An index of factorial simplicity. Psychometrika, 39(1), 31–36.',
        'Zwick, W. R., & Velicer, W. F. (1986). Comparison of five rules for determining the number of components to retain. Psychological Bulletin, 99(3), 432–442.',
        'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2019). Multivariate data analysis (8th ed.). Cengage Learning.',
        'Fabrigar, L. R., Wegener, D. T., MacCallum, R. C., & Strahan, E. J. (1999). Evaluating the use of exploratory factor analysis in psychological research. Psychological Methods, 4(3), 272–299.',
    ];

    // KMO classification per Kaiser (1974)
    let kmoLabel = '';
    if      (kmo >= 0.90) kmoLabel = 'marvellous';
    else if (kmo >= 0.80) kmoLabel = 'meritorious';
    else if (kmo >= 0.70) kmoLabel = 'middling';
    else if (kmo >= 0.60) kmoLabel = 'mediocre';
    else if (kmo >= 0.50) kmoLabel = 'miserable';
    else                  kmoLabel = 'unacceptable';

    if (kmo < 0.60) {
        warnings.push(
            `KMO = ${formatCoef(kmo)} (${kmoLabel}) falls below the recommended minimum of .60 ` +
            `(Kaiser, 1974). The inter-item correlations are insufficient for reliable factor extraction. ` +
            `Data collection procedures and item quality should be reviewed before re-analysing.`
        );
    } else if (kmo < 0.70) {
        warnings.push(
            `KMO = ${formatCoef(kmo)} (${kmoLabel}) is between .60 and .70. ` +
            `Factor solutions at this adequacy level should be interpreted with caution ` +
            `and validated in an independent sample.`
        );
    }

    const bartlettSig = bartlettP < 0.05
        ? `statistically significant (${formatPValue(bartlettP)})`
        : `not statistically significant (${formatPValue(bartlettP)})`;

    const extractionLabel = factorMethod === 'parallel'
        ? 'Parallel Analysis (the recommended retention criterion; Zwick & Velicer, 1986)'
        : factorMethod === 'map'
            ? 'Minimum Average Partial (MAP; Velicer, 1976)'
            : 'Kaiser criterion (eigenvalue > 1; Kaiser, 1974; note: this criterion tends to over-extract)';

    const rotationContext = rotationMethod
        ? (rotationMethod.toLowerCase().includes('varimax') || rotationMethod.toLowerCase().includes('equamax')
            ? `${rotationMethod} orthogonal rotation (assumes uncorrelated factors)`
            : `${rotationMethod} oblique rotation (allows factor intercorrelations; appropriate when factors are theoretically related)`)
        : 'no rotation applied';

    let summary =
        `Prior to conducting Exploratory Factor Analysis (EFA), the suitability ` +
        `of the correlation matrix was evaluated. The Kaiser-Meyer-Olkin (KMO) ` +
        `measure of sampling adequacy yielded KMO = ${formatCoef(kmo)} (${kmoLabel}; Kaiser, 1974). ` +
        `Bartlett's Test of Sphericity was ${bartlettSig}, ` +
        `${bartlettP < 0.05 ? 'confirming that the correlation matrix is sufficiently non-identity for factor analysis.' : 'failing to confirm factorability — factor analysis results should not be trusted.'} ` +
        `EFA was conducted using ${extractionLabel}, ` +
        `retaining ${nFactors} factor${nFactors !== 1 ? 's' : ''} ` +
        `with ${rotationContext}.`;

    details.push(`Factor retention criterion: ${extractionLabel}.`);
    if (rotationMethod) details.push(`Rotation applied: ${rotationContext}.`);
    details.push(`Factors retained: ${nFactors}.`);

    if (totalVariance != null) {
        const varPct = formatPct(totalVariance);
        details.push(
            `Total variance explained by the ${nFactors}-factor solution: ${varPct}. ` +
            `${totalVariance >= 0.60
                ? 'This exceeds the commonly recommended threshold of 60% for social science research (Hair et al., 2019).'
                : totalVariance >= 0.50
                    ? 'This meets the minimum 50% threshold (Hair et al., 2019), though higher variance extraction is preferable.'
                    : 'This falls below the recommended threshold of 50% — consider revising the item pool or retaining additional factors.'}`
        );
        if (totalVariance < 0.50) {
            warnings.push(
                `Total variance explained (${varPct}) is below 50% (Hair et al., 2019). ` +
                `The factor solution may not adequately capture the construct domain. ` +
                `Consider expanding the item pool or reviewing construct definitions.`
            );
        }
    }

    if (communalities) {
        const lowItems = communalities.filter(c => c.value < 0.40);
        if (lowItems.length > 0) {
            warnings.push(
                `The following item(s) have communalities (h²) below .40, indicating poor ` +
                `representation by the factor structure: ` +
                `${lowItems.map(c => `${c.item} (h² = ${formatCoef(c.value)})`).join(', ')}. ` +
                `Items with h² < .40 should be revised or removed (Hair et al., 2019; Fabrigar et al., 1999).`
            );
        }
    }

    details.push(
        `Minimum loading for factor assignment: ≥ .40 (Hair et al., 2019); ` +
        `≥ .50 preferred for sample sizes N < 200.`
    );
    details.push(
        `Cross-loadings (items loading ≥ .32 on two or more factors) compromise ` +
        `simple structure and should be examined carefully (Tabachnick & Fidell, 2019).`
    );
    warnings.push(
        'EFA is exploratory: the derived factor structure should be replicated in an independent sample ' +
        'via CFA before being treated as the definitive measurement model.'
    );

    const efaVerdict = kmo >= 0.70 && bartlettP < 0.05 && (totalVariance == null || totalVariance >= 0.50) ? 'pass' : kmo >= 0.60 && bartlettP < 0.05 ? 'warning' : 'fail';

    return {
        summary, details, warnings, citations,
        verdict: efaVerdict,
        apaStatement: `An EFA using ${factorMethod} extraction${rotationMethod ? ` with ${rotationMethod} rotation` : ''} was conducted. KMO = ${formatCoef(kmo)}, Bartlett's ${formatPValue(bartlettP)}. A ${nFactors}-factor solution was retained${totalVariance != null ? `, explaining ${(totalVariance * 100).toFixed(1)}% of total variance` : ''}.`,
        recommendations: [
            kmo < 0.70
                ? 'KMO is below .70 — consider improving items, increasing sample size, or removing items that do not correlate well with the rest.'
                : 'KMO is satisfactory — proceed with EFA and verify factor solution stability.',
            `Use parallel analysis (not Kaiser's eigenvalue > 1 criterion) to determine the optimal number of factors to retain.`,
            totalVariance != null && totalVariance < 0.60
                ? `Total variance explained (${(totalVariance * 100).toFixed(1)}%) is below 60% — consider retaining an additional factor or expanding the item pool.`
                : 'Replicate the EFA factor solution in a new sample via CFA before treating it as the definitive measurement model.',
        ],
    };
}


// ─── CONFIRMATORY FACTOR ANALYSIS ────────────────────────────────────────────

export function interpretCFA(params: {
    chi2:           number;
    df:             number;
    pValue:         number;
    cfi:            number;
    tli:            number;
    rmsea:          number;
    rmseaCILower?:  number;
    rmseaCIUpper?:  number;
    srmr:           number;
}): InterpretationResult {
    const { rmseaCILower, rmseaCIUpper } = params;
    const chi2   = safeNum(params.chi2);
    const df     = safeNum(params.df);
    const pValue = safeNum(params.pValue, 1);
    const cfi    = safeNum(params.cfi);
    const tli    = safeNum(params.tli);
    const rmsea  = safeNum(params.rmsea);
    const srmr   = safeNum(params.srmr);

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hu, L., & Bentler, P. M. (1999). Cutoff criteria for fit indexes in covariance structure analysis. Structural Equation Modeling, 6(1), 1–55. https://doi.org/10.1080/10705519909540118',
        'Kline, R. B. (2016). Principles and practice of structural equation modeling (4th ed.). Guilford Press.',
        'Brown, T. A. (2015). Confirmatory factor analysis for applied research (2nd ed.). Guilford Press.',
        'McNeish, D., & Wolf, M. G. (2023). Dynamic fit index cutoffs for confirmatory factor analysis models. Psychological Methods, 28(1), 61–88.',
    ];

    // ── Evaluate fit indices ──────────────────────────────────────────────────
    const cfiBad   = cfi  < 0.90;
    const tliBad   = tli  < 0.90;
    const rmseaBad = rmsea > 0.08;
    const srmrBad  = srmr  > 0.08;
    const cfiFine   = cfi  >= 0.95;
    const tliFine   = tli  >= 0.95;
    const rmseaFine = rmsea <= 0.06;
    const srmrFine  = srmr  <= 0.06;
    const nBad  = [cfiBad, tliBad, rmseaBad, srmrBad].filter(Boolean).length;
    const nFine = [cfiFine, tliFine, rmseaFine, srmrFine].filter(Boolean).length;

    let fitVerdict = '';
    if      (nBad === 0 && nFine >= 3) fitVerdict = 'excellent fit';
    else if (nBad === 0 && nFine >= 1) fitVerdict = 'good fit';
    else if (nBad === 0)               fitVerdict = 'acceptable fit';
    else if (nBad === 1)               fitVerdict = 'marginally acceptable fit';
    else if (nBad === 2)               fitVerdict = 'poor fit';
    else                               fitVerdict = 'unacceptable fit';

    // χ² / df ratio
    const chiRatio = df > 0 ? chi2 / df : null;
    const chiRatioVerdict = chiRatio == null ? ''
        : chiRatio <= 2.0 ? ' (good; ≤ 2.0)'
        : chiRatio <= 3.0 ? ' (acceptable; ≤ 3.0)'
        : chiRatio <= 5.0 ? ' (questionable; 3.0–5.0)'
        : ' (poor; > 5.0)';

    const rmseaCI = (rmseaCILower != null && rmseaCIUpper != null)
        ? ` [90% CI: ${formatCoef(rmseaCILower)}, ${formatCoef(rmseaCIUpper)}]`
        : '';

    let summary =
        `Confirmatory Factor Analysis (CFA) was conducted to evaluate the ` +
        `pre-specified measurement model. The overall pattern of model fit indices ` +
        `indicated ${fitVerdict}: ` +
        `CFI = ${formatCoef(cfi)}, TLI = ${formatCoef(tli)}, ` +
        `RMSEA = ${formatCoef(rmsea)}${rmseaCI}, SRMR = ${formatCoef(srmr)} ` +
        `(Hu & Bentler, 1999; Kline, 2016). ` +
        `${nBad === 0
            ? 'All reported fit indices satisfy recommended thresholds, supporting the adequacy of the measurement model.'
            : 'One or more fit indices suggest model-data misfit; model re-specification may be warranted (see warnings).'}`;

    // Detailed fit index lines
    details.push(
        `χ²(${df}) = ${formatNum(chi2)}, ${formatPValue(pValue)}` +
        `${chiRatio != null ? `; χ²/df = ${formatNum(chiRatio)}${chiRatioVerdict}` : ''}. ` +
        `Note: χ² is sensitive to sample size (significant for N > ~200 even with good fit); ` +
        `use it as one of multiple criteria (Kline, 2016).`
    );
    details.push(
        `CFI = ${formatCoef(cfi)} ` +
        `(${cfiFine ? 'excellent ≥ .95' : cfiBad ? 'below minimum .90' : 'acceptable .90–.94'}; ` +
        `threshold: ≥ .95 close fit, ≥ .90 acceptable; Hu & Bentler, 1999).`
    );
    details.push(
        `TLI = ${formatCoef(tli)} ` +
        `(${tliFine ? 'excellent ≥ .95' : tliBad ? 'below minimum .90' : 'acceptable .90–.94'}; ` +
        `threshold: ≥ .95 close fit, ≥ .90 acceptable).`
    );
    details.push(
        `RMSEA = ${formatCoef(rmsea)}${rmseaCI} ` +
        `(${rmseaFine ? 'excellent ≤ .06' : rmseaBad ? 'exceeds .08 limit' : 'acceptable .06–.08'}; ` +
        `threshold: ≤ .06 close fit, ≤ .08 acceptable; 90% CI upper bound < .08 preferred).`
    );
    details.push(
        `SRMR = ${formatCoef(srmr)} ` +
        `(${srmrFine ? 'excellent ≤ .06' : srmrBad ? 'exceeds .08 limit' : 'acceptable .06–.08'}; ` +
        `threshold: ≤ .08; represents average absolute standardised residual).`
    );

    if (pValue < 0.05 && nBad === 0) {
        details.push(
            `The significant χ² (${formatPValue(pValue)}) likely reflects large sample size ` +
            `sensitivity rather than substantive misfit — the incremental fit indices ` +
            `(CFI, TLI, RMSEA, SRMR) all indicate acceptable or better fit.`
        );
    } else if (pValue > 0.05) {
        details.push(
            `The non-significant χ² (${formatPValue(pValue)}) suggests the model covariance ` +
            `structure closely approximates the observed matrix; however, interpret with caution ` +
            `as this may reflect low statistical power (small N or df).`
        );
    }

    // Specific warnings for failing indices
    if (cfiBad)   warnings.push(`CFI = ${formatCoef(cfi)} is below .90 (Hu & Bentler, 1999). Model re-specification guided by theoretical reasoning and modification indices is recommended.`);
    if (tliBad)   warnings.push(`TLI = ${formatCoef(tli)} is below .90. TLI penalises model complexity; consider whether the model is over-parameterised.`);
    if (rmseaBad) warnings.push(`RMSEA = ${formatCoef(rmsea)} exceeds the .08 upper limit (Hu & Bentler, 1999). Inspect modification indices and consider freeing theoretically justified parameters (e.g., correlated residuals for same-method items).`);
    if (srmrBad)  warnings.push(`SRMR = ${formatCoef(srmr)} exceeds .08, indicating systematic residual covariance misfit. Examine the residual correlation matrix for patterns.`);

    if (nBad > 0) {
        warnings.push(
            'Important: post-hoc model modifications (e.g., adding correlated residuals based solely on MIs) ' +
            'inflate fit and should not be applied without theoretical justification. Cross-validate any modified model.'
        );
    }

    details.push(
        'Beyond fit indices, convergent validity (AVE ≥ .50) and discriminant validity ' +
        '(HTMT < .85 or Fornell-Larcker criterion) should be assessed to fully evaluate ' +
        'the measurement model (Brown, 2015).'
    );

    const cfaVerdict = nBad === 0 ? 'pass' : nBad <= 1 ? 'warning' : 'fail';
    const rmseaCIStr = (rmseaCILower != null && rmseaCIUpper != null)
        ? ` [90% CI: ${formatCoef(rmseaCILower)}, ${formatCoef(rmseaCIUpper)}]`
        : '';

    return {
        summary, details, warnings, citations,
        verdict: cfaVerdict,
        apaStatement: `CFA results indicated ${fitVerdict}: CFI = ${formatCoef(cfi)}, TLI = ${formatCoef(tli)}, RMSEA = ${formatCoef(rmsea)}${rmseaCIStr}, SRMR = ${formatCoef(srmr)}, χ²(${df}) = ${formatNum(chi2)}, ${formatPValue(pValue)} (Hu & Bentler, 1999).`,
        recommendations: nBad === 0
            ? [
                'Report all four fit indices (CFI, TLI, RMSEA with 90% CI, SRMR) in the manuscript for comprehensive evaluation.',
                'Assess convergent validity (AVE ≥ .50) and discriminant validity (HTMT < .85) to complete measurement model evaluation.',
                'Consider reporting reliability (Cronbach α or McDonald ω) for each factor alongside the CFA fit.',
              ]
            : [
                nBad >= 2
                    ? 'Multiple fit indices are below threshold — inspect modification indices (MI) for the largest residual covariances and consider theoretically justified model re-specifications.'
                    : 'One fit index is marginal — examine modification indices for potential item reassignments or correlated residuals within the same scale.',
                'Cross-validate any re-specified model in an independent sample to prevent overfitting.',
                'Consider Bayesian SEM or ESEM as alternatives if the simple-structure CFA consistently shows poor fit.',
              ],
    };
}
