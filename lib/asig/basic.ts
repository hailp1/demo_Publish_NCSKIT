/**
 * ASIG — basic.ts
 * Interpreters: Descriptive Statistics, Correlation, Independent/Paired t-test,
 *               One-Way ANOVA, Two-Way ANOVA, Mann-Whitney U, Kruskal-Wallis,
 *               Wilcoxon Signed Rank, Chi-Square
 *
 * All prose conforms to APA 7th Edition reporting standards.
 * Each interpreter outputs publication-ready narrative with:
 *   - Exact test statistics and effect sizes
 *   - Assumption check summaries
 *   - Methodological context with primary citations
 */

import { formatPValue, formatCoef, formatNum, formatPct, InterpretationResult } from './shared';


// ─── DESCRIPTIVE STATISTICS ───────────────────────────────────────────────────

export function interpretDescriptive(params: {
    columnNames: string[];
    means:       number[];
    sds:         number[];
    skews:       number[];
    kurtoses:    number[];
    N:           number[];
}): InterpretationResult {
    const { columnNames, means, sds, skews, kurtoses, N } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'George, D., & Mallery, P. (2010). SPSS for Windows step by step: A simple guide and reference (10th ed.). Pearson.',
        'West, S. G., Finch, J. F., & Curran, P. J. (1995). Structural equation models with nonnormal variables: Solutions and recommendations. In R. H. Hoyle (Ed.), Structural equation modeling: Concepts, issues, and applications (pp. 56–75). SAGE.',
        'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2019). Multivariate data analysis (8th ed.). Cengage Learning.',
    ];

    const nonNormal: string[] = [];

    columnNames.forEach((name, i) => {
        const skew = skews[i];
        const kurt = kurtoses[i];
        // West et al. (1995): |skew| < 2 and |excess kurtosis| < 7 are acceptable for most SEM/regression
        const skewOk = Math.abs(skew) <= 2;
        const kurtOk = Math.abs(kurt) <= 7;   // excess kurtosis convention

        let note = `"${name}": M = ${formatNum(means[i])}, SD = ${formatNum(sds[i])}`;
        if (N[i] != null) note += `, N = ${N[i]}`;
        note += `; Skewness = ${formatNum(skew)}, Kurtosis (excess) = ${formatNum(kurt)}.`;

        if (!skewOk || !kurtOk) {
            nonNormal.push(name);
            const issues: string[] = [];
            if (!skewOk) issues.push(`|skewness| = ${formatNum(Math.abs(skew))} exceeds ±2`);
            if (!kurtOk) issues.push(`|excess kurtosis| = ${formatNum(Math.abs(kurt))} exceeds ±7`);
            warnings.push(
                `"${name}" shows signs of non-normality: ${issues.join('; ')} ` +
                `(West et al., 1995). Consider non-parametric alternatives or robust estimators.`
            );
        }

        details.push(note);
    });

    const nVar = columnNames.length;
    let summary = '';
    if (nonNormal.length === 0) {
        summary =
            `Descriptive statistics were computed for ${nVar} variable${nVar > 1 ? 's' : ''} (N = ${N[0]}). ` +
            `All variables demonstrated skewness values within ±2 and excess kurtosis within ±7 ` +
            `(West et al., 1995; George & Mallery, 2010), indicating approximate univariate normality ` +
            `and suitability for parametric analyses.`;
    } else {
        summary =
            `Descriptive statistics were computed for ${nVar} variable${nVar > 1 ? 's' : ''} (N = ${N[0]}). ` +
            `${nonNormal.length} of ${nVar} variable${nVar > 1 ? 's' : ''} — ` +
            `${nonNormal.join(', ')} — exhibited skewness or excess kurtosis values that ` +
            `exceed the commonly recommended thresholds (|skew| ≤ 2, |kurt| ≤ 7; West et al., 1995), ` +
            `suggesting departure from normality. Non-parametric alternatives or robust standard errors ` +
            `should be considered for analyses involving these variables.`;
    }

    return { summary, details, warnings, citations };
}


// ─── PEARSON / SPEARMAN / KENDALL CORRELATION ─────────────────────────────────

