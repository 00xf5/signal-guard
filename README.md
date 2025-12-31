# Signal Guard — IP Intelligence & Fraud Detection

Signal Guard is a professional IP intelligence platform designed for security engineers and infrastructure architects. It transforms network telemetry into risk signals, providing detection of VPNs, Proxies, Tor Exit Nodes, and automation behaviors.

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://risksignal-tau.vercel.app/)
[![License](https://img.shields.io/badge/License-Proprietary-success?style=flat-square)](/terms)

---

## Features

### 1. Active Signal Scanner
- **Anonymity Scoring**: System based on infrastructure reputation, ASN history, and behavioral signals.
- **Human Verification**: Integrated Cloudflare Turnstile for request integrity.
- **Reputation Intelligence**: Detection of malicious infrastructure providers and known bad actors.

### 2. Developer API
- **Structured Response**: JSON response including verdict, trust level, and mitigation strategy.
- **Threat Intelligence**: Automated detection of botnet nodes and known spam sources.
- **Usage Tracking**: Integrated Supabase backend for managing 500-request quotas per unique API key.
- **Regional Data**: Country, currency, timezone, and geolocation data for every lookup.

### 3. Developer Portal & Docs
- **Key Generation**: Dedicated /api-access workflow with secure storage.
- **Documentation**: Implementation guides for cURL, Python, and JavaScript Fetch are available in the /docs route.

---

## Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database / Auth**: Supabase (PostgreSQL + RLS)
- **Security**: Cloudflare Turnstile
- **Theme Engine**: Persistent Light/Dark mode (Dark by default)

---

## API Implementation Example

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

## Local Setup & Development

1. **Clone & Install:**
   ```bash
   git clone https://github.com/00xf5/signal-guard.git
   cd signal-guard
   npm install
   ```

2. **Environment Configuration:**
   Create a .env file with your credentials:
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

## Legal & Security
Signal Guard is built with privacy-first principles. We do not store personally identifiable information of end-users. Usage data is strictly used for quota management.

- **Privacy Policy**: [Read Here](/privacy)
- **Terms of Service**: [Read Here](/terms)

© 2025 RiskSignal Intelligence. All rights reserved.