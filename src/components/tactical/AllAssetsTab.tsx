import React, { useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AllAssetsTabProps {
    assets: any[];
}

type SortField = 'score' | 'url' | 'signals';
type SortDirection = 'asc' | 'desc';

export const AllAssetsTab: React.FC<AllAssetsTabProps> = ({ assets }) => {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>('score');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredAssets = assets
        .filter(asset => {
            if (!search) return true;
            return asset.url.toLowerCase().includes(search.toLowerCase()) ||
                asset.signals?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortField === 'score') {
                comparison = a.score - b.score;
            } else if (sortField === 'url') {
                comparison = a.url.localeCompare(b.url);
            } else if (sortField === 'signals') {
                comparison = (a.signals?.length || 0) - (b.signals?.length || 0);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-red-500";
        if (score >= 70) return "text-orange-500";
        if (score >= 50) return "text-yellow-500";
        return "text-green-500";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 90) return "bg-red-500/20 text-red-500 border-red-500/30";
        if (score >= 70) return "bg-orange-500/20 text-orange-500 border-orange-500/30";
        if (score >= 50) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
        return "bg-green-500/20 text-green-500 border-green-500/30";
    };

    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by URL or signal..."
                    className="pl-10 h-9 bg-black/40 border-white/10 text-xs font-mono"
                />
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono">
                        <thead className="bg-black/60 border-b border-white/10">
                            <tr>
                                <th className="text-left p-2">
                                    <button
                                        onClick={() => handleSort('score')}
                                        className="flex items-center gap-1 font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Score
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left p-2">
                                    <button
                                        onClick={() => handleSort('url')}
                                        className="flex items-center gap-1 font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        URL
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left p-2">
                                    <button
                                        onClick={() => handleSort('signals')}
                                        className="flex items-center gap-1 font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Signals
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left p-2 font-black uppercase tracking-wider text-muted-foreground">
                                    Hash
                                </th>
                                <th className="text-left p-2 font-black uppercase tracking-wider text-muted-foreground">
                                    Source Map
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map((asset, i) => {
                                    const hasSourceMap = asset.signals?.some((s: string) => s.toLowerCase().includes('source-map'));
                                    const contentHash = asset.content_hash || asset.url.split('/').pop()?.split('?')[0]?.slice(0, 8);

                                    return (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black border ${getScoreBadge(asset.score)}`}>
                                                    {asset.score}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <a
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-foreground hover:text-info transition-colors break-all max-w-md block"
                                                >
                                                    {asset.url.split('?')[0].split('/').slice(-2).join('/')}
                                                </a>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {asset.signals?.slice(0, 3).map((sig: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-muted-foreground border border-white/10"
                                                        >
                                                            {sig.slice(0, 15)}
                                                        </span>
                                                    ))}
                                                    {asset.signals?.length > 3 && (
                                                        <span className="px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                                            +{asset.signals.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-2 text-muted-foreground">
                                                {contentHash}...
                                            </td>
                                            <td className="p-2">
                                                {hasSourceMap ? (
                                                    <span className="text-success text-xs">✓</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No assets found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <div>Showing {filteredAssets.length} of {assets.length} assets</div>
                <div className="flex gap-4">
                    <span>Critical (≥90): {assets.filter(a => a.score >= 90).length}</span>
                    <span>High (≥70): {assets.filter(a => a.score >= 70 && a.score < 90).length}</span>
                    <span>Medium (≥50): {assets.filter(a => a.score >= 50 && a.score < 70).length}</span>
                    <span>Low (&lt;50): {assets.filter(a => a.score < 50).length}</span>
                </div>
            </div>
        </div>
    );
};
