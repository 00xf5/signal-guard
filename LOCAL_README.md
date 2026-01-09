# 🏗️ RiskSignal Engineering Operations: The Master Manual (v2.7)

**CONFIDENTIALITY WARNING**: This document contains high-depth architectural blueprints for the RiskSignal ASM framework. It is intended for lead engineers and security operations leads.

---

## 🏛️ 1. Global Architectural Overview: The "Tri-Node" Loop

RiskSignal is not a standard web application. It is a distributed, state-aware reconnaissance ecosystem. The system is designed to handle "Network Gravity" by offloading heavy computational tasks into a specialized, asynchronous hub.

### The Architecture Diagram (Conceptual)
```text
[ CLIENT TIER ]             [ EDGE TIER ]             [ KERNEL TIER ]
(React/Vite HUD) <------> (Supabase Deno) <------> (Render.com Node.js)
       ^                       |                         |
       |                       v                         |
       |             [ GOVERNANCE DB (L) ]               |
       |             (Organizations/Assets)              |
       |                       ^                         |
       |                       |                         |
       +-----------------------+-------------------------+
                    (Satellite Direct Link)
                               |
                   [ INTELLIGENCE DB (R) ]
                   (Scans/JS-Intel/Leaks)
```

---

## 📂 2. Exhaustive Directory & File Registry

### 📁 `src/pages/` (The Core HUDs)
*   **`TacticalJS.tsx`**: The flagship module. Implements a fixed-height dashboard, "Satellite Link" polling, and a ruggedized mobile HUD with a metrics drawer.
*   **`Discovery.tsx`**: The entry point for forensic ingestion. Handles parallel state management for the `deep-intel` function responses.
*   **`IntelDetailed.tsx`**: The forensic deep-dive. Parses massive JSON blobs from Shodan, VT, and direct probes to build threat scorecards.
*   **`Forensics.tsx`**: The drift detector. Visualizes SHA-256 state changes over time. Uses the `asset_changes` table to show infrastructure evolution.
*   **`OrgInventory.tsx`**: The "Shadow IT" finder. Aggregates data from CT-logs (sands) to build a recursive organizational asset tree.
*   **`ApiAccess.tsx`**: Manage developer keys and monitor project-wide telemetry.
*   **`Index.tsx`**: High-performance landing zone with mission-briefing UI.

### 📁 `src/components/` (The Tactical Units)
*   **`Header.tsx`**: A state-aware navigation hub with mobile-responsive overlays.
*   **`tactical/`**:
    *   **`LiveMetricsSidebar.tsx`**: Displays real-time discovery counts and "Risk Gravity" breakdowns.
    *   **`CriticalAssetsTab.tsx`**: Filters extraction results for high-signal targets (Score > 70).
    *   **`EndpointsTab.tsx`**: Searchable table of extracted API routes with danger-level flags.
    *   **`SecretsTab.tsx`**: Patterns matching for keys (AWS, Stripe, JWT) found in minified JS.
    *   **`DiscordWebhookModal.tsx`**: UI gateway for configuring real-time alert dispatchers.
*   **`DiscoveryTacticalSidebar.tsx`**: Maintains scan context on the Discovery page.
*   **`ForensicTacticalSidebar.tsx`**: Provides quick-links to recent SHA-256 state changes.
*   **`InventoryTacticalSidebar.tsx`**: Aggregates organization-level statistics for rapid pivoting.
*   **`AttackPathGraph.tsx`**: Custom SVG-based relationship renderer for mapping org-to-asset ownership.
*   **`IPScanner.tsx`**: Direct port-probing interface with real-time banner synthesis.
*   **`ThreatMap.tsx`**: Three-dimensional geographic distribution of assets using Three.js/WebGL (via Mapbox/Globe libraries).
*   **`ui/`**: Radix-UI primitives (shadcn) customized with the RiskSignal primary/success/danger color tokens.

### 📁 `src/lib/` (The Intelligence Transport)
*   **`supabase.ts`**: The primary client for the **Governance Database**. Handles Auth and local asset management.
*   **`satelliteClient.ts`**: The high-security direct link to the **Remote Intelligence Database**. Bypasses local context to stream data from the engine cluster.
*   **`utils.ts`**: Tailwind class merging (cn) and primitive helpers.

---

## ⚙️ 3. Core Engine Deep Dives

