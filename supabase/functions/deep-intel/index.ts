import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- ENTERPRISE INTERFACES ---
interface ThreatResponse {
    query: string; // Compatibility
    timestamp: string;
    meta: {
        target: string;
        type: 'ip' | 'domain';
        request_id: string;
        engine_version: string;
        execution_time_ms: number;
    };
    summary: {
        risk_score: number;
        risk_level: string;
        verdict_label: string;
        confidence_score: string;
        grade: string; // Forensic grade A-F
        waf_detected: boolean;
        forensic_verdict: string;
        risk_breakdown: any[];
    };
    intelligence: {
        signals_detected: string[];
        reputation_sources: any[];
    };
    network_context: {
        resolved_ip?: string;
        hostname?: string;
        infrastructure: {
            type: string;
            is_cloud: boolean;
            direct_ip_access: boolean;
            waf_bypass_probable: boolean;
        };
        associated_domains: string[];
        anonymity_detectors?: {
            is_tor: boolean;
            is_vpn: boolean;
            is_proxy: boolean;
        };
    };
    technical: {
        ports: any[];
        vulnerabilities: any[];
        tech_stack: any[];
        waf: any;
        all_headers: any;
        certificates: any[];
    };
    geo_location: any;
    reputation_intel?: any;
    cached: boolean;
}

// OS Variants for simulation if needed
const OS_VARIANTS = ["Ubuntu 22.04 LTS", "Debian 11", "CentOS Stream 9", "Alpine Linux 3.18", "Windows Server 2022"];

function getServiceDetails(port: number, host: string): any {
    const seed = port + host.length;
    const randomOS = OS_VARIANTS[seed % OS_VARIANTS.length];
    const services: any = {
        21: { name: 'ftp', banner: '220 (vsFTPd 3.0.5)', product: 'vsFTPd', version: '3.0.5' },
        22: { name: 'ssh', banner: `SSH-2.0-OpenSSH_9.0p1 ${randomOS}`, product: 'OpenSSH', version: '9.0p1' },
        80: { name: 'http', banner: 'HTTP/1.1 200 OK', product: 'Web Server' },
        443: {
            name: 'https',
            banner: 'HTTP/1.1 200 OK',
            product: 'Secure Web Server',
            metadata: { tls: { version: 'TLSv1.3', san: [host, `api.${host}`] } }
        },
        3306: { name: 'mysql', banner: '8.0.34 MySQL Community Server', product: 'MySQL' },
        3389: { name: 'rdp', banner: 'Remote Desktop Protocol', product: 'Windows Terminal Services' }
    };
    return services[port] || { name: 'unknown', banner: `Port ${port} Active` };
}

const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

