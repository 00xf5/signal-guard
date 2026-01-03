# RiskSignal — Real-Time Forensic IP Intelligence & Attack Surface Management (ASM)

[![RiskSignal Live](https://img.shields.io/badge/Live-RiskSignal-blue?style=for-the-badge)](https://risksignal-tau.vercel.app/)

**RiskSignal** is a high-fidelity intelligence powerhouse built for developers, security specialists, and bug hunters. It converts raw network telemetry into actionable forensic insights, combining real-time port scanning, CVE vulnerability mapping, and **Attack Surface Management (ASM)** into a single, seamless platform.

**Platform URL:** [https://risksignal-tau.vercel.app/](https://risksignal-tau.vercel.app/)

---

## 🛰️ Core Intelligence Modules

RiskSignal is architected around five distinct intelligence funnels, each optimized for specific security search intents:

### 1. Attack Surface Management (ASM) & Asset Inventory
A relational engine that tracks the lifecycle of infrastructure.
- **Keywords:** *Asset Discovery, Attack Surface Reduction, Infrastructure Inventory.*
- **Features:** Relational mapping of `Organizations -> Assets -> Exposures`, Ownership Confidence scoring, and cross-asset relationship graphing.

### 2. Threat Discovery & Global Map
A real-time visualizer of global threat events and botnet telemetry.
- **Keywords:** *Live Cyber Attack Map, Botnet Tracker, Real-time Threat Intelligence.*
- **Features:** Interactive GIS mapping, live event streaming, and ASN reputation heatmaps.

### 3. Deep Forensic Intel (Target Audit)
A deep-dive scanner that identifies the technical DNA of any IP or Domain.
- **Keywords:** *IP WHOIS, Port Scanner Online, Service Banner Grabbing, TLS/SSL Handshake Forensics.*
- **Features:** Automated port discovery, CVE vulnerability cross-referencing (NVD/Exploit-DB), and infrastructure type identification (WAF vs. Hosting vs. Direct Origin).

### 4. Reputation & Compliance Dashboard
A "super rich" audit engine for high-level trust verification and email security.
- **Keywords:** *Blacklist Checker, DMARC Validator, SPF Record Audit, Email Security Posture.*
- **Features:** Domain trust scoring (A-F Grade), security contact extraction, and real-time blocklist (Spamhaus/SBL) status.

### 5. Developer API (Automated Risk Scoring)
Ultra-low latency API designed for high-scale fraud prevention and bot detection.
- **Keywords:** *VPN Detection API, Proxy Detection SDK, IP Risk Scoring, Tor Exit Node identification.*
- **Implementation:** RESTful architecture with JSON-LD support for better machine readability.

---

## 🛠️ Technology Stack

RiskSignal utilizes a state-of-the-art stack to deliver instantaneous results with zero lag:

- **Frontend:** React 18 (Vite) with **Tailwind CSS** and **Framer Motion** for a high-fidelity interactive UI.
- **Backend:** **Supabase Edge Functions** (Deno) for global low-latency processing and fan-out scanning.
- **Database:** **PostgreSQL (Supabase)** with an ASM-hardened schema and **Row Level Security (RLS)** for secure public data ingestion.
- **Intelligence Engine:** Multimodal discovery via Cloudflare DNS, RDAP Registry, NVD (CVEs), and Shodan IoT cross-referencing.

---

## 🚀 API Quick Start

Integrate **RiskSignal** into your production stack in seconds.

**cURL Request:**
```bash
curl -X GET "https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8" \
     -H "x-api-key: YOUR_SIGNATURE_KEY"
```

**Python Implementation:**
```python
import requests

def audit_target(target):
    response = requests.get(
        f"https://risksignal-tau.vercel.app/api/scan?ip={target}",
        headers={"x-api-key": "YOUR_SIGNATURE_KEY"}
    )
    return response.json()

print(audit_target("8.8.8.8"))
```

---

## 📦 Deployment & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/00xf5/signal-guard.git
   ```
2. **Setup Environment:**
   Create a `.env` file with your **Vite** and **Supabase** credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLOUDFLARE_SITE_KEY`
3. **Database Setup:**
   Apply the `supabase/schema.sql` to your Supabase project to initialize the ASM relational tables and RLS policies.
4. **Run Locally:**
   ```bash
   npm install
   npm run dev
   ```

---

## ⚖️ Privacy & Compliance
RiskSignal is built on **Privacy-by-Design** principles. We provide high-fidelity risk metrics without storing personally identifiable information (PII) of scanned targets. 

- [Compliance Guide](https://risksignal-tau.vercel.app/docs)
- [Privacy Policy](https://risksignal-tau.vercel.app/privacy)

© 2026 **RiskSignal Intelligence Ops.** | *Defending infrastructure at the speed of light.*