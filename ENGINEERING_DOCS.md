# 🏥 RiskSignal: The Complete Engineering & Operations Manual

This is the master documentation for the RiskSignal ASM platform. It covers everything from technical architecture to data-flow security.

---

## 🏗️ 1. System Architecture: The Hybrid Edge Kernel

RiskSignal implements a "Front-end Heavy, Back-end Distributed" architecture. This ensures that the user interface remains responsive while performing massive reconnaissance tasks on thousands of assets.

### A. The Tactical Kernel (Remote Node.js)
The JS-ASM Elite engine resides outside the Supabase/Vercel ecosystem on a dedicated Render.com Node.js cluster.
- **Language**: TypeScript (ESM)
- **Role**: Heavy-lifting. It executes recursive HTTP probes, JS syntax trees, and secret pattern matching.
- **Persistence**: It communicates only with the **Remote Intelligence Database** using a dedicated Service Role key.

### B. The Secure Trigger (Supabase Edge)
The `jsasm-tactical` function acts as the gatekeeper.
- **Role**: Prevents the client from knowing the Engine's API key.
- **Flow**: Frontend calls Edge -> Edge calls Engine -> Edge returns "Scan ID" or results.
- **Timeout Management**: It uses a "Race" mechanism to prevent 60s gateway timeouts.

### C. The Frontend Dashboard
A Shodan-inspired, data-dense React application.
- **Features**: Rugged mobile views, complex tab routing, and the **Satellite Link**.
- **Satellite Link**: A dedicated client (`satelliteClient.ts`) that allows the UI to speak directly to the database where the engine is writing.

---

## 🔐 2. Security & Operations (Vercel/GitHub Safety)

The user asked: **"How safe will this be after deploy to vercel and github?"**

### The Critical Concern: `satelliteClient.ts`
The current implementation of the Satellite Link requires the URL and API Key for your **Remote Intelligence Project**.

1.  **GitHub Safety**: 
    - **RISK**: If you push `satelliteClient.ts` with hardcoded keys, anyone who sees your repository (if public) can access your entire intelligence database.
    - **FIX**: I have transitioned the client to use `import.meta.env`. You **MUST** add these to your `.env` and never commit them. Use the provided `.env.example` as a template.

2.  **Vercel Safety**:
    - **RISK**: Vercel bundles environment variables into the React JS code. Anyone who opens "Inspect Element" and looks at your JS files can extract your Supabase URL and Key.
    - **FORENSIC ADVICE**:
        - Currently, we are using the `service_role` key on the frontend to ensure the "Satellite Link" can see all data immediately. This is **UNSAFE** for a production-grade public app.
        - **TO SECURE IT**: On your Remote Project (`nxzvpcbudbqotujuuczo`), you should:
            1. Enable **Row Level Security (RLS)** on all tables.
            2. Switch from the `service_role` key to the **`anon_key`** in Vercel.
            3. Create an RLS policy that allows public read access (`USING (true)`) so the dashboard can see the data without needing an admin key.

---

## 🔍 3. How the Features Work Under the Hood

### 🕵️‍♂️ Heuristic Risk Scoring
RiskSignal doesn't just find ports; it assesses "Risk Gravity." 
- **The Equation**: `Risk = (WAF_Exposure * 0.9) + (Dangling_DNS * 0.8) + (SSL_Freshness * 0.4)`.
- **Logic**: If an IP is exposed directly but its domain claims to be behind Cloudflare, the `WAF_Exposure` signal hits maximum gravity, triggering a red alert in the UI.

### 🧬 JS-ASM Syntax Extraction
The engine uses a "Scanner-on-a-Wire" approach:
1.  Downloads the JS bundle.
2.  De-minifies/Formats using a lightweight parser.
3.  Greps for **120+ Regex regular expressions** identifying AWS, Firebase, Stripe, Slack, and generic API tokens.
4.  Maps the `Content-Hash` of the file to detect version upgrades between scans.

### 🕰️ Forensic Timeline (Drift Detection)
When a scan finishes, the system generates a **Snapshot**.
- The snapshot is compared to the previous one in the `asset_snapshots` table.
- Difference detection is performed at the JSON key level.
- Any discrepancy (e.g., Port 22 opened) generates a row in `asset_changes`.

---

## 🛠️ DB Migrations & Synchronization

RiskSignal requires two separate database schemas to be in sync:

1.  **Project Alpha (Governance)**: Contains your Organizations, Assets, and local Discovery cache.
2.  **Project Beta (Intelligence)**: Contains the `scans`, `js_intelligence`, and `endpoints` tables where the Render engine dumps its data.

If you see errors like **"Column domain does not exist"**, it means your **Project Beta** needs a schema update. Use the SQL snippets provided in the `LOCAL_README.md` to fix this via the Supabase SQL Editor.

---

© 2026 RiskSignal Engineering & Operations. Document Version: 2.6
"Build to see what is hidden."
