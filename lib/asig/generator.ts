/**
 * ASIG — generator.ts
 * Central dispatch router: maps AnalysisType → specific interpreter.
 * Also exports standalone utilities: interpretVIF, interpretOutlier, interpretHTMT.
 *
 * All interpreters return an InterpretationResult with APA 7 prose.
 */

import { AnalysisType, InterpretationResult, formatCoef, formatNum } from './shared';
import { interpretCronbachAlpha, interpretEFA, interpretCFA }       from './factor';
import {
    interpretDescriptive,
    interpretCorrelation,
    interpretTTestIndependent,
    interpretTTestPaired,
    interpretANOVA,
    interpretTwoWayANOVA,
    interpretMannWhitney,
    interpretKruskalWallis,
    interpretWilcoxonSigned,
    interpretChiSquare,
} from './basic';
import {
    interpretLinearRegression,
    interpretLogisticRegression,
    interpretMediation,
    interpretModeration,
    interpretClusterAnalysis,
} from './regression';
import { interpretPLSSEM } from './pls-sem';


// ─── MAIN DISPATCH ROUTER ────────────────────────────────────────────────────

export function generateInterpretation(
    analysisType: AnalysisType,
    results: Record<string, any>
): InterpretationResult {
    switch (analysisType) {
        case 'cronbach_alpha':      return interpretCronbachAlpha(results as any);
        case 'correlation':         return interpretCorrelation(results as any);
        case 'ttest_independent':   return interpretTTestIndependent(results as any);
        case 'ttest_paired':        return interpretTTestPaired(results as any);
        case 'anova':               return interpretANOVA(results as any);
        case 'two_way_anova':       return interpretTwoWayANOVA(results as any);
        case 'efa':                 return interpretEFA(results as any);
        case 'cfa':                 return interpretCFA(results as any);
        case 'linear_regression':   return interpretLinearRegression(results as any);
        case 'logistic_regression': return interpretLogisticRegression(results as any);
        case 'mann_whitney':        return interpretMannWhitney(results as any);
        case 'kruskal_wallis':      return interpretKruskalWallis(results as any);
        case 'wilcoxon_signed':     return interpretWilcoxonSigned(results as any);
        case 'chi_square':          return interpretChiSquare(results as any);
        case 'mediation':           return interpretMediation(results as any);
        case 'moderation':          return interpretModeration(results as any);
        case 'cluster':             return interpretClusterAnalysis(results as any);
        case 'descriptive':         return interpretDescriptive(results as any);
        case 'pls-sem':             return interpretPLSSEM(results as any);

        // Inline handlers for lightweight diagnostics
        case 'vif':    return interpretVIF(results as any);
        case 'outlier': return interpretOutlier(results as any);
        case 'htmt':   return interpretHTMT(results as any);

        default:
            return {
                summary:   `No ASIG template is currently registered for analysis type "${analysisType}". Please contact the development team to request support for this method.`,
                details:   [],
                warnings:  ['This analysis type is not yet supported by the ASIG engine.'],
                citations: [],
                verdict:   'warning',
                apaStatement: `Analysis type "${analysisType}" is not yet supported by the ASIG engine.`,
                recommendations: ['Contact the development team to request support for this analysis type.'],
            };
    }
}


// ─── VIF — MULTICOLLINEARITY DIAGNOSTIC ──────────────────────────────────────