export function interpretCorrelation(params: {
    var1:    string;
    var2:    string;
    r:       number;
    pValue:  number;
    n?:      number;
    method?: 'pearson' | 'spearman' | 'kendall';
}): InterpretationResult {
    const { var1, var2, r, pValue, n, method = 'pearson' } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
        'Mukaka, M. M. (2012). Statistics corner: A guide to appropriate use of correlation coefficient in medical research. Malawi Medical Journal, 24(3), 69–71.',
    ];

    const methodLabel = method === 'pearson'
        ? 'Pearson product-moment correlation'
        : method === 'spearman'
            ? 'Spearman rank-order correlation'
            : 'Kendall rank correlation';

    const statSymbol = method === 'pearson' ? 'r' : method === 'spearman' ? 'rs' : 'τ';
    const dfStr = n != null ? `(${n - 2})` : '';
    const nStr  = n != null ? `, N = ${n}` : '';

    const absR    = Math.abs(r);
    const strength = absR < 0.10 ? 'negligible'
        : absR < 0.30 ? 'weak'
        : absR < 0.50 ? 'moderate'
        : absR < 0.70 ? 'moderately strong'
        : 'strong';

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `A ${methodLabel} was conducted to examine the linear relationship between ` +
            `"${var1}" and "${var2}." The analysis yielded a ${strength} association ` +
            `(${statSymbol}${dfStr} = ${formatCoef(r)}${nStr}, ${formatPValue(pValue)}), ` +
            `which did not reach statistical significance (α = .05). ` +
            `The 95% confidence interval should be reported alongside this result to bound the plausible range of effects.`;
    } else {
        const direction = r > 0 ? 'positive' : 'negative';

        summary =
            `A ${methodLabel} indicated a statistically significant ${strength} ${direction} ` +
            `association between "${var1}" and "${var2}" ` +
            `(${statSymbol}${dfStr} = ${formatCoef(r)}${nStr}, ${formatPValue(pValue)}). ` +
            `This finding suggests that ${r > 0 ? 'higher' : 'lower'} values of "${var1}" ` +
            `are systematically associated with ${r > 0 ? 'higher' : 'lower'} values of "${var2}." ` +
            `Note that a statistically significant correlation does not establish causality.`;

        const r2 = r * r;
        details.push(
            `Coefficient of determination: r² = ${formatCoef(r2)} — ` +
            `"${var1}" and "${var2}" share approximately ${formatPct(r2)} of their variance.`
        );
        details.push(
            `Effect size classification (Cohen, 1988): ` +
            `negligible |r| < .10; weak .10–.29; moderate .30–.49; strong ≥ .50.`
        );
    }

    warnings.push(
        'Correlation quantifies linear co-variation only. Inspect the scatter plot for non-linearity, ' +
        'heteroscedasticity, or influential data points that may distort the coefficient.'
    );
    if (method === 'pearson') {
        warnings.push(
            'Pearson r assumes interval-level measurement and approximate bivariate normality. ' +
            'For ordinal data, use Spearman rs or polychoric correlation.'
        );
    }

    return { summary, details, warnings, citations };
}


// ─── INDEPENDENT-SAMPLES T-TEST ───────────────────────────────────────────────