### 🛡️ A. JS-ASM ELITE (The Heavy Recon)
**Logic Flow**:
1.  **Warmup**: `TacticalJS` sends a "pulse" image request to wake the Render server.
2.  **Trigger**: User clicks "LAUNCH SCAN". `jsasm-tactical` (Edge) is invoked.
3.  **Race**: The Edge function waits 5s. If the engine responds, success. If not, the Edge returns `202 Accepted`.
4.  **Satellite Launch**: Frontend starts `fetchLiveResults` loop (5s interval).
5.  **Extraction**: The Node engine parses JS files, hashes them, and dumps secrets/endpoints to the Remote DB.
6.  **Polling**: `satelliteClient` pulls rows and passes them to `standardizeIntelligence` to unify the UI state.

### 🧪 B. Deep Intel (The Forensic Integrator)
**Processing Chain**:
- Aggregates Shodan (Ports/Banners), VirusTotal (Passive DNS), and IPWhois (Geo/ASN).
- **Banner Synthesis**: If raw banners are missing, the engine creates "Forensic Banners" from SSL certificate subject lines and HTTP headers.
- **State Hashing**: Results are normalized (sorted JSON), hashed with SHA-256, and compared to the `discovery_cache` to detect instant infrastructure drift.

### 📊 C. Heuristic Risk Engine
- Calculates a weighted "Trust Gauge" from 0-100%.
- **High-Gravity Signals**:
    - `WAF_BYPASS`: direct IP access on a proxied domain.
    - `DANGLING_DNS`: CNAMEs pointing to non-existent providers.
    - `INFRA_AGE`: Certificates/records < 72 hours old (possible phishing/infra-churn).

---

## 🛰️ 4. Feature Interconnectivity Matrix (Dependency Graph)

RiskSignal components are designed for recursive pivoting. Here is how they connect:

| From Component | To Component | Linkage Mechanism | Data Passed |
| :--- | :--- | :--- | :--- |
| `Discovery` | `IntelDetailed` | React Router Params | `IP` address or `Domain` |
| `IntelDetailed` | `TacticalJS` | Sub-domain click | Target `Domain` |
| `TacticalJS` | `Forensics` | Scan ID reference | `scan_id` (Forensic Anchor) |
| `Forensics` | `OrgInventory` | Org ID pivot | `organization_id` |
| `Inventory` | `AttackPathGraph` | JSONB Parent/Child map | Relationship Cluster |
| `IPScanner` | `ThreatMap` | Lat/Long coordinates | Geo-Spatial context |

---

## 🗄️ 5. Database Encyclopedia (The Data Model)

### **Governance Project (Local)**
- **`organizations`**: `[id, name, industry, threat_level]` - The root of the asset ownership tree.
- **`assets`**: `[id, org_id, type, value, last_seen]` - Every individual node in the attack surface.
- **`discovery_cache`**: `[query, result, state_hash, updated_at]` - Performance layer to avoid redundant API hits.
- **`asset_snapshots`**: Records a full point-in-time state of an asset cluster.
- **`asset_changes`**: `[asset_id, snapshot_id, change_type, diff_data]` - The core of the Forensic Timeline.

### **Intelligence Project (Remote/Render)**
- **`scans`**: `[id, domain, js_count, endpoint_count, status, mode]` - High-level session tracking.
- **`js_intelligence`**: `[id, domain, url, content_hash, score, tags, secrets]` - The result of the ASM engine.
- **`endpoints`**: `[id, domain, method, path, is_dangerous]` - Individual API surface findings.

---

## 🔐 6. Security & Operations (Field SOP)

### **The "Satellite" Secret Management**
`VITE_SATELLITE_URL` and `VITE_SATELLITE_ANON_KEY` are used. 
*   **WARNING**: Never hardcode these. They must be set in Vercel/GitHub Environment Secrets.
*   **Production Hardening**: On the Remote Project, enable **Row Level Security (RLS)**. Use an `anon_key` with a policy `USING (true)` to allow public reading of intelligence data without exposing admin access.

### **GitHub & Vercel Safety**
RiskSignal utilizes `.gitignore` to protect `.env`. The `jsasm-tactical` Edge function uses the Supabase Vault to store the secondary engine key, ensuring it never leaks into client-side bundles.

---

## 🚀 7. Troubleshooting & Common Operational Errors

### **"Satellite Link: syncing intelligence... scans.domain does not exist"**
- **Cause**: Outdated schema on your Remote Intelligence project.
- **Fix**: Run the `ALTER TABLE public.scans ADD COLUMN domain TEXT;` script in the Remote SQL Editor.

### **"Unauthorized" on Engine Warmup**
- **Cause**: Standard browser behavior when hitting a protected Node.js endpoint.
- **Resolution**: Ignored by default. The `Image` pulse wakes the server even if it returns a 401, as the request still triggers the Render.com host to spin up.

---

**RiskSignal Engineering Operations | Verified & Synchronized 2026-01-08**
"We specialize in the visibility of the invisible."
