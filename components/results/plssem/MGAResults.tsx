'use client';

import { Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MGAResultsProps {
    results: {
        group_means: { [key: string]: number };
        p_value: number;
        significant_difference: boolean;
    };
}

export default function MGAResults({ results }: MGAResultsProps) {
    if (!results) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <p className="text-red-800 font-medium">Không có kết quả MGA</p>
                </div>
            </div>
        );
    }

    const { group_means, p_value, significant_difference } = results;
    const groups = Object.keys(group_means);
    const means = Object.values(group_means);

    // Find highest and lowest
    const maxMean = Math.max(...means);
    const minMean = Math.min(...means);
    const maxGroup = groups[means.indexOf(maxMean)];
    const minGroup = groups[means.indexOf(minMean)];
    const difference = maxMean - minMean;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Kết quả MGA</h2>
                </div>
                <p className="text-indigo-100">
                    Multi-Group Analysis - So sánh giữa các nhóm
                </p>
            </div>

            {/* Significance Test */}
            <div className={`rounded-lg border p-6 ${significant_difference
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                <div className="flex items-center gap-3 mb-3">
                    {significant_difference ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                    )}
                    <h3 className="text-lg font-bold">
                        {significant_difference
                            ? 'Có sự khác biệt có ý nghĩa thống kê'
                            : 'Không có sự khác biệt có ý nghĩa thống kê'}
                    </h3>
                </div>
                <p className="text-sm mb-2">
                    <strong>P-value:</strong>{' '}
                    <span className={`font-bold ${p_value < 0.05 ? 'text-green-700' : 'text-yellow-700'}`}>
                        {p_value?.toFixed(4)}
                    </span>
                    {' '}({p_value < 0.05 ? 'p < 0.05' : 'p ≥ 0.05'})
                </p>
                <p className="text-sm">
                    {significant_difference
                        ? '✅ Các nhóm có sự khác biệt đáng kể về giá trị trung bình'
                        : '⚠️ Các nhóm không có sự khác biệt đáng kể về giá trị trung bình'}
                </p>
            </div>

            {/* Group Comparison Table */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                    So sánh giữa các nhóm
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                                    Nhóm
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                                    Giá trị trung bình
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                                    Xếp hạng
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group, idx) => {
                                const mean = group_means[group];
                                const isHighest = mean === maxMean;
                                const isLowest = mean === minMean;

                                return (
                                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            Nhóm {group}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <span className={`font-bold ${isHighest ? 'text-green-700' :
                                                    isLowest ? 'text-red-700' :
                                                        'text-slate-900'
                                                }`}>
                                                {mean?.toFixed(4)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isHighest && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                                    Cao nhất
                                                </span>
                                            )}
                                            {isLowest && (
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                                    Thấp nhất
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Difference Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                    📊 Tóm tắt sự khác biệt
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-blue-700 mb-1">Nhóm cao nhất:</p>
                        <p className="font-bold text-blue-900">Nhóm {maxGroup}</p>
                        <p className="text-xs text-blue-600">{typeof maxMean === 'number' ? maxMean.toFixed(4) : '-'}</p>
                    </div>
                    <div>
                        <p className="text-blue-700 mb-1">Nhóm thấp nhất:</p>
                        <p className="font-bold text-blue-900">Nhóm {minGroup}</p>
                        <p className="text-xs text-blue-600">{typeof minMean === 'number' ? minMean.toFixed(4) : '-'}</p>
                    </div>
                    <div>
                        <p className="text-blue-700 mb-1">Chênh lệch:</p>
                        <p className="font-bold text-blue-900">{typeof difference === 'number' ? difference.toFixed(4) : '-'}</p>
                        <p className="text-xs text-blue-600">
                            {(minMean != null && minMean !== 0 && typeof difference === 'number')
                                ? `${((difference / minMean) * 100).toFixed(1)}% difference`
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Interpretation */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-3">
                    📖 Hướng dẫn giải thích
                </h3>
                <div className="space-y-2 text-sm text-purple-800">
                    <p>
                        <strong>P-value {'<'} 0.05:</strong> Có sự khác biệt có ý nghĩa thống kê giữa các nhóm
                    </p>
                    <p>
                        <strong>P-value ≥ 0.05:</strong> Không có sự khác biệt có ý nghĩa thống kê
                    </p>
                    <p>
                        <strong>Chênh lệch lớn:</strong> Cho thấy các nhóm có đặc điểm khác nhau rõ rệt
                    </p>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-3">
                    💡 Khuyến nghị
                </h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                    {significant_difference ? (
                        <>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    Các nhóm có sự khác biệt đáng kể - cần chiến lược riêng cho mỗi nhóm
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    Nhóm {maxGroup} có hiệu suất cao nhất - nghiên cứu các yếu tố thành công
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    Nhóm {minGroup} cần cải thiện - áp dụng best practices từ nhóm tốt nhất
                                </span>
                            </li>
                        </>
                    ) : (
                        <li className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                                Các nhóm tương đồng - có thể áp dụng chiến lược chung cho tất cả nhóm
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
