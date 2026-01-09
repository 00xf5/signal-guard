import React, { useState } from "react";
import { Key, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SecretsTabProps {
    assets: any[];
}

export const SecretsTab: React.FC<SecretsTabProps> = ({ assets }) => {
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

    // Extract all secrets from assets
    const secretsData = assets.flatMap((asset, assetIdx) => {
        const assetSecrets: any[] = [];

        // Check if asset has secrets array
        if (asset.secrets && Array.isArray(asset.secrets) && asset.secrets.length > 0) {
            asset.secrets.forEach((secret: string, idx: number) => {
                assetSecrets.push({
                    id: `${assetIdx}-${idx}`,
                    secret,
                    foundIn: asset.url.split('/').pop()?.split('?')[0] || 'unknown',
                    fullUrl: asset.url,
                    score: asset.score,
                    type: detectSecretType(secret)
                });
            });
        }

        // Also extract from signals that might contain leaked keys
        asset.signals?.forEach((sig: string) => {
            if (sig.toLowerCase().includes('leaked') || sig.toLowerCase().includes('key') || sig.toLowerCase().includes('secret')) {
                const match = sig.match(/LEAKED[_-]KEY:\s*(.+)/i);
                if (match) {
                    assetSecrets.push({
                        id: `${assetIdx}-sig-${sig}`,
                        secret: match[1],
                        foundIn: asset.url.split('/').pop()?.split('?')[0] || 'unknown',
                        fullUrl: asset.url,
                        score: asset.score,
                        type: 'API_KEY'
                    });
                }
            }
        });

        return assetSecrets;
    });

    function detectSecretType(secret: string): string {
        if (secret.startsWith('sk_') || secret.startsWith('pk_')) return 'STRIPE_KEY';
        if (secret.startsWith('ghp_') || secret.startsWith('gho_')) return 'GITHUB_TOKEN';
        if (secret.includes('AKIA')) return 'AWS_KEY';
        if (secret.match(/^[A-Za-z0-9_-]{40}$/)) return 'OAUTH_TOKEN';
        if (secret.match(/^[A-Za-z0-9_-]{32}$/)) return 'API_KEY';
        if (secret.startsWith('xox')) return 'SLACK_TOKEN';
        return 'UNKNOWN';
    }

    const toggleReveal = (id: string) => {
        const newRevealed = new Set(revealedSecrets);
        if (newRevealed.has(id)) {
            newRevealed.delete(id);
        } else {
            newRevealed.add(id);
        }
        setRevealedSecrets(newRevealed);
    };

    const copySecret = (secret: string) => {
        navigator.clipboard.writeText(secret);
        toast.success("Secret copied to clipboard");
    };

    const getSeverityColor = (type: string) => {
        if (type === 'AWS_KEY' || type === 'STRIPE_KEY') return 'text-red-500 border-red-500/50 bg-red-500/10';
        if (type === 'GITHUB_TOKEN' || type === 'OAUTH_TOKEN') return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
        return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
    };

    return (
        <div className="space-y-4">
            {/* Warning Banner */}
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-sm font-black text-danger uppercase tracking-wider mb-1">Security Alert</div>
                    <div className="text-xs text-danger/90 leading-relaxed">
                        {secretsData.length} potential secret(s) detected. These may include API keys, tokens, or credentials hardcoded in JavaScript files.
                        Immediate rotation recommended.
                    </div>
                </div>
            </div>

            {/* Secrets List */}
            {secretsData.length > 0 ? (
                <div className="space-y-3">
                    {secretsData.map((item) => (
                        <div key={item.id} className="p-4 bg-[#0a0a0c] border border-danger/20 rounded-lg hover:border-danger/40 transition-all">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${getSeverityColor(item.type)}`}>
                                            {item.type.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[9px] font-mono text-muted-foreground">
                                            Score: {item.score}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-foreground mb-1">
                                        Found in: <span className="text-foreground">{item.foundIn}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        onClick={() => toggleReveal(item.id)}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-[10px] font-black uppercase"
                                    >
                                        {revealedSecrets.has(item.id) ? (
                                            <><EyeOff className="w-3 h-3 mr-1" /> Hide</>
                                        ) : (
                                            <><Eye className="w-3 h-3 mr-1" /> Reveal</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => copySecret(item.secret)}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-[10px] font-black uppercase"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Secret Value */}
                            <div className="p-3 bg-black/60 border border-white/10 rounded font-mono text-xs break-all">
                                {revealedSecrets.has(item.id) ? (
                                    <span className="text-danger">{item.secret}</span>
                                ) : (
                                    <span className="text-muted-foreground">{'•'.repeat(40)}</span>
                                )}
                            </div>

                            {/* Full URL */}
                            <div className="mt-2 text-[9px] font-mono text-muted-foreground">
                                <a href={item.fullUrl} target="_blank" rel="noopener noreferrer" className="hover:text-info transition-colors">
                                    {item.fullUrl}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Key className="w-16 h-16 text-success/20 mx-auto mb-4" />
                    <div className="text-lg font-black text-success uppercase tracking-wider mb-2">No Secrets Detected</div>
                    <div className="text-sm text-muted-foreground font-mono">
                        No hardcoded API keys, tokens, or credentials found in the scanned JavaScript files.
                    </div>
                </div>
            )}

            {/* Remediation Guide */}
            {secretsData.length > 0 && (
                <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                    <div className="text-xs font-black text-foreground uppercase tracking-wider mb-3">🛡️ Remediation Steps</div>
                    <ol className="text-[11px] text-muted-foreground space-y-2 font-mono list-decimal list-inside">
                        <li>Immediately rotate all exposed credentials</li>
                        <li>Move secrets to environment variables or secret management systems</li>
                        <li>Implement pre-commit hooks to prevent future leaks</li>
                        <li>Review access logs for potential unauthorized usage</li>
                        <li>Consider using tools like git-secrets or TruffleHog</li>
                    </ol>
                </div>
            )}
        </div>
    );
};