export function interpretTTestIndependent(params: {
    groupVar:   string;
    targetVar:  string;
    group1Name: string;
    group2Name: string;
    mean1:      number;
    sd1:        number;
    mean2:      number;
    sd2:        number;
    t:          number;
    df:         number;
    pValue:     number;
    cohensD?:   number;
    leveneP?:   number;
    shapiroP1?: number;
    shapiroP2?: number;
}): InterpretationResult {
    const {
        groupVar, targetVar, group1Name, group2Name,
        mean1, sd1, mean2, sd2, t, df, pValue,
        cohensD, leveneP, shapiroP1, shapiroP2
    } = params;

    const isWelch = leveneP != null && leveneP < 0.05;
    const testName = isWelch ? "Welch's t-test" : 'an independent-samples t-test';

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
        'Delacre, M., Lakens, D., & Leys, C. (2017). Why psychologists should by default use Welch\'s t-test. International Review of Social Psychology, 30(1), 92–101.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    const meanDiff   = Math.abs(mean1 - mean2);
    const higherGroup = mean1 > mean2 ? group1Name : group2Name;
    const lowerGroup  = mean1 > mean2 ? group2Name : group1Name;
    const mH = Math.max(mean1, mean2);
    const mL = Math.min(mean1, mean2);
    const sdH = mean1 > mean2 ? sd1 : sd2;
    const sdL = mean1 > mean2 ? sd2 : sd1;

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `${isWelch ? "Welch's t-test" : 'An independent-samples t-test'} ` +
            `(${isWelch ? 'Welch\'s correction applied due to unequal variances' : 'equal variances assumed'}) ` +
            `was conducted to compare "${targetVar}" between the ${group1Name} group ` +
            `(M = ${formatNum(mean1)}, SD = ${formatNum(sd1)}) ` +
            `and the ${group2Name} group (M = ${formatNum(mean2)}, SD = ${formatNum(sd2)}). ` +
            `The difference in means (ΔM = ${formatNum(meanDiff)}) was not statistically significant ` +
            `at α = .05: t(${formatNum(df, 0)}) = ${formatNum(t)}, ${formatPValue(pValue)}. ` +
            `Interpret the 95% confidence interval for the mean difference to gauge the range of plausible effects.`;
    } else {
        summary =
            `${isWelch ? "Welch's t-test" : 'An independent-samples t-test'} ` +
            `(${isWelch ? 'Welch\'s correction applied due to unequal variances' : 'equal variances assumed'}) ` +
            `revealed a statistically significant difference in "${targetVar}" ` +
            `between the ${group1Name} group (M = ${formatNum(mH)}, SD = ${formatNum(sdH)}) ` +
            `and the ${group2Name} group (M = ${formatNum(mL)}, SD = ${formatNum(sdL)}), ` +
            `t(${formatNum(df, 0)}) = ${formatNum(t)}, ${formatPValue(pValue)}, α = .05. ` +
            `The ${higherGroup} group scored significantly higher than the ${lowerGroup} group ` +
            `(ΔM = ${formatNum(meanDiff)}).`;
    }

    // Effect size
    if (cohensD != null) {
        const d = Math.abs(cohensD);
        const label = d < 0.20 ? 'negligible'
            : d < 0.50 ? 'small'
            : d < 0.80 ? 'medium'
            : 'large';
        details.push(
            `Effect size: Cohen's d = ${formatNum(cohensD)} (${label}; ` +
            `Cohen's benchmarks: negligible < .20, small .20–.49, medium .50–.79, large ≥ .80).`
        );
        if (d < 0.20 && pValue < 0.05) {
            warnings.push(
                `The effect size (d = ${formatNum(cohensD)}) is negligible despite statistical significance. ` +
                `With large N, even trivial differences reach significance; practical importance should be evaluated carefully.`
            );
        }
    }

    // Assumption checks
    if (isWelch) {
        warnings.push(
            `Levene's Test indicated unequal variances (${formatPValue(leveneP!)}). ` +
            `Welch's t-test was applied, which is robust to heteroscedasticity ` +
            `(Delacre et al., 2017; recommended as the default t-test).`
        );
    }
    if (shapiroP1 != null && shapiroP1 < 0.05) {
        warnings.push(
            `The ${group1Name} group violated the normality assumption ` +
            `(Shapiro-Wilk, ${formatPValue(shapiroP1)}). ` +
            `The Mann-Whitney U test is recommended as a non-parametric alternative ` +
            `when normality cannot be assumed.`
        );
    }
    if (shapiroP2 != null && shapiroP2 < 0.05) {
        warnings.push(
            `The ${group2Name} group violated the normality assumption ` +
            `(Shapiro-Wilk, ${formatPValue(shapiroP2)}). ` +
            `Consider the Mann-Whitney U test as a robust alternative.`
        );
    }

    details.push(
        `APA 7 reporting format: ` +
        `t(${formatNum(df, 0)}) = ${formatNum(t)}, ${formatPValue(pValue)}` +
        `${cohensD != null ? `, d = ${formatNum(Math.abs(cohensD))}` : ''}.`
    );

    return { summary, details, warnings, citations };
}


// ─── PAIRED-SAMPLES T-TEST ────────────────────────────────────────────────────

