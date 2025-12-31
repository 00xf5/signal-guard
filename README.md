# 🛡️ Signal Guard — Enterprise IP Intelligence & Fraud Detection

Signal Guard is a high-fidelity, professional-grade IP intelligence platform designed for security engineers, e-commerce platforms, and infrastructure architects. It transforms raw network telemetry into actionable risk signals, providing instant detection of VPNs, Proxies, Tor Exit Nodes, and sophisticated automation behaviors.

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://risksignal-tau.vercel.app/)
[![License](https://img.shields.io/badge/License-Proprietary-success?style=flat-square)](/terms)

---

## 🚀 Key Features

### 1. Active Signal Scanner
A sleek, terminal-inspired interface for deep IP inspection.
- **Advanced Anonymity Scoring**: Weighted scoring system based on infrastructure reputation, ASN history, and behavioral signals.
- **Human Verification Layer**: Integrated Cloudflare Turnstile for bot mitigation and request integrity.
- **Reputation Intelligence**: Real-time detection of known bad actors and malicious infrastructure providers (Datacamp, M247, Akamai).

### 2. Developer API (God Mode)
A programmatic gateway for enterprise-level fraud detection.
- **High-Fidelity Response**: Upgraded JSON response including `verdict`, `trust_level`, and `mitigation_strategy`.
- **Criminal Intelligence**: Automated detection of botnet nodes and known spam sources.
- **Usage Telemetry**: Integrated Supabase backend for tracking 500-request quotas per unique API key.
- **Localization Gold**: Detailed country, currency, timezone, and flag data for every lookup.

### 3. Developer Portal & Docs
- **Automatic Key Generation**: Dedicated `/api-access` workflow with secure storage.
- **Comprehensive Documentation**: Implementation guides for cURL, Python, and JavaScript Fetch are built directly into the `/docs` route.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend Infrastructure**: Vercel Serverless Functions (Node.js)
- **Database & Auth**: Supabase (PostgreSQL + RLS)
- **Security**: Cloudflare Turnstile (Invisible Anti-Bot)
- **Theme Engine**: Dynamic Light/Dark mode with persistence (Dark by default)

---

## 🔌 API Implementation Example

Signal Guard provides an industry-standard header-based authentication.

**cURL Request:**
```bash
curl -X GET "https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8" \
     -H "x-api-key: YOUR_24_DIGIT_HEX_KEY"
```

**Python Implementation:**
```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}
response = requests.get("https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8", headers=headers)

print(response.json()['data']['security']['verdict']) # Output: ALLOW
```

---

## 📦 Local Setup & Development

1. **Clone & Install:**
   ```bash
   git clone https://github.com/00xf5/signal-guard.git
   cd signal-guard
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TURNSTILE_SITE_KEY=your_cloudflare_site_key
   ```

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```

---

## ⚖️ Legal & Security
Signal Guard is built with privacy-first principles. We do not store personally identifiable information of your end-users. Usage data is strictly used for quota management.

- **Privacy Policy**: [Read Here](/privacy)
- **Terms of Service**: [Read Here](/terms)

© 2025 RiskSignal Intelligence. All rights reserved.