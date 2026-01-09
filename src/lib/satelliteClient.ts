import { createClient } from '@supabase/supabase-js';

/**
 * 🛰️ SATELLITE CLIENT CONTEXT
 * 
 * SECURITY WARNING: 
 * This client connects to the remote JS-ASM Intelligence database. 
 * Using the 'service_role' key on the frontend exposes full administrative access to your database.
 * 
 * TO PROTECT YOUR DATA:
 * 1. Ensure these variables are provided via .env and NOT hardcoded.
 * 2. On your remote Supabase project, enable Row Level Security (RLS) on 'scans', 'js_intelligence', and 'endpoints'.
 * 3. Add a policy: 'Allow public read access' (USING (true)).
 * 4. Replace the SERVICE_ROLE_KEY below with your remote project's ANON_KEY.
 */

const engineUrl = import.meta.env.VITE_SATELLITE_URL;
const engineKey = import.meta.env.VITE_SATELLITE_ANON_KEY || import.meta.env.VITE_SATELLITE_KEY;

export const satelliteClient = createClient(engineUrl, engineKey);
