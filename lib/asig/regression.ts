/**
 * ASIG — regression.ts
 * Interpreters: Linear Regression, Logistic Regression, Mediation,
 *               Moderation, Cluster Analysis
 *
 * All prose conforms to APA 7th Edition reporting standards.
 */

import { formatPValue, formatCoef, formatNum, formatPct, safeNum, InterpretationResult } from './shared';


// ─── LINEAR REGRESSION ───────────────────────────────────────────────────────

export function interpretLinearRegression(params: {
    dependentVar:  string;
    rSquared:      number;
    adjRSquared:   number;
    fStatistic:    number;
    fPValue:       number;
    dfResidual?:   number;
    coefficients:  {
        term:     string;
        estimate: number;
        stdBeta:  number;
        pValue:   number;
        vif?:     number;
    }[];
    normalityP?:   number;
    durbinWatson?: number;
}): InterpretationResult {
    const { dependentVar, dfResidual, coefficients, normalityP, durbinWatson } = params;
    const rSquared    = safeNum(params.rSquared);
    const adjRSquared = safeNum(params.adjRSquared);
    const fStatistic  = safeNum(params.fStatistic);
    const fPValue     = safeNum(params.fPValue, 1);

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Cohen, J., Cohen, P., West, S. G., & Aiken, L. S. (2003). Applied multiple regression/correlation analysis for the behavioral sciences (3rd ed.). Lawrence Erlbaum Associates.',
        'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2019). Multivariate data analysis (8th ed.). Cengage Learning.',
        'O\'Brien, R. M. (2007). A caution regarding rules of thumb for variance inflation factors. Quality & Quantity, 41(5), 673–690.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    const modelSig = fPValue < 0.05;
    const r2Label  = adjRSquared < 0.02 ? 'negligible'
        : adjRSquared < 0.13 ? 'weak'
        : adjRSquared < 0.26 ? 'moderate'
        : 'substantial';
    const nPred    = coefficients.filter(c => c.term !== '(Intercept)').length;
    const dfDenom  = dfResidual != null ? `${dfResidual}` : `N−${nPred + 1}`;

    let summary = '';
    if (modelSig) {
        summary =
            `Multiple linear regression was conducted to predict "${dependentVar}" ` +
            `from ${nPred} predictor${nPred > 1 ? 's' : ''} (α = .05). ` +
            `The overall model was statistically significant: ` +
            `F(${formatNum(nPred, 0)}, ${dfDenom}) = ${formatNum(fStatistic)}, ` +
            `${formatPValue(fPValue)}, R² = ${formatCoef(rSquared)}, ` +
            `adjusted R² = ${formatCoef(adjRSquared)}. ` +
            `The model explained approximately ${formatPct(adjRSquared)} ` +
            `of the variance in "${dependentVar}" (${r2Label} explanatory power; ` +
            `Cohen, 1988 f² benchmarks: weak ≈ .02, moderate ≈ .15, large ≈ .35).`;
    } else {
        summary =
            `Multiple linear regression was conducted to predict "${dependentVar}" ` +
            `from ${nPred} predictor${nPred > 1 ? 's' : ''} (α = .05). ` +
            `The overall model was not statistically significant: ` +
            `F(${formatNum(nPred, 0)}, ${dfDenom}) = ${formatNum(fStatistic)}, ` +
            `${formatPValue(fPValue)}, adjusted R² = ${formatCoef(adjRSquared)}. ` +
            `The predictors did not explain a significant proportion of variance in "${dependentVar}."`;
    }

    // Predictors
    const predictors = coefficients.filter(c => c.term !== '(Intercept)');
    for (const coef of predictors) {
        const direction = coef.estimate > 0 ? 'positively' : 'negatively';
        if (coef.pValue < 0.05) {
            details.push(
                `"${coef.term}": β = ${formatCoef(coef.stdBeta)}, B = ${formatNum(coef.estimate)}, ` +
                `${formatPValue(coef.pValue)} — statistically significant, ` +
                `${direction} associated with "${dependentVar}." ` +
                `A one-unit increase in "${coef.term}" is associated with a ` +
                `${formatNum(Math.abs(coef.estimate))}-unit ` +
                `${coef.estimate > 0 ? 'increase' : 'decrease'} in "${dependentVar}" ` +
                `holding all other predictors constant.`
            );
        } else {
            details.push(
                `"${coef.term}": β = ${formatCoef(coef.stdBeta)}, B = ${formatNum(coef.estimate)}, ` +
                `${formatPValue(coef.pValue)} — not statistically significant. ` +
                `This predictor did not contribute uniquely to "${dependentVar}" ` +
                `beyond the other predictors in the model.`
            );
        }

        if (coef.vif != null) {
            if (coef.vif >= 10) {
                warnings.push(
                    `"${coef.term}": VIF = ${formatNum(coef.vif)} ≥ 10 — ` +
                    `severe multicollinearity. This predictor shares > 90% variance with other predictors; ` +
                    `coefficient estimates are highly unstable. Consider removing or combining predictors.`
                );
            } else if (coef.vif >= 5) {
                warnings.push(
                    `"${coef.term}": VIF = ${formatNum(coef.vif)} ≥ 5 — ` +
                    `moderate multicollinearity. Standard errors may be inflated; ` +
                    `monitor coefficient stability (O'Brien, 2007).`
                );
            } else {
                details.push(`"${coef.term}": VIF = ${formatNum(coef.vif)} ✓ (< 5; no problematic multicollinearity).`);
            }
        }
    }

    // Assumption diagnostics
    if (normalityP != null) {
        if (normalityP < 0.05) {
            warnings.push(
                `Shapiro-Wilk test indicated that residuals violated the normality assumption ` +
                `(${formatPValue(normalityP)}). ` +
                `Bootstrap confidence intervals or heteroscedasticity-robust (HC) standard errors ` +
                `are recommended for robust inference (Field, 2018). ` +
                `Regression is generally robust to non-normality for N ≥ 30.`
            );
        } else {
            details.push(`Residual normality: Shapiro-Wilk ${formatPValue(normalityP)} ✓ — assumption satisfied.`);
        }
    }
    if (durbinWatson != null) {
        const dwOk = durbinWatson >= 1.5 && durbinWatson <= 2.5;
        if (!dwOk) {
            warnings.push(
                `Durbin-Watson = ${formatNum(durbinWatson)} (acceptable range: 1.5–2.5) suggests ` +
                `${durbinWatson < 1.5 ? 'positive' : 'negative'} autocorrelation in residuals. ` +
                `This violates the independence assumption; Generalised Least Squares or robust SEs ` +
                `should be used if the data have a time-ordered or clustered structure.`
            );
        } else {
            details.push(`Independence of residuals: Durbin-Watson = ${formatNum(durbinWatson)} ✓ (1.5–2.5 range satisfied).`);
        }
    }

    details.push(
        `APA 7 reporting: F(${formatNum(nPred, 0)}, ${dfDenom}) = ${formatNum(fStatistic)}, ` +
        `${formatPValue(fPValue)}, R² = ${formatCoef(rSquared)}, adjusted R² = ${formatCoef(adjRSquared)}.`
    );
    details.push(
        `Report B (unstandardized, with SE and 95% CI) for replication, ` +
        `and β (standardized) for comparing relative predictor importance within the model.`
    );

    const sigPredictors = coefficients.filter(c => c.term !== '(Intercept)' && c.pValue < 0.05);

    return {
        summary, details, warnings, citations,
        verdict: modelSig ? 'pass' : 'warning',
        apaStatement: modelSig
            ? `Multiple linear regression significantly predicted "${dependentVar}", F(${formatNum(nPred, 0)}, ${dfDenom}) = ${formatNum(fStatistic)}, ${formatPValue(fPValue)}, R² = ${formatCoef(rSquared)}, adjusted R² = ${formatCoef(adjRSquared)}. ${sigPredictors.length > 0 ? `Significant predictors: ${sigPredictors.map(c => `${c.term} (β = ${formatCoef(c.stdBeta)}, ${formatPValue(c.pValue)})`).join(', ')}.` : ''}`
            : `The regression model did not significantly predict "${dependentVar}", F(${formatNum(nPred, 0)}, ${dfDenom}) = ${formatNum(fStatistic)}, ${formatPValue(fPValue)}, adjusted R² = ${formatCoef(adjRSquared)}.`,
        recommendations: modelSig
            ? [
                sigPredictors.length > 0
                    ? `Focus interpretation on significant predictors (${sigPredictors.map(c => c.term).join(', ')}); report standardised β for relative importance comparison.`
                    : 'Report adjusted R² rather than R² to account for model complexity.',
                'Report 95% CIs for all unstandardised B coefficients for replication purposes.',
                coefficients.some(c => c.vif != null && c.vif >= 5)
                    ? 'Multicollinearity detected — consider ridge regression or removing redundant predictors.'
                    : 'Check residual plots (fitted vs. residuals, Q-Q plot) to verify linearity and homoscedasticity assumptions.',
              ]
            : [
                'The model is non-significant — evaluate whether the predictors are theoretically appropriate for this outcome.',
                'Increase sample size or reconsider the predictor set based on prior literature.',
                'Consider a hierarchical regression approach to assess whether adding predictors improves model fit.',
              ],
    };
}


