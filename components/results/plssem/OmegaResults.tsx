'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UnifiedASIGInterpretation } from '@/components/results/shared/UnifiedASIGInterpretation';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface OmegaResultsProps {
    results: any;
    columns?: string[];
    scaleName?: string;
}

/**
 * McDonald's Omega Results Component
 * Displays Omega reliability statistics
 */
export const OmegaResults = React.memo(function OmegaResults({
    results,
    columns,
    scaleName
}: OmegaResultsProps) {
    const omegaTotal = results.omega_total || results.omega || 0;
    const omegaH = results.omega_hierarchical || results.omegaHierarchical || 0;
    const alpha = results.alpha || 0;
    const interpretation = results.interpretation || 'N/A';

    // Determine quality badge
    const getQualityBadge = (value: number) => {
        if (value >= 0.7) {
            return { text: 'Good', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle };
        } else if (value >= 0.6) {
            return { text: 'Acceptable', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Info };
        } else {
            return { text: 'Poor', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle };
        }
    };

    const badge = getQualityBadge(omegaTotal);
    const BadgeIcon = badge.icon;

    return (
        <div className="space-y-8 font-sans text-gray-900">
            {/* Header with Badge */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-purple-900 mb-1">
                            McDonald&apos;s Omega: {scaleName || 'Analysis'}
                        </h3>
                        <p className="text-sm text-purple-700">
                            Độ tin cậy thang đo (Composite Reliability)
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${badge.color}`}>
                        <BadgeIcon className="w-5 h-5" />
                        <span className="font-bold">{badge.text}</span>
                    </div>
                </div>
            </div>

            {/* Reliability Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Reliability Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-2 pr-4 font-semibold text-gray-700">Measure</th>
                                <th className="py-2 pr-4 font-semibold text-gray-700">Value</th>
                                <th className="py-2 pr-4 font-semibold text-gray-700">Interpretation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100 bg-purple-50">
                                <td className="py-3 pr-4 font-bold text-purple-900">McDonald&apos;s Omega (Total)</td>
                                <td className="py-3 pr-4 font-bold text-purple-900 text-lg">{omegaTotal.toFixed(3)}</td>
                                <td className="py-3 pr-4 font-medium text-purple-700">{interpretation}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-medium text-gray-700">Omega Hierarchical (ωh)</td>
                                <td className="py-2 pr-4 text-gray-600">{omegaH.toFixed(3)}</td>
                                <td className="py-2 pr-4 text-xs text-gray-500 italic">General factor saturation</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-medium text-gray-600">Cronbach&apos;s Alpha (for comparison)</td>
                                <td className="py-2 pr-4 text-gray-600">{alpha.toFixed(3)}</td>
                                <td className="py-2 pr-4 text-xs text-gray-500 italic">Traditional reliability</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Interpretation Guide */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Interpretation Guide
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• <strong>ω ≥ 0.70</strong>: Good reliability (recommended for research)</li>
                            <li>• <strong>ω ≥ 0.60</strong>: Acceptable reliability (exploratory research)</li>
                            <li>• <strong>ω &lt; 0.60</strong>: Poor reliability (consider scale revision)</li>
                            <li className="mt-2 pt-2 border-t border-gray-200">
                                💡 <strong>Omega vs Alpha</strong>: Omega is more accurate because it accounts for different item loadings, while Alpha assumes equal loadings (tau-equivalence).
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Card */}
            {Math.abs(omegaTotal - alpha) > 0.05 && (
                <Card className="border-2 border-amber-200 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="text-amber-900 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Notable Difference Detected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-amber-800">
                            There is a difference of <strong>{Math.abs(omegaTotal - alpha).toFixed(3)}</strong> between Omega and Alpha.
                            This suggests that items may have <strong>unequal factor loadings</strong>, making Omega a more appropriate measure.
                        </p>
                        <p className="text-xs text-amber-700 mt-2 italic">
                            Recommendation: Report Omega as the primary reliability measure in your manuscript.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Template Interpretation */}
            <UnifiedASIGInterpretation
                analysisType="omega"
                results={results}
                scaleName={scaleName}
            />
        </div>
    );
});

export default OmegaResults;
