import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, FileText, Activity, Info, BarChart } from 'lucide-react';
import { TemplateInterpretation } from '@/components/TemplateInterpretation';

interface KruskalWallisResultsProps {
    results: any;
    columns?: string[];
    variableNames?: {
        factorVar?: string;
        targetVar?: string;
    };
}

/**
 * Kruskal-Wallis Test Results Component - Scientific Academic Style (White & Blue)
 */
export const KruskalWallisResults = React.memo(function KruskalWallisResults({ results, columns, variableNames }: KruskalWallisResultsProps) {
    if (!results) return null;

    const pValue   = typeof results.pValue === 'number' ? results.pValue : null;
    const significant = pValue != null && pValue < 0.05;

    const fmtP = (p: number | null) => {
        if (p == null) return 'N/A';
        if (p < 0.001) return '< .001';
        return p.toFixed(3);
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Quick Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-blue-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">H Statistic</p>
                        <p className="text-2xl font-black text-blue-900">{results.statistic?.toFixed(3)}</p>
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
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">df</p>
                        <p className="text-2xl font-black text-indigo-900">{results.df}</p>
                    </div>
                </div>
            </div>

            {/* Group Medians Table */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        Group Medians
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
                            {results.medians?.map((median: number | null | undefined, idx: number) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="py-5 px-6 text-sm font-bold text-slate-700">Group {idx + 1}</td>
                                    <td className="py-5 px-4 text-sm text-right font-mono font-bold text-blue-900">
                                        {typeof median === 'number' ? median.toFixed(3) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Professional Template Interpretation */}
            <TemplateInterpretation 
                analysisType="kruskal_wallis"
                results={results}
                variableNames={variableNames}
            />
        </div>
    );
});

export default KruskalWallisResults;

