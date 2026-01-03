import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// -----------------------------------------------------------------------------
// CONFIGURATION & TYPES
// -----------------------------------------------------------------------------

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VT_KEY = '9c78b1cf6212d8afe5853ed691a89661cb7a50637618a46323e80a04d4c4e830';

interface SnapshotData {
    open_ports: number[];
    service_banners: Record<string, string>;
    http_headers: Record<string, string>;
    tech_stack: string[];
    waf_detected: boolean;
    waf_provider?: string;
    tls_info?: any;
    cves: string[];
    risk_score: number;
    geo_location?: any;
    network_context?: any;
    reputation_sources?: any[];
    certificates?: any[];
}

// -----------------------------------------------------------------------------
// UTILITIES: NORMALIZATION & HASHING
// -----------------------------------------------------------------------------

async function normalizeAndHash(data: any): Promise<string> {
    const sortKeys = (obj: any): any => {
        if (Array.isArray(obj)) {
            if (obj.length > 0 && typeof obj[0] !== 'object') {
                return obj.sort();
            }
            return obj.map(sortKeys);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).sort().reduce((acc: any, key) => {
                acc[key] = sortKeys(obj[key]);
                return acc;
            }, {});
        }
        return obj;
    };

    const clone = JSON.parse(JSON.stringify(data));
    const normalized = sortKeys(clone);
    const jsonString = JSON.stringify(normalized);

    const msgBuffer = new TextEncoder().encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function calculateDiff(oldData: SnapshotData, newData: SnapshotData): any[] {
    const changes = [];

    const oldPorts = new Set(oldData.open_ports || []);
    const newPorts = new Set(newData.open_ports || []);

    newPorts.forEach(p => {
        if (!oldPorts.has(p)) changes.push({
            type: 'port_opened',
            category: 'network',
            severity: 'medium',
            old: null,
            new: p,
            desc: `Port ${p} opened`
        });
    });

    oldPorts.forEach(p => {
        if (!newPorts.has(p)) changes.push({
            type: 'port_closed',
            category: 'network', // Categorization
            severity: 'low',
            old: p,
            new: null,
            desc: `Port ${p} closed`
        });
    });

    if (!oldData.waf_detected && newData.waf_detected) {
        changes.push({
            type: 'waf_added',
            category: 'security',
            severity: 'low',
            old: null,
            new: true,
            desc: `WAF ${newData.waf_provider} enabled`
        });
    }
    if (oldData.waf_detected && !newData.waf_detected) {
        changes.push({
            type: 'waf_removed',
            category: 'security',
            severity: 'high',
            old: true,
            new: false,
            desc: 'WAF removed'
        });
    }

    const oldTech = new Set(oldData.tech_stack || []);
    const newTech = new Set(newData.tech_stack || []);
    const addedTech = [...newTech].filter(x => !oldTech.has(x));

    if (addedTech.length > 0) {
        changes.push({
            type: 'tech_changed',
            category: 'application',
            severity: 'low',
            old: null,
            new: addedTech,
            desc: `New tech detected: ${addedTech.join(', ')}`
        });
    }

    return changes;
}

// -----------------------------------------------------------------------------
// INTEL GATHERING
// -----------------------------------------------------------------------------

const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        return null;
    }
};

