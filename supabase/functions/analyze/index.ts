import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enterprise-Grade Response Structure
interface ThreatResponse {
    meta: {
        target: string;
        type: 'ip' | 'domain';
        timestamp: string;
        request_id: string;
        engine_version: string;
        execution_time_ms: number;
    };
    summary: {
        risk_score: number; // 0-100
        risk_level: 'safe' | 'suspicious' | 'high' | 'critical';
        verdict_label: string;
        confidence_score: string; // HIGH, MEDIUM, LOW
    };
    intelligence: {
        signals_detected: string[];
        reputation_sources: Array<{
            source: string;
            status: 'clean' | 'flagged' | 'unchecked';
            description?: string;
        }>;
    };
    network_context: {
        resolved_ip?: string;
        hostname?: string;
        asn?: {
            number: string;
            organization: string;
            route: string;
        };
        infrastructure_type: string; // 'Residential', 'Datacenter', 'Mobile', etc.
        anonymity_detectors: {
            is_tor: boolean;
            is_vpn: boolean;
            is_proxy: boolean;
            is_abuser: boolean;
        };
    };
    geo_location?: {
        country_name: string;
        country_code: string;
        city: string;
        region: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        timezone: string;
    };
    cached: boolean;
}

serve(async (req) => {
    const startTime = Date.now();
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        // Initialize DB Client using Env Vars
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { query, type: rawType } = await req.json();
        if (!query) throw new Error("Query parameter is required");

        // Normalization
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query);
        const type = isIp ? 'ip' : 'domain';

        // 1. CACHE CHECK (24h TTL)
        try {
            const { data: cachedData } = await supabase
                .from('discovery_cache')
                .select('*')
                .eq('target', query)
                .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                .maybeSingle();

            if (cachedData) {
                console.log("Serving from cache:", query);
                const cachedPayload = typeof cachedData.data === 'string' ? JSON.parse(cachedData.data) : cachedData.data;
                // Update execution time and cached flag to reflect the CURRENT cache retrieval, not the original scan
                cachedPayload.meta.execution_time_ms = Date.now() - startTime;
                cachedPayload.cached = true;
                return new Response(JSON.stringify(cachedPayload), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
        } catch (err) { console.error("Cache Read Error:", err); }

        // --- 1. INTELLIGENCE LAYERS ---
        const signals: string[] = [];
        let riskScore = 0;

        // VIRUSTOTAL CONFIGURATION (Standard Free Tier: 4 req/min)
        const vtKey = '9c78b1cf6212d8afe5853ed691a89661cb7a50637618a46323e80a04d4c4e830';
        let vtStatus: 'clean' | 'flagged' | 'unchecked' = 'unchecked';
        let vtDesc = 'Rate limit reserved or API unavailable';

        try {
            // We use the VT V3 API
            const endpoint = type === 'ip'
                ? `https://www.virustotal.com/api/v3/ip_addresses/${query}`
                : `https://www.virustotal.com/api/v3/domains/${query}`;

            const vtRes = await fetch(endpoint, {
                headers: { 'x-apikey': vtKey }
            });

            if (vtRes.status === 429) {
                console.warn("VirusTotal Rate Limit Exceeded (4/min)");
                vtStatus = 'unchecked';
                vtDesc = 'Global quota exceeded (Free Tier: 4 req/min). Falling back to Heuristics.';
                signals.push('SYSTEM: VT_RATE_LIMIT_HIT');
            }
            else if (vtRes.ok) {
                const vtData = await vtRes.json();
                const stats = vtData.data?.attributes?.last_analysis_stats;

                if (stats) {
                    const malicious = stats.malicious || 0;
                    const suspicious = stats.suspicious || 0;

                    if (malicious > 0) {
                        riskScore = 100;
                        vtStatus = 'flagged';
                        vtDesc = `Flagged by ${malicious} security vendors`;
                        signals.push(`VIRUSTOTAL: MALICIOUS_DETECTION_x${malicious}`);
                    } else if (suspicious > 0) {
                        riskScore = Math.max(riskScore, 65);
                        vtStatus = 'flagged';
                        signals.push(`VIRUSTOTAL: SUSPICIOUS_DETECTION_x${suspicious}`);
                        vtDesc = `Flagged as Suspicious by ${suspicious} vendors`;
                    } else {
                        vtStatus = 'clean';
                        vtDesc = 'Clean scan across 90+ security vendors';
                    }
                }
            }
        } catch (e) {
            console.error("VT API Failed", e);
            vtDesc = "API Connection Failed";
        }

        // --- FALLBACK LAYERS (If VT Limit Hit or Clean) ---
        // We still run these to enrich the data (e.g. Heuristics for entropy, Infras check)

        // Cloudflare Malware Check (DNS)
        // Only run this if VT was clean or skipped, to double-check
        // (If VT says malicious, it stays malicious. If VT says clean, we verify with Cloudflare)
        if (riskScore < 90) {
            try {
                // 1. Google DNS (The Unfiltered Truth)
                const googleRes = await fetch(`https://dns.google/resolve?name=${query}&type=A`, {
                    headers: { 'Accept': 'application/dns-json' }
                });
                const gData = await googleRes.json();
                const existsOnInternet = gData.Answer && gData.Answer.length > 0;

                // 2. Cloudflare Security DNS
                const cfSecRes = await fetch(`https://security.cloudflare-dns.com/dns-query?name=${query}&type=A`, {
                    headers: { 'Accept': 'application/dns-json' }
                });

                if (cfSecRes.ok) {
                    const cfSecData = await cfSecRes.json();
                    if (existsOnInternet) {
                        const isBlocked = !cfSecData.Answer || cfSecData.Answer.length === 0 || cfSecData.Status === 3;
                        if (isBlocked) {
                            riskScore = 100;
                            signals.push('THREAT_INTEL: BLOCKED_BY_CLOUDFLARE_SECURITY');
                        }
                    }
                }
            } catch (e) { }
        }

        // --- 2. DNS & INFRASTRUCTURE RESOLUTION ---
        let resolvedIp = isIp ? query : null;
        if (type === 'domain' && !resolvedIp) {
            // Try Cloudflare DNS
            try {
                const dnsRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${query}&type=A`, { headers: { 'Accept': 'application/dns-json' } });
                const dnsData = await dnsRes.json();
                if (dnsData.Answer?.[0]?.data) resolvedIp = dnsData.Answer[0].data;
            } catch (e) { }
        }

        // --- 3. IP INTELLIGENCE (ipwho.is) ---
        let geoData: any = {};
        if (resolvedIp) {
            try {
                const geoRes = await fetch(`https://ipwho.is/${resolvedIp}`);
                geoData = await geoRes.json();
            } catch (e) { }
        }

        // --- 4. HEURISTIC ENGINE ---

        // Infrastructure Analysis
        const hostingKeywords = ['amazon', 'google cloud', 'digitalocean', 'microsoft', 'oracle', 'alibaba', 'zenlayer', 'choopa', 'hetzner'];
        const ispName = (geoData.connection?.isp || "").toLowerCase();
        const orgName = (geoData.connection?.org || "").toLowerCase();
        const isDatacenter = hostingKeywords.some(k => ispName.includes(k) || orgName.includes(k));

        if (riskScore < 100) {
            // Start Heuristic Checks
            // 1. Infrastructure Checks
            // Only flag Datacenter hosting as suspicious if we are analyzing an Identity/IP (checking for VPNs)
            // For Domains (websites), hosting in a Datacenter is normal/expected.
            if (isDatacenter && type === 'ip') {
                riskScore = Math.max(riskScore, 40);
                signals.push('INFRASTRUCTURE_MISMATCH: Datacenter IP detected for user traffic');
            }

            // Tor/Proxy Checks
            if (geoData.security?.tor) {
                riskScore = Math.max(riskScore, 80);
                signals.push('ANONYMITY_NET: TOR Exit Node Confirmed');
            }
            if (geoData.security?.vpn || geoData.security?.proxy) {
                riskScore = Math.max(riskScore, 50);
                signals.push('ANONYMITY_NET: Proxy or VPN Tunnel Detected');
            }

            // Domain Entropy (DGA)
            if (type === 'domain') {
                const entropy = (str: string) => {
                    const len = str.length;
                    const freq: any = {};
                    for (const char of str) freq[char] = (freq[char] || 0) + 1;
                    return Object.values(freq).reduce((sum: number, f: any) => sum - (f / len) * Math.log2(f / len), 0);
                };
                if (entropy(query) > 3.9) {
                    riskScore = Math.max(riskScore, 35);
                    signals.push('HEURISTIC: High Entropy Domain (Possible DGA)');
                }
                // Suspicious TLDs (Statistical probability of abuse)
                // Expanded list based on spamhaus statistics
                const susTLDs = ['.xyz', '.top', '.ru', '.cn', '.info', '.biz', '.loan', '.click', '.online', '.site', '.live', '.shop', '.pro', '.work'];
                if (susTLDs.some(tld => query.endsWith(tld))) {
                    riskScore += 25;
                    signals.push(`LOW_REPUTATION_TLD (${query.split('.').pop()})`);
                }
            }
        }

        // --- 5. RESPONSE ASSEMBLY ---
        let riskLevel: ThreatResponse['summary']['risk_level'] = 'safe';
        let verdict = 'CLEAN';
        if (riskScore >= 90) { riskLevel = 'critical'; verdict = 'MALICIOUS_INTENT'; }
        else if (riskScore >= 60) { riskLevel = 'high'; verdict = 'HIGH_RISK_ANOMALY'; }
        else if (riskScore >= 20) { riskLevel = 'suspicious'; verdict = 'SUSPICIOUS_INDICATORS'; }

        const responsePayload: ThreatResponse = {
            meta: {
                target: query,
                type: type,
                timestamp: new Date().toISOString(),
                request_id: crypto.randomUUID(),
                engine_version: '3.0.0-pro-vt-cached',
                execution_time_ms: Date.now() - startTime
            },
            summary: {
                risk_score: Math.min(riskScore, 100),
                risk_level: riskLevel,
                verdict_label: verdict,
                confidence_score: riskScore > 80 || riskScore < 10 ? 'HIGH' : 'MEDIUM'
            },
            intelligence: {
                signals_detected: signals.length > 0 ? signals : ['No Anomaly Detected'],
                reputation_sources: [
                    { source: 'VirusTotal V3', status: vtStatus as any, description: vtDesc },
                    { source: 'SignalGuard Heuristics', status: riskScore > 20 ? 'flagged' : 'clean', description: 'Behavioral & Infrastructure Analysis' },
                    { source: 'Cloudflare Security DNS', status: signals.includes('THREAT_INTEL: BLOCKED_BY_CLOUDFLARE_SECURITY') ? 'flagged' : 'clean', description: 'Malware Blocking Filter' }
                ]
            },
            network_context: {
                resolved_ip: resolvedIp || undefined,
                hostname: type === 'domain' ? query : undefined,
                asn: geoData.connection ? {
                    number: `AS${geoData.connection.asn}`,
                    organization: geoData.connection.org,
                    route: geoData.connection.domain
                } : undefined,
                infrastructure_type: isDatacenter ? 'Datacenter / Cloud' : 'Residential / Business',
                anonymity_detectors: {
                    is_tor: geoData.security?.tor || false,
                    is_vpn: geoData.security?.vpn || false,
                    is_proxy: geoData.security?.proxy || false,
                    is_abuser: false
                }
            },
            geo_location: geoData.success ? {
                country_name: geoData.country,
                country_code: geoData.country_code,
                city: geoData.city,
                region: geoData.region,
                coordinates: {
                    latitude: geoData.latitude,
                    longitude: geoData.longitude
                },
                timezone: geoData.timezone?.id
            } : undefined,
            cached: false
        };

        // Cache the result ONLY if it's a threat (suspicious or higher)
        // We don't cache clean results because domains can become compromised
        // This saves VT quota and keeps the cache focused on known threats
        if (riskScore >= 20) {
            try {
                await supabase.from('discovery_cache').upsert({
                    target: query,
                    type: type,
                    data: responsePayload,
                    risk_score: riskScore,
                    created_at: new Date().toISOString()
                });
            } catch (e) { console.error("Cache Write Error", e); }
        }

        return new Response(JSON.stringify(responsePayload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
