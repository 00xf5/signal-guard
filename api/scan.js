import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    // 0. Safety Check for Env Vars
    if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({
            error: 'Server configuration error: Missing Supabase keys in Vercel Dashboard.'
        });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // 1. Method Check
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ip } = req.query;
    const apiKey = req.headers['x-api-key'];

    if (!ip) return res.status(400).json({ error: 'Missing IP parameter' });
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    try {
        // 2. Auth & Quota Check
        const { data: accessData, error: authError } = await supabase
            .from('api_access')
            .select('*')
            .eq('api_key', apiKey)
            .single();

        if (authError || !accessData) {
            return res.status(401).json({ error: 'Invalid API Key' });
        }

        if (accessData.usage_count >= accessData.max_usage) {
            return res.status(429).json({ error: 'Quota exhausted' });
        }

        // 3. Fetch IP Data
        const ipResponse = await fetch(`https://ipwho.is/${ip}`);
        const data = await ipResponse.json();

        if (!data.success) {
            return res.status(400).json({ error: data.message || 'Failed to scan IP' });
        }

        // 4. Reputation Intelligence (Same logic as Frontend)
        const INFRASTRUCTURE_ASNS = ["212238", "13335", "15169", "54113", "16509", "14061", "16276", "24940"];
        const INFRASTRUCTURE_ISPS = ["datacamp", "m247", "akamai", "cloudflare", "digitalocean", "linode", "ovh", "hetzner", "google cloud", "amazon technologies", "microsoft azure"];

        const rawAsn = data.connection?.asn ? String(data.connection.asn) : "";
        const rawIsp = data.connection?.isp?.toLowerCase() || "";
        const isKnownInfra = INFRASTRUCTURE_ASNS.includes(rawAsn) ||
            INFRASTRUCTURE_ISPS.some(infra => rawIsp.includes(infra));

        const isVPN = data.security?.vpn === true || (isKnownInfra && !rawIsp.includes("consumer"));
        const isProxy = data.security?.proxy === true || data.security?.relay === true;
        const isTor = data.security?.tor === true;
        const isHosting = data.security?.hosting === true || (isKnownInfra && !isVPN);

        // 5. Calculate Scores (Simplified for API)
        let riskScore = 5.0;
        if (isTor) riskScore += 80;
        else if (isVPN || isProxy) riskScore += 45;
        if (isHosting && !isVPN) riskScore += 15;

        // 6. Update Quota
        await supabase
            .from('api_access')
            .update({ usage_count: accessData.usage_count + 1 })
            .eq('id', accessData.id);

        // 7. Return Response
        return res.status(200).json({
            status: "success",
            data: {
                ip: data.ip,
                location: {
                    country: data.country,
                    city: data.city,
                    timezone: data.timezone?.id
                },
                network: {
                    isp: data.connection?.isp,
                    asn: `AS${data.connection?.asn}`,
                    type: isHosting ? "Infrastructure" : "Residential"
                },
                security: {
                    risk_score: Math.min(riskScore, 100),
                    is_vpn: isVPN,
                    is_proxy: isProxy,
                    is_tor: isTor,
                    is_hosting: isHosting,
                    is_bot: isHosting && (isVPN || isProxy)
                }
            },
            quota: {
                remaining: accessData.max_usage - (accessData.usage_count + 1),
                limit: accessData.max_usage
            }
        });

    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