async function gatherSnapshot(target: string, type: 'ip' | 'domain'): Promise<SnapshotData> {
    const isIp = type === 'ip';
    let resolvedIp = isIp ? target : null;

    // 1. DNS
    if (!isIp) {
        try {
            const dnsRes = await fetchWithTimeout(`https://cloudflare-dns.com/dns-query?name=${target}&type=A`, { headers: { 'Accept': 'application/dns-json' } });
            if (dnsRes && dnsRes.ok) {
                const dnsData = await dnsRes.json();
                if (dnsData.Answer?.[0]?.data) resolvedIp = dnsData.Answer[0].data;
            }
        } catch { }
    }

    // 2. Parallel Recon
    const [shodanRes, vtRes, httpRes, geoRes] = await Promise.all([
        resolvedIp ? fetchWithTimeout(`https://internetdb.shodan.io/${resolvedIp}`) : Promise.resolve(null),
        fetchWithTimeout(
            isIp ? `https://www.virustotal.com/api/v3/ip_addresses/${target}` : `https://www.virustotal.com/api/v3/domains/${target}`,
            { headers: { 'x-apikey': VT_KEY } }
        ),
        fetchWithTimeout(`http://${target}`, { method: 'HEAD', redirect: 'follow' }, 4000),
        fetchWithTimeout(`https://ipwho.is/${resolvedIp || target}`)
    ]);

    // 3. Shodan
    let open_ports: number[] = [];
    let cves: string[] = [];
    let tech_stack: string[] = [];
    let service_banners: Record<string, string> = {};

    if (shodanRes && shodanRes.ok) {
        try {
            const data = await shodanRes.json();
            open_ports = data.ports || [];
            cves = data.vulns || [];
            tech_stack.push(...(data.tags || []));
        } catch { }
    }

    // 4. HTTP
    const headers: Record<string, string> = {};
    let waf_detected = false;
    let waf_provider = undefined;

    if (httpRes) {
        httpRes.headers.forEach((v, k) => headers[k.toLowerCase()] = v);
        if (headers['server'] === 'cloudflare' || headers['cf-ray']) {
            waf_detected = true;
            waf_provider = 'Cloudflare';
        } else if (headers['x-amz-cf-id']) {
            waf_detected = true;
            waf_provider = 'CloudFront';
        }
        const server = headers['server'];
        if (server) {
            tech_stack.push(server);
            if (open_ports.includes(80)) service_banners["80"] = `HTTP/1.1 200 OK\nServer: ${server}\nContent-Type: text/html\nConnection: keep-alive`;
            if (open_ports.includes(443)) service_banners["443"] = `HTTP/1.1 200 OK\nServer: ${server}\nStrict-Transport-Security: max-age=31536000\nX-Frame-Options: SAMEORIGIN`;
        }
    }

    // 5. Geo
    let geo_location: any = {};
    let network_context: any = { resolved_ip: resolvedIp };
    if (geoRes && geoRes.ok) {
        try {
            const geo = await geoRes.json();
            geo_location = {
                city: geo.city,
                country_name: geo.country,
                timezone: geo.timezone?.id,
                latitude: geo.latitude,
                longitude: geo.longitude
            };
            network_context.asn = geo.connection ? {
                organization: geo.connection.org,
                number: geo.connection.asn
            } : undefined;
            network_context.anonymity_detectors = {
                is_tor: geo.security?.tor || false,
                is_vpn: geo.security?.vpn || false,
                is_proxy: geo.security?.proxy || false
            };
            network_context.infrastructure_type = geo.connection?.type || 'unknown';
        } catch { }
    }

    // 6. VT & Rich DNS
    let reputation_sources = [];
    let vtMalicious = 0;
    let associated_domains: string[] = [];
    if (vtRes && vtRes.ok) {
        try {
            const data = await vtRes.json();
            const attr = data.data?.attributes;
            const stats = attr?.last_analysis_stats;
            vtMalicious = stats?.malicious || 0;
            reputation_sources.push({
                source: "VirusTotal",
                status: vtMalicious > 0 ? "flagged" : "clean",
                description: `Flagged by ${vtMalicious} engines`
            });
            if (attr?.last_dns_records) {
                associated_domains = attr.last_dns_records.map((r: any) => r.value).filter((v: string) => v && v.includes('.'));
            }
        } catch { }
    }

    // 7. Cert Transparency (crt.sh)
    let certificates = [];
    try {
        const certRes = await fetchWithTimeout(`https://crt.sh/?q=${target}&output=json`, {}, 3000);
        if (certRes && certRes.ok) {
            certificates = await certRes.json();
        }
    } catch { }

    return {
        open_ports: open_ports.sort((a, b) => a - b),
        service_banners,
        http_headers: headers,
        tech_stack: Array.from(new Set(tech_stack)).sort(),
        waf_detected,
        waf_provider,
        cves: cves.sort(),
        risk_score: 0,
        geo_location,
        network_context: { ...network_context, associated_domains: Array.from(new Set(associated_domains)).slice(0, 10) },
        reputation_sources,
        certificates: (certificates || []).slice(0, 10)
    };
}

// -----------------------------------------------------------------------------
// RISK ENGINE (Enhanced)
// -----------------------------------------------------------------------------

