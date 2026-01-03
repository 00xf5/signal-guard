# Signal Guard V2: Architecture & Developer Guide (Deep Dive)

## 🛡️ Overview
Signal Guard V2 introduces a paradigm shift from "Static Scanning" to **"Time-Aware Risk Intelligence"**. 
Instead of just showing what ports are open *now*, the system snapshots the asset's state, calculates a SHA-256 hash, and compares it against previous states to generate a **Forensic Timeline** of changes.

---

## 🛰️ Data Source Orchestration (The "Forensic Pulse")

The `deep-intel` engine does not rely on a single source. It orchestrates a "Forensic Pulse" across multiple global intelligence providers in parallel:

| Source | Feature | Intelligence Provided |
| :--- | :--- | :--- |
| **Shodan (InternetDB)** | Infrastructure | Open ports, basic CVE tags, and known vulnerabilities derived from massive global scans. |
| **VirusTotal** | Reputation | Historical DNS records, associated domains, and "maliciousness" scores from 70+ AV engines. |
| **crt.sh** | SSL/TLS History | Certificate Transparency (CT) logs used to discover subdomains and identify when a backend cert was first issued. |
| **IPWhois.is** | Geopolitical | High-precision Latitude/Longitude, ASN ownership, and ISP infrastructure identification. |
| **Direct HTTP Probe** | Fingerprinting | Real-time discovery of WAFs (Cloudflare/AWS), Server headers (Nginx/LiteSpeed), and Security Headers. |

---

## 🧠 The Engine: `deep-intel` V2

### 1. Measure & Synthesize
When a scan runs, we don't just return raw JSON. We **Synthesize** intelligence:
- **Banner Synthesis:** If Shodan doesn't provide a banner for port 80/443, we reconstruct one using the `Server` and `Location` headers found during the direct HTTP probe.
- **Normalization:** Port lists are sorted and transient keys (like `scan_id`) are stripped before hashing to ensure no "False Positives" in change detection.

### 2. The O(1) Hash Chain
We generate a **SHA-256 Hash** of the normalized state.
- **Optimization:** Before any DB write, we compare the new hash with the `latest_snapshot_hash`. If they match, we update the `last_seen` timestamp on the asset and exit. This prevents database bloat.
- **Version Control:** If the hash differs, the new state is saved with an incremented `version_number`, linked to the previous state's ID.

### 3. Heuristic Risk Engine (The Logic)
Risk is not a single number; it's a weighted sum of **Heuristics**:

1.  **WAF Bypass (Critical):** 
    *   *Logic:* If the target domain has a WAF detected (e.g., Cloudflare) but the direct IP scan shows open administrative ports or the *same* technology stack, it indicates a bypass vulnerability.
2.  **Fresh Infrastructure (Medium):**
    *   *Logic:* Assets first seen in the last 72 hours are flagged. Malicious infra is often short-lived ("Burner IPs").
3.  **Missing Secure Protocols (Low):**
    *   *Logic:* Lack of HSTS or CSP headers on ports 80/443 increases the risk score by a fixed weight defined in `risk_rules`.

---

## 🗄️ Database Schema V2 (The Spine)

### Core Persistence
- **`assets`**: Identity tracking (Value, Kind, Confidence). Uses `onConflict: 'value'` to act as a global registry.
- **`asset_snapshots`**: The "Truth" at a specific point in time. Stores the serialized state.
- **`asset_changes`**: Event log. e.g., `{"type": "port_opened", "old": null, "new": 3306}`.
- **`risk_rules`**: The Brain. Change weights here to shift the entire platform's risk tolerance without redeploying code.

---

## 🎨 Frontend Implementation

The `IntelDetailed.tsx` page is the primary consumer of this data. It maps the complex `snapshot_data` into interactive modules:
- **MapVisual:** Uses the `geo_location.coordinates` for the 3D terminal view.
- **SubnetMatrix:** Calculates neighboring IP status.
- **Vulnerability Matrix:** Direct links to NVD using the extracted `cves` array.

---

## 🚀 Deployment Workflow

1.  **Schema:** Run `supabase/schema.sql` (idempotent).
2.  **Secrets:** Configure `SUPABASE_SERVICE_ROLE_KEY` in Supabase dashboard.
3.  **Functions:** `supabase functions deploy deep-intel`.
4.  **Local:** `npm run dev` (Vite dev server).

---

*Signal Guard V2 - Engineering Ops*
