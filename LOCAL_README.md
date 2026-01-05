# 🛡️ Signal Guard V2: The Forensic Intelligence Bible

Signal Guard (RiskSignal) is not just a scanner; it is a **Full-Spectrum Attack Surface Management (ASM)** and **Forensic Intelligence Platform**. This document provides an exhaustive technical breakdown of every feature, engine, and logic flow within the system.

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
To prevent database bloat and track historical "drift," Signal Guard uses a hash-based state management system:
1.  **Normalization:** Incoming data is stripped of transient keys (scan IDs, timestamps) and keys are sorted alphabetically.
2.  **Hashing:** A SHA-256 hash is generated from the normalized state.
3.  **Comparison:** The system checks the `latest_snapshot_hash` in the database.
4.  **Action:**
    - If **Hash Matches**: The system simply updates `last_seen`. No new data is written.
    - If **Hash Differs**: A new version is created. The delta is calculated and injected into the **Forensic Timeline**.

### B. Heuristic Risk Engine
Risk is calculated as a weighted sum of violations:
- **WAF Bypass (Critical):** If a proxy (Cloudflare) is present but the direct IP scan exposes administrative ports (22, 3306) or matching service banners.
- **Infrastructure Age (Medium):** Assets first seen in the last 72 hours are flagged high-risk ("Burner Infrastructure").
- **Stack Consistency:** Cross-referencing detected technologies across different ports to find "Shadow IT."

### C. Reputation Audit Engine (`src/pages/ReputationDetailed.tsx`)
Beyond infrastructure, the platform audits the **Trust Profile** of a domain or IP:
- **Email Security Matrix:**
    - **SPF (Sender Policy Framework):** Validates outbound mail server authorization.
    - **DMARC (Domain-based Message Authentication):** Verifies if aggregate reporting and domain alignment are enforced.
    - **MX (Mail Exchange):** Probes inbound mail routing health and provider trust (e.g., G-Suite vs Private).
- **Identity & Entity (WHOIS/RDAP):**
    - Orchestrates lookups across global RDAP registries to determine organization ownership, registry handles, and infrastructure status.
- **Trust Gauge:** Calculates a percentage-based trust factor by subtracting the normalized Risk Score from 100%.

### D. Taxonomy Mapping (`src/lib/taxonomy.ts`)
Instead of generic "Open Port" alerts, the system uses a taxonomy engine to classify exposures:
- **EXP-WEB-ADMIN:** Exposed panel detected via banner analysis (e.g., "WordPress Login").
- **EXP-DB-LEAK:** Database port open with no authentication hint.
- **EXP-GEN-RISK:** High risk score triggered from cumulative minor factors.

---

## 3. 🌐 Attack Surface Management (ASM) & Graph Logic

The ASM module (`AsmService.ts`) builds a living graph of an organization's digital footprint.

### Asset Ownership Confidence
The system automatically assigns confidence scores to discovered assets:
- **Root Domain Match:** 100%
- **Cert SAN (Subject Alternative Name) Match:** 95%
- **Subdomain Match:** 90%
- **IP Hosted Match:** 85%
- **Passive DNS / PTR Link:** 70%
- **Subnet Proximity:** 40%

### Passive Discovery Expansion
During a scan, the system "Pivots" to find related infrastructure:
1.  **TLS Pivot:** Every name in the SSL certificate's SAN list is automatically added to the organization's inventory.
2.  **Passive DNS Pivot:** Historical domains associated with the IP are tracked and linked.
3.  **Subnet Enumeration (Phase F):** Probes the `/24` range of the target IP, looking for PTR record patterns (e.g., `dev.client-name.com`) to identify sibling servers.

---

## 4. 📟 Frontend: The HUD & Tactical Interfaces

The UI is designed as a "High-Fidelity Cyber HUD" for security analysts.

### A. Discovery Tactical Sidebar
- **Global Heat Index:** A real-time visualizer of "Threats Detected Today" vs "Safe Network Nodes."
- **Intel Frequencies (Frequency List):** A persistent history of your recent scans, stored in `localStorage`, allowing for instant re-scanning and state comparison.
- **Edge Latency Matrix:** Real-time health statistics of the core scanning infrastructure.

### B. Forensic Timeline
- A linear visualization of every change an asset has undergone.
- Categorized by **Network**, **Application**, **Infrastructure**, and **Security**.
- Each entry shows a "Diff View" (Old Value vs New Value).

### C. Subnet Matrix
- Visualizes the surrounding IP addresses in a grid.
- Allows analysts to see if they are dealing with an isolated host or a cluster of related infrastructure.

---

## 5. 🛡️ Bot Evasion & Human Verification

Signal Guard implements a multi-tier defense system to prevent API abuse:
1.  **Risk Detection:** On the Discovery page, the system checks the visitor's IP using `ipwho.is`.
2.  **Triggering:** If the user is on a **VPN, Proxy, Tor, or Datacenter IP**, the `isRiskyUser` flag is set to true.
3.  **The Challenge:** A **Cloudflare Turnstile** modal is force-rendered. No scans can be performed until a cryptographic human challenge is solved.

---

## 🗄️ Database Architecture (The Digital Spine)

- **`organizations`**: Root entities for grouping assets.
- **`assets`**: The global registry of every IP and Domain found.
- **`asset_snapshots`**: The historical record of serialized states.
- **`asset_relationships`**: The "Links" (e.g., `Domain hosted_on IP`).
- **`exposures`**: The verified findings linked to assets.
- **`discovery_cache`**: High-performance cache for recent scan results.

---

*Signal Guard V2 - Engineering Ops Manual*
