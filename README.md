# 🛡️ RiskSignal: Autonomous Attack Surface Management & Forensic Intelligence

![RiskSignal Banner](https://img.shields.io/badge/RiskSignal-Intelligence_Operations-success?style=for-the-badge&logo=shodan)
![Status](https://img.shields.io/badge/Status-Operational-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-AES--256-blueviolet?style=for-the-badge)

**RiskSignal** is a state-of-the-art Cyber-Asset Attack Surface Management (CAASM) and forensic intelligence platform. It converts fragmented network telemetry, certificate logs, and JavaScript logic into a unified, actionable security posture. Designed for high-speed intelligence operations, RiskSignal enables security teams to identify, track, and mitigate threats across their entire digital footprint in real-time.

---

## 🛰️ Mission Control Overview

RiskSignal's architecture is built on the principle of **Autonomous Visibility**. By distributing reconnaissance tasks into high-performance kernels, the platform provides a continuous "Satellite View" of global infrastructure, detecting deltas and vulns the moment they manifest.

### 🧩 Core Capabilities
*   **JS-ASM ELITE Engine**: A deep-forensic analysis system that de-minifies and parses JavaScript at scale to reveal hidden API routes and leaked credentials.
*   **Forensic State Hashing**: Implements SHA-256 state-anchoring to detect even the most subtle "infrastructure drift."
*   **Shadow IT Discovery**: Recursive monitoring of Certificate Transparency (CT) logs to unearth unmanaged assets.
*   **Tactical HUD Architecture**: A data-dense, Shodan-inspired interface optimized for rapid response and ergonomic data ingestion.
*   **Asynchronous Intelligence Loop**: Uses specialized edge-triggers and background extraction to bypass traditional cloud latency.

---

## 🚀 Intelligence Modules

### 🔬 1. Tactical JS Intelligence
The premier module for modern web reconnaissance.
- **Endpoint Extraction**: Maps hidden API paths (GET/POST/PUT) and flags dangerous routes like `/v1/auth` or `/admin`.
- **Secret Miner**: Sophisticated pattern matching for 120+ secret types (AWS, Stripe, JWT, Google Cloud, etc.).
- **Forensic Tagging**: Automatically attributes assets with high-signal tags like `XSS-CANDIDATE`, `INTERNAL-LEAK`, or `BYPASS-SIGNAL`.

### 🔎 2. Forensic Discovery (Deep Intel)
Converges global data streams into a single forensic pane:
- **Port & Service Mapping**: Shodan-integrated port discovery with forensic banner synthesis.
- **Reputation Audit**: Real-time cross-referencing against 70+ malicious IP blocklists.
- **Geo-Forensics**: Precision ASN mapping and 3D geographic coordinate visualization.

### 🗃️ 3. Inventory & Drift Analysis
- **Snapshot Chronology**: Automatic point-in-time recording of asset states.
- **The Forensic Diff**: Instantly calculates the delta between any two scan events to show precisely what changed.
- **Risk Gravity Scoring**: Weighted heuristic engine that calculates a "Trust Gauge" based on infrastructure health.

---

## 🛠️ Technology Stack & Dependencies

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 / Vite / TypeScript |
| **Styling & UI** | Tailwind CSS / Radix UI / Lucide |
| **Backend / Serverless** | Supabase (PostgreSQL / Edge Functions) |
| **Extraction Kernel** | Node.js ESM Cluster (Render) |
| **Alerting** | Discord Webhook Architecture |
| **Security** | Supabase Auth / Vault / RLS |

---

## ⚙️ Quick Start Deployment

For a full guided setup, see the **[LOCAL_README.md](./LOCAL_README.md)**.

1.  **Clone Repository**:
    ```bash
    git clone https://github.com/00xf5/signal-guard.git
    cd signal-guard
    ```

2.  **Environment Sync**:
    Copy `.env.example` to `.env` and populate your Supabase and Satellite credentials.

3.  **Kernel Deployment**:
    Deploy the core Edge Functions to your Supabase project:
    ```bash
    npx supabase functions deploy jsasm-tactical --no-verify-jwt
    npx supabase functions deploy deep-intel --no-verify-jwt
    ```

4.  **Schema Preparation**:
    Apply the forensic database migrations via the Supabase SQL Editor or CLI.

---

## 📜 Technical Documentation

RiskSignal maintains exhaustive documentation for all operational tiers:
- **[LOCAL_README.md](./LOCAL_README.md)**: 700% Detailed Feature & Component Breakdown.
- **[Docs.md](./Docs.md)**: (MASTER) Thorough project documentation and logic explanations.
- **[ENGINEERING_DOCS.md](./ENGINEERING_DOCS.md)**: Architecture, Security, and Core Logic flows.

---

© 2026 RiskSignal Intelligence Operations. Built for the relentless pursuit of visibility.
"Build to see what is hidden."