export function interpretTTestPaired(params: {
    targetVar:      string;
    meanBefore:     number;
    sdBefore:       number;
    meanAfter:      number;
    sdAfter:        number;
    meanDiff:       number;
    t:              number;
    df:             number;
    pValue:         number;
    cohensD?:       number;
    normalityDiffP?: number;
}): InterpretationResult {
    const {
        targetVar, meanBefore, sdBefore, meanAfter, sdAfter,
        meanDiff, t, df, pValue, cohensD, normalityDiffP
    } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    const direction = meanDiff > 0 ? 'decreased' : 'increased';

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `A paired-samples t-test was conducted to evaluate change in "${targetVar}" ` +
            `across two related measurement occasions. ` +
            `The mean difference between pre-test (M = ${formatNum(meanBefore)}, SD = ${formatNum(sdBefore)}) ` +
            `and post-test (M = ${formatNum(meanAfter)}, SD = ${formatNum(sdAfter)}) ` +
            `(ΔM = ${formatNum(Math.abs(meanDiff))}) did not reach statistical significance ` +
            `at α = .05: t(${formatNum(df, 0)}) = ${formatNum(t)}, ${formatPValue(pValue)}. ` +
            `A 95% CI for the mean difference should be reported to convey the precision of the estimate.`;
    } else {
        summary =
            `A paired-samples t-test indicated a statistically significant change in ` +
            `"${targetVar}" between the two measurement occasions (α = .05), ` +
            `t(${formatNum(df, 0)}) = ${formatNum(t)}, ${formatPValue(pValue)}. ` +
            `Mean scores ${direction} from the pre-test ` +
            `(M = ${formatNum(meanBefore)}, SD = ${formatNum(sdBefore)}) ` +
            `to the post-test ` +
            `(M = ${formatNum(meanAfter)}, SD = ${formatNum(sdAfter)}), ` +
            `yielding a mean difference of ${formatNum(Math.abs(meanDiff))}.`;
    }

    if (cohensD != null) {
        const d = Math.abs(cohensD);
        const label = d < 0.20 ? 'negligible'
            : d < 0.50 ? 'small'
            : d < 0.80 ? 'medium'
            : 'large';
        details.push(
            `Effect size: Cohen's d = ${formatNum(cohensD)} (${label} effect). ` +
            `Cohen's d for paired data uses the SD of difference scores as the standardizer; ` +
            `benchmarks: negligible < .20, small .20–.49, medium .50–.79, large ≥ .80 (Cohen, 1988).`
        );
    }

    details.push(
        `APA 7 reporting: t(${formatNum(df, 0)}) = ${formatNum(t)}, ${formatPValue(pValue)}` +
        `${cohensD != null ? `, d = ${formatNum(Math.abs(cohensD))}` : ''}.`
    );

    if (normalityDiffP != null && normalityDiffP > 0 && normalityDiffP < 0.05) {
        warnings.push(
            `The distribution of difference scores violated normality ` +
            `(Shapiro-Wilk, ${formatPValue(normalityDiffP)}). ` +
            `The Wilcoxon Signed-Rank Test is recommended as a non-parametric alternative. ` +
            `The t-test is robust to moderate non-normality when N ≥ 30.`
        );
    }

    return { summary, details, warnings, citations };
}


// ─── ONE-WAY ANOVA ────────────────────────────────────────────────────────────

export function interpretANOVA(params: {
    factorVar:        string;
    targetVar:        string;
    F:                number;
    dfBetween:        number;
    dfWithin:         number;
    pValue:           number;
    etaSquared?:      number;
    methodUsed?:      string;
    leveneP?:         number;
    normalityResidP?: number;
    postHoc?:         { comparison: string; diff: number; pAdj: number }[];
}): InterpretationResult {
    const {
        factorVar, targetVar, F, dfBetween, dfWithin, pValue,
        etaSquared, methodUsed, leveneP, normalityResidP, postHoc
    } = params;

    const isWelch = methodUsed?.toLowerCase().includes('welch') ?? false;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
        'Richardson, J. T. E. (2011). Eta squared and partial eta squared as measures of effect size in educational research. Educational Research Review, 6(2), 135–147.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `${isWelch ? 'A Welch one-way ANOVA' : 'A one-way ANOVA'} was conducted ` +
            `to examine whether "${targetVar}" differed across levels of "${factorVar}." ` +
            `The omnibus F-test was not statistically significant (α = .05): ` +
            `F(${formatNum(dfBetween, 0)}, ${formatNum(dfWithin, 0)}) = ${formatNum(F)}, ` +
            `${formatPValue(pValue)}. The null hypothesis of equal population group means ` +
            `was retained. Inspect the 95% CIs on group means to evaluate the practical ` +
            `magnitude of any observed differences.`;
    } else {
        summary =
            `${isWelch ? 'A Welch one-way ANOVA' : 'A one-way ANOVA'} revealed a ` +
            `statistically significant effect of "${factorVar}" on "${targetVar}" (α = .05): ` +
            `F(${formatNum(dfBetween, 0)}, ${formatNum(dfWithin, 0)}) = ${formatNum(F)}, ` +
            `${formatPValue(pValue)}. Post-hoc pairwise comparisons are required to ` +
            `determine which specific groups differ — an omnibus F does not identify ` +
            `the location of differences.`;

        if (postHoc) {
            const sigPairs = postHoc.filter(p => p.pAdj < 0.05);
            if (sigPairs.length > 0) {
                details.push(
                    `Post-hoc comparisons (${isWelch ? 'Games-Howell' : 'Tukey HSD'}) ` +
                    `identified the following significantly different pairs: ` +
                    `${sigPairs.map(p => `${p.comparison} (pₐdⱼ ${p.pAdj < 0.001 ? '< .001' : '= ' + formatCoef(p.pAdj)})`).join('; ')}.`
                );
            } else {
                details.push(
                    `Post-hoc pairwise comparisons did not identify any significantly different ` +
                    `group pairs after adjustment for multiple comparisons — the omnibus effect ` +
                    `may reflect overall pattern heterogeneity without specific pair-wise separation.`
                );
            }
        }
    }

    if (etaSquared != null) {
        const label = etaSquared < 0.01 ? 'negligible'
            : etaSquared < 0.06 ? 'small'
            : etaSquared < 0.14 ? 'medium'
            : 'large';
        details.push(
            `Effect size: η² = ${formatCoef(etaSquared)} (${label}; Cohen, 1988 benchmarks: ` +
            `.01 small, .06 medium, .14 large). η² represents the proportion of total ` +
            `variance in "${targetVar}" attributable to group membership. ` +
            `Note: η² is positively biased in small samples; ω² provides a less biased estimate.`
        );
        if (etaSquared < 0.01 && pValue < 0.05) {
            warnings.push(
                `η² = ${formatCoef(etaSquared)} is negligible despite statistical significance. ` +
                `The result is likely driven by large N rather than a meaningful group effect.`
            );
        }
    }

    if (isWelch && leveneP != null) {
        warnings.push(
            `Levene's test was significant (${formatPValue(leveneP)}), ` +
            `indicating heteroscedasticity. Welch's ANOVA was applied; ` +
            `its test statistic is robust to unequal variances.`
        );
    }
    if (normalityResidP != null && normalityResidP < 0.05) {
        warnings.push(
            `Residuals violated normality (Shapiro-Wilk, ${formatPValue(normalityResidP)}). ` +
            `ANOVA is moderately robust to this violation when group sizes are ≥ 15; ` +
            `for smaller groups, the Kruskal-Wallis H test is recommended.`
        );
    }

    details.push(
        `APA 7 reporting format: F(${formatNum(dfBetween, 0)}, ${formatNum(dfWithin, 0)}) = ${formatNum(F)}, ` +
        `${formatPValue(pValue)}${etaSquared != null ? `, η² = ${formatCoef(etaSquared)}` : ''}.`
    );

    return { summary, details, warnings, citations };
}


