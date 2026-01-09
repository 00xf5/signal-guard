import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DiscordWebhookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (webhook: string, threshold: number) => void;
    currentWebhook?: string;
}

export const DiscordWebhookModal: React.FC<DiscordWebhookModalProps> = ({ isOpen, onClose, onSave, currentWebhook = "" }) => {
    const [webhook, setWebhook] = useState(currentWebhook);
    const [threshold, setThreshold] = useState<number>(70);

    if (!isOpen) return null;

    const handleTest = async () => {
        if (!webhook) {
            toast.error("Enter a webhook URL first");
            return;
        }

        try {
            const response = await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: "🔔 JS-ASM Elite Test Alert",
                        description: "Webhook connection successful! You'll receive alerts here.",
                        color: 0x22c55e,
                        timestamp: new Date().toISOString()
                    }]
                })
            });

            if (response.ok) {
                toast.success("Test alert sent successfully!");
            } else {
                toast.error("Webhook test failed. Check the URL.");
            }
        } catch (error) {
            toast.error("Failed to send test alert");
        }
    };

    const handleSave = () => {
        if (!webhook) {
            toast.error("Webhook URL is required");
            return;
        }
        onSave(webhook, threshold);
        onClose();
        toast.success("Discord webhook configured");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase tracking-widest">Discord Alerts</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Webhook URL</label>
                        <Input
                            value={webhook}
                            onChange={(e) => setWebhook(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="font-mono text-xs bg-black/40 border-white/10"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Alert Threshold</label>
                        <div className="space-y-2">
                            {[
                                { label: "All Findings", value: 0 },
                                { label: "Score ≥ 70 Only", value: 70 },
                                { label: "Critical Only (≥ 90)", value: 90 }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="threshold"
                                        checked={threshold === option.value}
                                        onChange={() => setThreshold(option.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-mono">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleTest} variant="outline" className="flex-1 text-xs font-black uppercase">
                            <Send className="w-4 h-4 mr-2" />
                            Test
                        </Button>
                        <Button onClick={handleSave} className="flex-1 bg-success text-black hover:bg-success/90 text-xs font-black uppercase">
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
