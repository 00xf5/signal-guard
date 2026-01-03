import { Severity, ExposureStatus } from '../types/asm';

export interface TaxonomyEntry {
    id: string;
    name: string;
    severity: Severity;
    category: 'Network' | 'Application' | 'Identity' | 'Infrastructure' | 'Behavioral';
    description: string;
    remediation: string;
}

/**
 * RiskSignal Exposure Taxonomy
 * Professional classification of security risks beyond simple CVEs.
 */
export const ExposureTaxonomy: Record<string, TaxonomyEntry> = {
    'EXP-NET-9200': {
        id: 'EXP-NET-9200',
        name: 'Public Elasticsearch Instance',
        severity: 'critical',
        category: 'Network',
        description: 'Elasticsearch database exposed without authentication, potentially leaking all cluster data.',
        remediation: 'Implement IP whitelisting or enable Shield/X-Pack authentication.'
    },
    'EXP-NET-3389': {
        id: 'EXP-NET-3389',
        name: 'Exposed RDP Service',
        severity: 'high',
        category: 'Network',
        description: 'Remote Desktop Protocol (RDP) exposed to the internet, inviting brute-force attacks.',
        remediation: 'Disable public RDP; use a VPN or Remote Desktop Gateway.'
    },
    'EXP-ID-WEAK-MAIL': {
        id: 'EXP-ID-WEAK-MAIL',
        name: 'Weak Email Security Posture',
        severity: 'medium',
        category: 'Identity',
        description: 'Missing or overly permissive SPF/DMARC records allowing for domain spoofing.',
        remediation: 'Configure SPF with a strict -all policy and set DMARC to p=reject.'
    },
    'EXP-APP-DEBUG': {
        id: 'EXP-APP-DEBUG',
        name: 'Active Debug Interface',
        severity: 'high',
        category: 'Application',
        description: 'Detected a framework debug mode or verbose error reporting enabled in production.',
        remediation: 'Disable debug modes in production environment variables.'
    },
    'EXP-INF-DC-MASK': {
        id: 'EXP-INF-DC-MASK',
        name: 'Datacenter Resident Masking',
        severity: 'low',
        category: 'Infrastructure',
        description: 'Target is operating from a datacenter IP but attempting to present as residential infrastructure.',
        remediation: 'Verify if this is an authorized proxy; otherwise, monitor for automated scraping behavior.'
    },
    'EXP-INF-WAF-BYPASS': {
        id: 'EXP-INF-WAF-BYPASS',
        name: 'Potential WAF Bypass (Direct Origin)',
        severity: 'high',
        category: 'Infrastructure',
        description: 'The backend origin server is directly accessible via IP, bypassing CDN/WAF protections.',
        remediation: 'Restrict incoming traffic to only allow your CDN/WAF IP ranges (e.g., Cloudflare, Akamai).'
    },
    'EXP-CRY-TLS-LEGACY': {
        id: 'EXP-CRY-TLS-LEGACY',
        name: 'Legacy TLS (v1.0/v1.1) Support',
        severity: 'medium',
        category: 'Identity',
        description: 'Server supports deprecated TLS versions which are vulnerable to various handshake attacks.',
        remediation: 'Decommission TLS 1.0/1.1 and enforce TLS 1.2+ with forward secrecy.'
    },
    'EXP-LEAK-VERSION': {
        id: 'EXP-LEAK-VERSION',
        name: 'Sensitive Infrastructure Version Leakage',
        severity: 'low',
        category: 'Infrastructure',
        description: 'Response headers or banners leak specific software versions (e.g. nginx/1.14.0).',
        remediation: 'Disable version reporting in the server configuration (e.g. server_tokens off).'
    },
    'EXP-INF-ORIGIN-LEAK': {
        id: 'EXP-INF-ORIGIN-LEAK',
        name: 'WAF Origin Leakage',
        severity: 'high',
        category: 'Infrastructure',
        description: 'Server is leaking its own backend origin IP in specific HTTP headers (e.g. X-Real-IP).',
        remediation: 'Sanitize outgoing headers at the edge or within the application server to prevent internal network disclosure.'
    },
    'EXP-APP-ENV-LEAK': {
        id: 'EXP-APP-ENV-LEAK',
        name: 'Development Environment Discourse',
        severity: 'medium',
        category: 'Application',
        description: 'Detected headers or environment variables indicating this is a non-production or development server.',
        remediation: 'Restrict access to development assets or remove development markers before deployment to production.'
    }
};

/**
 * Heuristic engine to classify a discovered service or data point into the taxonomy.
 */
export const classifyExposure = (port: number, banner: string = '', metadata: any = {}): TaxonomyEntry | null => {
    const bannerLower = banner.toLowerCase();

    // Origin Leakage check
    if (metadata.has_origin_leak) {
        return ExposureTaxonomy['EXP-INF-ORIGIN-LEAK'];
    }

    // Env Leakage check
    if (metadata.has_dev_env || metadata.has_path_leak) {
        return ExposureTaxonomy['EXP-APP-ENV-LEAK'];
    }

    if (port === 9200 || bannerLower.includes('elasticsearch')) {
        return ExposureTaxonomy['EXP-NET-9200'];
    }

    if (port === 3389 || bannerLower.includes('remote desktop')) {
        return ExposureTaxonomy['EXP-NET-3389'];
    }

    if (metadata.email_security?.risk === 'high') {
        return ExposureTaxonomy['EXP-ID-WEAK-MAIL'];
    }

    if (bannerLower.includes('debug') || bannerLower.includes('stack trace')) {
        return ExposureTaxonomy['EXP-APP-DEBUG'];
    }

    // Advanced: WAF Bypass (Direct IP access to a site that should be on a CDN)
    if (metadata.is_direct_ip && metadata.known_cdn_host) {
        return ExposureTaxonomy['EXP-INF-WAF-BYPASS'];
    }

    // Advanced: Legacy TLS
    if (metadata.tls?.version && ['TLSv1', 'TLSv1.1'].includes(metadata.tls.version)) {
        return ExposureTaxonomy['EXP-CRY-TLS-LEGACY'];
    }

    // Advanced: Version Leakage
    if (/\d+\.\d+(\.\d+)?/.test(banner)) {
        return ExposureTaxonomy['EXP-LEAK-VERSION'];
    }

    return null;
};
