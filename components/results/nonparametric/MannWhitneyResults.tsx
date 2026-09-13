import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, FileText, Activity, Info, BarChart } from 'lucide-react';
import { TemplateInterpretation } from '@/components/TemplateInterpretation';

interface MannWhitneyResultsProps {
    results: any;
    columns?: string[];
    variableNames?: {
        groupVar?: string;
        targetVar?: string;
        group1?: string;
        group2?: string;
    };
}

/**
 * Mann-Whitney U Test Results Component - Scientific Academic Style (White & Blue)
 */
export const MannWhitneyResults = React.memo(function MannWhitneyResults({ results, columns, variableNames }: MannWhitneyResultsProps) {
    if (!results) return null;
    const { statistic, median1, median2, effectSize } = results;
    const pValue     = typeof results.pValue === 'number' ? results.pValue : null;
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
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statistic (U)</p>
                        <p className="text-2xl font-black text-blue-900">{statistic}</p>
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
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effect Size (r)</p>
                        <p className="text-2xl font-black text-indigo-900">{effectSize?.toFixed(3) || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Median Comparison Table */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        Median Comparison (So sánh Trung vị)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-slate-700">
                        <thead className="bg-blue-50/50 border-y border-blue-100">
                            <tr>
                                <th className="py-4 px-6 text-xs font-black text-blue-900 uppercase">Group</th>
                                <th className="py-4 px-4 text-xs font-black text-blue-900 uppercase text-right">Median</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            <tr className="hover:bg-blue-50/30 transition-colors">
                                <td className="py-5 px-6 text-sm font-bold text-slate-700">{variableNames?.group1 || 'Group 1'}</td>
                                <td className="py-5 px-4 text-sm text-right font-mono font-bold text-blue-900">{median1?.toFixed(3)}</td>
                            </tr>
                            <tr className="hover:bg-blue-50/30 transition-colors">
                                <td className="py-5 px-6 text-sm font-bold text-slate-700">{variableNames?.group2 || 'Group 2'}</td>
                                <td className="py-5 px-4 text-sm text-right font-mono font-bold text-blue-900">{median2?.toFixed(3)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Professional Template Interpretation */}
            <TemplateInterpretation 
                analysisType="mann_whitney"
                results={results}
                variableNames={variableNames}
            />
        </div>
    );
});

export default MannWhitneyResults;