export function interpretVIF(params: {
    vifValues:      number[];
    variableNames?: string[];
    threshold?:     number;
}): InterpretationResult {
    const { vifValues, variableNames, threshold = 5 } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2010). Multivariate data analysis (7th ed.). Pearson.',
        'O\'Brien, R. M. (2007). A caution regarding rules of thumb for variance inflation factors. Quality & Quantity, 41(5), 673–690.',
    ];

    const hasSevere   = vifValues.some(v => v >= 10);
    const hasModerate = vifValues.some(v => v >= threshold && v < 10);

    let summary = '';
    if (hasSevere) {
        summary = `Multicollinearity diagnostics revealed severe collinearity in the model: one or more predictors have VIF ≥ 10, indicating that these variables share more than 90% of their variance with other predictors. Regression coefficient estimates are highly unstable under these conditions (Hair et al., 2010). Model re-specification is strongly recommended.`;
    } else if (hasModerate) {
        summary = `Multicollinearity diagnostics revealed moderate collinearity: one or more predictors have VIF between ${threshold} and 10. While estimates remain valid, inflated standard errors may reduce statistical power. Researchers should monitor the stability of regression coefficients.`;
    } else {
        summary = `Multicollinearity diagnostics indicate that all predictors have VIF < ${threshold}, suggesting no problematic collinearity in the regression model. Coefficient estimates are stable and interpretable.`;
    }

    vifValues.forEach((v, i) => {
        const name = variableNames?.[i] ?? `Variable ${i + 1}`;
        if (v >= 10) {
            warnings.push(`"${name}": VIF = ${formatNum(v)} ≥ 10 — severe multicollinearity. Consider removing, combining, or orthogonalising this predictor.`);
        } else if (v >= threshold) {
            warnings.push(`"${name}": VIF = ${formatNum(v)} ≥ ${threshold} — moderate multicollinearity. Monitor coefficient stability across model specifications.`);
        } else {
            details.push(`"${name}": VIF = ${formatNum(v)} ✓ (below threshold of ${threshold}).`);
        }
    });

    return {
        summary, details, warnings, citations,
        verdict: hasSevere ? 'fail' : hasModerate ? 'warning' : 'pass',
        apaStatement: hasSevere
            ? `Severe multicollinearity was detected: ${vifValues.filter(v => v >= 10).length} predictor${vifValues.filter(v => v >= 10).length > 1 ? 's' : ''} had VIF ≥ 10, indicating > 90% shared variance with other predictors.`
            : hasModerate
                ? `Moderate multicollinearity was detected: ${vifValues.filter(v => v >= threshold && v < 10).length} predictor${vifValues.filter(v => v >= threshold && v < 10).length > 1 ? 's had' : ' had'} VIF ≥ ${threshold}.`
                : `All predictors had VIF < ${threshold}, indicating no problematic multicollinearity.`,
        recommendations: hasSevere
            ? [
                'Remove or combine the severely collinear predictors (VIF ≥ 10) — their coefficient estimates are unreliable.',
                'Consider principal component regression or ridge regression to handle severe multicollinearity.',
                'Check the correlation matrix to identify which predictors are near-redundant.',
              ]
            : hasModerate
                ? [
                    `Monitor the stability of regression coefficients across model specifications for predictors with VIF ≥ ${threshold}.`,
                    'Mean-centering predictors or using orthogonal coding can help reduce non-essential multicollinearity.',
                    'Report tolerance (1/VIF) alongside VIF values for comprehensive collinearity diagnostics.',
                  ]
                : [
                    'No action required — multicollinearity is within acceptable bounds.',
                    'Proceed with regression analysis; coefficient estimates are stable.',
                  ],
    };
}


// ─── MULTIVARIATE OUTLIER DETECTION ──────────────────────────────────────────

export function interpretOutlier(params: {
    nOutliers:   number;
    totalN:      number;
    cutoffValue: number;
    method?:     string;
}): InterpretationResult {
    const { nOutliers, totalN, cutoffValue, method = 'Mahalanobis Distance' } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Tabachnick, B. G., & Fidell, L. S. (2013). Using multivariate statistics (6th ed.). Pearson.',
        'Mahalanobis, P. C. (1936). On the generalised distance in statistics. Proceedings of the National Institute of Sciences of India, 2(1), 49–55.',
    ];

    const pct = (nOutliers / totalN) * 100;

    let summary = '';
    if (nOutliers === 0) {
        summary = `Multivariate outlier detection using ${method} (critical χ² cutoff = ${formatNum(cutoffValue)}) identified no influential outliers across the ${totalN} observations. The dataset is free of multivariate anomalies that could distort regression or SEM estimates.`;
        details.push(`All ${totalN} observations fall within the acceptable Mahalanobis distance range.`);
    } else {
        summary = `Multivariate outlier detection using ${method} identified ${nOutliers} observation${nOutliers > 1 ? 's' : ''} (${formatNum(pct, 1)}% of N = ${totalN}) with Mahalanobis distances exceeding the critical χ² threshold (D² > ${formatNum(cutoffValue)}). These observations may disproportionately influence parameter estimates.`;
        warnings.push(`${nOutliers} multivariate outlier${nOutliers > 1 ? 's' : ''} detected. Researchers should examine these cases individually: if they represent data entry errors, they should be corrected; if they are genuine but extreme observations, sensitivity analyses with and without outliers are recommended before final reporting (Tabachnick & Fidell, 2013).`);
    }

    details.push(`Detection method: ${method}, p < .001 criterion (χ² cutoff = ${formatNum(cutoffValue)}).`);

    return {
        summary, details, warnings, citations,
        verdict: nOutliers === 0 ? 'pass' : nOutliers / totalN < 0.05 ? 'warning' : 'fail',
        apaStatement: nOutliers === 0
            ? `No multivariate outliers were detected using ${method} (N = ${totalN}, χ² cutoff = ${formatNum(cutoffValue)}).`
            : `${nOutliers} multivariate outlier${nOutliers > 1 ? 's' : ''} (${((nOutliers / totalN) * 100).toFixed(1)}% of N = ${totalN}) were identified via ${method} (D² > ${formatNum(cutoffValue)}).`,
        recommendations: nOutliers === 0
            ? ['Proceed with planned analyses — no influential outliers detected.', 'Verify data entry accuracy as a routine quality check before finalising the dataset.']
            : [
                'Examine each flagged observation individually — determine whether it represents a data entry error or a genuine extreme case.',
                'Run analyses both with and without outliers and report whether conclusions differ (sensitivity analysis).',
                `${nOutliers / totalN > 0.05 ? 'High outlier rate (> 5%) may indicate data quality issues — review data collection procedures.' : 'Outlier rate is below 5% — sensitivity analysis is sufficient before deciding on exclusions.'}`,
              ],
    };
}


