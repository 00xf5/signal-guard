# RiskSignal — Real-Time Forensic IP Intelligence & Attack Surface Management (ASM)

[![RiskSignal Live](https://img.shields.io/badge/Live-RiskSignal-blue?style=for-the-badge)](https://app.risksignal.name.ng/)

**RiskSignal** is a high-fidelity intelligence powerhouse built for developers, security specialists, and bug hunters. It converts raw network telemetry into actionable forensic insights, combining real-time port scanning, CVE vulnerability mapping, and **Time-Aware Attack Surface Management (ASM)** into a single, seamless platform.

---

## 🛰️ Core Intelligence Modules (V2 Architecture)

RiskSignal is built on a "Measure, Hash, Judge" cycle that identifies infrastructure changes in milliseconds.

### 1. Forensic ASM & Change Detection
A state-based engine that tracks infrastructure evolution.
- **Data Sources:** Shodan, VirusTotal, crt.sh (Certificate Transparency).
- **How it works:** Every scan state is hashed (SHA-256). If the hash changes vs. the last scan, the system identifies the exact delta (e.g., `Port 22 Opened`) and records it in the asset's timeline.
- **Data Source:** `crt.sh` is used to discover historical subdomains and certificate age to detect "Burner" infrastructure.

### 2. Deep Service Fingerprinting
Goes beyond simple port detection to identify the technical DNA of a target.
- **Technique:** **Forensic Banner Synthesis**. If a service doesn't respond with a banner, we synthesize one from HTTP response headers (`Server`, `X-Powered-By`) and SSL handshakes.
- **Intelligence:** Automatically maps ports to services like **OpenSSH**, **Nginx**, **MySQL**, and **LiteSpeed**.

### 3. Heuristic Risk Engine
Moves beyond static CVSS scores to calculate risk based on context.
- **Logic:** 
  - **WAF Bypass Detection:** Flags if an IP is exposed but associated with a Cloudflare/WAF-protected domain.
  - **Fresh Infrastructure:** Automatically triggers a warning if an SSL certificate was issued in the last 72 hours.
  - **Technology Drift:** Detects if the underlying server software has changed significantly between scans.

### 4. Reputation & Intelligence Hub
- **Database:** VirusTotal & IPWhois.
- **Feature:** Identifies known malicious scanners (Masscan, Shodan Bot) and checks against 70+ blocklists in real-time.
- **Geo-Forensics:** High-precision ISP/ASN mapping and 3D coordinate visualization.

---

## 🛠️ Data Source Orchestration

| Provider | Intelligence Role |
| :--- | :--- |
| **Shodan** | Global port discovery and IoT vulnerability detection. |
| **VirusTotal** | Malware reputation and passive DNS relationships. |
| **crt.sh** | Certificate Transparency logs for asset discovery. |
| **IPWhois** | Real-time ASN connectivity and geographic placement. |
| **HTTP Engine** | Headless tech-stack profiling and security header audit. |

---

## 📦 Deployment & Setup

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/00xf5/signal-guard.git
   ```
2. **Setup Environment:**
   Configure your `.env` with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy Backend:**
   RiskSignal uses **Supabase Edge Functions** (Deno) for its logic.
   ```bash
   supabase functions deploy deep-intel --no-verify-jwt
   ```
4. **Run Application:**
   ```bash
   npm install && npm run dev
   ```

---

## 🚀 API for Developers
Ultra-low latency API for high-scale fraud prevention.
```bash
curl -X POST "https://[YOUR_SUPABASE_URL]/functions/v1/deep-intel" \
     -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
     -d '{"query": "example.com"}'
```

---

© 2026 **RiskSignal Intelligence Ops.** | *Defending infrastructure at the speed of light.*