// ─── TWO-WAY ANOVA ────────────────────────────────────────────────────────────

export function interpretTwoWayANOVA(params: {
    factor1:       string;
    factor2:       string;
    targetVar:     string;
    mainEffect1F:  number;
    mainEffect1P:  number;
    mainEffect2F:  number;
    mainEffect2P:  number;
    interactionF:  number;
    interactionP:  number;
    df1:           number;
    df2:           number;
    dfError:       number;
}): InterpretationResult {
    const {
        factor1, factor2, targetVar,
        mainEffect1F, mainEffect1P,
        mainEffect2F, mainEffect2P,
        interactionF, interactionP,
        df1, df2, dfError
    } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
        'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
    ];

    const hasInteraction = interactionP < 0.05;
    const hasMain1       = mainEffect1P < 0.05;
    const hasMain2       = mainEffect2P < 0.05;
    const dfInteraction  = df1 * df2;   // correct interaction df

    let summary = '';

    if (hasInteraction) {
        summary =
            `A two-way between-subjects ANOVA was conducted to examine the effects of ` +
            `"${factor1}" and "${factor2}" on "${targetVar}." ` +
            `A statistically significant interaction effect was obtained (α = .05): ` +
            `F(${formatNum(dfInteraction, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(interactionF)}, ` +
            `${formatPValue(interactionP)}. ` +
            `This indicates that the effect of "${factor1}" on "${targetVar}" depends on ` +
            `the level of "${factor2}" (and vice versa). ` +
            `When a significant interaction is present, main effects must not be interpreted in isolation — ` +
            `simple effects analysis (spotlight analysis) is required to fully decompose the interaction.`;
        warnings.push(
            'A statistically significant interaction overrides the main effects: interpret simple effects ' +
            '(the effect of each factor at each level of the other factor) rather than main effects alone.'
        );
    } else {
        const mainEffects: string[] = [];
        if (hasMain1) mainEffects.push(
            `"${factor1}" (F(${formatNum(df1, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(mainEffect1F)}, ${formatPValue(mainEffect1P)})`
        );
        if (hasMain2) mainEffects.push(
            `"${factor2}" (F(${formatNum(df2, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(mainEffect2F)}, ${formatPValue(mainEffect2P)})`
        );

        if (mainEffects.length > 0) {
            summary =
                `A two-way between-subjects ANOVA revealed no statistically significant interaction ` +
                `between "${factor1}" and "${factor2}" (α = .05): ` +
                `F(${formatNum(dfInteraction, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(interactionF)}, ` +
                `${formatPValue(interactionP)}. ` +
                `However, significant main effect${mainEffects.length > 1 ? 's' : ''} were observed for ` +
                `${mainEffects.join(' and ')}, ` +
                `indicating that each factor independently influences "${targetVar}." ` +
                `Main effects are interpretable in the absence of a significant interaction.`;
        } else {
            summary =
                `A two-way between-subjects ANOVA indicated neither a statistically significant ` +
                `interaction (F(${formatNum(dfInteraction, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(interactionF)}, ` +
                `${formatPValue(interactionP)}) nor significant main effects ` +
                `for "${factor1}" or "${factor2}" on "${targetVar}" (α = .05).`;
        }
    }

    details.push(`Main effect of "${factor1}": F(${formatNum(df1, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(mainEffect1F)}, ${formatPValue(mainEffect1P)}.`);
    details.push(`Main effect of "${factor2}": F(${formatNum(df2, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(mainEffect2F)}, ${formatPValue(mainEffect2P)}.`);
    details.push(`Interaction (${factor1} × ${factor2}): F(${formatNum(dfInteraction, 0)}, ${formatNum(dfError, 0)}) = ${formatNum(interactionF)}, ${formatPValue(interactionP)}.`);
    details.push('Report partial η² (ηₚ²) as the effect size for each effect in a two-way design, as η² is confounded by other effects in the model (Cohen, 1988).');

    return { summary, details, warnings, citations };
}


