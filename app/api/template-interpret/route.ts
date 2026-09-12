import { NextRequest, NextResponse } from 'next/server';
import {
    generateInterpretation,
    interpretCronbachAlpha,
    interpretCorrelation,
    interpretTTestIndependent,
    interpretTTestPaired,
    interpretANOVA,
    interpretTwoWayANOVA,
    interpretLinearRegression,
    interpretLogisticRegression,
    interpretMannWhitney,
    interpretKruskalWallis,
    interpretWilcoxonSigned,
    interpretChiSquare,
    interpretEFA,
    interpretCFA,
    interpretMediation,
    interpretModeration,
    interpretClusterAnalysis,
    interpretDescriptive,
    interpretVIF,
    interpretOutlier,
    interpretHTMT,
    interpretPLSSEM,
    InterpretationResult
} from '@/lib/asig';
import { validateOrigin } from '@/utils/csrf-protection';
import { checkRateLimit } from '@/utils/rate-limit';

/**
 * Template-based interpretation endpoint (NO AI COST!)
 * 
 * This uses pre-defined academic templates based on ASIG specifications
 * to generate interpretations without calling external AI APIs.
 */
export async function POST(req: NextRequest) {
    try {
        // Origin validation (CSRF protection)
        if (!validateOrigin(req)) {
            return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
        }

        // Rate limiting (10 requests/minute/IP — template interpretation is cheap)
        const rateLimitResult = await checkRateLimit(req, 10);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
                { status: 429 }
            );
        }

        const { analysisType, results, scaleName, variableNames } = await req.json();

        if (!analysisType || !results) {
            return NextResponse.json(
                { error: 'Missing analysisType or results' },
                { status: 400 }
            );
        }

        let interpretation: InterpretationResult;

        switch (analysisType) {
            case 'cronbach':
            case 'cronbach_alpha':
                interpretation = interpretCronbachAlpha({
                    scaleName: scaleName || 'Thang đo',
                    nItems: results.nItems || 0,
                    alpha: results.alpha || results.rawAlpha || 0,
                    omega: results.omega || undefined,
                    badItems: results.badItems || []
                });
                break;

            case 'correlation':
                interpretation = interpretCorrelation({
                    var1: variableNames?.[0] || 'Biến 1',
                    var2: variableNames?.[1] || 'Biến 2',
                    r: results.r || results.correlation || 0,
                    pValue: results.pValue || results.p || 0,
                    method: results.method || 'pearson'
                });
                break;

            case 'ttest':
            case 'ttest_independent':
                interpretation = interpretTTestIndependent({
                    groupVar: variableNames?.groupVar || 'Biến phân nhóm',
                    targetVar: variableNames?.targetVar || 'Biến phụ thuộc',
                    group1Name: variableNames?.group1 || 'Nhóm 1',
                    group2Name: variableNames?.group2 || 'Nhóm 2',
                    mean1: results.mean1 || 0,
                    sd1: results.sd1 || 0,
                    mean2: results.mean2 || 0,
                    sd2: results.sd2 || 0,
                    t: results.t || 0,
                    df: results.df || 0,
                    pValue: results.pValue || 0,
                    cohensD: results.effectSize || results.cohensD,
                    leveneP: results.assumptionCheckP || results.leveneP,
                    shapiroP1: results.normalityP1,
                    shapiroP2: results.normalityP2
                });
                break;

            case 'anova':
            case 'one_way_anova':
                interpretation = interpretANOVA({
                    factorVar: variableNames?.factorVar || 'Biến phân nhóm',
                    targetVar: variableNames?.targetVar || 'Biến phụ thuộc',
                    F: results.F || 0,
                    dfBetween: results.dfBetween || 0,
                    dfWithin: results.dfWithin || 0,
                    pValue: results.pValue || 0,
                    etaSquared: results.etaSquared,
                    methodUsed: results.methodUsed,
                    leveneP: results.assumptionCheckP,
                    normalityResidP: results.normalityResidP,
                    postHoc: results.postHoc
                });
                break;

            case 'regression':
            case 'linear_regression':
                interpretation = interpretLinearRegression({
                    dependentVar: variableNames?.dependent || 'Biến phụ thuộc',
                    rSquared: results.modelFit?.rSquared || 0,
                    adjRSquared: results.modelFit?.adjRSquared || 0,
                    fStatistic: results.modelFit?.fStatistic || 0,
                    fPValue: results.modelFit?.pValue || 0,
                    coefficients: results.coefficients || [],
                    normalityP: results.modelFit?.normalityP
                });
                break;

            case 'logistic':
            case 'logistic_regression':
                interpretation = interpretLogisticRegression({
                    dependentVar: variableNames?.dependent || 'Biến phụ thuộc',
                    pseudoR2: results.modelFit?.pseudoR2 || 0,
                    accuracy: results.modelFit?.accuracy || 0,
                    coefficients: results.coefficients || []
                });
                break;

            case 'chi_square':
            case 'chisquare':
                interpretation = interpretChiSquare({
                    var1: variableNames?.[0] || 'Biến 1',
                    var2: variableNames?.[1] || 'Biến 2',
                    statistic: results.statistic || 0,
                    df: results.df || 0,
                    pValue: results.pValue || 0,
                    cramersV: results.cramersV || 0,
                    fisherPValue: results.fisherPValue,
                    warning: results.warning
                });
                break;

            case 'efa':
                interpretation = interpretEFA({
                    kmo: results.kmo || 0,
                    bartlettP: results.bartlettP || 0,
                    nFactors: results.nFactorsUsed || 0,
                    factorMethod: results.factorMethod || 'kaiser',
                    totalVariance: results.totalVariance
                });
                break;

            case 'cfa':
                interpretation = interpretCFA({
                    chi2: results.fitMeasures?.chisq || 0,
                    df: results.fitMeasures?.df || 0,
                    pValue: results.fitMeasures?.pvalue || 0,
                    cfi: results.fitMeasures?.cfi || 0,
                    tli: results.fitMeasures?.tli || 0,
                    rmsea: results.fitMeasures?.rmsea || 0,
                    srmr: results.fitMeasures?.srmr || 0
                });
                break;

            case 'mediation':
                interpretation = interpretMediation({
                    xVar: variableNames?.x || 'X',
                    mVar: variableNames?.m || 'M',
                    yVar: variableNames?.y || 'Y',
                    pathA: results.pathA || { estimate: 0, pValue: 1 },
                    pathB: results.pathB || { estimate: 0, pValue: 1 },
                    pathC: results.pathC || { estimate: 0, pValue: 1 },
                    pathCprime: results.pathCprime || { estimate: 0, pValue: 1 },
                    indirectEffect: results.indirectEffect || 0,
                    sobelZ: results.sobelZ || 0,
                    sobelP: results.sobelP || 1,
                    bootstrapCI: results.bootstrapCI,
                    mediationType: results.mediationType || 'none'
                });
                break;

            case 'moderation':
                interpretation = interpretModeration({
                    xVar: variableNames?.x || 'X',
                    mVar: variableNames?.m || 'M',
                    yVar: variableNames?.y || 'Y',
                    interactionTerm: results.interactionTerm || 'X:M',
                    interactionEstimate: results.interactionEstimate || 0,
                    interactionP: results.interactionP || 1,
                    simpleSlopes: results.slopes
                });
                break;

            case 'ttest_paired':
            case 'ttest-paired':
                interpretation = interpretTTestPaired({
                    targetVar: variableNames?.targetVar || 'Dependent Variable',
                    meanBefore: results.meanBefore || 0,
                    sdBefore: results.sdBefore || 0,
                    meanAfter: results.meanAfter || 0,
                    sdAfter: results.sdAfter || 0,
                    meanDiff: results.meanDiff || 0,
                    t: results.t || 0,
                    df: results.df || 0,
                    pValue: results.pValue || 0,
                    cohensD: results.effectSize,
                    normalityDiffP: results.normalityDiffP
                });
                break;

            case 'two_way_anova':
            case 'twoway-anova':
                interpretation = interpretTwoWayANOVA({
                    factor1: variableNames?.factor1 || 'Factor 1',
                    factor2: variableNames?.factor2 || 'Factor 2',
                    targetVar: variableNames?.targetVar || 'Dependent Variable',
                    mainEffect1F: results.factor1F || 0,
                    mainEffect1P: results.factor1P ?? 1,
                    mainEffect2F: results.factor2F || 0,
                    mainEffect2P: results.factor2P ?? 1,
                    interactionF: results.interactionF || 0,
                    interactionP: results.interactionP ?? 1,
                    df1: results.factor1Df || 0,
                    df2: results.factor2Df || 0,
                    dfError: results.residualDf || 0
                });
                break;

            case 'mann_whitney':
            case 'mann-whitney':
                interpretation = interpretMannWhitney({
                    group1Name: variableNames?.group1 || 'Group 1',
                    group2Name: variableNames?.group2 || 'Group 2',
                    targetVar: variableNames?.targetVar || 'Dependent Variable',
                    statistic: results.statistic || 0,
                    pValue: results.pValue || 0,
                    median1: results.median1 || 0,
                    median2: results.median2 || 0,
                    effectSize: results.effectSize
                });
                break;

            case 'kruskal_wallis':
            case 'kruskal-wallis':
            case 'kruskal':
                interpretation = interpretKruskalWallis({
                    factorVar: variableNames?.factorVar || 'Grouping Variable',
                    targetVar: variableNames?.targetVar || 'Dependent Variable',
                    statistic: results.statistic || 0,
                    df: results.df || 0,
                    pValue: results.pValue || 0,
                    medians: results.medians || []
                });
                break;

            case 'wilcoxon_signed':
            case 'wilcoxon-signed':
            case 'wilcoxon':
                interpretation = interpretWilcoxonSigned({
                    targetVar: variableNames?.targetVar || 'Dependent Variable',
                    statistic: results.statistic || 0,
                    pValue: results.pValue || 0,
                    medianDiff: results.medianDiff || 0
                });
                break;

            case 'cluster':
            case 'cluster_analysis':
                interpretation = interpretClusterAnalysis({
                    method: results.method || 'K-Means',
                    nClusters: results.nClusters || results.k || 0,
                    totalSS: results.totalSS || 0,
                    withinSS: results.totWithinSS || 0,
                    betweenSS: results.betweensSS || 0,
                    silhouetteScore: results.silhouetteScore
                });
                break;

            case 'descriptive':
            case 'descriptive_stats':
                interpretation = interpretDescriptive({
                    columnNames: results.columnNames || [],
                    means: results.mean || [],
                    sds: results.sd || [],
                    skews: results.skew || [],
                    kurtoses: results.kurtosis || [],
                    N: results.N || []
                });
                break;

            case 'vif':
                interpretation = interpretVIF({
                    vifValues: results.vif_values || [],
                    variableNames: results.variable_names || []
                });
                break;

            case 'outlier':
                interpretation = interpretOutlier({
                    nOutliers: results.n_outliers || 0,
                    totalN: results.mahalanobis_distances?.length || 0,
                    cutoffValue: results.cutoff_value || 0
                });
                break;

            case 'htmt':
                interpretation = interpretHTMT({
                    htmtMatrix: results.htmt_matrix || [],
                    factorNames: results.factor_names || [],
                    threshold: results.threshold || 0.85
                });
                break;

            case 'pls-sem':
            case 'plssem':
                interpretation = interpretPLSSEM({
                    fornell_larcker: results.fornell_larcker,
                    htmt: results.htmt,
                    r_squared: results.r_squared,
                    ave: results.ave,
                    compositeReliability: results.compositeReliability,
                    pathCoefficients: results.pathCoefficients
                });
                break;

            default:
                interpretation = {
                    summary: `No ASIG template is registered for analysis type "${analysisType}". Please contact the development team.`,
                    details: [],
                    warnings: ['This analysis type is not yet supported by the ASIG template engine.'],
                    citations: []
                };
        }

        // Format response similar to AI endpoint for compatibility
        const formattedResponse = formatAsMarkdown(interpretation);

        return NextResponse.json({
            success: true,
            interpretation,
            // Legacy format for backward compatibility
            explanation: formattedResponse,
            structured: {
                summary: interpretation.summary,
                details: interpretation.details,
                warnings: interpretation.warnings,
                citations: interpretation.citations
            }
        });

    } catch (error) {
        console.error('Template interpretation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate interpretation' },
            { status: 500 }
        );
    }
}

/**
 * Format interpretation as Markdown for display
 */
function formatAsMarkdown(result: InterpretationResult): string {
    const lines: string[] = [];

    // Summary
    lines.push('## Kết quả phân tích\n');
    lines.push(result.summary);
    lines.push('');

    // Details
    if (result.details.length > 0) {
        lines.push('### Chi tiết\n');
        for (const detail of result.details) {
            lines.push(`- ${detail}`);
        }
        lines.push('');
    }

    // Warnings
    if (result.warnings.length > 0) {
        lines.push('### Lưu ý\n');
        for (const warning of result.warnings) {
            lines.push(`> [!] ${warning}`);
        }
        lines.push('');
    }

    // Citations
    if (result.citations.length > 0) {
        lines.push('### Tài liệu tham khảo\n');
        for (const citation of result.citations) {
            lines.push(`- ${citation}`);
        }
    }

    return lines.join('\n');
}

