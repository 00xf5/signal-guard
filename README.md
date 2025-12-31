# Signal Guard — IP Intelligence & Anonymity Detection

Signal Guard is a technical IP intelligence platform designed for infrastructure security and fraud prevention. The system correlates multiple data points—including ASN reputation, infrastructure markers, and device signals—to identify high-risk connections in real-time.

**Platform URL:** [https://risksignal-tau.vercel.app/](https://risksignal-tau.vercel.app/)

---

## Technical Features

### 1. Signal Analysis Engine
- **Anonymity Scoring**: Probabilistic system detecting Tor exit nodes, public VPNs, and residential proxies.
- **Infrastructure Verification**: Distinguishes between consumer ISPs and high-performance server farms/hosting providers.
- **Behavioral Fingerprinting**: Identifies signal discrepancies like timezone and locale mismatches.

### 2. Programmable API
- **REST Implementation**: Header-based authentication (`x-api-key`) designed for low-latency production environments.
- **Comprehensive Payloads**: JSON responses include security verdicts (ALLOW/REVIEW/BLOCK), trust levels, and granular network telemetry.
- **Scalable Infrastructure**: Powered by Vercel Edge Functions for global performance.

### 3. Developer Integration
- **Key Provisioning**: Self-service API key generation with automated quota management.
- **Documentation**: Native support for cURL, Python, and JavaScript implementations.
- **Human Verification**: Integrated Turnstile challenge ensures technical requests remain authenticated.

---

## Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Vercel Serverless (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Security**: Cloudflare Turnstile
- **API Engine**: Real-time IP Intelligence Cross-referencing

---

## API Quick Start

**cURL:**
```bash
curl -X GET "https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8" \
     -H "x-api-key: your_api_key_here"
```

**Python:**
```python
import requests

url = "https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8"
headers = {"x-api-key": "your_api_key_here"}

response = requests.get(url, headers=headers)
print(response.json())
```

---

## Deployment & Setup

1. **Clone Repo:**
   ```bash
   git clone https://github.com/00xf5/signal-guard.git
   ```

2. **Environment Configuration:**
   Populate `.env` using names from `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLOUDFLARE_SITE_KEY`

3. **Development:**
   ```bash
   npm install
   npm run dev
   ```

---

## Privacy & Compliance
Signal Guard operates on privacy-first principles. We do not store personally identifiable information (PII) of end-users. All telemetry is used strictly for technical risk assessment and quota enforcement.

- [Privacy Policy](https://risksignal-tau.vercel.app/privacy)
- [Terms of Service](https://risksignal-tau.vercel.app/terms)

© 2025 Signal Guard Intelligence.