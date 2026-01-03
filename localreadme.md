# RiskSignal — Technical Architecture & Forensic Manifesto (A-Z)

**RiskSignal** is a high-fidelity intelligence platform engineered for full-stack network forensics, reputation auditing, and global threat telemetry. It operates as a distributed system leveraging **Supabase Edge Functions (Deno)**, **Global DNS/RDAP API nodes**, and a real-time reactive frontend built on **Vite/React**.

---

## 🛰️ A. Real-Time Telemetry & GIS Ingestion
The platform's visual "nervous system" handles high-throughput event data from global honeypots and network sensors.

- **Reactive State (`useThreatFeed`):** Utilizes a custom hook to manage a synchronized buffer of global threat events. Each event is timestamped and categorized into a severity matrix (`safe`, `suspicious`, `critical`).
- **GIS Mapping (WebGL):** The `ThreatMap` component renders coordinate pairs on a normalized 2D/3D plane. It uses a **Point-in-Polygon** logic or simple mapping to visualize attack vectors.
- **Visual Decay Algorithm:** To prevent UI performance degradation, events are automatically purged from the local state after a 60-second TTL. This ensures the 1,800+ "active analysts" indicator reflects live traffic density, not historical logs.
- **KPI Metrics:** The **Global Heat Index** is a real-time derivative of the event ingestion rate (calculated as `Δevents / Δtime`), providing a metric of current global attack intensity.

---

## 🔍 B. Discovery Engine (`analy`)
The entry-point intelligence layer for rapid, zero-latency target classification.

- **Orchestration Workflow:** The `analy` Edge Function executes a fan-out pattern, querying multiple IP/Domain metadata providers in parallel to minimize "Time to Verdict."
- **Risk Weighting Matrix:**
    - **Anonymity Detection:** VPN/Proxy flags contribute +35 to the risk score. Tor Exit Nodes contribute +60.
    - **Infrastructure Source:** Datacenter/Hosting provider detection (AWS, GCP, DigitalOcean) adds a +15 multiplier as these are common sources for mass-scanning bots.
    - **ISP Reputation:** Individual ASN reputation scores are averaged to determine if a target is originating from a "malicious" autonomous system.
- **Bot Evasion Layer:** Utilizes **Cloudflare Turnstile** integration. For requests originating from high-risk IP ranges (detected via `isRiskyUser`), the results are locked behind a cryptographic challenge (`verifyWithBackend`) to prevent automated API harvesting.

---

## 🧬 C. Forensic Deep-Intel (`deep-intel`)
The heavy-duty auditing layer for technical DNA extraction and service fingerprinting.

- **Banner Grabbing Logic:** The backend initiates a stealth "half-shake" or service probe to retrieve raw protocol banners. 
- **Signature Parsing:** A regex-based engine decomposes raw strings (e.g., `OpenSSH_7.2p2 Ubuntu-4ubuntu2.10`) into structured attributes: `{product: "OpenSSH", version: "7.2p2", os: "Ubuntu"}`.
- **TLS/SSL Handshake Forensics:** 
    - **SNI Injection:** Checks for Server Name Indication mismatches.
    - **Cert-Chain Mapping:** Extracts the Subject Alternative Names (SAN) and Issuer (e.g., "Let's Encrypt" vs "Self-Signed") to determine trust level.
- **Infrastructure Marker Extraction:** Actively scans for proprietary headers (e.g., `x-vercel-cache`, `x-amz-cf-id`, `x-azure-ref`) to map the target's specific cloud topology.

---

## 🧭 D. Neighborhood & Subnet Topology
Understanding threat risk by proximity.

- **Subnet Matrix Explorer:** Rather than analyzing a single IP, RiskSignal maps the surrounding `/24` subnet. It probes "beacon ports" (22, 80, 443, 3389) on adjacent IPs to identify if the target is part of a malicious cluster, a residential proxy pool, or a legitimate enterprise range.
- **Relative Risk:** If 30%+ of the neighboring nodes are flagged, the target's individual risk score receives a "Neighborhood Multiplier" penalty.

---

## 🛡️ E. Vulnerability Matrix (CVE Integration)
Translating forensic data into actionable exploit intelligence.

