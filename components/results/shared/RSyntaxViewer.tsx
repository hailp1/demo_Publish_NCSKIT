'use client';

/**
 * RSyntaxViewer — Demo version.
 * Role gate removed. R code always visible to all users.
 */

import React, { useCallback } from 'react';
import { CardTitle } from '@/components/ui/card';
import { Copy, Check, Terminal, Download } from 'lucide-react';

interface RSyntaxViewerProps {
    code: string;
    userProfile?: any;
}

export function RSyntaxViewer({ code }: RSyntaxViewerProps) {
    const [copied, setCopied] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ncskit_analysis.R';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [code]);

    return (
        <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6 print:hidden">
            <div
                className="cursor-pointer select-none group"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="py-4 px-6 flex flex-row items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Terminal className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                                Equivalent R Syntax
                                <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">
                                    Open Source
                                </span>
                            </CardTitle>
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                        {expanded ? 'Hide Code' : 'Show R Code'}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="pt-0 pb-6 px-6">
                    <div className="relative group/code">
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-800 text-slate-400 text-[9px] font-mono rounded-md border border-slate-700 z-10">
                            ncskit_engine.r
                        </div>
                        <pre className="bg-slate-900 text-indigo-300 p-6 pt-8 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-2xl leading-relaxed">
                            {(() => {
                                const lines = code.split('\n');
                                if (lines.length > 0 && lines[0].trim() === '') lines.shift();
                                if (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
                                const minIndent = lines.filter(l => l.trim() !== '').reduce((min, line) => {
                                    const match = line.match(/^(\s*)/);
                                    return match ? Math.min(min, match[1].length) : min;
                                }, Infinity);
                                return minIndent === Infinity
                                    ? lines.join('\n')
                                    : lines.map(l => l.startsWith(' '.repeat(minIndent)) ? l.substring(minIndent) : l).join('\n');
                            })()}
                        </pre>
                        <div className="absolute top-6 right-4 flex items-center gap-2 opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-all">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                                className="p-2 bg-slate-800/80 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 border border-slate-700 shadow-lg transition-all active:scale-95"
                                title="Copy code"
                            >
                                {copied ? (
                                    <><Check className="h-3.5 w-3.5" /><span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">Copied</span></>
                                ) : (
                                    <><Copy className="h-3.5 w-3.5" /><span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">Copy</span></>
                                )}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                                className="p-2 bg-slate-800/80 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 border border-slate-700 shadow-lg transition-all active:scale-95"
                                title="Download .R file"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