// ─── LOGISTIC REGRESSION ─────────────────────────────────────────────────────

export function interpretLogisticRegression(params: {
    dependentVar:  string;
    pseudoR2:      number;
    accuracy:      number;
    auc?:          number;
    coefficients:  {
        term:       string;
        estimate:   number;
        oddsRatio:  number;
        ciLower?:   number;
        ciUpper?:   number;
        pValue:     number;
    }[];
}): InterpretationResult {
    const { dependentVar, auc, coefficients } = params;
    const pseudoR2 = safeNum(params.pseudoR2);
    const accuracy = safeNum(params.accuracy);

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hosmer, D. W., Lemeshow, S., & Sturdivant, R. X. (2013). Applied logistic regression (3rd ed.). Wiley. https://doi.org/10.1002/9781118548387',
        'McFadden, D. (1979). Quantitative methods for analyzing travel behaviour of individuals. In D. Hensher & P. Stopher (Eds.), Behavioural travel modelling (pp. 279–318). Croom Helm.',
        'Harrell, F. E. (2015). Regression modeling strategies (2nd ed.). Springer.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    const r2Label = pseudoR2 < 0.10 ? 'weak'
        : pseudoR2 < 0.20 ? 'moderate'
        : pseudoR2 < 0.40 ? 'good'
        : 'strong';

    let summary =
        `Binary logistic regression was conducted to predict the probability of "${dependentVar}." ` +
        `The model demonstrated ${r2Label} explanatory power: ` +
        `McFadden's pseudo-R² = ${formatCoef(pseudoR2)} (${r2Label}; McFadden, 1979), ` +
        `with an overall classification accuracy of ${formatPct(accuracy)}. `;

    if (auc != null) {
        const aucLabel = auc < 0.60 ? 'poor'
            : auc < 0.70 ? 'weak'
            : auc < 0.80 ? 'acceptable'
            : auc < 0.90 ? 'excellent'
            : 'outstanding';
        summary +=
            `The area under the ROC curve (AUC = ${formatCoef(auc)}) indicated ` +
            `${aucLabel} discriminative ability (Hosmer et al., 2013).`;
        details.push(
            `AUC = ${formatCoef(auc)} (Hosmer et al., 2013 benchmarks: ` +
            `< .70 weak, .70–.79 acceptable, .80–.89 excellent, ≥ .90 outstanding).`
        );
    }

    const predictors = coefficients.filter(c => c.term !== '(Intercept)');
    for (const coef of predictors) {
        const or    = coef.oddsRatio;
        const ciStr = (coef.ciLower != null && coef.ciUpper != null)
            ? `, 95% CI [${formatNum(coef.ciLower)}, ${formatNum(coef.ciUpper)}]`
            : '';
        const pct   = or > 1 ? formatPct(or - 1) : formatPct(1 - or);

        if (coef.pValue < 0.05) {
            details.push(
                `"${coef.term}": OR = ${formatNum(or)}${ciStr}, ${formatPValue(coef.pValue)} — ` +
                `statistically significant (α = .05). ` +
                `Each one-unit increase in "${coef.term}" is associated with a ` +
                `${pct} ${or > 1 ? 'increase' : 'decrease'} in the odds of "${dependentVar}."` +
                `${ciStr === '' ? ' Report 95% CI for the OR in publications.' : ''}`
            );
        } else {
            details.push(
                `"${coef.term}": OR = ${formatNum(or)}${ciStr}, ${formatPValue(coef.pValue)} — ` +
                `not statistically significant (α = .05). ` +
                `This predictor did not contribute significantly to the model.`
            );
        }
    }

    warnings.push(
        'Report OR with 95% CI for each predictor — odds ratios without CIs are uninformative. ' +
        'A wide CI indicates high uncertainty even if OR is nominally large.'
    );
    warnings.push(
        'McFadden\'s pseudo-R² should not be interpreted as equivalent to OLS R²: ' +
        'values of .10–.20 in logistic regression indicate models comparable to R² ≈ .30–.50 in OLS (McFadden, 1979).'
    );
    warnings.push(
        'Classification accuracy is a misleading metric when the outcome is imbalanced. ' +
        'Report sensitivity, specificity, positive predictive value, and the Hosmer-Lemeshow test ' +
        'for a complete model evaluation.'
    );

    details.push(
        `Model fit: McFadden R² = ${formatCoef(pseudoR2)}, ` +
        `accuracy = ${formatPct(accuracy)}` +
        `${auc != null ? `, AUC = ${formatCoef(auc)}` : ''}.`
    );

    const logisticVerdict = pseudoR2 >= 0.10 && accuracy >= 0.70 ? 'pass' : pseudoR2 >= 0.05 ? 'warning' : 'fail';
    const sigLogPreds = coefficients.filter(c => c.term !== '(Intercept)' && c.pValue < 0.05);

    return {
        summary, details, warnings, citations,
        verdict: logisticVerdict,
        apaStatement: `Binary logistic regression predicting "${dependentVar}" yielded McFadden pseudo-R² = ${formatCoef(pseudoR2)}, accuracy = ${formatPct(accuracy)}${auc != null ? `, AUC = ${formatCoef(auc)}` : ''}. ${sigLogPreds.length > 0 ? `Significant predictors: ${sigLogPreds.map(c => `${c.term} (OR = ${formatNum(c.oddsRatio)}, ${formatPValue(c.pValue)})`).join(', ')}.` : ''}`,
        recommendations: [
            'Report OR with 95% CI for all predictors — CIs are more informative than p-values alone for logistic models.',
            auc != null && auc < 0.70
                ? `AUC = ${formatCoef(auc)} indicates weak discrimination — consider adding theoretically motivated predictors.`
                : 'Evaluate model calibration using the Hosmer-Lemeshow goodness-of-fit test.',
            'For imbalanced outcomes, report sensitivity, specificity, and the F1-score in addition to overall accuracy.',
        ],
    };
}


