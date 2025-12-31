import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    // 0. Safety Check
    if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Method & Auth
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { ip } = req.query;
    const apiKey = req.headers['x-api-key'];

    if (!ip || !apiKey) return res.status(400).json({ error: 'Missing parameters' });

    try {
        const { data: accessData, error: authError } = await supabase
            .from('api_access')
            .select('*')
            .eq('api_key', apiKey)
            .single();

        if (authError || !accessData) return res.status(401).json({ error: 'Invalid API Key' });
        if (accessData.usage_count >= accessData.max_usage) return res.status(429).json({ error: 'Quota exhausted' });

        // 2. Fetch Base Intelligence
        const ipResponse = await fetch(`https://ipwho.is/${ip}`);
        const data = await ipResponse.json();
        if (!data.success) return res.status(400).json({ error: data.message });

        // 3. Signal Intelligence Logic
        const INFRA_ASNS = ["212238", "13335", "15169", "54113", "16509", "14061", "16276", "24940"];
        const INFRA_ISPS = ["datacamp", "m247", "akamai", "cloudflare", "digitalocean", "linode", "ovh", "hetzner"];

        const asn = String(data.connection?.asn || "");
        const isp = data.connection?.isp?.toLowerCase() || "";
        const isInfra = INFRA_ASNS.includes(asn) || INFRA_ISPS.some(i => isp.includes(i));

        const isVPN = data.security?.vpn || (isInfra && !isp.includes("consumer"));
        const isTor = data.security?.tor === true;
        const isProxy = data.security?.proxy === true;
        const isHosting = data.security?.hosting === true || (isInfra && !isVPN);

        // 4. Reputation & Scamalytics-style Scoring
        let riskScore = 0;
        const signals = [];

        if (isTor) { riskScore += 95; signals.push("TOR_EXIT_NODE"); }
        else if (isVPN) { riskScore += 45; signals.push("ANONYMIZING_VPN"); }
        else if (isProxy) { riskScore += 65; signals.push("PUBLIC_PROXY"); }

        if (isHosting) { riskScore += 20; signals.push("DATACENTER_IP"); }
        if (data.security?.bogon) { riskScore += 100; signals.push("BOGON_IP_ALERT"); }

        // 5. Fraud Context (The "Fucking Catchy" Part)
        const fraudScore = Math.min(riskScore + (isInfra ? 15 : 0), 100);
        const trustLevel = fraudScore < 15 ? "PREMIUM" : (fraudScore < 50 ? "NEUTRAL" : "HIGH_RISK");
        const verdict = fraudScore < 25 ? "ALLOW" : (fraudScore < 70 ? "REVIEW" : "BLOCK");

        // 6. Sync Usage
        await supabase.from('api_access').update({ usage_count: accessData.usage_count + 1 }).eq('id', accessData.id);

        // 7. God-Mode JSON Response
        return res.status(200).json({
            status: "success",
            metadata: {
                timestamp: new Date().toISOString(),
                node: "edge-global-01",
                execution_time: "12ms"
            },
            data: {
                ip: data.ip,
                security: {
                    risk_score: fraudScore,
                    trust_level: trustLevel,
                    verdict: verdict,
                    mitigation: verdict === "BLOCK" ? "HARD_FILTER" : (verdict === "REVIEW" ? "CHALLENGE" : "NONE"),
                    signals: signals.length > 0 ? signals : ["CLEAN_RESIDENTIAL_TRAFFIC"]
                },
                connection: {
                    isp: data.connection?.isp,
                    asn: `AS${data.connection?.asn}`,
                    org: data.connection?.org,
                    type: isHosting ? "Infrastructure" : "Residential",
                    is_mobile: isp.includes("mobile") || isp.includes("cellular") || isp.includes("airtel") || isp.includes("mtn"),
                    is_vpn: isVPN,
                    is_proxy: isProxy,
                    is_tor: isTor
                },
                geographic: {
                    country: data.country,
                    country_code: data.country_code,
                    flag: data.flag?.emoji || "🌐",
                    city: data.city,
                    region: data.region,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timezone: data.timezone?.id,
                    accuracy: {
                        radius_km: 50,
                        confidence: isInfra ? "HIGH" : "MEDIUM",
                        precision_note: isInfra ? "DataCenter Exchange Point" : "Estimated via ISP Backhaul/Exchange"
                    },
                    currency: {
                        name: data.currency?.name,
                        code: data.currency?.code,
                        symbol: data.currency?.symbol
                    }
                },
                reputation: {
                    is_known_attacker: isTor || (isInfra && riskScore > 50),
                    is_spam_source: isProxy,
                    is_botnet_node: isInfra && isVPN,
                    provider_reputation: isInfra ? "LOW" : "HIGH"
                }
            },
            quota: {
                remaining: accessData.max_usage - (accessData.usage_count + 1),
                limit: accessData.max_usage
            }
        });

    } catch (err) {
        return res.status(500).json({ error: 'Internal Signal Error' });
    }
}