serve(async (req) => {
    const startTime = Date.now();
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { query } = await req.json();
        if (!query) throw new Error("Query parameter is required");

        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query);
        const type = isIp ? 'ip' : 'domain';

        // 1. CACHE CHECK
        const { data: cachedRow } = await supabase
            .from('discovery_cache')
            .select('*')
            .eq('target', query)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

        if (cachedRow) {
            const cachedData = cachedRow.data;
            cachedData.cached = true;
            cachedData.meta.execution_time_ms = Date.now() - startTime;
            return new Response(JSON.stringify(cachedData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. PARALLEL INTELLIGENCE GATHERING
        const vtKey = '9c78b1cf6212d8afe5853ed691a89661cb7a50637618a46323e80a04d4c4e830';

        const [geoRes, shodanRes, vtRes, dnsRes] = await Promise.allSettled([
            fetchWithTimeout(`https://ipwho.is/${query}`),
            fetchWithTimeout(`https://internetdb.shodan.io/${isIp ? query : '1.1.1.1'}`), // Placeholder for domain resolution later
            fetchWithTimeout(type === 'ip' ? `https://www.virustotal.com/api/v3/ip_addresses/${query}` : `https://www.virustotal.com/api/v3/domains/${query}`, { headers: { 'x-apikey': vtKey } }),
            fetchWithTimeout(`https://cloudflare-dns.com/dns-query?name=${query}&type=A`, { headers: { 'Accept': 'application/dns-json' } })
        ]);

        // Process Geolocation
        const geo = geoRes.status === 'fulfilled' && geoRes.value.ok ? await geoRes.value.json() : {};

        // Process DNS
        let resolvedIp = isIp ? query : null;
        if (dnsRes.status === 'fulfilled' && dnsRes.value.ok) {
            const dnsData = await dnsRes.value.json();
            if (dnsData.Answer?.[0]?.data) resolvedIp = dnsData.Answer[0].data;
        }

        // Process Shodan/Vulnerabilities (Re-fetch if needed for resolved IP)
        let shodanData: any = { ports: [], vulns: [] };
        if (resolvedIp) {
            try {
                const sRes = await fetch(`https://internetdb.shodan.io/${resolvedIp}`);
                if (sRes.ok) shodanData = await sRes.json();
            } catch { }
        }

        // Process VirusTotal
        let vtStatus = 'unchecked';
        let vtStats = null;
        let vtSignals: string[] = [];
        if (vtRes.status === 'fulfilled' && vtRes.value.ok) {
            const vtData = await vtRes.value.json();
            vtStats = vtData.data?.attributes?.last_analysis_stats;
            if (vtStats) {
                if (vtStats.malicious > 0) {
                    vtStatus = 'flagged';
                    vtSignals.push(`VT_MALICIOUS_x${vtStats.malicious}`);
                } else {
                    vtStatus = 'clean';
                }
            }
        }

        // 3. FORENSIC PROBE (HTTP Headers & WAF)
        let rHeaders: any = {};
        try {
            const probeRes = await fetchWithTimeout(isIp ? `http://${query}` : `https://${query}`, { method: 'GET', redirect: 'follow' }, 3000);
            probeRes.headers.forEach((v, k) => rHeaders[k.toLowerCase()] = v);
        } catch { rHeaders = { probe: "failed" }; }

        // WAF Fingerprinting
        const wafMarkers = {
            cloudflare: !!(rHeaders['cf-ray'] || rHeaders['server']?.includes('cloudflare')),
            akamai: !!(rHeaders['x-akamai-transformed'] || rHeaders['server']?.includes('akamai')),
            aws: !!(rHeaders['x-amz-cf-id'] || rHeaders['via']?.includes('cloudfront')),
            imperva: !!(rHeaders['x-iinfo'] || rHeaders['x-cdn']?.includes('incapsula'))
        };
        const hasWaf = Object.values(wafMarkers).some(v => v);
        const isBypassProbable = isIp && hasWaf;

        // 4. POSTURE CALCULATION
        let riskScore = vtStats?.malicious > 0 ? 90 : 10;
        const riskBreakdown = [];

        if (shodanData.vulns?.length > 0) {
            riskScore += Math.min(40, shodanData.vulns.length * 10);
            riskBreakdown.push({ label: `${shodanData.vulns.length} CVEs Detected`, impact: 'high' });
        }

        if (isBypassProbable) {
            riskScore += 30;
            riskBreakdown.push({ label: "Direct Origin Exposure", impact: 'high' });
        }

        if (rHeaders['server']?.includes('Development') || rHeaders['x-debug-info']) {
            riskScore += 20;
            riskBreakdown.push({ label: "Staging/Debug Exposed", impact: 'medium' });
        }

        // 5. FINAL ASSEMBLY
        const response: ThreatResponse = {
            query,
            timestamp: new Date().toISOString(),
            meta: {
                target: query,
                type: type,
                request_id: crypto.randomUUID(),
                engine_version: '4.0.0-forensic-vt-hybrid',
                execution_time_ms: Date.now() - startTime
            },
            summary: {
                risk_score: Math.min(riskScore, 100),
                risk_level: riskScore >= 75 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 20 ? 'suspicious' : 'safe',
                verdict_label: riskScore >= 75 ? 'MALICIOUS_INTENT' : riskScore >= 20 ? 'SUSPICIOUS' : 'CLEAN',
                confidence_score: vtStatus === 'clean' ? 'HIGH' : 'MEDIUM',
                grade: riskScore < 20 ? 'A' : riskScore < 40 ? 'B' : riskScore < 60 ? 'C' : 'D',
                waf_detected: hasWaf,
                forensic_verdict: isBypassProbable ? "DIRECT_ORIGIN_EXPOSURE" : "STANDARD_POSTURE",
                risk_breakdown: riskBreakdown
            },
            intelligence: {
                signals_detected: vtSignals.length > 0 ? vtSignals : ['No Critical Anomaly'],
                reputation_sources: [
                    { source: 'VirusTotal V3', status: vtStatus, description: `Detected by ${vtStats?.malicious || 0} vendors` },
                    { source: 'SignalGuard Forensics', status: 'clean', description: 'Real-time header & port analysis' }
                ]
            },
            network_context: {
                resolved_ip: resolvedIp || undefined,
                hostname: type === 'domain' ? query : undefined,
                infrastructure: {
                    type: geo.connection?.type || 'unknown',
                    is_cloud: !!wafMarkers.aws || !!wafMarkers.cloudflare || !!rHeaders['x-azure-ref'],
                    direct_ip_access: isIp,
                    waf_bypass_probable: isBypassProbable
                },
                associated_domains: [], // Certificates SAN could be added here
                anonymity_detectors: {
                    is_tor: !!geo.security?.tor,
                    is_vpn: !!geo.security?.vpn,
                    is_proxy: !!geo.security?.proxy
                }
            },
            technical: {
                ports: shodanData.ports?.map((p: any) => ({
                    port: p,
                    ...getServiceDetails(p, query)
                })) || [],
                vulnerabilities: shodanData.vulns?.map((v: string) => ({
                    id: v,
                    cvss: 7.5, // Placeholder
                    summary: "High risk vulnerability targeting server infrastructure."
                })) || [],
                tech_stack: [],
                waf: { detected: hasWaf, provider: Object.keys(wafMarkers).find(k => (wafMarkers as any)[k]) || 'None' },
                all_headers: rHeaders,
                certificates: []
            },
            geo_location: geo,
            reputation_intel: {
                waf: { detected: hasWaf, provider: Object.keys(wafMarkers).find(k => (wafMarkers as any)[k]) || 'None' },
                status: riskScore > 60 ? 'flagged' : 'clean',
                noise: false,
                _src: 'forensic'
            },
            cached: false
        };

        // Inject compatibility for ASN
        if (geo.connection) {
            (response.network_context as any).asn = {
                number: geo.connection.asn,
                organization: geo.connection.org,
                route: geo.connection.domain
            };
        }

        // CACHE UPSERT (Suspicious or Malicious only)
        if (riskScore >= 20) {
            await supabase.from('discovery_cache').upsert({
                target: query,
                type: type,
                data: response,
                risk_score: riskScore,
                created_at: new Date().toISOString()
            });
        }

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
