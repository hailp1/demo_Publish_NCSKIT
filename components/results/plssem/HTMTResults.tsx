'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UnifiedASIGInterpretation } from '@/components/results/shared/UnifiedASIGInterpretation';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface HTMTResultsProps {
    results: any;
    factorStructure?: { name: string; items: number[] }[];
}

/**
 * HTMT Matrix Results Component
 * Displays Heterotrait-Monotrait Ratio for discriminant validity
 */
export const HTMTResults = React.memo(function HTMTResults({
    results,
    factorStructure
}: HTMTResultsProps) {
    const htmtMatrix = results.htmt_matrix || [];
    const factorNames = results.factor_names || factorStructure?.map(f => f.name) || [];
    const threshold = results.threshold || 0.85;
    const hasIssues = results.has_issues || false;

    return (
        <div className="space-y-8 font-sans text-gray-900">
            {/* Summary Card */}
            <div className={`rounded-xl p-6 border-2 ${hasIssues ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {hasIssues ? (
                                <>
                                    <AlertCircle className="w-7 h-7 text-red-600" />
                                    Discriminant Validity Issues Detected
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                    Good Discriminant Validity
                                </>
                            )}
                        </h3>
                        <p className="text-sm text-gray-700">
                            HTMT Threshold: {threshold} ({threshold === 0.85 ? 'Strict' : 'Lenient'})
                        </p>
                    </div>
                </div>
            </div>

            {/* HTMT Matrix Table */}
            <Card>
                <CardHeader>
                    <CardTitle>HTMT Matrix (Heterotrait-Monotrait Ratio)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="py-3 px-4 font-semibold text-gray-700">Factor</th>
                                    {factorNames.map((name: string, idx: number) => (
                                        <th key={idx} className="py-3 px-4 font-semibold text-center text-gray-700">
                                            {name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {htmtMatrix.map((row: number[], rowIdx: number) => (
                                    <tr key={rowIdx} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium text-gray-900">
                                            {factorNames[rowIdx]}
                                        </td>
                                        {row.map((value: number, colIdx: number) => {
                                            const isAboveThreshold = value > threshold;
                                            const isDiagonal = rowIdx === colIdx;

                                            return (
                                                <td
                                                    key={colIdx}
                                                    className={`py-3 px-4 text-center ${isDiagonal
                                                        ? 'bg-gray-100 text-gray-400'
                                                        : isAboveThreshold
                                                            ? 'bg-red-100 text-red-700 font-bold'
                                                            : 'text-gray-600'
                                                        }`}
                                                >
                                                    {isDiagonal ? '-' : value.toFixed(3)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Interpretation Guide
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• <strong>HTMT &lt; {threshold}</strong>: Good discriminant validity (factors are distinct)</li>
                            <li>• <strong>HTMT ≥ {threshold}</strong>: <span className="text-red-600 font-bold">Problematic</span> - factors may be too similar</li>
                            <li className="mt-2 pt-2 border-t border-gray-200">
                                💡 <strong>Red cells</strong> indicate potential discriminant validity issues. Consider revising your measurement model.
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Issues Card */}
            {hasIssues && (
                <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-900 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Recommended Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-red-800 space-y-2">
                            <li>• <strong>Review factor definitions</strong>: Check if items are loading on the correct factors</li>
                            <li>• <strong>Remove problematic items</strong>: Consider removing items that cause high HTMT values</li>
                            <li>• <strong>Theoretical justification</strong>: Ensure factors are conceptually distinct</li>
                            <li>• <strong>Alternative criteria</strong>: Consider using Fornell-Larcker criterion as additional evidence</li>
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Methodology Note */}
            <Card>
                <CardHeader>
                    <CardTitle>Methodology: HTMT Criterion</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p>
                            <strong>Method</strong>: HTMT (Heterotrait-Monotrait Ratio) assesses discriminant validity by comparing the average correlations between items measuring different constructs to the average correlations between items measuring the same construct.
                        </p>
                        <p>
                            <strong>Threshold</strong>: {threshold === 0.85 ? 'Strict criterion (0.85) recommended for conceptually similar constructs' : 'Lenient criterion (0.90) acceptable for conceptually distinct constructs'}
                        </p>
                        <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t border-gray-200">
                            Reference: Henseler, J., Ringle, C. M., & Sarstedt, M. (2015). A new criterion for assessing discriminant validity in variance-based structural equation modeling. Journal of the Academy of Marketing Science, 43(1), 115-135.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* ASIG Interpretation */}
            <UnifiedASIGInterpretation
                analysisType="htmt"
                results={{
                    htmtMatrix: results.htmt_matrix || results.htmtMatrix || [],
                    factorNames: results.factor_names || results.factorNames || [],
                    threshold: results.threshold || 0.85,
                }}
            />
        </div>
    );
});

export default HTMTResults;
