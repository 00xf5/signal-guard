# 📖 RiskSignal: The Comprehensive Operational Master Document

Welcome to the definitive guide for **RiskSignal**, a full-spectrum Cyber-Asset Attack Surface Management (CAASM) and forensic intelligence platform. This document serves as the "Master Blueprint," explaining the internal logic, architectural decisions, and operational flows that power the system.

---

## 🏛️ 1. Project Philosophy & Introduction

RiskSignal was built to solve the "Visibility Gap" in modern cybersecurity. Traditional tools are either too slow or too shallow. RiskSignal bridges this gap by combining **Autonomous Reconnaissance** (always-on discovery) with **Forensic Analysis** (deep-dive logic extraction).

### The Three Pillars of RiskSignal:
1.  **Immutability**: Every asset state is hashed and versioned. We don't just see the current state; we see the evolution.
2.  **Asynchronicity**: Expensive tasks (like de-minifying 5MB of JS) are never done in the main thread or gated by browser timeouts.
3.  **Precision**: We prioritize high-signal intelligence (secrets, endpoints, exposed origins) over thousands of low-value alerts.

---

## 🛰️ 2. The Hybrid Distributed Engine (HDE)

RiskSignal uses a unique **Tri-Tier Compute Architecture** to ensure reliability and performance.

### Tier 1: The Tactical HUD (Frontend)
- **Role**: Data Visualization & Orchestration.
- **Tech**: React 18, Vite, TypeScript.
- **Logic**: It manages the "Satellite Link," a direct polling mechanism that talks to the remote intelligence database via `satelliteClient.ts`. It also implements the "Rugged Mobile View," a fixed-height dashboard that ensures mission-critical tools are never more than a thumb-swipe away.

### Tier 2: The Secure Trigger Bridge (Edge)
- **Role**: Orchestration & Security.
- **Tech**: Deno (Supabase Edge Functions).
- **Logic**: Functions like `jsasm-tactical` and `deep-intel` serve as secure proxies. They manage the API keys (stored in the Vault) and initiate scans on the remote cluster. They use a "5-second race" logic to return results instantly if the engine is warm, or a "202 Accepted" ticket if the scan is long-running.

### Tier 3: The Recon Kernel (Remote Cluster)
- **Role**: High-Intensity Extraction.
- **Tech**: Node.js (ESM), Render.com.
- **Logic**: This is where the **JS-ASM Elite** engine lives. It performs recursive web-crawling, certificate transparency lookups, and deep-forensic JavaScript parsing. It writes its findings directly to the **Remote Intelligence Database**, which the frontend then polls.

---

## 🕵️‍♂️ 3. Core Logic Flows & Intelligence Modules

### A. The Discovery Pipeline (Deep Intel)
1.  **Query Ingestion**: The user enters a domain or IP.
2.  **Parallel Harvesting**: The edge function fires simultaneous requests to Shodan (Port states), VirusTotal (Passive DNS), and IPWhois (ASN/Geo).
3.  **Synthesis**: The engine normalizes the data. It synthesizes missing banners by analyzing the remote service's response headers.
4.  **Scoring**: The **Heuristic Risk Engine** applies weighted rules. If an IP is exposed but its domain is behind a WAF, it flags a `WAF-BYPASS` signal.
5.  **Caching**: Results are SHA-256 hashed and stored in the `discovery_cache` for instant retrieval on future queries.

### B. The JS-ASM Elite Pipeline (Tactical JS)
1.  **Stealth Warmup**: On landing on the page, the UI pings the remote engine to wake it from sleep.
2.  **Secure Trigger**: Initiates a scan with the `full` extraction mode.
3.  **Satellite Feed**: The frontend establishes a live link to the remote DB.
4.  **Module Extraction**:
    - **Leaked Secrets**: Patterns matching for AWS, JWT, Firebase, etc.
    - **Hidden Endpoints**: Extracting API routes and dangerous paths using regex-based AST analysis.
    - **Logic Signals**: Tagging assets based on content (e.g., `INTERNAL-IP`, `FIREBASE-CONFIG`).

### C. The Forensic Hash-Chain (Inventory)
1.  **State Capture**: Every scan generates a "State Snapshot."
2.  **Hash comparison**: The hex-encoded SHA-256 hash of the current state is compared against the last known hash in the `asset_snapshots` table.
3.  **Diff Generation**: If the hashes differ, a row is automatically generated in `asset_changes`.
4.  **Timeline Visualization**: The "Forensics" page visualizes these changes, allowing a security analyst to see infrastructure drift (e.g., "A new port 80 was opened on Tuesday").

---

## 🔐 4. Security Philosophy & Implementation

RiskSignal treats security as a fundamental design constraint:
- **Zero-Exposure Frontend**: API keys for engine providers (Shodan, VT, JS-ASM) are **never** present in the client-side code. They are stored in the Supabase Vault and injected into Edge Functions at runtime.
- **Satellite Link Protection**: While `satelliteClient.ts` uses an `anon_key` for polling, we advocate for **Row Level Security (RLS)**. This ensures that even if the link is discovered, the data access is governed by strict PostgreSQL policies.
- **Audit Trails**: Every administrative action (toggling risk rules, managing keys) is recorded in the `audit_logs` table for compliance and internal security reviews.

---

## 🛠️ 5. Operational SOP & Troubleshooting

### Identifying "Satellite Link" Desync
If the dashboard shows "Online" but no data is flowing:
1.  **Check the Schema**: Ensure the `js_intelligence`, `scans`, and `endpoints` tables exist on the **Remote Intelligence Project**.
2.  **Check the Key**: Verify that the `VITE_SATELLITE_ANON_KEY` matches the current project you are polling.
3.  **Check the logs**: View the Render.com logs to ensure the Node.js cluster isn't hitting memory limits during large JS parses.

### Applying Manual Fixes
If a scan is "stuck" in the UI:
- Open the Supabase SQL Editor.
- Run `UPDATE public.scans SET status = 'completed' WHERE domain = 'target.com';`
- This will terminate the polling loop in the frontend.

---

## 📈 6. Future Expansion Paths
RiskSignal is built for extensibility:
- **New Modules**: Adding a tab to `TacticalJS.tsx` is as simple as defining a new component in `src/components/tactical/` and adding it to the `standardizeIntelligence` callback.
- **New Data Sources**: The `deep-intel` edge function can be expanded with additional collectors (e.g., Censys, GreyNoise) by adding a new class to its provider list.

---

**RiskSignal Operational Master Docs | Document Version: 2.7.0**
"In transparency we trust, in invisibility we find truth."
