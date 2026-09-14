import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, FileText, Activity, Info, BarChart } from 'lucide-react';
import { UnifiedASIGInterpretation } from '@/components/results/shared/UnifiedASIGInterpretation';

interface ChiSquareResultsProps {
    results: any;
    columns?: string[];
    variableNames?: {
        rowVar?: string;
        colVar?: string;
    };
}

/**
 * Chi-Square Test Results Component - Scientific Academic Style (White & Blue)
 */
export const ChiSquareResults = React.memo(function ChiSquareResults({ results, columns, variableNames }: ChiSquareResultsProps) {
    if (!results) return null;

    const { statistic, df, observed, expected, cramersV } = results;
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
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi-Square (χ²)</p>
                        <p className="text-2xl font-black text-blue-900">{typeof statistic === 'number' ? statistic.toFixed(3) : '-'}</p>
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
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cramer&apos;s V</p>
                        <p className="text-2xl font-black text-indigo-900">{cramersV?.toFixed(3) || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Observed Counts */}
                {observed && observed.cols && (
                <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-blue-50 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-600" />
                            Observed Frequencies (Tần số Quan sát)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-slate-700">
                            <thead className="bg-blue-50/50 border-y border-blue-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-black text-blue-900 uppercase">Variable</th>
                                    {observed.cols.map((c: string, i: number) => (
                                        <th key={i} className="py-4 px-4 text-xs font-black text-blue-900 uppercase text-center">{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {observed.rows?.map((r: string, idx: number) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-5 px-6 text-sm font-bold text-blue-800">{r}</td>
                                        {observed.data?.[idx]?.map((val: number, i: number) => (
                                            <td key={i} className="py-5 px-4 text-sm text-center font-mono font-bold text-slate-900">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* Expected Counts */}
                {expected && expected.cols && (
                <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden opacity-80">
                    <div className="px-6 py-4 border-b border-blue-50 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-4 h-4 text-slate-400" />
                            Expected Frequencies (Tần số Kỳ vọng)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-slate-500">
                            <thead className="bg-slate-50 border-y border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase">Variable</th>
                                    {expected.cols.map((c: string, i: number) => (
                                        <th key={i} className="py-4 px-4 text-xs font-black text-slate-500 uppercase text-center">{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {expected.rows?.map((r: string, idx: number) => (
                                    <tr key={idx}>
                                        <td className="py-5 px-6 text-sm font-medium">{r}</td>
                                        {expected.data?.[idx]?.map((val: number, i: number) => (
                                            <td key={i} className="py-5 px-4 text-sm text-center font-mono">{val.toFixed(1)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>

            {/* Professional Template Interpretation */}
            <UnifiedASIGInterpretation 
                analysisType="chisquare"
                results={results}
                variableNames={variableNames}
            />
        </div>
    );
});

export default ChiSquareResults;