// ─── MANN-WHITNEY U TEST ─────────────────────────────────────────────────────

export function interpretMannWhitney(params: {
    group1Name:     string;
    group2Name:     string;
    targetVar:      string;
    statistic:      number;
    pValue:         number;
    median1:        number;
    median2:        number;
    effectSize?:    number;
    distShapeRun?:  string;
}): InterpretationResult {
    const { group1Name, group2Name, targetVar, statistic, pValue, median1, median2, effectSize, distShapeRun } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Mann, H. B., & Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics, 18(1), 50–60. https://doi.org/10.1214/aoms/1177730491',
        'Fritz, C. O., Morris, P. E., & Richler, J. J. (2012). Effect size estimates: Current use, calculations, and interpretation. Journal of Experimental Psychology: General, 141(1), 2–18.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    const higherGroup = median1 > median2 ? group1Name : group2Name;
    const lowerGroup  = median1 > median2 ? group2Name : group1Name;

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `A Mann-Whitney U test was conducted as a non-parametric alternative to the ` +
            `independent-samples t-test, to compare the rank distribution of "${targetVar}" ` +
            `between the ${group1Name} (Mdn = ${formatNum(median1)}) ` +
            `and ${group2Name} (Mdn = ${formatNum(median2)}) groups. ` +
            `The test did not reach statistical significance (α = .05): ` +
            `U = ${formatNum(statistic, 0)}, ${formatPValue(pValue)}.`;
    } else {
        summary =
            `A Mann-Whitney U test indicated a statistically significant difference ` +
            `in the rank distribution of "${targetVar}" between groups (α = .05): ` +
            `U = ${formatNum(statistic, 0)}, ${formatPValue(pValue)}. ` +
            `The ${higherGroup} group (Mdn = ${formatNum(Math.max(median1, median2))}) ` +
            `demonstrated significantly higher ranks than the ` +
            `${lowerGroup} group (Mdn = ${formatNum(Math.min(median1, median2))}).`;
    }

    if (effectSize != null) {
        const r = Math.abs(effectSize);
        const label = r < 0.10 ? 'negligible'
            : r < 0.30 ? 'small'
            : r < 0.50 ? 'medium'
            : 'large';
        details.push(
            `Effect size: rank-biserial correlation r = ${formatCoef(effectSize)} (${label}). ` +
            `Computed as |z| / √N; benchmarks per Cohen (1988): ` +
            `negligible < .10, small .10–.29, medium .30–.49, large ≥ .50 (Fritz et al., 2012).`
        );
    }

    if (distShapeRun) {
        details.push(distShapeRun);
    }

    warnings.push(
        'The Mann-Whitney U test evaluates stochastic dominance (rank-ordering), not specifically medians. ' +
        'Medians are valid descriptors only when the distributional shapes of the two groups are identical. ' +
        'Report medians alongside the U statistic for interpretability.'
    );

    details.push(
        `APA 7 reporting: U = ${formatNum(statistic, 0)}, ${formatPValue(pValue)}` +
        `${effectSize != null ? `, r = ${formatCoef(Math.abs(effectSize))}` : ''}.`
    );

    return { summary, details, warnings, citations };
}


