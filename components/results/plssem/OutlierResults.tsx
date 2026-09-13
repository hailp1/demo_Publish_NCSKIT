'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UnifiedASIGInterpretation } from '@/components/results/shared/UnifiedASIGInterpretation';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface OutlierResultsProps {
    results: any;
    columns?: string[];
}

/**
 * Outlier Detection Results Component
 * Displays Mahalanobis distance outlier analysis
 */
export const OutlierResults = React.memo(function OutlierResults({
    results,
    columns
}: OutlierResultsProps) {
    const nOutliers = results.n_outliers || 0;
    const outlierIndices = results.outlier_indices || [];
    const mahalDistances = results.mahalanobis_distances || [];
    const cutoffValue = results.cutoff_value || 0;
    const percentageOutliers = results.percentage_outliers || 0;

    const hasOutliers = nOutliers > 0;

    return (
        <div className="space-y-8 font-sans text-gray-900">
            {/* Summary Card */}
            <div className={`rounded-xl p-6 border-2 ${hasOutliers ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {hasOutliers ? (
                                <>
                                    <AlertTriangle className="w-7 h-7 text-red-600" />
                                    Outliers Detected
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                    No Outliers Detected
                                </>
                            )}
                        </h3>
                        <p className="text-sm text-gray-700">
                            Mahalanobis Distance Analysis (p &lt; 0.001)
                        </p>
                    </div>
                    <div className={`text-center px-6 py-4 rounded-lg border-2 ${hasOutliers ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
                        <div className={`text-4xl font-bold ${hasOutliers ? 'text-red-700' : 'text-green-700'}`}>
                            {nOutliers}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${hasOutliers ? 'text-red-600' : 'text-green-600'}`}>
                            Outliers
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Detection Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Total Observations</div>
                            <div className="text-2xl font-bold text-gray-900">{mahalDistances.length}</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-xs text-red-600 mb-1">Outliers Found</div>
                            <div className="text-2xl font-bold text-red-700">{nOutliers}</div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <div className="text-xs text-orange-600 mb-1">Percentage</div>
                            <div className="text-2xl font-bold text-orange-700">{percentageOutliers.toFixed(2)}%</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-600 mb-1">Cutoff Value (χ²)</div>
                            <div className="text-2xl font-bold text-blue-700">{cutoffValue.toFixed(2)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Outlier List */}
            {hasOutliers && (
                <Card className="border-2 border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Outlier Cases (Row Numbers)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-800 font-medium mb-2">
                                The following {nOutliers} observations have Mahalanobis distances exceeding the critical value:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {outlierIndices.slice(0, 50).map((idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold"
                                    >
                                        Row {idx}
                                    </span>
                                ))}
                                {outlierIndices.length > 50 && (
                                    <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-sm">
                                        +{outlierIndices.length - 50} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Recommended Actions
                            </h4>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• <strong>Investigate</strong>: Review these cases for data entry errors or unusual response patterns</li>
                                <li>• <strong>Decide</strong>: Consider whether to exclude, transform, or keep these observations</li>
                                <li>• <strong>Report</strong>: Document your decision in the methodology section</li>
                                <li>• <strong>Sensitivity Analysis</strong>: Re-run analyses with and without outliers to check robustness</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Outliers Message */}
            {!hasOutliers && (
                <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-green-900 text-lg mb-2">
                                    Data Quality: Excellent ✓
                                </h4>
                                <p className="text-sm text-green-800">
                                    No multivariate outliers were detected in your dataset. All observations fall within the expected range based on Mahalanobis distance analysis (p &lt; 0.001).
                                </p>
                                <p className="text-xs text-green-700 mt-2 italic">
                                    You can proceed with confidence to the next analysis steps.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Methodology Note */}
            <Card>
                <CardHeader>
                    <CardTitle>Methodology: Mahalanobis Distance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p>
                            <strong>Method</strong>: Mahalanobis distance measures how far each observation is from the center of the data distribution, accounting for correlations between variables.
                        </p>
                        <p>
                            <strong>Cutoff</strong>: Chi-square critical value at p &lt; 0.001 with {columns?.length || 'n'} degrees of freedom = {cutoffValue.toFixed(2)}
                        </p>
                        <p>
                            <strong>Interpretation</strong>: Observations with Mahalanobis distance &gt; {cutoffValue.toFixed(2)} are flagged as potential multivariate outliers.
                        </p>
                        <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t border-gray-200">
                            Reference: Tabachnick, B. G., & Fidell, L. S. (2013). Using Multivariate Statistics (6th ed.). Pearson.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Template Interpretation */}
            <UnifiedASIGInterpretation
                analysisType="outlier"
                results={{
                    nOutliers: results.n_outliers ?? results.nOutliers ?? 0,
                    totalN: results.total_n ?? results.totalN ?? (results.n_outliers != null ? results.n_outliers + 100 : 100),
                    cutoffValue: results.cutoff_value ?? results.cutoffValue ?? 0,
                    method: results.method || 'Mahalanobis Distance',
                }}
            />
        </div>
    );
});

export default OutlierResults;
