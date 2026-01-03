import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Shield, Activity,
    Database, Network, Zap,
    ShieldAlert, Circle, ArrowRight
} from 'lucide-react';

interface Node {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    severity?: string;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    type: string;
}

interface AttackPathGraphProps {
    assets: any[];
    relationships: any[];
}

/**
 * Enhanced Attack Path Graph Visualization
 * Uses a force-inspired layout (simulated for deterministic beauty) 
 * to show relationships between organizational assets.
 */
export const AttackPathGraph: React.FC<AttackPathGraphProps> = ({ assets, relationships }) => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Simulated layout logic to keep nodes separated and readable
    // In a real app, this might use a library like d3-force
    const nodes = useMemo(() => {
        return assets.map((a, i) => {
            const angle = (i / assets.length) * 2 * Math.PI;
            const radius = a.asset_type === 'domain' ? 100 : a.asset_type === 'ip' ? 200 : 300;

            return {
                id: a.id,
                type: a.asset_type,
                label: a.asset_type === 'domain' ? a.domains[0]?.fqdn : a.ips[0]?.ip_address || 'Service',
                x: 400 + Math.cos(angle) * radius,
                y: 400 + Math.sin(angle) * radius,
                severity: 'low' // Default, would be calculated from exposures
            } as Node;
        });
    }, [assets]);

    const edges = useMemo(() => {
        return relationships.map((r, i) => ({
            id: r.id,
            source: r.source_asset_id,
            target: r.target_asset_id,
            type: r.relationship_type
        } as Edge));
    }, [relationships]);

    const getTargetPos = (id: string) => {
        const node = nodes.find(n => n.id === id);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
    };

    return (
        <div className="relative w-full h-full bg-terminal-bg/30 rounded-[3rem] overflow-hidden border border-panel-border group/graph">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none grid-bg" />

            {/* HUD Info */}
            <div className="absolute top-8 left-8 z-20 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-info uppercase tracking-[0.4em] font-black">Graph_Engine</span>
                    <span className="text-xs text-muted-foreground font-mono">RELATIONAL_MARKERS_ACTIVE: {edges.length}</span>
                </div>
            </div>

            <svg
                viewBox="0 0 800 800"
                className="w-full h-full cursor-grab active:cursor-grabbing p-20"
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Edges */}
                {edges.map(edge => {
                    const source = getTargetPos(edge.source);
                    const target = getTargetPos(edge.target);
                    return (
                        <motion.line
                            key={edge.id}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: hoveredNode ? (hoveredNode === edge.source || hoveredNode === edge.target ? 1 : 0.1) : 0.4 }}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-info/30"
                            style={{ filter: 'url(#glow)' }}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map(node => (
                    <motion.g
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: hoveredNode ? (hoveredNode === node.id ? 1 : 0.5) : 1,
                            transition: { delay: Math.random() * 0.5 }
                        }}
                        whileHover={{ scale: 1.1 }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                    >
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r="24"
                            className={`fill-panel-bg stroke-2 ${node.type === 'domain' ? 'stroke-blue-500/50' : node.type === 'ip' ? 'stroke-emerald-500/50' : 'stroke-info/50'}`}
                        />
                        <foreignObject x={node.x - 12} y={node.y - 12} width="24" height="24">
                            <div className="flex items-center justify-center h-full w-full">
                                {node.type === 'domain' ? <Globe className="w-3.5 h-3.5 text-blue-500" /> :
                                    node.type === 'ip' ? <Database className="w-3.5 h-3.5 text-emerald-500" /> :
                                        <Zap className="w-3.5 h-3.5 text-info" />}
                            </div>
                        </foreignObject>

                        <text
                            x={node.x}
                            y={node.y + 40}
                            textAnchor="middle"
                            className="fill-muted-foreground font-mono text-[8px] uppercase tracking-widest pointer-events-none"
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}
            </svg>

            {/* Legend & Controls */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-terminal-bg/50 border border-panel-border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                    <span className="text-[8px] font-mono text-muted-foreground uppercase">Target_Surface</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-terminal-bg/50 border border-panel-border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                    <span className="text-[8px] font-mono text-muted-foreground uppercase">Host_Infrastructure</span>
                </div>
            </div>
        </div>
    );
};
