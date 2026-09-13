'use client';

/**
 * UnifiedASIGInterpretation — Single source-of-truth for ASIG output display.
 *
 * Replaces both:
 *   - TemplateInterpretation (green auto-fire widget)
 *   - AIInterpretation (blue button-triggered widget)
 *
 * Features:
 *   • Auto-fires on mount via useEffect (no button press needed)
 *   • Verdict badge (Pass / Warning / Fail)
 *   • APA-ready copy-paste statement
 *   • Expandable details + warnings
 *   • Actionable next-step recommendations
 *   • Full citations list
 *   • Copy-all button
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    BookMarked,
    Lightbulb,
    FileText,
    ArrowRight,
} from 'lucide-react';
import { InterpretationResult } from '@/lib/asig';

interface UnifiedASIGInterpretationProps {
    analysisType: string;
    results: any;
    scaleName?: string;
    variableNames?: Record<string, string>;
    /** If true, skip auto-fire and render nothing until explicitly invoked */
    lazy?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Verdict helpers
// ─────────────────────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
    pass: {
        label: 'PASSED',
        bg: 'bg-emerald-50 border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        accent: 'border-emerald-500',
    },
    warning: {
        label: 'ATTENTION NEEDED',
        bg: 'bg-amber-50 border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        accent: 'border-amber-500',
    },
    fail: {
        label: 'ACTION REQUIRED',
        bg: 'bg-rose-50 border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: XCircle,
        iconColor: 'text-rose-600',
        accent: 'border-rose-500',
    },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function UnifiedASIGInterpretation({
    analysisType,
    results,
    scaleName = 'Scale',
    variableNames = {},
    lazy = false,
}: UnifiedASIGInterpretationProps) {
    const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(true);
    const [showCitations, setShowCitations] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedAPA, setCopiedAPA] = useState(false);
    const prevKey = useRef<string>('');

    const compute = useCallback(async () => {
        const effectiveResults = results?.data ?? results;
        if (!effectiveResults) return;

        const key = JSON.stringify({ analysisType, r: effectiveResults });
        if (key === prevKey.current && interpretation) return; // skip identical re-runs
        prevKey.current = key;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/template-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisType,
                    results: effectiveResults,
                    scaleName,
                    variableNames,
                }),
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody.error || `Server error: ${response.statusText}`);
            }

            const data = await response.json();
            const result: InterpretationResult = data.interpretation || data.structured;
            if (result) {
                setInterpretation(result);
            } else {
                throw new Error('No interpretation returned.');
            }
        } catch (err: any) {
            console.error('[ASIG]', err);
            setError(err.message || 'Could not generate interpretation.');
        } finally {
            setLoading(false);
        }
    }, [analysisType, results, scaleName, variableNames]);

    // Auto-fire unless lazy
    useEffect(() => {
        if (!lazy) compute();
    }, [compute, lazy]);

    // ── Copy helpers ──────────────────────────────────────────────────────────

    const copyAll = () => {
        if (!interpretation) return;
        const parts = [
            '=== ASIG Academic Interpretation ===',
            '',
            interpretation.summary,
            '',
            interpretation.apaStatement ? `APA Statement:\n${interpretation.apaStatement}` : '',
            '',
            interpretation.details.length > 0
                ? `Details:\n${interpretation.details.map(d => `• ${d}`).join('\n')}`
                : '',
            '',
            interpretation.warnings.length > 0
                ? `Warnings:\n${interpretation.warnings.map(w => `⚠ ${w}`).join('\n')}`
                : '',
            '',
            interpretation.recommendations?.length
                ? `Next Steps:\n${interpretation.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
                : '',
            '',
            interpretation.citations.length > 0
                ? `References:\n${interpretation.citations.join('\n')}`
                : '',
        ].filter(Boolean).join('\n');

        navigator.clipboard.writeText(parts.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyAPA = () => {
        if (!interpretation?.apaStatement) return;
        navigator.clipboard.writeText(interpretation.apaStatement);
        setCopiedAPA(true);
        setTimeout(() => setCopiedAPA(false), 2000);
    };

    // ── Render states ─────────────────────────────────────────────────────────

    if (lazy && !interpretation && !loading) return null;

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 my-6 flex items-center gap-4">
                <div className="w-6 h-6 border-3 border-slate-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                <div>
                    <p className="text-sm font-black text-slate-700 uppercase tracking-widest">
                        Generating Academic Interpretation…
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">ASIG engine running APA 7 templates</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 my-6 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-rose-800">Interpretation unavailable</p>
                    <p className="text-xs text-rose-600 mt-1">{error}</p>
                    <button
                        onClick={compute}
                        className="mt-2 text-xs font-bold text-rose-700 underline hover:text-rose-900"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!interpretation) return null;

    const verdict = interpretation.verdict ?? 'pass';
    const vc = VERDICT_CONFIG[verdict];
    const VerdictIcon = vc.icon;

    return (
        <div className={`rounded-2xl border-2 ${vc.bg} my-6 overflow-hidden shadow-sm`}>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/60">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-white shadow-sm border ${vc.badge.replace('bg-', 'border-').split(' ')[0]}`}>
                        <VerdictIcon className={`w-4 h-4 ${vc.iconColor}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            ASIG Academic Interpretation
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${vc.badge}`}>
                                <VerdictIcon className="w-2.5 h-2.5" />
                                {vc.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">APA 7 · Deterministic · Citable</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={copyAll}
                    title="Copy full interpretation"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-sm transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy All'}
                </button>
            </div>

            <div className="p-5 space-y-4">
                {/* ── Summary ──────────────────────────────────────────────── */}
                <div className={`rounded-xl p-5 bg-slate-900 border-l-4 ${vc.accent} shadow-lg relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
                    <p className="text-white font-bold leading-relaxed text-sm relative z-10">
                        {interpretation.summary}
                    </p>
                </div>

                {/* ── APA Statement ─────────────────────────────────────────── */}
                {interpretation.apaStatement && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    APA Manuscript Statement
                                </span>
                            </div>
                            <button
                                onClick={copyAPA}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                                {copiedAPA ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {copiedAPA ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-sm text-slate-700 italic leading-relaxed font-medium">
                            &ldquo;{interpretation.apaStatement}&rdquo;
                        </p>
                    </div>
                )}

                {/* ── Details (collapsible) ─────────────────────────────────── */}
                {interpretation.details.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowDetails(v => !v)}
                            className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 py-1.5"
                        >
                            <span>Statistical Details ({interpretation.details.length})</span>
                            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {showDetails && (
                            <ul className="space-y-2 mt-1">
                                {interpretation.details.map((d, i) => (
                                    <li
                                        key={i}
                                        className={`text-sm text-slate-800 bg-white p-3 rounded-xl border-l-4 ${vc.accent} shadow-sm font-medium leading-relaxed`}
                                    >
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* ── Warnings ──────────────────────────────────────────────── */}
                {interpretation.warnings.length > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                                Methodological Warnings ({interpretation.warnings.length})
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {interpretation.warnings.map((w, i) => (
                                <li key={i} className="text-sm text-amber-800 font-medium flex items-start gap-2">
                                    <span className="text-amber-500 shrink-0 mt-0.5">▲</span>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Recommendations ───────────────────────────────────────── */}
                {interpretation.recommendations && interpretation.recommendations.length > 0 && (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                                Recommended Next Steps
                            </span>
                        </div>
                        <ol className="space-y-2">
                            {interpretation.recommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-blue-800 font-medium">
                                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-[10px] font-black flex items-center justify-center mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                                        {r}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* ── Citations (collapsible) ───────────────────────────────── */}
                {interpretation.citations.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowCitations(v => !v)}
                            className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 py-1"
                        >
                            <div className="flex items-center gap-1.5">
                                <BookMarked className="w-3 h-3" />
                                <span>References ({interpretation.citations.length})</span>
                            </div>
                            {showCitations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showCitations && (
                            <ul className="mt-2 space-y-1.5">
                                {interpretation.citations.map((c, i) => (
                                    <li
                                        key={i}
                                        className="text-[11px] text-slate-600 italic leading-relaxed border-l-2 border-slate-200 pl-3 py-0.5"
                                    >
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
