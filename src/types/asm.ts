/**
 * RiskSignal ASM Core Type System
 * Professional-grade type definitions for Attack Surface Management.
 */

export type AssetType = 'domain' | 'ip' | 'service' | 'cert' | 'api' | 'web_app';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ExposureStatus = 'detected' | 'confirmed' | 'acknowledged' | 'mitigated' | 'regressed';
export type RelationshipType = 'points_to' | 'hosted_on' | 'cert_valid_for' | 'subdomain_of' | 'belongs_to_org';

export interface Organization {
    id: string;
    name: string;
    root_domain: string;
    confidence_score: number;
    created_at: string;
    last_updated: string;
}

export interface AssetBase {
    id: string;
    org_id: string;
    asset_type: AssetType;
    ownership_confidence: number;
    first_seen: string;
    last_seen: string;
    metadata_json?: Record<string, any>;
}

export interface DomainAsset extends AssetBase {
    asset_type: 'domain';
    fqdn: string;
    root_domain: string;
    is_subdomain: boolean;
    dns_records?: Array<{
        type: string;
        value: string;
        ttl: number;
    }>;
}

export interface IpAsset extends AssetBase {
    asset_type: 'ip';
    ip_address: string;
    asn?: number;
    isp?: string;
    country_code?: string;
    is_cloud: boolean;
    cloud_provider?: string;
}

export interface ServiceAsset extends AssetBase {
    asset_type: 'service';
    ip_asset_id: string; // The host IP
    port: number;
    protocol: 'tcp' | 'udp';
    product?: string;
    version?: string;
    banner?: string;
    banner_hash?: string;
    last_scan: string;
}

export interface Exposure {
    id: string;
    asset_id: string;
    taxonomy_id: string; // Refers to the internal RiskSignal Exposure Taxonomy (e.g. EXP-NET-9200)
    severity: Severity;
    confidence: number;
    attack_path_depth: number;
    first_seen: string;
    last_seen: string;
    status: ExposureStatus;
    description?: string;
    remediation_steps?: string;
    attack_vector?: string; // e.g. 'remote unauthenticated'
    evidence?: string[];
    recommended_action?: string;
}

export interface RiskFactor {
    id: string;
    label: string;
    weight: number;
    severity: Severity;
    evidence: string | object;
}

export interface AssetRelationship {
    id: string;
    source_asset_id: string;
    target_asset_id: string;
    relationship_type: RelationshipType;
}

export interface AttackPath {
    nodes: Array<AssetBase | Exposure>;
    edges: Array<{
        from: string;
        to: string;
        label: string;
    }>;
}

export type ScanMode = 'bug_bounty' | 'soc' | 'compliance';

export interface ScanProfile {
    mode: ScanMode;
    enableSubnetScan: boolean;
    weightInfrastructureAge: number;
    allowAggressiveProbes: boolean;
}