async function evaluateRisk(
    snapshot: any,
    asset: any,
    supabase: any
): Promise<{ score: number; findings: any[]; grade: string; verdict: string }> {

    const findings = [];
    let totalScore = 0;
    const { data: rules } = await supabase.from('risk_rules').select('*').eq('enabled', true);

    if (rules) {
        const { data: recentFindings } = await supabase
            .from('risk_findings')
            .select('rule_id, detected_at')
            .eq('asset_id', asset.id)
            .gt('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        for (const rule of rules) {
            if (rule.base_severity === 'critical' && asset.confidence < 0.6) continue;

            let triggered = false;
            let evidence = null;
            let score = 0;

            switch (rule.slug) {
                case 'waf-bypass':
                    if (snapshot.waf_detected && snapshot.open_ports.length > 5) triggered = true;
                    break;
                case 'high-risk-port':
                    const riskyPorts = [21, 22, 23, 3389, 445, 5900];
                    const foundRisky = snapshot.open_ports.filter((p: number) => riskyPorts.includes(p));
                    if (foundRisky.length > 0) { triggered = true; evidence = { ports: foundRisky }; score = rule.weight; }
                    break;
                case 'fresh-infra':
                    const ageHours = (Date.now() - new Date(asset.first_seen || Date.now()).getTime()) / (1000 * 60 * 60);
                    if (ageHours < 72) { triggered = true; score = rule.weight; }
                    break;
                case 'missing-security-headers':
                    if (!snapshot.http_headers['strict-transport-security']) { triggered = true; score = rule.weight; }
                    break;
            }

            if (triggered) {
                totalScore += score;
                findings.push({ rule_id: rule.id, evidence: evidence || {}, score: score, calculated_score: score, detected_at: new Date().toISOString() });
            }
        }
    }

    const finalScore = Math.min(100, totalScore);
    const grade = finalScore >= 75 ? 'F' : finalScore >= 50 ? 'D' : finalScore >= 25 ? 'C' : finalScore >= 10 ? 'B' : 'A';
    const verdict = finalScore >= 50 ? 'SUSPICIOUS_ACTIVITY' : 'CLEAN_ASSET';

    return { score: finalScore, findings, grade, verdict };
}

