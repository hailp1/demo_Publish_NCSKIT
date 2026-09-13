import React, { useMemo } from 'react';

interface Path {
    from: string;
    to: string;
    coef?: number;
    pVal?: number;
}

interface ResearchModelDiagramProps {
    paths: Path[];
    className?: string;
}

export function ResearchModelDiagram({ paths, className = "" }: ResearchModelDiagramProps) {
    const { nodes, columns, connections } = useMemo(() => {
        if (!paths || paths.length === 0) return { nodes: [], columns: [], connections: [] };

        const allNodes = Array.from(new Set(paths.flatMap(p => [p.from, p.to])));
        
        const fromSet = new Set(paths.map(p => p.from));
        const toSet = new Set(paths.map(p => p.to));

        // Group by column
        const ivs = allNodes.filter(n => !toSet.has(n)); // Only from
        const dvs = allNodes.filter(n => !fromSet.has(n)); // Only to
        const meds = allNodes.filter(n => fromSet.has(n) && toSet.has(n)); // Both

        // If a model has no mediators, just 2 columns
        const cols = meds.length > 0 ? [ivs, meds, dvs] : [ivs, dvs];

        // Positioning configurations
        const width = 800;
        const height = 400;
        const colWidth = width / cols.length;
        const nodeWidth = 140;
        const nodeHeight = 50;

        const nodePositions: Record<string, {x: number, y: number}> = {};

        cols.forEach((colNodes, colIdx) => {
            const x = (colIdx + 0.5) * colWidth - (nodeWidth / 2);
            const rowHeight = height / (colNodes.length + 1);
            
            colNodes.forEach((node, rowIdx) => {
                const y = (rowIdx + 1) * rowHeight - (nodeHeight / 2);
                nodePositions[node] = { x, y };
            });
        });

        // Map connections with coordinates
        const conns = paths.map(p => {
            const fromPos = nodePositions[p.from];
            const toPos = nodePositions[p.to];
            if(!fromPos || !toPos) return null;
            
            return {
                ...p,
                x1: fromPos.x + nodeWidth,
                y1: fromPos.y + (nodeHeight / 2),
                x2: toPos.x,
                y2: toPos.y + (nodeHeight / 2)
            };
        }).filter(Boolean) as any[];

        return {
            nodes: allNodes.map(n => ({ id: n, ...nodePositions[n] })),
            columns: cols,
            connections: conns,
            nodeWidth,
            nodeHeight
        };

    }, [paths]);

    if (nodes.length === 0) return null;

    return (
        <div className={`w-full overflow-x-auto bg-slate-50/50 rounded-2xl border border-slate-200 p-4 ${className}`}>
            <div className="min-w-[600px] w-full flex justify-center">
                <svg width="100%" height="400" viewBox="0 0 800 400" className="max-w-full drop-shadow-sm">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                        </marker>
                    </defs>

                    {/* Draw connections first so they are under nodes */}
                    {connections.map((c, idx) => {
                        const isSig = c.pVal === undefined || c.pVal <= 0.05;

                        return (
                            <g key={`conn-${idx}`}>
                                <path
                                    d={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`}
                                    fill="none"
                                    stroke={isSig ? "#6366f1" : "#cbd5e1"}
                                    strokeWidth="2"
                                    strokeDasharray={isSig ? "none" : "4 4"}
                                    markerEnd="url(#arrowhead)"
                                    className="transition-all duration-500"
                                />
                                {c.coef !== undefined && (
                                    <rect 
                                        x={(c.x1 + c.x2)/2 - 20} 
                                        y={(c.y1 + c.y2)/2 - 10} 
                                        width="40" height="20" 
                                        fill="white" rx="4"
                                        className="opacity-90"
                                    />
                                )}
                                {c.coef !== undefined && (
                                    <text
                                        x={(c.x1 + c.x2) / 2}
                                        y={(c.y1 + c.y2) / 2 + 4}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="bold"
                                        fill={isSig ? "#4f46e5" : "#94a3b8"}
                                    >
                                        {typeof c.coef === 'number' ? c.coef.toFixed(3) : '-'}
                                        {c.pVal !== undefined && c.pVal <= 0.001 ? '***' : c.pVal !== undefined && c.pVal <= 0.01 ? '**' : c.pVal !== undefined && c.pVal <= 0.05 ? '*' : ''}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Draw Nodes */}
                    {nodes.map(n => (
                        <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                            <rect
                                width="140"
                                height="50"
                                rx="12"
                                fill="white"
                                stroke="#818cf8"
                                strokeWidth="2"
                                className="shadow-lg transition-transform hover:-translate-y-1 cursor-pointer"
                            />
                            <text
                                x="70"
                                y="29"
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="bold"
                                fill="#1e293b"
                            >
                                {n.id.length > 15 ? n.id.substring(0, 15) + '...' : n.id}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="mt-2 text-center text-xs text-slate-400">
                <span className="inline-flex items-center gap-1 mx-2"><div className="w-3 h-0.5 bg-indigo-500"></div> Có ý nghĩa thống kê</span>
                <span className="inline-flex items-center gap-1 mx-2"><div className="w-3 h-0.5 bg-slate-300 border-dashed border-b border-slate-300"></div> Không có ý nghĩa</span>
            </div>
        </div>
    );
}