// ─── KRUSKAL-WALLIS H TEST ────────────────────────────────────────────────────

export function interpretKruskalWallis(params: {
    factorVar:   string;
    targetVar:   string;
    statistic:   number;
    df:          number;
    pValue:      number;
    medians:     number[];
    groupNames?: string[];
}): InterpretationResult {
    const { factorVar, targetVar, statistic, df, pValue, medians, groupNames } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Kruskal, W. H., & Wallis, W. A. (1952). Use of ranks in one-criterion variance analysis. Journal of the American Statistical Association, 47(260), 583–621. https://doi.org/10.2307/2280779',
        'Dunn, O. J. (1964). Multiple comparisons using rank sums. Technometrics, 6(3), 241–252.',
        'Tomczak, M., & Tomczak, E. (2014). The need to report effect size estimates revisited. Trends in Sport Sciences, 1(21), 19–25.',
    ];

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `A Kruskal-Wallis H test was conducted as a non-parametric omnibus test ` +
            `to compare the rank distributions of "${targetVar}" across levels of "${factorVar}." ` +
            `The test did not reach statistical significance (α = .05): ` +
            `H(${df}) = ${formatNum(statistic)}, ${formatPValue(pValue)}, ` +
            `indicating no significant difference in rank distributions across groups.`;
    } else {
        summary =
            `A Kruskal-Wallis H test revealed a statistically significant difference ` +
            `in the rank distributions of "${targetVar}" across groups of "${factorVar}" ` +
            `(α = .05): H(${df}) = ${formatNum(statistic)}, ${formatPValue(pValue)}. ` +
            `Post-hoc pairwise comparisons using Dunn's test with Bonferroni (or Holm) ` +
            `correction are required to identify which specific group pairs account ` +
            `for the overall difference.`;

        const medStr = medians
            .map((m, i) => `${groupNames?.[i] ?? `Group ${i + 1}`}: Mdn = ${formatNum(m)}`)
            .join('; ');
        details.push(`Group medians: ${medStr}.`);
        details.push(
            `Follow-up: Dunn's test (Dunn, 1964) with Bonferroni or Holm correction ` +
            `provides pairwise comparisons that control familywise error rate.`
        );
        warnings.push(
            'Report ε² (epsilon squared) or η²H as the effect size for Kruskal-Wallis: ' +
            'ε² = H / (N − 1); benchmarks: small ≈ .01, medium ≈ .06, large ≈ .14 ' +
            '(Tomczak & Tomczak, 2014).'
        );
    }

    warnings.push(
        'The Kruskal-Wallis H test compares rank distributions, not medians per se. ' +
        'Medians are descriptively appropriate when group distributional shapes are similar.'
    );

    details.push(
        `APA 7 reporting: H(${df}) = ${formatNum(statistic)}, ${formatPValue(pValue)}.`
    );

    return { summary, details, warnings, citations };
}


// ─── WILCOXON SIGNED-RANK TEST ────────────────────────────────────────────────

export function interpretWilcoxonSigned(params: {
    targetVar:   string;
    statistic:   number;
    pValue:      number;
    medianDiff:  number;
    effectSize?: number;
}): InterpretationResult {
    const { targetVar, statistic, pValue, medianDiff, effectSize } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Wilcoxon, F. (1945). Individual comparisons by ranking methods. Biometrics Bulletin, 1(6), 80–83.',
        'Fritz, C. O., Morris, P. E., & Richler, J. J. (2012). Effect size estimates: Current use, calculations, and interpretation. Journal of Experimental Psychology: General, 141(1), 2–18.',
        'Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE Publications.',
    ];

    const direction = medianDiff > 0 ? 'decreased' : 'increased';

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `A Wilcoxon Signed-Rank Test was conducted as a non-parametric alternative ` +
            `to the paired-samples t-test, to assess change in "${targetVar}" between ` +
            `two related measurement occasions. ` +
            `The test did not reach statistical significance (α = .05): ` +
            `W = ${formatNum(statistic, 0)}, ${formatPValue(pValue)}, ` +
            `with a median difference of ${formatNum(Math.abs(medianDiff))} (pseudo-median of differences).`;
    } else {
        summary =
            `A Wilcoxon Signed-Rank Test indicated a statistically significant change ` +
            `in "${targetVar}" between the two measurement occasions (α = .05): ` +
            `W = ${formatNum(statistic, 0)}, ${formatPValue(pValue)}. ` +
            `Scores ${direction} significantly, with a median difference of ` +
            `${formatNum(Math.abs(medianDiff))}.`;
    }

    if (effectSize != null) {
        const r = Math.abs(effectSize);
        const label = r < 0.10 ? 'negligible'
            : r < 0.30 ? 'small'
            : r < 0.50 ? 'medium'
            : 'large';
        details.push(
            `Effect size: r = ${formatCoef(effectSize)} (${label}; computed as z / √N). ` +
            `Benchmarks: negligible < .10, small .10–.29, medium .30–.49, large ≥ .50 (Fritz et al., 2012).`
        );
    }

    details.push(
        `The Wilcoxon Signed-Rank Test ranks the absolute values of pair differences ` +
        `and tests whether positive and negative ranks differ systematically. ` +
        `It does not assume normality of the outcome variable, only that the ` +
        `difference scores are symmetrically distributed around zero under H₀.`
    );
    details.push(
        `APA 7 reporting: W = ${formatNum(statistic, 0)}, ${formatPValue(pValue)}` +
        `${effectSize != null ? `, r = ${formatCoef(Math.abs(effectSize))}` : ''}.`
    );

    warnings.push(
        'Report the counts of positive, negative, and tied pairs to provide full ' +
        'transparency about the rank distribution (recommended by APA 7).'
    );

    return { summary, details, warnings, citations };
}


