import { useState, useEffect } from 'react';
import { Sparkles, Bot, AlertCircle, CheckCircle, AlertTriangle, BookMarked } from 'lucide-react';
import { InterpretationResult } from '@/lib/asig';
import { AIInterpretationFeedback } from './feedback/AIInterpretationFeedback';
import { explainResults } from '@/lib/ai-explainer';
import { hasStoredApiKey, retrieveApiKey } from '@/utils/key-encryption';

interface AIInterpretationProps {
    analysisType: string;
    results: any;
    userProfile?: any;
}

export function AIInterpretation({ analysisType, results, userProfile }: AIInterpretationProps) {
    const [apiKey, setApiKey] = useState<string>('');
    const [structured, setStructured] = useState<InterpretationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cache, setCache] = useState<Map<string, string>>(new Map());
    const [lastCallTime, setLastCallTime] = useState(0);

    // Load key state from encrypted storage (we only need to know if a key exists,
    // not the raw value — the actual key is read by ai-explainer.ts via getEncryptedKeyForHeader)
    useEffect(() => {
        const loadKeyState = () => {
            // Check if server has a shared key configured (no personal key needed)
            // or if user has stored a personal key
            const hasPersonalKey = hasStoredApiKey();
            // Use a placeholder to indicate key is available — actual value not needed here
            setApiKey(hasPersonalKey ? '***stored***' : '');
        };

        loadKeyState();

        // Re-check when user saves/clears key in AISettings
        window.addEventListener('gemini-key-updated', loadKeyState);
        return () => window.removeEventListener('gemini-key-updated', loadKeyState);
    }, []);

    const generateExplanation = async () => {
        // Rate limiting: 5s cooldown
        const now = Date.now();
        if (now - lastCallTime < 5000) {
            setError('Vui lòng đợi 5 giây trước khi tạo lại (tránh spam).');
            return;
        }

        // Check cache first
        const effectiveResults = results?.data ?? results;
        const cacheKey = JSON.stringify({ analysisType, results: effectiveResults });
        if (cache.has(cacheKey)) {
            setStructured(JSON.parse(cache.get(cacheKey)!));
            setError(null);
            return;
        }

        // Guard: nếu chưa có kết quả phân tích thì không gọi API
        if (effectiveResults === null || effectiveResults === undefined) {
            setError('Chưa có kết quả phân tích. Hãy chạy phân tích trước.');
            return;
        }

        setLoading(true);
        setError(null);
        setLastCallTime(now);

        try {
            // Build Context from Results if available
            const scaleName = results?.scaleName || results?.data?.scaleName || 'Thang đo';
            const variableNames = results?.variables || results?.data?.variables || [];
            
            const response = await fetch('/api/template-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisType,
                    results: effectiveResults,
                    scaleName,
                    variableNames
                })
            });

            if (!response.ok) {
                throw new Error(`Lỗi Server: ${response.statusText}`);
            }

            const data = await response.json();
            const resultData = data.interpretation || data.structured;

            if (resultData) {
                setStructured(resultData);
                // Cache the response
                const newCache = new Map(cache);
                newCache.set(cacheKey, JSON.stringify(resultData));
                setCache(newCache);
            } else {
                throw new Error('Không thể tạo diễn giải cho phân tích này.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Có lỗi xảy ra khi tạo diễn giải.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mt-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-blue-900">Diễn giải Học thuật (Chuẩn ASIG)</h3>
                    <p className="text-xs text-blue-700 font-medium">Báo cáo phân tích chuyên sâu tự động</p>
                </div>
            </div>

            {!structured && !loading && (
                <div className="text-center py-6">
                    <p className="text-blue-600 mb-4 text-sm">
                        Hệ thống sẽ tự động đọc kết quả và viết báo cáo phân tích theo chuẩn khoa học.
                    </p>
                    <button
                        onClick={generateExplanation}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <Bot className="w-5 h-5" />
                        Tạo báo cáo diễn giải
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-indigo-600 animate-pulse font-medium">Đang suy nghĩ và viết báo cáo...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {structured && (
                <div className="bg-white/70 p-6 rounded-xl border border-indigo-100/50 shadow-sm">
                    {/* Summary - High Impact Box */}
                    <div className="bg-indigo-900 rounded-2xl p-6 mb-6 border-b-4 border-indigo-500 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] -mr-16 -mt-16"></div>
                        <p className="text-white leading-relaxed font-bold text-lg relative z-10">
                            {structured.summary}
                        </p>
                    </div>

                    {/* Details */}
                    {structured.details?.length > 0 && (
                        <div className="mb-5">
                            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                                Chi tiết phân tích
                            </h4>
                            <ul className="space-y-3">
                                {structured.details.map((detail: string, idx: number) => (
                                    <li key={idx} className="text-sm text-slate-800 bg-indigo-50/50 p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm font-medium">
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {structured.warnings?.length > 0 && (
                        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Lưu ý quan trọng
                            </h4>
                            <ul className="space-y-2">
                                {structured.warnings.map((warning: string, idx: number) => (
                                    <li key={idx} className="text-sm text-amber-800 font-medium flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">•</span>
                                        {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Citations */}
                    {structured.citations?.length > 0 && (
                        <div className="border-t border-indigo-100 pt-4 mt-4">
                            <h4 className="text-[10px] font-black text-indigo-800 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <BookMarked className="w-3 h-3" />
                                Tài liệu tham khảo ASIG
                            </h4>
                            <ul className="text-[11px] text-slate-600 space-y-2 font-sans">
                                {structured.citations.map((citation: string, idx: number) => (
                                    <li key={idx} className="italic hover:text-indigo-800 transition-colors leading-relaxed border-l-2 border-indigo-200 pl-3 py-0.5">
                                        {citation}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-indigo-100 flex justify-end">
                        <button
                            onClick={generateExplanation}
                            className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold underline"
                        >
                            Tạo lại báo cáo khác
                        </button>
                    </div>

                    {/* Feedback Part 2 */}
                    <div className="mt-4">
                        <AIInterpretationFeedback analysisType={analysisType} />
                    </div>
                </div>
            )}
        </div>
    );
}
