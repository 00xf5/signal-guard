
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        console.log("Fetching global threats...");
        // URLhaus often requires a User-Agent header to prevent blocking
        const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', {
            headers: { 'User-Agent': 'RiskSignal-Telemetry-Bot/1.0' }
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error("Failed to parse URLhaus JSON:", e);
            throw new Error("Invalid response from Threat Feed");
        }

        if (data.query_status !== 'ok') {
            console.error("URLhaus API Status:", data.query_status);
            // Fallback to a different source if URLhaus is down/rate-limited
            return handleFallbackFeed(corsHeaders);
        }

        const threats = data.urls.slice(0, 10);

        // Geolocation for these threats
        const results = await Promise.all(threats.slice(0, 8).map(async (threat: any) => {
            const host = threat.hostname;
            try {
                const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);

                let resolvedIp = host;
                if (!isIp) {
                    const dnsRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${host}&type=A`, { headers: { 'Accept': 'application/dns-json' } });
                    const dnsData = await dnsRes.json();
                    if (dnsData.Answer?.[0]?.data) resolvedIp = dnsData.Answer[0].data;
                }

                const geoRes = await fetch(`https://ipwho.is/${resolvedIp}`);
                const geoData = await geoRes.json();

                return {
                    id: `global-${threat.id}`,
                    target: host,
                    type: 'critical',
                    lat: geoData.latitude || (Math.random() * 120 - 60),
                    lng: geoData.longitude || (Math.random() * 240 - 120),
                    timestamp: new Date(threat.dateadded).toISOString(),
                    source: 'global'
                };
            } catch (e) {
                return {
                    id: `global-${threat.id}`,
                    target: host,
                    type: 'critical',
                    lat: (Math.random() * 120 - 60),
                    lng: (Math.random() * 240 - 120),
                    timestamp: new Date(threat.dateadded).toISOString(),
                    source: 'global'
                };
            }
        }));

        return new Response(JSON.stringify(results), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Telemetry error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

// Fallback feed if URLhaus fails (uses Feodotracker)
async function handleFallbackFeed(corsHeaders: any) {
    try {
        const response = await fetch('https://feodotracker.abuse.ch/downloads/ipblocklist.json');
        const data = await response.json();
        const top5 = data.slice(0, 5);

        return new Response(JSON.stringify(top5.map((ip: any) => ({
            id: `global-feodo-${ip.ip_address}`,
            target: ip.ip_address,
            type: 'critical',
            lat: (Math.random() * 120 - 60), // Simplified for fallback
            lng: (Math.random() * 240 - 120),
            timestamp: new Date().toISOString(),
            source: 'global'
        }))), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (e) {
        throw new Error("All threat feeds are unavailable");
    }
}