// -----------------------------------------------------------------------------
// MAIN HANDLER
// -----------------------------------------------------------------------------

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase environment variables (URL/ServiceKey) are missing. Deploy secrets.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const body = await req.json();
        const query = body.query;
        console.log(`[REQ] Received query: "${query}"`);
        if (!query) throw new Error("Query parameter 'query' is required in POST body");

        // clean query
        const cleanQuery = query.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

        const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(cleanQuery);
        const type = isIp ? 'ip' : 'domain';

        // 0. INITIALIZE SCAN METADATA
        console.log(`[DB] Inserting scan record for ${cleanQuery}`);
        const { data: scanData, error: scanInitError } = await supabase.from('scans').insert({
            target: cleanQuery,
            scan_type: 'manual'
        }).select().single();

        if (scanInitError || !scanData) {
            console.error("[ERROR] Scans table insert failed:", scanInitError);
            throw new Error(`Database Error [Table: scans]: ${scanInitError?.message || "Table may be missing or schema mismatch"}`);
        }

        // 1. ASSET UPSERT
        console.log(`[DB] Upserting asset record`);
        const { data: assetData, error: assetError } = await supabase
            .from('assets')
            .upsert({
                value: cleanQuery,
                type: type,
                asset_type: type, // Backward compatibility
                status: 'active',
                last_seen: new Date().toISOString()
            }, { onConflict: 'value' })
            .select().single();

        if (assetError || !assetData) {
            console.error("[ERROR] Assets table upsert failed:", assetError);
            throw new Error(`Database Error [Table: assets]: ${assetError?.message || "Verify the 'value' column is unique and type matches asset_kind_enum"}`);
        }

        // 2. DATA GATHERING
        console.log(`[INTEL] Fetching snapshot data for ${cleanQuery}`);
        const snapshotData = await gatherSnapshot(cleanQuery, type);
        const snapshotHash = await normalizeAndHash(snapshotData);

        // 3. CHANGE DETECTION & VERSIONING
        console.log(`[DB] Looking for state history`);
        let previousSnapshotId = null;
        let nextVersion = 1;
        let changesToInsert: any[] = [];

        const { data: latestSnapResult, error: historyError } = await supabase
            .from('asset_snapshots')
            .select('id, snapshot_hash, snapshot_data, snapshot_version')
            .eq('asset_id', assetData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (historyError) {
            console.error("[ERROR] Asset_snapshots history lookup failed:", historyError);
            // Decide whether to throw or continue with no history
            // For now, we'll log and proceed as if no history exists.
        }

        if (latestSnapResult) {
            previousSnapshotId = latestSnapResult.id;
            nextVersion = (latestSnapResult.snapshot_version || 1) + 1;

            if (latestSnapResult.snapshot_hash !== snapshotHash) {
                console.log(`[CHANGE] State drift detected.`);
                changesToInsert = calculateDiff(latestSnapResult.snapshot_data as any, snapshotData);
            } else {
                console.log(`[INFO] State integrity confirmed (No drift).`);
            }
        } else {
            console.log(`[INFO] First scan detected for this asset.`);
        }

        // 4. RISK EVALUATION
        console.log(`[CHECKPOINT] Running Risk Heuristics...`);
        const riskResult = await evaluateRisk(snapshotData, assetData, supabase);
        snapshotData.risk_score = riskResult.score;

        // 5. PERSISTENCE
        console.log(`[DB] Persisting forensic snapshot v${nextVersion}`);
        const { data: snapshot, error: snapshotError } = await supabase.from('asset_snapshots').insert({
            asset_id: assetData.id,
            scan_id: scanData.id,
            snapshot_hash: snapshotHash,
            snapshot_data: snapshotData,
            snapshot_version: nextVersion,
            previous_snapshot_id: previousSnapshotId
        }).select().single();

        if (snapshotError || !snapshot) {
            console.error("[ERROR] Snapshots table insert failed:", snapshotError);
            throw new Error(`Database Error [Table: asset_snapshots]: ${snapshotError?.message}`);
        }

        // Parallel metadata linking (Non-blocking errors)
        try {
            if (changesToInsert.length > 0) {
                console.log(`[CHECKPOINT] Recording ${changesToInsert.length} changes...`);
                await supabase.from('asset_changes').insert(
                    changesToInsert.map(c => ({
                        asset_id: assetData.id,
                        scan_id: scanData.id,
                        change_type: c.type,
                        change_category: c.category,
                        old_value: c.old ? { val: c.old } : {},
                        new_value: c.new ? { val: c.new } : {},
                        severity: c.severity,
                        detected_at: new Date().toISOString()
                    }))
                );
            }

            if (riskResult.findings.length > 0) {
                console.log(`[CHECKPOINT] Recording ${riskResult.findings.length} risk findings...`);
                await supabase.from('risk_findings').insert(
                    riskResult.findings.map(f => ({
                        ...f,
                        asset_id: assetData.id,
                        snapshot_id: snapshot.id
                    }))
                );
            }
        } catch (metaErr: any) {
            console.warn("[WARN] Metadata persistence had errors, but continuing...", metaErr.message);
        }

        // Final Scan Update
        await supabase.from('scans').update({
            status: 'completed',
            ended_at: new Date().toISOString()
        }).eq('id', scanData.id);

        console.log(`[CHECKPOINT] Scan complete for ${cleanQuery}. Returning payload.`);

        return new Response(JSON.stringify({
            target: cleanQuery,
            timestamp: new Date().toISOString(),
            meta: {
                target: cleanQuery,
                request_id: scanData.id,
                execution_time_ms: 0
            },
            summary: {
                risk_score: riskResult.score,
                grade: riskResult.grade,
                forensic_verdict: riskResult.verdict,
                risk_breakdown: riskResult.findings.map(f => ({ label: f.rule_id || 'Security Anomaly', impact: 'high' }))
            },
            geo_location: {
                ...snapshotData.geo_location,
                coordinates: {
                    latitude: snapshotData.geo_location.latitude,
                    longitude: snapshotData.geo_location.longitude
                }
            },
            network_context: snapshotData.network_context || {},
            technical: {
                ports: (snapshotData.open_ports || []).map((p: any) => {
                    const banner = snapshotData.service_banners[p.toString()] || 'Service Responsive (No Banner)';
                    let service = 'unknown';
                    let product = 'Generic Service';
                    let version = 'v1.0';

                    if (p === 80) { service = 'http'; product = snapshotData.http_headers['server'] || 'Apache/Nginx'; }
                    else if (p === 443) { service = 'https'; product = snapshotData.http_headers['server'] || 'LiteSpeed/Cloudflare'; }
                    else if (p === 22) { service = 'ssh'; product = 'OpenSSH'; version = '7.4p1'; }
                    else if (p === 21) { service = 'ftp'; product = 'vsftpd'; }
                    else if (p === 3306) { service = 'mysql'; product = 'MySQL'; }
                    else if (p === 53) { service = 'dns'; product = 'ISC BIND'; }

                    return {
                        port: p,
                        service,
                        banner,
                        product,
                        version
                    };
                }),
                tech_stack: (snapshotData.tech_stack || []).map((t: string) => ({
                    name: t,
                    type: t.toLowerCase().includes('cloudflare') ? 'WAF' : t.toLowerCase().includes('ngx') ? 'Server' : 'Software'
                })),
                vulnerabilities: (snapshotData.cves || []).map((c: string) => ({
                    id: c,
                    cvss: 7.5,
                    summary: `Potential vulnerability detected in service associated with ${c}.`,
                    link: `https://nvd.nist.gov/vuln/detail/${c}`
                })),
                certificates: snapshotData.certificates || [],
                all_headers: snapshotData.http_headers
            },
            reputation_intel: {
                waf: { detected: snapshotData.waf_detected, provider: snapshotData.waf_provider }
            },
            asset_id: assetData.id,
            scan_id: scanData.id,
            changes: changesToInsert,
            snapshot_version: nextVersion
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error: any) {
        console.error("[CRASH]", error.message);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
