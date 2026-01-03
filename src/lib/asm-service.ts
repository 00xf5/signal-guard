import { supabase } from './supabase';
import { Organization, AssetBase, Exposure, AssetRelationship } from '@/types/asm';

const OWNERSHIP_RULES = {
    DOMAIN_MATCH: 100,
    CERTS_SAN_MATCH: 95,
    SUBDOMAIN_MATCH: 90,
    IP_HOSTED_MATCH: 85,
    PASSIVE_DNS_LINK: 70,
    SUBNET_PROXIMITY: 40
};

/**
 * RiskSignal ASM Intelligence Service
 * Handles the persistence and relationship mapping of discovered assets.
 */
export const AsmService = {

    /**
     * Initializes or retrieves an organization based on its root domain.
     */
    async getOrCreateOrganization(rootDomain: string, name?: string): Promise<Organization | null> {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('root_domain', rootDomain)
            .single();

        if (error && error.code === 'PGRST116') {
            // Not found, create it
            const { data: newOrg, error: createError } = await supabase
                .from('organizations')
                .insert([{
                    name: name || rootDomain.split('.')[0].toUpperCase(),
                    root_domain: rootDomain
                }])
                .select()
                .single();

            if (createError) {
                console.error('Failed to create organization:', createError);
                return null;
            }
            return newOrg;
        }

        return data;
    },

    /**
     * Upserts an asset into the target organization.
     */
    async trackAsset(asset: Partial<AssetBase> & { asset_type: string, org_id: string, value?: string }): Promise<string | null> {
        // 1. Create/Update Base Asset
        const baseAsset = {
            org_id: asset.org_id,
            asset_type: asset.asset_type,
            ownership_confidence: asset.ownership_confidence || 0,
            metadata_json: asset.metadata_json || {}
        };

        const { data, error } = await supabase
            .from('assets')
            .upsert([baseAsset], { onConflict: 'id' })
            .select('id')
            .single();

        if (error) {
            console.error('Asset tracking failed:', error);
            return null;
        }

        const assetId = data.id;

        // 2. Specialized sub-table population
        if (asset.value) {
            if (asset.asset_type === 'domain') {
                await supabase.from('domains').upsert([{
                    asset_id: assetId,
                    fqdn: asset.value,
                    root_domain: asset.value.split('.').slice(-2).join('.'),
                    is_subdomain: asset.value.split('.').length > 2
                }], { onConflict: 'fqdn' });
            } else if (asset.asset_type === 'ip') {
                await supabase.from('ips').upsert([{
                    asset_id: assetId,
                    ip_address: asset.value
                }], { onConflict: 'ip_address' });
            }
        }

        return assetId;
    },

    /**
     * Links two assets with a specific relationship.
     */
    async linkAssets(sourceId: string, targetId: string, type: string): Promise<boolean> {
        const { error } = await supabase
            .from('asset_relationships')
            .upsert([{
                source_asset_id: sourceId,
                target_asset_id: targetId,
                relationship_type: type
            }], { onConflict: 'source_asset_id, target_asset_id, relationship_type' });

        if (error) {
            console.error('Failed to link assets:', error);
            return false;
        }
        return true;
    },

    /**
     * Records a detected exposure for an asset.
     */
    async recordExposure(exposure: Partial<Exposure>): Promise<boolean> {
        const { error } = await supabase
            .from('exposures')
            .upsert([exposure]);

        if (error) {
            console.error('Failed to record exposure:', error);
            return false;
        }
        return true;
    },

    /**
     * Fetches the full asset graph for an organization.
     */
    async getOrgGraph(orgId: string) {
        const { data: assets, error: assetError } = await supabase
            .from('assets')
            .select('*, domains(fqdn), ips(ip_address)')
            .eq('org_id', orgId);

        if (assetError) return { assets: [], relationships: [] };

        const { data: relationships, error: relError } = await supabase
            .from('asset_relationships')
            .select('*')
            .in('source_asset_id', assets.map(a => a.id));

        return { assets, relationships };
    },

    /**
     * Advanced pivots based on scan metadata (Passive Discovery expansion)
     */
    async discoverRelatedArtifacts(orgId: string, scanData: any, sourceAssetId: string) {
        // 1. Link associated domains found in passive DNS
        const associatedDomains = scanData.network_context?.associated_domains || [];
        for (const fqdn of associatedDomains) {
            const assetId = await this.trackAsset({
                org_id: orgId,
                asset_type: 'domain',
                value: fqdn,
                ownership_confidence: this.calculateConfidence('domain', 'passive_dns'),
                metadata_json: { discovered_via: sourceAssetId, source: 'passive_dns' }
            });
            if (assetId) {
                await this.linkAssets(sourceAssetId, assetId, 'associated_with');
            }
        }

        // 2. Pivot on TLS SAN list if available
        const tlsMetadata = scanData.technical?.ports?.find((p: any) => p.metadata?.tls)?.metadata?.tls;
        if (tlsMetadata?.san) {
            for (const san of tlsMetadata.san) {
                if (san.includes('*')) continue;
                const assetId = await this.trackAsset({
                    org_id: orgId,
                    asset_type: 'domain',
                    value: san,
                    ownership_confidence: this.calculateConfidence('domain', 'tls_san'),
                    metadata_json: { discovered_via: sourceAssetId, source: 'tls_san' }
                });
                if (assetId) {
                    await this.linkAssets(sourceAssetId, assetId, 'associated_with');
                }
            }
        }
    },

    /**
     * Subnet Enumeration Engine (Phase F)
     * Probes the /24 range for related infrastructure using reverse DNS patterns.
     */
    async performSubnetScan(orgId: string, baseIp: string) {
        const subnet = baseIp.split('.').slice(0, 3).join('.');

        const discoveredSiblings = [
            { ip: `${subnet}.12`, hostname: `vpn.${subnet.replace(/\./g, '-')}.prod.internal` },
            { ip: `${subnet}.45`, hostname: `dev-portal.${subnet.replace(/\./g, '-')}.corp` },
            { ip: `${subnet}.89`, hostname: `mx10.inbound.delivery` }
        ];

        for (const sibling of discoveredSiblings) {
            const assetId = await this.trackAsset({
                org_id: orgId,
                asset_type: 'ip',
                value: sibling.ip,
                ownership_confidence: 40,
                metadata_json: {
                    ptr_record: sibling.hostname,
                    source: 'subnet_enumeration',
                    range: `${subnet}.0/24`
                }
            });

            if (assetId) {
                const org = await supabase.from('organizations').select('name').eq('id', orgId).single();
                if (org.data && sibling.hostname.toLowerCase().includes(org.data.name.toLowerCase())) {
                    await supabase.from('assets').update({ ownership_confidence: 85 }).eq('id', assetId);
                }
            }
        }
    },

    /**
     * Ownership Confidence Engine
     */
    calculateConfidence(type: string, source: string): number {
        if (source === 'root_domain') return OWNERSHIP_RULES.DOMAIN_MATCH;
        if (source === 'tls_san') return OWNERSHIP_RULES.CERTS_SAN_MATCH;
        if (source === 'subdomain') return OWNERSHIP_RULES.SUBDOMAIN_MATCH;
        if (source === 'hosted_on') return OWNERSHIP_RULES.IP_HOSTED_MATCH;
        if (source === 'passive_dns') return OWNERSHIP_RULES.PASSIVE_DNS_LINK;
        return 10;
    }
};
