import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, FileText, Activity, Info, BarChart } from 'lucide-react';
import { UnifiedASIGInterpretation } from '@/components/results/shared/UnifiedASIGInterpretation';

interface WilcoxonResultsProps {
    results: any;
    columns?: string[];
    variableNames?: {
        targetVar?: string;
    };
}

/**
 * Wilcoxon Signed Rank Test Results Component - Scientific Academic Style (White & Blue)
 */
export const WilcoxonResults = React.memo(function WilcoxonResults({ results, columns, variableNames }: WilcoxonResultsProps) {
    if (!results) return null;
    const pValue      = typeof results.pValue === 'number' ? results.pValue : null;
    const significant = pValue != null && pValue < 0.05;
    const fmtP = (p: number | null) => p == null ? 'N/A' : p < 0.001 ? '< .001' : p.toFixed(3);

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Quick Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statistic (V)</p>
                        <p className="text-2xl font-black text-blue-900">{results.statistic?.toFixed(1)}</p>
                    </div>
                </div>
                <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <Info className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">p-value</p>
                        <p className={`text-2xl font-black ${significant ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {fmtP(pValue)}
                        </p>
                    </div>
                </div>
                <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <BarChart className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Median Diff.</p>
                        <p className="text-2xl font-black text-indigo-900">{results.medianDiff?.toFixed(3)}</p>
                    </div>
                </div>
            </div>

            {/* Professional Template Interpretation */}
            <UnifiedASIGInterpretation 
                analysisType="wilcoxon"
                results={results}
                variableNames={variableNames}
            />
        </div>
    );
});

export default WilcoxonResults;

