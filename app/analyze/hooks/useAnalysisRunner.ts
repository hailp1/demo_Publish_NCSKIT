'use client';

import { useState } from 'react';
import { runCorrelation, runDescriptiveStats, getWebRStatus } from '@/lib/webr-wrapper';
import { getAnalysisCost, checkBalance, deductCreditsAtomic } from '@/lib/ncs-credits';

export function useAnalysisRunner({
    data,
    getNumericColumns,
    user,
    setStep,
    setAnalysisType,
    setRequiredCredits,
    setCurrentAnalysisCost,
    setShowInsufficientCredits,
    setNcsBalance,
    setResults,
    setToast,
    handleAnalysisError
}: any) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    const runAnalysis = async (type: string) => {
        const webRStatus = getWebRStatus();
        if (!webRStatus.isReady) {
            setToast(
                webRStatus.isLoading 
                    ? 'R Engine đang khởi động, vui lòng đợi vài giây rồi thử lại.' 
                    : 'R Engine chưa sẵn sàng. Vui lòng đợi và thử lại.', 
                'info'
            );
            return;
        }

        setIsAnalyzing(true);
        setAnalysisType(type);
        let progressInterval: NodeJS.Timeout | undefined;
        let analysisCost = 0;

        try {
            const numericColumns = getNumericColumns();

            if (numericColumns.length < 2) {
                setToast('Cần ít nhất 2 biến số để phân tích', 'error');
                setIsAnalyzing(false);
                return;
            }

            // Types that just redirect to their respective view components
            const redirectMap: Record<string, string> = {
                'ttest': 'ttest-select',
                'ttest-indep': 'ttest-select',
                'ttest-paired': 'ttest-paired-select',
                'anova': 'anova-select',
                'efa': 'efa-select',
                'cfa': 'cfa-select',
                'sem': 'sem-select',
                'cronbach': 'cronbach-select',
                'regression': 'regression-select',
                'logistic': 'logistic-select',
                'mediation': 'mediation-select',
                'moderation': 'moderation-select',
                'chisquare': 'chisq-select',
                'chisq': 'chisq-select',
                'mann-whitney': 'mannwhitney-select',
                'kruskal-wallis': 'kruskalwallis-select',
                'wilcoxon': 'wilcoxon-select',
                'plssem': 'plssem-select',
                'htmt': 'htmt-select',
                'twoway-anova': 'twoway-anova-select',
                'fisher': 'fisher-select',
                'cluster': 'cluster-select',
            };

            if (redirectMap[type]) {
                setIsAnalyzing(false);
                setStep(redirectMap[type]);
                return;
            }

            // --- Types that run directly without variable selection ---
            if (user) {
                analysisCost = await getAnalysisCost(type);
                const { hasEnough } = await checkBalance(user.id, analysisCost);
                if (!hasEnough) {
                    setRequiredCredits(analysisCost);
                    setCurrentAnalysisCost(analysisCost);
                    setShowInsufficientCredits(true);
                    setIsAnalyzing(false);
                    return;
                }
                
                if (analysisCost > 0) {
                    const description = type === 'correlation' ? 'Correlation Matrix' : 'Descriptive Statistics';
                    const { success, isExempt, newBalance, error: deductError } = await deductCreditsAtomic(user.id, analysisCost, description);
                    if (!success) {
                        setToast(deductError || 'Không đủ NCS để thực hiện phân tích', 'error');
                        setIsAnalyzing(false);
                        return;
                    }
                    if (!isExempt) setNcsBalance(newBalance);
                }
            }

            setAnalysisProgress(0);
            progressInterval = setInterval(() => {
                setAnalysisProgress(prev => Math.min(prev + 10, 90));
            }, 300);

            const numericData = data.map((row: any) =>
                numericColumns.map((col: string) => {
                    const v = row[col];
                    if (v === null || v === undefined || v === '' || v === 'NA') return null;
                    const n = Number(v);
                    return isNaN(n) ? null : n;
                })
            );

            let analysisResults: any;
            setAnalysisProgress(30);

            switch (type) {
                case 'correlation':
                    analysisResults = await runCorrelation(numericData);
                    break;
                case 'descriptive':
                    analysisResults = await runDescriptiveStats(numericData);
                    break;
                default:
                    throw new Error(`Phân tích '${type}' không được hỗ trợ chạy trực tiếp.`);
            }

            clearInterval(progressInterval);
            setAnalysisProgress(100);

            const formattedResults = {
                type,
                data: analysisResults,
                variables: numericColumns,
                timestamp: new Date().toISOString()
            };

            setResults(formattedResults);
            setStep('results');

            // Scroll to results
            setTimeout(() => {
                const resultsEl = document.getElementById('results-section');
                if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (err: any) {
            if (progressInterval) clearInterval(progressInterval);
            handleAnalysisError(err);
        } finally {
            setIsAnalyzing(false);
            if (progressInterval) clearInterval(progressInterval);
        }
    };

    return {
        isAnalyzing,
        setIsAnalyzing,
        analysisProgress,
        runAnalysis
    };
}
