# RiskSignal - Real-Time Forensic IP Intelligence & Attack Surface Management (ASM)

[![RiskSignal Live](https://img.shields.io/badge/Live-RiskSignal-blue?style=for-the-badge)](https://app.risksignal.name.ng/)

**RiskSignal** is an intelligence platform for developers and security specialists. It converts network telemetry into actionable insights, combining port scanning, CVE mapping, and Attack Surface Management (ASM).

---

## Core Intelligence Modules

RiskSignal uses a state-based engine to identify infrastructure changes.

### 1. Forensic ASM & Change Detection
- **Data Sources:** Shodan, VirusTotal, crt.sh (Certificate Transparency).
- **Functionality:** Every scan state is hashed (SHA-256). The system identifies exact deltas and records them in the asset timeline.
- **Subdomain Discovery:** Recursive lookup of Certificate Transparency logs to find development environments and shadow IT.

### 2. Service Fingerprinting
- **Technique:** Forensic banner synthesis from HTTP headers and SSL handshakes.
- **Intelligence:** Automatically maps ports to services like OpenSSH, Nginx, MySQL, and LiteSpeed.

### 3. Heuristic Risk Engine
- **WAF Bypass Detection:** Flags exposed IPs associated with WAF-protected domains.
- **DNS Takeover Risk:** Identifies dangling CNAME records.
- **Infrastructure Age:** Warnings for SSL certificates issued in the last 72 hours.

### 4. Reputation & Intelligence
- **Data Sources:** VirusTotal & IPWhois.
- **Feature:** Identifies malicious scanners and checks against 70+ blocklists.
- **Geo-Forensics:** ISP/ASN mapping and 3D coordinate visualization.

---

## Tactical UI & UX

- **Asset Pivot:** Clickable IP addresses, domains, and records for direct investigation.
- **Mobile HUD:** Dedicated sidebars for Discovery, Inventory, and Forensics.
- **Forensic History:** Retains recent queries for instant drift analysis.

---

## Admin Command Center
- **Risk Policy Engine:** Toggle forensic rules on/off.
- **Audit Logging:** Immutable record of administrative actions.
- **Bulk Importer:** Ingest domains for organization-wide monitoring.
- **API Commander:** Manage developer keys and monitor telemetry.

---

## Data Source Orchestration

| Provider | Role |
| :--- | :--- |
| **Shodan** | Port discovery and vulnerability detection |
| **VirusTotal** | Reputation and passive DNS |
| **crt.sh** | Certificate Transparency logs |
| **IPWhois** | ASN connectivity and geographic placement |
| **HTTP Engine** | Tech-stack profiling and security audit |

---

## Deployment & Setup

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/00xf5/signal-guard.git
   ```
2. **Setup Environment:**
   Configure `.env` with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy Backend:**
   ```bash
   supabase functions deploy deep-intel --no-verify-jwt
   ```
4. **Run Application:**
   ```bash
   npm install && npm run dev
   ```

---

## API for Developers
```bash
curl -X POST "https://[YOUR_SUPABASE_URL]/functions/v1/deep-intel" \
     -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
     -d '{"query": "example.com"}'
```

---

© 2026 RiskSignal Intelligence Ops.