- **CPE Generation:** Dynamically generates **Common Platform Enumeration (CPE)** identifiers based on forensic service IDs.
- **Vulnerability Mapping:** Queries the **NVD (National Vulnerability Database)** cross-index.
- **Weaponization Indicator:** Specifically identifies vulnerabilities with public exploits in **Exploit-DB** or **Metasploit**, allowing for prioritized remediation based on "attackability" rather than just severity.

---

## 📋 F. Reputation & Compliance Architecture
High-level trust verification for enterprise domains and email infrastructure.

- **Trust Gauge:** A visual representation mapping the normalized reputation score to an A-F grade.
- **Email Security Auditor:** 
    - **SPF Recursion:** Parses and validates the `v=spf1` record, identifying "all" or "softfail" misconfigurations.
    - **DMARC Enforcement:** Checks for the presence of `p=reject` or `p=quarantine` policies to ensure sender identity integrity.
- **RDAP/WHOIS Hub:** Uses REST-based RDAP (Registration Data Access Protocol) over HTTPS to bypass traditional WHOIS port-43 rate limits and retrieve structured registration data.

---

## 🚀 G. Global Asset Explorer
The signature-based search engine for infrastructure patterns.

- **Signature Matching:** Allows analysts to search by **ASN**, **ISP**, **Country**, or **Tech Stack**.
- **Cluster Intelligence:** Identifies patterns across the global edge network (e.g., "Find all nodes running Nginx in AS15169 that have port 8080 open").
- **Mock-Data Persistence:** During development, the explorer uses a predictive generation algorithm to simulate infrastructure patterns before syncing with the live global feed.

---

## 🛠️ H. Developer API & SDK
The programmatic gateway for integrating RiskSignal intelligence.

- **RESTful Endpoints:** Standardized `GET /api/scan?ip=...` interface.
- **Header-Based Authentication:** Uses `x-api-key` for stateless authentication at the edge.
- **Quota Management:** Each key is linked to a Supabase-persisted usage counter (defaulting to 500 requests for free tiers) to prevent API abuse.
- **JSON-LD Schema:** Every response is formatted with Schema.org JSON-LD, providing semantic context for automated security tooling.

---

## 🛡️ I. Bot Counter-Measures & Fingerprinting
Protecting the platform from automated probes and scrapers.

- **Environment Detection:** Monitors the DOM for `navigator.webdriver` and other headless browser markers.
- **Behavioral Biometrics:** Analyzes interaction timing and mouse trajectory to distinguish between scripted automation and human interaction.
- **IP Security Middleware:** Automatically redirects suspicious/high-impact visitors through the Verification Gateway.

---

## 🎨 J. Design System & UX Engineering
Visual sophistication as a functional requirement for clarity.

- **Stack:** Vite, React 18, Tailwind CSS, Framer Motion.
- **Glassmorphic Tokens:** Uses `backdrop-blur-xl` and `bg-white/5` to maintain technical legibility over complex background visualizations.
- **Motion Damping:** Framer Motion transitions are designed with high-stiffness springs to feel responsive yet "professional," avoiding the "bounce" of consumer-tier web apps.

---

## 🏗️ K. ASM Core (Inventory Engine)
The fundamental shift from "snapshot scanning" to "asset lifecycle management."

- **Relational Data Model (PostgreSQL):** Implements a six-tier schema mapping `Organizations -> Assets -> Entities (Domain/IP/Service) -> Exposures`. The schema is **idempotent**, utilizing `DROP POLICY IF EXISTS` and `ON CONFLICT` clauses to ensure resilient migrations.
- **Security & RLS Architecture:** Enforces strict **Row Level Security (RLS)** across all intelligence tables. Public data ingestion is managed via fine-grained policies that allow `anon` role contributions while protecting system integrity.
- **Ownership Confidence Algorithm:** Calculates the probability of asset ownership by analyzing shared SSL certificate SANs, DNS history, and co-location metrics.
- **Service Layer (`AsmService`):** A frontend/edge bridge that enforces type-safety (`src/types/asm.ts`) and handles relational upserts to ensure the graph integrity remains "error-free."
- **Attack Path Graphing:** A visualization layer that uses depth-first-search (DFS) over asset relationships to identify how an exposure in a web application could potentially lead to production database compromise.

---

© 2026 **RiskSignal Intelligence Ops.** | *Defending infrastructure at the speed of light.*
