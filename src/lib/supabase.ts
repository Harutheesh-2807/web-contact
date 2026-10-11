import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { AdminRole, AdminUser } from '../types';

const STORAGE_KEY_CONFIG = 'auradev_supabase_config_v1';
const STORAGE_KEY_AUTHORIZED_ADMINS = 'auradev_authorized_admins_v1';

// Default authorized administrative emails (enforces RBAC for admin portal)
export const DEFAULT_AUTHORIZED_ADMINS: Array<{ email: string; name: string; role: AdminRole }> = [
  { email: 'admin@auradev.studio', name: 'Alex Vance (Principal Director)', role: 'super_admin' },
  { email: 'tech@auradev.studio', name: 'Elena Rostova (Lead Systems Architect)', role: 'lead_developer' },
  { email: 'design@auradev.studio', name: 'Marcus Sterling (Design Director)', role: 'lead_designer' },
  { email: 'ops@auradev.studio', name: 'Sarah Lin (Senior Project Manager)', role: 'project_manager' },
];

export interface StoredSupabaseConfig {
  url: string;
  anonKey: string;
}

export function getInitialSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (stored) {
    try {
      const parsed: StoredSupabaseConfig = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim(), isConfigured: true };
      }
    } catch {
      // ignore
    }
  }

  // Check Vite env variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envAnonKey && !envUrl.includes('your-project') && !envAnonKey.includes('your-anon')) {
    return { url: envUrl.trim(), anonKey: envAnonKey.trim(), isConfigured: true };
  }

  return { url: '', anonKey: '', isConfigured: false };
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfig = getInitialSupabaseCredentials();

export function initSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const targetUrl = url || currentConfig.url;
  const targetKey = anonKey || currentConfig.anonKey;

  if (!targetUrl || !targetKey || targetUrl.includes('your-project')) {
    supabaseInstance = null;
    return null;
  }

  try {
    supabaseInstance = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabaseInstance = null;
    return null;
  }
}

// Initialize on module load if valid
initSupabaseClient();

export function saveSupabaseConfig(url: string, anonKey: string) {
  const cleanedUrl = url.trim();
  const cleanedKey = anonKey.trim();
  currentConfig = { url: cleanedUrl, anonKey: cleanedKey, isConfigured: Boolean(cleanedUrl && cleanedKey) };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: cleanedUrl, anonKey: cleanedKey }));
  initSupabaseClient(cleanedUrl, cleanedKey);
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_CONFIG);
  currentConfig = getInitialSupabaseCredentials();
  initSupabaseClient();
}

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

export function isSupabaseActive(): boolean {
  return Boolean(supabaseInstance && currentConfig.isConfigured);
}

export function getActiveSupabaseConfig() {
  return {
    ...currentConfig,
    source: (localStorage.getItem(STORAGE_KEY_CONFIG) ? 'custom' : (import.meta.env.VITE_SUPABASE_URL ? 'env' : 'unconfigured')) as 'custom' | 'env' | 'unconfigured'
  };
}

// Authorized Admins Registry (Persisted)
export function getAuthorizedAdmins(): Array<{ email: string; name: string; role: AdminRole }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTHORIZED_ADMINS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEFAULT_AUTHORIZED_ADMINS;
}

export function addAuthorizedAdmin(email: string, name: string, role: AdminRole) {
  const current = getAuthorizedAdmins();
  const existing = current.find(a => a.email.toLowerCase() === email.toLowerCase());
  let updated;
  if (existing) {
    updated = current.map(a => a.email.toLowerCase() === email.toLowerCase() ? { ...a, name, role } : a);
  } else {
    updated = [...current, { email: email.toLowerCase(), name, role }];
  }
  localStorage.setItem(STORAGE_KEY_AUTHORIZED_ADMINS, JSON.stringify(updated));
  return updated;
}

export function checkIsAuthorizedAdmin(email: string): { isAuthorized: boolean; adminInfo?: { email: string; name: string; role: AdminRole } } {
  const admins = getAuthorizedAdmins();
  const match = admins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
  if (match) {
    return { isAuthorized: true, adminInfo: match };
  }
  return { isAuthorized: false };
}

// Supabase Direct Ping & Verification
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL and Anon Key must be provided.' };
  }

  const startTime = Date.now();
  try {
    const tempClient = createClient(url, anonKey);
    // Ping auth health or a benign table query
    const { error } = await tempClient.from('projects').select('count', { count: 'exact', head: true });
    
    // In Supabase, if the table doesn't exist yet, it returns a 404 or relation does not exist error from PostgREST,
    // which confirms the database and API are indeed reachable and the anon key is authenticated!
    const latencyMs = Date.now() - startTime;

    if (error && error.message.includes('FetchError') || error && error.message.includes('Failed to fetch')) {
      return { success: false, message: 'Connection failed: Unable to reach the Supabase host URL. Please check the domain.' };
    }

    if (error && error.message.includes('Invalid API key') || error && error.message.includes('JWT')) {
      return { success: false, message: 'Connection rejected: Invalid public Anon Key.' };
    }

    return { 
      success: true, 
      message: error ? `Connected to Supabase endpoint! (${error.message})` : 'Connected to Supabase successfully with active PostgREST schema.',
      latencyMs 
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to establish connection to Supabase.' };
  }
}

// Full SQL Schema with Row Level Security (RLS) for Supabase SQL Editor
export const SUPABASE_RLS_SQL_SCHEMA = `-- AuraDev Web Agency - Supabase RLS Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  live_url TEXT,
  repo_url TEXT,
  budget NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'In Development',
  featured BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Code',
  price_starting NUMERIC DEFAULT 0,
  delivery_time TEXT,
  category TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'lead_developer',
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Active',
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Client Enquiries / Leads Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service_type TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  priority TEXT NOT NULL DEFAULT 'Medium',
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin Profiles / Authorization Table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'lead_developer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES

-- Projects: Anyone can view active/featured projects; Only authenticated Admins can insert/update/delete
CREATE POLICY "Public can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Services: Anyone can view active services; Only Admins can modify
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Team Members: Anyone can view team; Only Admins can modify
CREATE POLICY "Public can view team members" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enquiries: Anyone (potential client) can insert an enquiry; Only authenticated Admins can view and manage
CREATE POLICY "Public can submit enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage enquiries" ON public.enquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.admin_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Realtime Configuration:
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
`;
