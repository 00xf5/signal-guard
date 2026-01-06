# 🛡️ RiskSignal V2.5: The Forensic Intelligence Bible

**RiskSignal** is a **Full-Spectrum Attack Surface Management (ASM)** and **Forensic Intelligence Platform**. This document provides an exhaustive technical breakdown of every feature, engine, and logic flow within the system.

---

## 🏗️ System Architecture & Interconnectivity

RiskSignal functions as an autonomous "Intelligence Loop." Understanding how these parts connect is critical for system operation.

### The "Life of a Scan" Flow:
1.  **Ingestion (Frontend/API)**: A user submits a target (IP/Domain) via the Discovery UI or a REST API call.
2.  **Orchestration (Edge Function)**: The `deep-intel` function is triggered. It acts as the "Brain," dispatching parallel requests to Shodan, VirusTotal, crt.sh, and direct HTTP probes.
3.  **Synthesis (Intelligence Layer)**: Raw data is normalized. Banners are synthesized, SSL chains are parsed, and the **Heuristic Risk Engine** runs its weighted calculations.
4.  **Verification (Database)**: The system checks the `discovery_cache`. If data is "Fresh" (< 1 hour), it returns the cache. If not, it generates a new state.
5.  **Forensic Anchoring (The Hash Chain)**: The new state is SHA-256 hashed. If the hash differs from the last known state, a record is written to `asset_snapshots` and a "Diff" is calculated for the **Forensic Timeline**.
6.  **ASM Expansion (Relationship Graph)**: Found entities (e.g., DNS SANs) are passed to the `AsmService`, which creates links between `organizations` and `assets`, growing the attack surface map.
7.  **Command & Control (Admin)**: Operation logs are fed to the **Live Telemetry** stream, while **Audit Logs** capture any manual intervention (rule toggles, API recharges).

---

## 1. 🛰️ The "Forensic Pulse" (Data Orchestration)

Every scan triggers a synchronized orchestration of global intelligence. The system treats every target (IP or Domain) as a forensic subject.

| Source | Role | Intelligence Output |
| :--- | :--- | :--- |
| **Shodan API** | Infrastructure | Port state, banner retrieval, and known CVE tags (Vulnerability correlations). |
| **VirusTotal** | Reputation | Historical DNS resolution, "Maliciousness" pings from 70+ engines, and sibling domain discovery. |
| **crt.sh (OSS)** | Identity | Certificate Transparency (CT) logs. Used to find hidden subdomains and identify the CA trust chain. |
| **IPWhois.is** | Geopolitics | Lat/Long coordinates, ISP/DC classification, and ASN reputation. |
| **Direct Probe** | Fingerprinting | Real-time HTTP header analysis (WAF detection, HSTS/CSP security score, Server signature). |

---

## 2. 🧠 The Core Intelligence Engines

### A. The O(1) Hash Chain (Change Detection)
To prevent database bloat and track historical "drift," RiskSignal uses a hash-based state management system:
1.  **Normalization:** Incoming data is stripped of transient keys (scan IDs, timestamps) and keys are sorted alphabetically.
2.  **Hashing:** A SHA-256 hash is generated from the normalized state.
3.  **Action:** If the hash differs from the previous state, a new snapshot version is created, and the delta is injected into the **Forensic Timeline** (`asset_changes` table).

### B. Heuristic Risk Engine (`src/lib/taxonomy.ts`)
Risk is calculated as a weighted sum of violations using a library of predefined rules:
- **WAF Bypass (Critical):** Proxy presence vs. Direct IP exposure conflict.
- **DNS Takeover (Critical):** Dangling infrastructure identifying unclaimed cloud resources.
- **Infrastructure Age (Medium):** Warning for "Burner" infrastructure seen for < 72 hours.
- **Technology Drift:** Detects regressions in tech stack (e.g., protocol downgrades).

### C. Reputation Audit Engine (`src/pages/ReputationDetailed.tsx`)
Audits the **Trust Profile** of a domain or IP:
- **Email Security Matrix:** Detailed verification of **SPF**, **DMARC**, and **MX** records.
- **Identity & Entity (RDAP):** Cross-referencing global registries for organization ownership.
- **Trust Gauge:** Normalized percentage-based trust factor (100% - Risk Score).

### D. Forensic Grep Engine (`src/pages/Forensics.tsx`)
A high-speed investigation tool for searching historical indicators of compromise (IoC) across all snapshots:
- **JSONB Path Discovery:** Uses advanced PostgreSQL JSONB path querying (`@>`) to search across nested banner data, SSL fields, and headers.
- **State-Aware Search:** Finds matching artifacts *within* a specific time-slice of an asset's history.

---

## 3. 🛡️ Admin Command Center (The Brain)

A dedicated, secure console for platform management located at `/admin/dashboard`.

### Connection to Core Engine:
- **Rule Toggling**: Admins can enable/disable rules in the `risk_rules` table. The `deep-intel` function reads this table on every execution to decide which heuristics to apply.
- **API Oversight**: The `api_access` table acts as a gatekeeper for the Edge Functions, enforcing limits configured from the dashboard.
- **Bulk Matrix**: Ingests raw domains and seeds the `organizations` table, which triggers background discovery for each new entity.

---

## 4. 🌐 Attack Surface Management (ASM) & Graph Logic

The ASM module (`AsmService.ts`) builds a living graph of an organization's digital footprint.

### Data Interconnectivity:
- **`organizations` ↔ `assets`**: A many-to-many relationship using a junction table or foreign keys, representing ownership.
- **Asset Ownership Confidence**: The system calculates a score (0-100) based on how the link was discovered (e.g., direct DNS vs. subnet proximity).
- **Passive Discovery Expansion**: SAN extraction from SSL certificates automatically triggers new "Discovery" events if a previously unknown domain is found.

---

## 5. 📟 Tactical UI & Mobile UX

- **Interactive Asset Pivoting**: Every technical entity is wrapped in the `ClickableAsset` component. This component acts as a "Router Pivot," allowing analysts to jump from a Reputation view to a Detailed Intel view with a single click.
- **Tactical Sidebars (HUDs)**:
    - **Shared Context**: Sidebars maintain state (like `fullIntel`) across different sub-pages for seamless navigation.
    - **Responsiveness**: HUDs use `framer-motion` for hardware-accelerated transitions on mobile devices.

---

## �️ Database Schema Relationships

| Table | Primary Role | Relationships |
| :--- | :--- | :--- |
| **`organizations`** | Core Entity | Owns many `assets`. |
| **`assets`** | Target Node | Belongs to `organizations`, has many `snapshots`. |
| **`asset_snapshots`** | Point-in-time state | Linked to `assets`. Defines the "Forensic State." |
| **`asset_changes`** | The "Diff" | Calculated between two `asset_snapshots`. |
| **`risk_rules`** | Logic Configuration | Applied by `deep-intel` to generate `risk_findings`. |

---

*RiskSignal V2.5 - Engineering Ops Manual*
