# RiskSignal V2.5 Engineering Documentation

RiskSignal is a Full-Spectrum Attack Surface Management (ASM) and Forensic Intelligence Platform. This document provides a technical breakdown of features, engines, and logic flows within the system.

---

## System Architecture & Interconnectivity

RiskSignal functions as an autonomous intelligence loop.

### Lifecycle of a Scan:
1.  **Ingestion (Frontend/API)**: User submits a target (IP/Domain) via the Discovery UI or REST API.
2.  **Orchestration (Edge Function)**: The `deep-intel` function dispatches parallel requests to Shodan, VirusTotal, crt.sh, and direct HTTP probes.
3.  **Synthesis (Intelligence Layer)**: Data is normalized, banners are synthesized, and SSL chains are parsed. The Heuristic Risk Engine runs weighted calculations.
4.  **Verification (Database)**: The system checks `discovery_cache`. If data is fresh (< 1 hour), it returns the cache. Otherwise, it generates a new state.
5.  **Forensic Anchoring (Hash Chain)**: The new state is SHA-256 hashed. If the hash differs from the last state, a record is written to `asset_snapshots` and a diff is calculated for the Forensic Timeline.
6.  **ASM Expansion (Relationship Graph)**: Found entities are passed to `AsmService`, which creates links between organizations and assets.
7.  **Command & Control (Admin)**: Logs are fed to telemetry and audit logs capture manual intervention.

---

## 1. Data Orchestration

| Source | Role | Output |
| :--- | :--- | :--- |
| **Shodan API** | Infrastructure | Port state, banners, CVE tags |
| **VirusTotal** | Reputation | Passive DNS, maliciousness scoring |
| **crt.sh** | Identity | Certificate Transparency logs |
| **IPWhois** | Geopolitics | Coordinates, ISP classification, ASN reputation |
| **Direct Probe** | Fingerprinting | HTTP header analysis, WAF detection |

---

## 2. Core Intelligence Engines

### A. The Hash Chain (Change Detection)
To track historical drift, RiskSignal uses a hash-based system:
1.  **Normalization:** Strip transient keys and sort alphabetically.
2.  **Hashing:** SHA-256 generation from normalized state.
3.  **Action:** On hash difference, a new snapshot and diff entry are created.

### B. Heuristic Risk Engine
Calculates risk scores based on weighted violations:
- **WAF Bypass:** Proxy presence vs direct IP exposure.
- **DNS Takeover:** Dangling infrastructure.
- **Infrastructure Age:** Warning for assets < 72 hours old.

### C. Reputation Audit Engine
Audits the trust profile of a target:
- **Email Security Matrix:** Verification of SPF, DMARC, and MX records.
- **Identity & Entity (RDAP):** Ownership lookups via global registries.
- **Trust Gauge:** Normalized percentage factor based on risk score.

### D. Forensic Grep Engine
Investigation tool for searching historical IoCs across snapshots using PostgreSQL JSONB path querying.

---

## 3. Admin Command Center

### Connection to Core Engine:
- **Rule Toggling**: Admins can enable/disable rules in the `risk_rules` table.
- **API Oversight**: The `api_access` table manages rate limits and quotas.
- **Bulk Matrix**: Ingests raw domains and triggers background discovery.

---

## 4. Attack Surface Management (ASM)

### Data Interconnectivity:
- **Organizations vs Assets**: Many-to-many relationship tracking ownership.
- **Ownership Confidence**: Calculated based on discovery method.
- **Passive Expansion**: SAN extraction from SSL certificates triggers new discovery events.

---

## 5. UI & UX

- **Asset Pivoting**: Interactive technical entities allow analysts to jump between modules.
- **Tactical HUDs**: Sidebars maintain state across sub-pages for seamless navigation.

---

## Database Schema Relationships

| Table | Role | Relationships |
| :--- | :--- | :--- |
| **`organizations`** | Core Entity | Owns multiple assets |
| **`assets`** | Target Node | Linked to orgs and snapshots |
| **`asset_snapshots`** | State record | Point-in-time forensic state |
| **`asset_changes`** | The Diff | Calculated between snapshots |
| **`risk_rules`** | Logic Configuration | Applied by deep-intel engine |

---

RiskSignal Engineering Operations