// ─── HTMT — STANDALONE DISCRIMINANT VALIDITY ─────────────────────────────────

export function interpretHTMT(params: {
    htmtMatrix:   number[][];
    factorNames:  string[];
    threshold?:   number;
}): InterpretationResult {
    const { htmtMatrix, factorNames, threshold = 0.85 } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Henseler, J., Ringle, C. M., & Sarstedt, M. (2015). A new criterion for assessing discriminant validity in variance-based structural equation modeling. Journal of the Academy of Marketing Science, 43(1), 115–135.',
    ];

    const violations: string[] = [];

    for (let i = 0; i < htmtMatrix.length; i++) {
        for (let j = i + 1; j < htmtMatrix[i].length; j++) {
            const val = htmtMatrix[i][j];
            const f1  = factorNames[i] ?? `Factor ${i + 1}`;
            const f2  = factorNames[j] ?? `Factor ${j + 1}`;

            if (val >= threshold) {
                violations.push(`${f1} & ${f2} (HTMT = ${formatCoef(val)})`);
            } else {
                details.push(`${f1} & ${f2}: HTMT = ${formatCoef(val)} < ${formatCoef(threshold)} ✓`);
            }
        }
    }

    let summary = '';
    if (violations.length === 0) {
        summary = `Discriminant validity assessment using the Heterotrait-Monotrait (HTMT) ratio indicated that all construct pairs have HTMT values below the threshold of ${formatCoef(threshold)} (Henseler et al., 2015), confirming that all constructs are conceptually and statistically distinct.`;
    } else {
        summary = `HTMT-based discriminant validity assessment identified ${violations.length} construct pair${violations.length > 1 ? 's' : ''} with HTMT values at or above the threshold of ${formatCoef(threshold)} (Henseler et al., 2015), indicating insufficient conceptual distinctiveness between these constructs.`;
        warnings.push(`Discriminant validity concern(s): ${violations.join('; ')}. Inspect cross-loadings, consider item reassignment, or merge constructs if conceptual overlap is substantive.`);
    }

    details.push(`Applied threshold: HTMT < ${formatCoef(threshold)} (strict) or < .90 (liberal; Henseler et al., 2015).`);

    return {
        summary, details, warnings, citations,
        verdict: violations.length === 0 ? 'pass' : 'fail',
        apaStatement: violations.length === 0
            ? `HTMT-based discriminant validity was confirmed: all construct pairs had HTMT < ${formatCoef(threshold)} (Henseler et al., 2015).`
            : `HTMT discriminant validity was violated for ${violations.length} pair${violations.length > 1 ? 's' : ''}: ${violations.join('; ')}.`,
        recommendations: violations.length === 0
            ? [
                'Discriminant validity is confirmed — proceed with structural model interpretation.',
                'Report HTMT values in a correlation matrix table for transparency.',
              ]
            : [
                'Examine cross-loadings for the violating construct pairs to identify poorly discriminating items.',
                'Consider merging constructs that are conceptually and empirically similar (HTMT ≥ .90).',
                'Obtain bootstrap CIs for HTMT values — if the upper bound exceeds .90, the violation is statistically significant.',
              ],
    };
}