// ─── CHI-SQUARE TEST OF INDEPENDENCE ─────────────────────────────────────────

export function interpretChiSquare(params: {
    var1:          string;
    var2:          string;
    statistic:     number;
    df:            number;
    pValue:        number;
    cramersV:      number;
    fisherPValue?: number | null;
    warning?:      string;
    n?:            number;
}): InterpretationResult {
    const { var1, var2, statistic, df, pValue, cramersV, fisherPValue, warning, n } = params;

    const details:   string[] = [];
    const warnings:  string[] = [];
    const citations: string[] = [
        'Cramér, H. (1946). Mathematical methods of statistics. Princeton University Press.',
        'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
        'Agresti, A. (2013). Categorical data analysis (3rd ed.). Wiley.',
    ];

    const nStr = n != null ? `, N = ${n}` : '';
    const label = cramersV < 0.10 ? 'negligible'
        : cramersV < 0.30 ? 'weak'
        : cramersV < 0.50 ? 'moderate'
        : 'strong';

    let summary = '';

    if (pValue > 0.05) {
        summary =
            `A Pearson chi-square test of independence was conducted to examine ` +
            `the association between "${var1}" and "${var2}." ` +
            `The test was not statistically significant (α = .05): ` +
            `χ²(${df}${nStr}) = ${formatNum(statistic)}, ${formatPValue(pValue)}. ` +
            `The data are consistent with the assumption of statistical independence ` +
            `between the two categorical variables ` +
            `(Cramér's V = ${formatCoef(cramersV)}, indicating a ${label} association).`;
    } else {
        summary =
            `A Pearson chi-square test of independence indicated a statistically ` +
            `significant association between "${var1}" and "${var2}" (α = .05): ` +
            `χ²(${df}${nStr}) = ${formatNum(statistic)}, ${formatPValue(pValue)}. ` +
            `The strength of association was ${label} ` +
            `(Cramér's V = ${formatCoef(cramersV)}). ` +
            `Inspection of the observed and expected frequency tables identifies ` +
            `which cells deviate most from the independence model.`;
        details.push(
            `Effect size benchmarks for Cramér's V (for df = 1): ` +
            `negligible < .10, weak .10–.29, moderate .30–.49, strong ≥ .50 (Cohen, 1988). ` +
            `For tables with df > 1, adjusted benchmarks apply.`
        );
    }

    if (fisherPValue != null) {
        const fisherSig = fisherPValue < 0.05;
        details.push(
            `Fisher's Exact Test (applied for 2×2 tables or cells with expected frequency < 5): ` +
            `${formatPValue(fisherPValue)}${fisherSig ? ' — statistically significant (α = .05)' : ' — not statistically significant'}.`
        );
    }

    details.push(
        `APA 7 reporting: χ²(${df}${nStr}) = ${formatNum(statistic)}, ${formatPValue(pValue)}, V = ${formatCoef(cramersV)}.`
    );

    warnings.push(
        'Chi-square assumes expected cell frequencies ≥ 5 in at least 80% of cells and ≥ 1 in all cells. ' +
        'When this assumption is violated, use Fisher\'s Exact Test (2×2) or collapse rare categories.'
    );
    warnings.push(
        'Chi-square tests association, not directionality or causality. For ordered categorical data, ' +
        'consider Goodman-Kruskal gamma or Kendall\'s tau-b to leverage the ordinal information.'
    );

    if (warning) {
        warnings.push(warning);
    }

    return { summary, details, warnings, citations };
}
