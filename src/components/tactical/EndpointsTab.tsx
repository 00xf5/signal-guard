import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EndpointsTabProps {
    assets: any[];
}

export const EndpointsTab: React.FC<EndpointsTabProps> = ({ assets }) => {
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState<string>("");

    // Extract all endpoints from signals
    const endpoints = assets.flatMap((asset, assetIdx) => {
        const assetEndpoints: any[] = [];
        asset.signals?.forEach((sig: string) => {
            const match = sig.match(/IDOR Lead: (.+)/i) || sig.match(/(\/api\/[^\s]+)/i);
            if (match) {
                const endpoint = match[1] || match[0];
                assetEndpoints.push({
                    endpoint,
                    method: endpoint.includes('delete') ? 'DELETE' : endpoint.includes('create') || endpoint.includes('add') ? 'POST' : 'GET',
                    foundIn: asset.url.split('/').pop()?.split('?')[0]?.slice(0, 8) || 'unknown',
                    risk: asset.score >= 90 ? '🔴' : asset.score >= 70 ? '🟡' : '🟢',
                    score: asset.score
                });
            }
        });
        return assetEndpoints;
    });

    const filteredEndpoints = endpoints.filter(ep => {
        if (search && !ep.endpoint.toLowerCase().includes(search.toLowerCase())) return false;
        if (methodFilter && ep.method !== methodFilter) return false;
        return true;
    });

    return (
        <div className="space-y-3">
            {/* Search & Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search endpoints..."
                        className="pl-10 h-9 bg-black/40 border-white/10 text-xs font-mono"
                    />
                </div>
                <div className="flex gap-2">
                    {['GET', 'POST', 'DELETE', 'PUT'].map((method) => (
                        <button
                            key={method}
                            onClick={() => setMethodFilter(methodFilter === method ? "" : method)}
                            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${methodFilter === method
                                    ? "bg-info text-black"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] font-mono">
                    <thead className="bg-black/60 border-b border-white/10">
                        <tr>
                            <th className="text-left p-2 font-black uppercase tracking-wider text-muted-foreground">Method</th>
                            <th className="text-left p-2 font-black uppercase tracking-wider text-muted-foreground">Endpoint</th>
                            <th className="text-left p-2 font-black uppercase tracking-wider text-muted-foreground">Found In</th>
                            <th className="text-center p-2 font-black uppercase tracking-wider text-muted-foreground">Risk</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredEndpoints.length > 0 ? (
                            filteredEndpoints.map((ep, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${ep.method === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                                                ep.method === 'POST' ? 'bg-orange-500/20 text-orange-500' :
                                                    'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {ep.method}
                                        </span>
                                    </td>
                                    <td className="p-2 text-foreground">{ep.endpoint}</td>
                                    <td className="p-2 text-muted-foreground">{ep.foundIn}</td>
                                    <td className="p-2 text-center text-lg">{ep.risk}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                    No endpoints found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground text-right">
                Showing {filteredEndpoints.length} of {endpoints.length} endpoints
            </div>
        </div>
    );
};
