export type AdminRole = 'super_admin' | 'lead_developer' | 'lead_designer' | 'project_manager';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLogin?: string;
}

export type ProjectStatus = 'Planning' | 'In Development' | 'Testing & QA' | 'Live' | 'Archived';

export interface Project {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: 'SaaS Platform' | 'E-Commerce' | 'Web Portal' | 'AI / Tech' | 'Corporate Branding';
  summary: string;
  description: string;
  coverImage: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  budget: number;
  status: ProjectStatus;
  featured: boolean;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  icon: string;
  priceStarting: number;
  deliveryTime: string;
  category: 'Full-Stack Development' | 'UI/UX System' | 'API & Cloud' | 'Optimization & Scale';
  features: string[];
  deliverables: string[];
  active: boolean;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  accessLevel: AdminRole;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  status: 'Active' | 'On Leave' | 'Contractor';
  joinedDate: string;
}

export type EnquiryStatus = 'New' | 'Reviewing' | 'Quoted' | 'In Progress' | 'Closed';
export type EnquiryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Enquiry {
  id: string;
  clientName: string;
  email: string;
  company?: string;
  serviceType: string;
  budgetRange: string;
  timeline: string;
  message: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: 'create' | 'update' | 'delete' | 'auth' | 'status_change';
  entity: 'project' | 'service' | 'team' | 'enquiry' | 'system';
  description: string;
  timestamp: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  source: 'env' | 'custom' | 'unconfigured';
}