// ─── MEDIATION ANALYSIS ───────────────────────────────────────────────────────

export function interpretMediation(params: {
    xVar:           string;
    mVar:           string;
    yVar:           string;
    pathA:          { estimate: number; pValue: number };
    pathB:          { estimate: number; pValue: number };
    pathC:          { estimate: number; pValue: number };
    pathCprime:     { estimate: number; pValue: number };
    indirectEffect: number;
    sobelZ:         number;
    sobelP:         number;
    bootstrapCI?:   { lower: number; upper: number; nBootstrap?: number };
    mediationType:  'full' | 'partial' | 'none';
}): InterpretationResult {
    const {
        xVar, mVar, yVar,
        pathA, pathB, pathC, pathCprime,
        bootstrapCI, mediationType
    } = params;
    const indirectEffect = safeNum(params.indirectEffect);
    const sobelZ         = safeNum(params.sobelZ);
    const sobelP         = safeNum(params.sobelP, 1);

    // Normalize path objects
    const safePathA      = { estimate: safeNum(pathA?.estimate), pValue: safeNum(pathA?.pValue, 1) };
    const safePathB      = { estimate: safeNum(pathB?.estimate), pValue: safeNum(pathB?.pValue, 1) };
    const safePathC      = { estimate: safeNum(pathC?.estimate), pValue: safeNum(pathC?.pValue, 1) };
    const safePathCprime = { estimate: safeNum(pathCprime?.estimate), pValue: safeNum(pathCprime?.pValue, 1) };

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hayes, A. F. (2018). Introduction to mediation, moderation, and conditional process analysis (2nd ed.). Guilford Press.',
        'Preacher, K. J., & Hayes, A. F. (2008). Asymptotic and resampling strategies for assessing and comparing indirect effects in multiple mediator models. Behavior Research Methods, 40(3), 879–891. https://doi.org/10.3758/BRM.40.3.879',
        'Baron, R. M., & Kenny, D. A. (1986). The moderator-mediator variable distinction in social psychological research. Journal of Personality and Social Psychology, 51(6), 1173–1182.',
        'Shrout, P. E., & Bolger, N. (2002). Mediation in experimental and nonexperimental studies: New procedures and recommendations. Psychological Methods, 7(4), 422–445.',
    ];

    // Path details with APA notation
    details.push(
        `Path a (${xVar} → ${mVar}): B = ${formatCoef(safePathA.estimate)}, ` +
        `${formatPValue(safePathA.pValue)}` +
        `${safePathA.pValue < 0.05 ? ' ✓ significant' : ' — not significant'}.`
    );
    details.push(
        `Path b (${mVar} → ${yVar} | ${xVar}): B = ${formatCoef(safePathB.estimate)}, ` +
        `${formatPValue(safePathB.pValue)}` +
        `${safePathB.pValue < 0.05 ? ' ✓ significant' : ' — not significant'}.`
    );
    details.push(
        `Path c — Total effect (${xVar} → ${yVar}): B = ${formatCoef(safePathC.estimate)}, ` +
        `${formatPValue(safePathC.pValue)}.`
    );
    details.push(
        `Path c′ — Direct effect (${xVar} → ${yVar} | ${mVar}): B = ${formatCoef(safePathCprime.estimate)}, ` +
        `${formatPValue(safePathCprime.pValue)}.`
    );
    details.push(`Indirect effect (a × b) = ${formatCoef(indirectEffect)}.`);

    if (bootstrapCI) {
        const n = bootstrapCI.nBootstrap ?? 5000;
        const ciInclZero = bootstrapCI.lower < 0 && bootstrapCI.upper > 0;
        details.push(
            `Bootstrap 95% CI for indirect effect (${n} resamples): ` +
            `[${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]. ` +
            `${ciInclZero
                ? 'CI includes zero → indirect effect is NOT statistically significant.'
                : 'CI excludes zero → indirect effect IS statistically significant (Hayes, 2018).'}`
        );
    }

    details.push(
        `Sobel test: Z = ${formatNum(sobelZ)}, ${formatPValue(sobelP)} ` +
        `(Sobel test is less powerful than bootstrap CI and assumes normality of the indirect effect distribution; ` +
        `bootstrap CI is the recommended standard; Shrout & Bolger, 2002).`
    );

    // Summary based on mediation type
    let summary = '';
    if (mediationType === 'full') {
        summary =
            `Mediation analysis indicated that "${mVar}" fully mediated the ` +
            `relationship between "${xVar}" and "${yVar}." ` +
            `Path a (${xVar} → ${mVar}: B = ${formatCoef(safePathA.estimate)}, ${formatPValue(safePathA.pValue)}) ` +
            `and path b (${mVar} → ${yVar}: B = ${formatCoef(safePathB.estimate)}, ${formatPValue(safePathB.pValue)}) ` +
            `were both statistically significant, while the direct effect of "${xVar}" on "${yVar}" ` +
            `was substantially reduced and non-significant after controlling for the mediator ` +
            `(c′ = ${formatCoef(safePathCprime.estimate)}, ${formatPValue(safePathCprime.pValue)}). ` +
            `The indirect effect (a × b = ${formatCoef(indirectEffect)}) was statistically significant` +
            `${bootstrapCI
                ? `, as confirmed by bootstrap confidence intervals ` +
                  `(95% CI [${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]; Hayes, 2018)`
                : ` per the Sobel test (Z = ${formatNum(sobelZ)}, ${formatPValue(sobelP)})`}, ` +
            `consistent with complete mediation.`;
    } else if (mediationType === 'partial') {
        summary =
            `Mediation analysis indicated that "${mVar}" partially mediated the ` +
            `relationship between "${xVar}" and "${yVar}." ` +
            `Both the indirect effect (a × b = ${formatCoef(indirectEffect)}) ` +
            `and the direct effect of "${xVar}" on "${yVar}" ` +
            `(c′ = ${formatCoef(safePathCprime.estimate)}, ${formatPValue(safePathCprime.pValue)}) ` +
            `remained statistically significant after introducing the mediator into the model, ` +
            `consistent with partial mediation. ` +
            `${bootstrapCI
                ? `Bootstrap 95% CI for the indirect effect excluded zero ` +
                  `([${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]; Hayes, 2018), ` +
                  `confirming the significance of the mediated pathway.`
                : ''}`;
    } else {
        summary =
            `Mediation analysis did not support a significant indirect effect of "${xVar}" ` +
            `on "${yVar}" through "${mVar}." ` +
            `${bootstrapCI
                ? `The bootstrap 95% CI for the indirect effect included zero ` +
                  `([${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]; Hayes, 2018), ` +
                  `indicating that the mediated pathway was not statistically significant.`
                : `The Sobel test was not significant (Z = ${formatNum(sobelZ)}, ${formatPValue(sobelP)}).`} ` +
            `The total effect of "${xVar}" on "${yVar}" ` +
            `(B = ${formatCoef(safePathC.estimate)}, ${formatPValue(safePathC.pValue)}) ` +
            `should be interpreted in the absence of demonstrated mediation.`;
    }

    warnings.push(
        'Baron and Kenny\'s (1986) causal-steps approach is now considered obsolete. ' +
        'The bootstrap indirect effect CI (Hayes, 2018) is the current methodological standard ' +
        'and provides more accurate Type I error control than the Sobel test.'
    );
    warnings.push(
        'Mediation analysis does not establish causality: it is a statistical, not experimental, test. ' +
        'Causal inference requires time precedence, covariation, and ruling out third-variable explanations.'
    );

    const medVerdict = mediationType !== 'none' && (bootstrapCI ? (bootstrapCI.lower > 0 || bootstrapCI.upper < 0) : sobelP < 0.05) ? 'pass' : 'warning';

    return {
        summary, details, warnings, citations,
        verdict: medVerdict,
        apaStatement: mediationType === 'full'
            ? `Full mediation: the indirect effect of "${xVar}" on "${yVar}" through "${mVar}" was statistically significant (a × b = ${formatCoef(indirectEffect)}${bootstrapCI ? `, 95% CI [${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]` : ''}), and the direct effect was non-significant (c′ = ${formatCoef(safePathCprime.estimate)}, ${formatPValue(safePathCprime.pValue)}).`
            : mediationType === 'partial'
                ? `Partial mediation: "${mVar}" significantly mediated the "${xVar}" → "${yVar}" relationship (indirect effect = ${formatCoef(indirectEffect)}${bootstrapCI ? `, 95% CI [${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]` : ''}); the direct effect remained significant (c′ = ${formatCoef(safePathCprime.estimate)}, ${formatPValue(safePathCprime.pValue)}).`
                : `No significant mediation was found for the "${xVar}" → "${mVar}" → "${yVar}" pathway (indirect effect = ${formatCoef(indirectEffect)}${bootstrapCI ? `, 95% CI [${formatCoef(bootstrapCI.lower)}, ${formatCoef(bootstrapCI.upper)}]` : ''}).`,
        recommendations: mediationType !== 'none'
            ? [
                'Use Hayes\' PROCESS macro (Model 4) or lavaan in R for standardised indirect effect reporting with bootstrap CIs.',
                'Report the proportion of mediation (indirect / total effect) as a supplementary effect size index.',
                'Acknowledge that mediation cannot establish causality — longitudinal or experimental designs are required for causal claims.',
              ]
            : [
                'A non-significant indirect effect may reflect insufficient power — bootstrap CIs for indirect effects require larger N than direct effects.',
                'Consider testing alternative mediators grounded in the theoretical model.',
                'Report the bootstrap CI for the indirect effect even when non-significant, to convey the bounds on the plausible effect.',
              ],
    };
}


// ─── MODERATION ANALYSIS ─────────────────────────────────────────────────────

export function interpretModeration(params: {
    xVar:                string;
    mVar:                string;
    yVar:                string;
    interactionTerm:     string;
    interactionEstimate: number;
    interactionP:        number;
    r2Change?:           number;
    r2ChangeP?:          number;
    simpleSlopes?:       { level: string; slope: number; pValue: number }[];
}): InterpretationResult {
    const {
        xVar, mVar, yVar,
        interactionTerm, r2Change, r2ChangeP, simpleSlopes
    } = params;
    const interactionEstimate = safeNum(params.interactionEstimate);
    const interactionP        = safeNum(params.interactionP, 1);

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hayes, A. F. (2018). Introduction to mediation, moderation, and conditional process analysis (2nd ed.). Guilford Press.',
        'Aiken, L. S., & West, S. G. (1991). Multiple regression: Testing and interpreting interactions. SAGE Publications.',
        'Cohen, J., Cohen, P., West, S. G., & Aiken, L. S. (2003). Applied multiple regression/correlation analysis for the behavioral sciences (3rd ed.). Lawrence Erlbaum Associates.',
    ];

    let summary = '';

    if (interactionP > 0.05) {
        summary =
            `Moderation analysis was conducted to test whether "${mVar}" moderated ` +
            `the effect of "${xVar}" on "${yVar}." ` +
            `The product term representing the interaction (${interactionTerm}) was not ` +
            `statistically significant: B = ${formatCoef(interactionEstimate)}, ` +
            `${formatPValue(interactionP)} (α = .05). ` +
            `The data do not support the hypothesis that the effect of "${xVar}" on ` +
            `"${yVar}" varies as a function of "${mVar}."`;
    } else {
        const direction = interactionEstimate > 0 ? 'strengthened' : 'attenuated';
        summary =
            `Moderation analysis revealed a statistically significant interaction between ` +
            `"${xVar}" and "${mVar}" in predicting "${yVar}" (α = .05): ` +
            `B = ${formatCoef(interactionEstimate)}, ${formatPValue(interactionP)}. ` +
            `This indicates that "${mVar}" moderates the effect of "${xVar}" on "${yVar}" — ` +
            `specifically, higher levels of "${mVar}" ${direction} this relationship. ` +
            `Simple slopes analysis at representative levels of "${mVar}" is recommended ` +
            `to characterise the nature of the interaction (Aiken & West, 1991).`;

        if (r2Change != null) {
            const sig = r2ChangeP != null && r2ChangeP < 0.05;
            details.push(
                `ΔR² due to interaction term: ${formatCoef(r2Change)} ` +
                `(${sig ? 'statistically significant' : 'not statistically significant'}` +
                `${r2ChangeP != null ? `, ${formatPValue(r2ChangeP)}` : ''}). ` +
                `ΔR² is the preferred effect size for moderation (Cohen et al., 2003): ` +
                `small ≈ .02, medium ≈ .15, large ≈ .35.`
            );
        }

        if (simpleSlopes && simpleSlopes.length > 0) {
            details.push('Simple slopes at representative levels of the moderator (Aiken & West, 1991):');
            for (const s of simpleSlopes) {
                const sig = s.pValue < 0.05;
                details.push(
                    `  • At ${s.level} of "${mVar}": slope = ${formatCoef(s.slope)}, ` +
                    `${formatPValue(s.pValue)} ` +
                    `(${sig ? 'statistically significant' : 'not significant'}).`
                );
            }
        }
    }

    warnings.push(
        'Mean-center both the predictor (X) and moderator (W) before computing the interaction term (X × W) ' +
        'to reduce non-essential multicollinearity and ensure main effects are interpretable as ' +
        'conditional effects at the mean of the other variable (Aiken & West, 1991).'
    );
    warnings.push(
        'A significant interaction in regression does not require significant main effects. ' +
        'Report and interpret the interaction term as the primary finding when moderation is the hypothesis.'
    );
    if (interactionP > 0.05) {
        warnings.push(
            'A non-significant interaction does not rule out moderation: insufficient statistical power ' +
            'is a common reason for failing to detect true interactions. ' +
            'Report ΔR² and its 90% CI to quantify the precision of the null result.'
        );
    }

    return {
        summary, details, warnings, citations,
        verdict: interactionP < 0.05 ? 'pass' : 'warning',
        apaStatement: interactionP < 0.05
            ? `Moderation analysis revealed a statistically significant interaction between "${xVar}" and "${mVar}" predicting "${yVar}", B = ${formatCoef(interactionEstimate)}, ${formatPValue(interactionP)}${r2Change != null ? `, ΔR² = ${formatCoef(r2Change)}` : ''}.`
            : `The interaction between "${xVar}" and "${mVar}" predicting "${yVar}" was not statistically significant, B = ${formatCoef(interactionEstimate)}, ${formatPValue(interactionP)}.`,
        recommendations: interactionP < 0.05
            ? [
                'Conduct simple slopes analysis at ±1 SD (and mean) of the moderator to characterise the interaction pattern.',
                'Create an interaction plot (predicted Y values across levels of X at different levels of W) for manuscript presentation.',
                'Report ΔR² as the primary effect size for the moderation effect (Cohen et al., 2003).',
              ]
            : [
                'Mean-center X and W before computing the interaction term to reduce non-essential multicollinearity.',
                'Verify the model is adequately powered — interactions typically require 4× the N of main effects for equivalent power.',
                'Report ΔR² and its 90% CI for the interaction term even when non-significant.',
              ],
    };
}


// ─── CLUSTER ANALYSIS ────────────────────────────────────────────────────────

export function interpretClusterAnalysis(params: {
    method:           string;
    nClusters:        number;
    totalSS:          number;
    withinSS:         number;
    betweenSS:        number;
    silhouetteScore?: number;
    clusterSizes?:    number[];
}): InterpretationResult {
    const { method, silhouetteScore, clusterSizes } = params;
    const nClusters      = safeNum(params.nClusters, 1);
    const totalSS        = safeNum(params.totalSS);
    const withinSS       = safeNum(params.withinSS);
    const betweenSS      = safeNum(params.betweenSS);

    const varianceExplained = totalSS > 0 ? betweenSS / totalSS : 0;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2019). Multivariate data analysis (8th ed.). Cengage Learning.',
        'Rousseeuw, P. J. (1987). Silhouettes: A graphical aid to the interpretation and validation of cluster analysis. Journal of Computational and Applied Mathematics, 20, 53–65. https://doi.org/10.1016/0377-0427(87)90125-7',
        'Everitt, B. S., Landau, S., Leese, M., & Stahl, D. (2011). Cluster analysis (5th ed.). Wiley.',
    ];

    let summary =
        `${method} cluster analysis was applied to identify naturally occurring subgroups ` +
        `in the data. The analysis identified ${nClusters} cluster${nClusters !== 1 ? 's' : ''}. ` +
        `The between-cluster sum of squares accounted for ${formatPct(varianceExplained)} ` +
        `of the total variance (between-SS = ${formatNum(betweenSS, 1)}, ` +
        `within-SS = ${formatNum(withinSS, 1)}, total SS = ${formatNum(totalSS, 1)}), ` +
        `${varianceExplained >= 0.60
            ? 'indicating well-separated, internally cohesive clusters.'
            : varianceExplained >= 0.50
                ? 'suggesting moderately differentiated clusters.'
                : 'suggesting limited cluster separation — solution validity should be verified.'}`;

    details.push(`Variance decomposition: between-SS / total SS = ${formatPct(varianceExplained)}.`);
    details.push(`Within-cluster SS = ${formatNum(withinSS, 1)} (${formatPct(withinSS / totalSS)} of total).`);
    details.push(`Between-cluster SS = ${formatNum(betweenSS, 1)} (${formatPct(varianceExplained)} of total).`);

    if (clusterSizes && clusterSizes.length > 0) {
        const total = clusterSizes.reduce((a, b) => a + b, 0);
        details.push(
            `Cluster composition: ` +
            clusterSizes.map((s, i) => `Cluster ${i + 1}: n = ${s} (${formatPct(s / total)})`).join('; ')
        );
        const minSize = Math.min(...clusterSizes);
        const minPct  = minSize / total;
        if (minPct < 0.05) {
            warnings.push(
                `Cluster ${clusterSizes.indexOf(minSize) + 1} contains only n = ${minSize} ` +
                `(${formatPct(minPct)} of total). Small clusters (< 5% of N) may reflect ` +
                `outlier agglomeration rather than a meaningful subgroup (Hair et al., 2019). ` +
                `Consider merging or removing this cluster.`
            );
        }
    }

    if (silhouetteScore != null) {
        let quality = '';
        if      (silhouetteScore >= 0.70) quality = 'strong (well-separated clusters)';
        else if (silhouetteScore >= 0.50) quality = 'reasonable (moderate separation)';
        else if (silhouetteScore >= 0.25) quality = 'weak (overlapping structure)';
        else                               quality = 'absent or artificial structure';

        details.push(
            `Average Silhouette Score = ${formatCoef(silhouetteScore)}: ${quality}. ` +
            `(Rousseeuw, 1987 benchmarks: > .70 strong, .50–.70 reasonable, .25–.50 weak, < .25 no structure.)`
        );
        if (silhouetteScore < 0.25) {
            warnings.push(
                `Silhouette Score = ${formatCoef(silhouetteScore)} indicates that the cluster ` +
                `structure is weak or artificial. Observations may be misassigned, or the ` +
                `data may not contain natural clusters. Evaluate alternative k values and ` +
                `consider hierarchical clustering to inspect the dendrogram.`
            );
        }
    }

    if (varianceExplained < 0.50) {
        warnings.push(
            `Between-cluster variance explained (${formatPct(varianceExplained)}) is below 50%. ` +
            `The cluster solution may not adequately differentiate subgroups. ` +
            `Try alternative cluster numbers using the elbow criterion or silhouette width maximisation.`
        );
    }

    warnings.push(
        'K-Means cluster solutions are sensitive to the initial random centroid selection and variable scaling. ' +
        'Standardise all input variables (z-scores) before clustering, and report results as one of multiple ' +
        'candidate solutions evaluated with internal validity indices (silhouette, CH index).'
    );
    warnings.push(
        'Cluster analysis is exploratory: the derived solution should be validated on a holdout sample ' +
        'or by comparing cluster profiles on theoretically meaningful external criterion variables.'
    );

    details.push(
        `APA 7 reporting: ${method} cluster analysis, k = ${nClusters}, ` +
        `${formatPct(varianceExplained)} between-cluster variance explained` +
        `${silhouetteScore != null ? `, silhouette = ${formatCoef(silhouetteScore)}` : ''}.`
    );

    const clusterVerdict = varianceExplained >= 0.50 && (silhouetteScore == null || silhouetteScore >= 0.25) ? 'pass' : 'warning';

    return {
        summary, details, warnings, citations,
        verdict: clusterVerdict,
        apaStatement: `${method} cluster analysis identified ${nClusters} cluster${nClusters !== 1 ? 's' : ''}, accounting for ${(varianceExplained * 100).toFixed(1)}% of total variance between clusters${silhouetteScore != null ? ` (silhouette = ${formatCoef(silhouetteScore)})` : ''}.`,
        recommendations: [
            varianceExplained < 0.50
                ? `Between-cluster variance (${(varianceExplained * 100).toFixed(1)}%) is below 50% — try k = ${nClusters + 1} and k = ${Math.max(2, nClusters - 1)} and compare using the elbow criterion and silhouette width.`
                : 'Validate the cluster solution by profiling clusters on theoretically meaningful external variables.',
            'Standardise all clustering variables (z-scores) before analysis to prevent scale-sensitive distortions.',
            'Run k-means with multiple random starts (≥ 25) and select the solution with the lowest total within-cluster SS.',
        ],
    };
}
