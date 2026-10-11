import { Project, Service, TeamMember, Enquiry, ActivityLog, AdminRole } from '../types';
import { getSupabase, isSupabaseActive } from './supabase';

// BroadcastChannel for cross-tab & cross-window real-time sync
const SYNC_CHANNEL_NAME = 'auradev_realtime_bus_v1';
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch {
    // fallback
  }
}

// Initial realistic data for AuraDev agency
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    title: 'Solaria BioTech Enterprise Portal',
    slug: 'solaria-biotech-enterprise',
    client: 'Solaria Therapeutics Inc.',
    category: 'SaaS Platform',
    summary: 'Next-gen clinical trial telemetry dashboard with sub-second real-time charts and HIPAA compliance.',
    description: 'Designed and engineered an enterprise React 19 + TypeScript clinical trials telemetry portal. Integrated WebSockets for bi-directional biometric telemetry streaming, custom SVG genomic charts, and fine-grained role-based access control.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tags: ['React 19', 'TypeScript', 'Tailwind', 'Realtime WebSockets', 'PostgreSQL'],
    liveUrl: 'https://solaria-demo.auradev.studio',
    repoUrl: 'https://github.com/auradev-agency/solaria-portal',
    budget: 48500,
    status: 'Live',
    featured: true,
    completionDate: '2026-08-15',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-08-15T16:30:00Z',
  },
  {
    id: 'proj-02',
    title: 'Kinetix Global Logistics Matrix',
    slug: 'kinetix-logistics-matrix',
    client: 'Kinetix Freight Group',
    category: 'Web Portal',
    summary: 'Interactive freight routing engine with multi-modal cargo tracking and dynamic carbon footprint audits.',
    description: 'Constructed an international route calculation engine processing over 120,000 real-time shipping manifests daily. Features interactive map layers, automated dispatch invoicing, and cargo telematics integration.',
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Next.js', 'PostgreSQL', 'Mapbox GL', 'Node.js', 'Docker'],
    liveUrl: 'https://kinetix-track.auradev.studio',
    budget: 62000,
    status: 'Live',
    featured: true,
    completionDate: '2026-09-02',
    createdAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z',
  },
  {
    id: 'proj-03',
    title: 'Verve Atelier Luxury E-Commerce',
    slug: 'verve-atelier-ecommerce',
    client: 'Verve Maison Paris',
    category: 'E-Commerce',
    summary: 'Headless high-fashion commerce platform with 3D product previews and instant checkout engine.',
    description: 'Bespoke digital flagship store with custom editorial layouts, currency geofencing, Shopify storefront API integration, and sub-second page transitions optimized for high mobile conversions.',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    tags: ['Headless Shopify', 'Three.js 3D', 'Tailwind CSS', 'Stripe Elements'],
    liveUrl: 'https://verve-atelier.auradev.studio',
    budget: 35000,
    status: 'In Development',
    featured: true,
    createdAt: '2026-08-10T11:20:00Z',
    updatedAt: '2026-10-02T14:15:00Z',
  },
  {
    id: 'proj-04',
    title: 'Aegis Sentinel Cyber Defense Hub',
    slug: 'aegis-sentinel-hub',
    client: 'Aegis Security Labs',
    category: 'AI / Tech',
    summary: 'Zero-trust security analytics console visualizing network intrusion telemetry and incident mitigation.',
    description: 'Built a graphite-themed high-density security command center for SecOps engineers. Features anomaly visualization, automated incident playbook triggers, and compliance reporting.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'D3.js', 'Go Backend', 'Tailwind', 'GraphQL'],
    liveUrl: 'https://aegis-security.auradev.studio',
    budget: 54000,
    status: 'In Development',
    featured: false,
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-10-08T18:00:00Z',
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'serv-01',
    title: 'Bespoke Web Application Engineering',
    slug: 'web-application-engineering',
    tagline: 'End-to-end modern web applications built for reliability, security, and lightning speed.',
    description: 'We build reactive, cloud-native web applications utilizing React 19, TypeScript, scalable backends, and robust PostgreSQL/Supabase databases. Designed for mission-critical operations with sub-100ms response targets.',
    icon: 'Layers',
    priceStarting: 12500,
    deliveryTime: '4 - 8 Weeks',
    category: 'Full-Stack Development',
    features: [
      'Tailored Architecture & Modular Component System',
      'High-Speed State Management & API Integration',
      'Database Modeling & Secure Row Level Security (RLS)',
      'Automated Testing & Multi-Device Responsive QA'
    ],
    deliverables: ['Full Source Code & Repositories', 'Technical System Documentation', 'Cloud Deployment CI/CD Pipeline', '90 Days Post-Launch SLA Warranty'],
    active: true,
    order: 1,
  },
  {
    id: 'serv-02',
    title: 'Design Systems & High-Conversion UI/UX',
    slug: 'design-systems-ui-ux',
    tagline: 'Striking visual identity and interactive product design engineered for maximum conversions.',
    description: 'From wireframes to interactive Figma tokens and coded component libraries in Tailwind CSS. We craft intuitive graphite and rich color aesthetic user experiences that captivate clients.',
    icon: 'Palette',
    priceStarting: 6800,
    deliveryTime: '2 - 4 Weeks',
    category: 'UI/UX System',
    features: [
      'Comprehensive Design Tokens & Component Library',
      'High-Fidelity Interactive Prototypes in Figma',
      'Accessibility (WCAG 2.1 AA) Compliance Audit',
      'Micro-Interactions & Motion Choreography'
    ],
    deliverables: ['Complete Figma Project Files', 'Tokenized Style Guides', 'Exported Vector & Motion Assets', 'Responsive Prototype Specs'],
    active: true,
    order: 2,
  },
  {
    id: 'serv-03',
    title: 'Supabase & Cloud Backend Architecture',
    slug: 'supabase-cloud-architecture',
    tagline: 'Scalable serverless infrastructure, auth guards, and real-time database synchronization.',
    description: 'We construct ironclad database schemas with PostgreSQL, Supabase Auth, Row Level Security policies, edge functions, and real-time pub/sub synchronization across all connected clients.',
    icon: 'Database',
    priceStarting: 8500,
    deliveryTime: '3 - 5 Weeks',
    category: 'API & Cloud',
    features: [
      'PostgreSQL Schema Design & Indexing Optimization',
      'Supabase Authentication & Multi-Role RBAC',
      'Strict Row Level Security (RLS) Policy Architecture',
      'Realtime Subscriptions & Edge Function Webhooks'
    ],
    deliverables: ['Production Migration Scripts', 'Security & RLS Penetration Report', 'Environment Orchestration Config', 'Backup & Disaster Recovery Protocols'],
    active: true,
    order: 3,
  },
  {
    id: 'serv-04',
    title: 'Performance Optimization & SEO Modernization',
    slug: 'performance-seo-scale',
    tagline: 'Achieve 99+ Google Lighthouse scores and dominate technical search index rankings.',
    description: 'Deep audit and refactor for core web vitals, server-side caching, image pipeline optimization, bundle splitting, and structured schema markup to supercharge visibility.',
    icon: 'Zap',
    priceStarting: 4500,
    deliveryTime: '1 - 2 Weeks',
    category: 'Optimization & Scale',
    features: [
      'Core Web Vitals Audit & Asset Compression',
      'Next.js / Vite Tree-Shaking & Bundle Optimization',
      'OpenGraph, Twitter Cards & JSON-LD Structured Data',
      'Server-Side Caching & CDN Edge Distribution'
    ],
    deliverables: ['Before/After Performance Metrics Audit', 'Code Refactor Pull Requests', 'SEO Structured Data Implementation', 'Lighthouse 95+ Guarantee Report'],
    active: true,
    order: 4,
  },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-01',
    name: 'Alex Vance',
    role: 'Principal Director & Systems Architect',
    accessLevel: 'super_admin',
    email: 'admin@auradev.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '12+ years directing high-impact engineering teams, specialized in resilient cloud topologies, Supabase architecture, and TypeScript systems.',
    skills: ['System Architecture', 'PostgreSQL / RLS', 'TypeScript', 'Cloud Infrastructure', 'Team Leadership'],
    status: 'Active',
    joinedDate: '2023-01-15',
  },
  {
    id: 'team-02',
    name: 'Elena Rostova',
    role: 'Lead Full-Stack Developer',
    accessLevel: 'lead_developer',
    email: 'tech@auradev.studio',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'React 19 & Tailwind specialist. Focused on low-latency state machines, high-throughput APIs, and bulletproof frontend codebases.',
    skills: ['React 19', 'Next.js', 'Supabase Realtime', 'Node.js', 'REST & GraphQL'],
    status: 'Active',
    joinedDate: '2023-04-10',
  },
  {
    id: 'team-03',
    name: 'Marcus Sterling',
    role: 'Creative Design Director',
    accessLevel: 'lead_designer',
    email: 'design@auradev.studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Visual designer championing dark graphite minimalism and electric accent systems. Crafts design systems that communicate luxury and precision.',
    skills: ['UI/UX Design', 'Design Systems', 'Figma', 'Motion Choreography', 'Tailwind CSS'],
    status: 'Active',
    joinedDate: '2023-08-01',
  },
  {
    id: 'team-04',
    name: 'Sarah Lin',
    role: 'Senior Technical Project Manager',
    accessLevel: 'project_manager',
    email: 'ops@auradev.studio',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Agile delivery lead ensuring milestones are achieved on-budget and on-schedule with seamless stakeholder communication.',
    skills: ['Sprint Planning', 'Client Relations', 'Risk Mitigation', 'Quality Assurance', 'Budget Tracking'],
    status: 'Active',
    joinedDate: '2024-02-18',
  },
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-01',
    clientName: 'Julian Croft',
    email: 'julian@croftaerospace.io',
    company: 'Croft Aerospace Systems',
    serviceType: 'Bespoke Web Application Engineering',
    budgetRange: '$40,000 - $65,000',
    timeline: '8 Weeks',
    message: 'We require a mission control web application to track orbital test telemetry. Must have real-time sensor streams, strict role-based access, and dark graphite UI.',
    status: 'Reviewing',
    priority: 'Urgent',
    internalNotes: 'Initial discovery call held. Proposal draft sent for NDA sign-off. High match with our expertise.',
    createdAt: '2026-10-09T14:22:00Z',
    updatedAt: '2026-10-10T09:15:00Z',
  },
  {
    id: 'enq-02',
    clientName: 'Claire Beaumont',
    email: 'claire@luminahealth.com',
    company: 'Lumina Integrative Health',
    serviceType: 'Design Systems & High-Conversion UI/UX',
    budgetRange: '$15,000 - $25,000',
    timeline: '4 Weeks',
    message: 'Our wellness booking platform needs an entire design overhaul. We want a serene yet authoritative dark purple palette and frictionless mobile appointment checkout.',
    status: 'Quoted',
    priority: 'High',
    internalNotes: 'Design sprint quote submitted at $18,500. Awaiting CFO signoff on Tuesday.',
    createdAt: '2026-10-08T11:05:00Z',
    updatedAt: '2026-10-09T16:40:00Z',
  },
  {
    id: 'enq-03',
    clientName: 'David K. Osei',
    email: 'david@afriquestpayments.com',
    company: 'AfriQuest Fintech',
    serviceType: 'Supabase & Cloud Backend Architecture',
    budgetRange: '$30,000 - $50,000',
    timeline: '6 Weeks',
    message: 'Looking to migrate our merchant settlement dashboard to Supabase with strict Row Level Security (RLS) and real-time transaction webhooks.',
    status: 'New',
    priority: 'Medium',
    internalNotes: 'Needs technical review of their existing database volume and compliance schema.',
    createdAt: '2026-10-10T08:30:00Z',
    updatedAt: '2026-10-10T08:30:00Z',
  },
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    actor: 'admin@auradev.studio',
    action: 'status_change',
    entity: 'enquiry',
    description: 'Updated enquiry from Julian Croft to "Reviewing" with priority "Urgent".',
    timestamp: '2026-10-10T09:15:00Z',
  },
  {
    id: 'log-02',
    actor: 'tech@auradev.studio',
    action: 'update',
    entity: 'project',
    description: 'Published live release notes for Solaria BioTech Enterprise Portal.',
    timestamp: '2026-10-09T17:00:00Z',
  },
  {
    id: 'log-03',
    actor: 'admin@auradev.studio',
    action: 'auth',
    entity: 'system',
    description: 'Super Admin Alex Vance established authenticated session.',
    timestamp: '2026-10-09T08:00:00Z',
  },
];

// Local Storage Keys
const KEY_PROJECTS = 'auradev_projects_v1';
const KEY_SERVICES = 'auradev_services_v1';
const KEY_TEAM = 'auradev_team_v1';
const KEY_ENQUIRIES = 'auradev_enquiries_v1';
const KEY_LOGS = 'auradev_logs_v1';

class DataStoreManager {
  private projects: Project[] = [];
  private services: Service[] = [];
  private team: TeamMember[] = [];
  private enquiries: Enquiry[] = [];
  private logs: ActivityLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.setupSyncListener();
    this.setupSupabaseSubscription();
  }

  private loadFromStorage() {
    try {
      const p = localStorage.getItem(KEY_PROJECTS);
      this.projects = p ? JSON.parse(p) : INITIAL_PROJECTS;

      const s = localStorage.getItem(KEY_SERVICES);
      this.services = s ? JSON.parse(s) : INITIAL_SERVICES;

      const t = localStorage.getItem(KEY_TEAM);
      this.team = t ? JSON.parse(t) : INITIAL_TEAM;

      const e = localStorage.getItem(KEY_ENQUIRIES);
      this.enquiries = e ? JSON.parse(e) : INITIAL_ENQUIRIES;

      const l = localStorage.getItem(KEY_LOGS);
      this.logs = l ? JSON.parse(l) : INITIAL_LOGS;
    } catch {
      this.projects = INITIAL_PROJECTS;
      this.services = INITIAL_SERVICES;
      this.team = INITIAL_TEAM;
      this.enquiries = INITIAL_ENQUIRIES;
      this.logs = INITIAL_LOGS;
    }
  }

  private saveToStorage() {
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(this.projects));
    localStorage.setItem(KEY_SERVICES, JSON.stringify(this.services));
    localStorage.setItem(KEY_TEAM, JSON.stringify(this.team));
    localStorage.setItem(KEY_ENQUIRIES, JSON.stringify(this.enquiries));
    localStorage.setItem(KEY_LOGS, JSON.stringify(this.logs));
  }

  private notify(type: string, payload?: any) {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());

    // Broadcast cross-tab and cross-window event
    if (syncChannel) {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }

  private setupSyncListener() {
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data && event.data.type) {
          this.loadFromStorage();
          this.listeners.forEach((listener) => listener());
        }
      };
    }
  }

  private setupSupabaseSubscription() {
    const supabase = getSupabase();
    if (supabase && isSupabaseActive()) {
      try {
        const channel = supabase.channel('auradev_live_changes');
        channel
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            // Trigger refresh when Supabase database updates in real-time
            this.syncWithSupabase();
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime Supabase subscription setup:', err);
      }
    }
  }

  public async syncWithSupabase() {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseActive()) return;

    try {
      const [projRes, servRes, teamRes, enqRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('services').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('enquiries').select('*'),
      ]);

      if (projRes.data && projRes.data.length > 0) {
        this.projects = projRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          client: item.client,
          category: item.category,
          summary: item.summary,
          description: item.description || '',
          coverImage: item.cover_image,
          tags: item.tags || [],
          liveUrl: item.live_url,
          repoUrl: item.repo_url,
          budget: Number(item.budget) || 0,
          status: item.status,
          featured: Boolean(item.featured),
          completionDate: item.completion_date,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }

      if (servRes.data && servRes.data.length > 0) {
        this.services = servRes.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          tagline: item.tagline || '',
          description: item.description,
          icon: item.icon,
          priceStarting: Number(item.price_starting) || 0,
          deliveryTime: item.delivery_time || '3 Weeks',
          category: item.category,
          features: item.features || [],
          deliverables: item.deliverables || [],
          active: Boolean(item.active),
          order: item.display_order || 0,
        }));
      }

      if (teamRes.data && teamRes.data.length > 0) {
        this.team = teamRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          accessLevel: item.access_level,
          email: item.email,
          avatar: item.avatar,
          bio: item.bio || '',
          skills: item.skills || [],
          status: item.status || 'Active',
          joinedDate: item.joined_date || '',
        }));
      }

      if (enqRes.data && enqRes.data.length > 0) {
        this.enquiries = enqRes.data.map((item: any) => ({
          id: item.id,
          clientName: item.client_name,
          email: item.email,
          company: item.company,
          serviceType: item.service_type,
          budgetRange: item.budget_range,
          timeline: item.timeline,
          message: item.message,
          status: item.status,
          priority: item.priority,
          internalNotes: item.internal_notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }

      this.saveToStorage();
      this.listeners.forEach((listener) => listener());
    } catch (err) {
      console.warn('Sync with Supabase encountered table note:', err);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Projects CRUD ---
  public getProjects(): Project[] {
    return [...this.projects];
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, actor: string = 'Admin'): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: 'proj-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    this.addLog(actor, 'create', 'project', `Created project "${newProject.title}" for client ${newProject.client}.`);
    this.notify('PROJECT_CREATED', newProject);

    // If Supabase is active, push to Supabase
    const supabase = getSupabase();
    if (supabase && isSupabaseActive()) {
      try {
        await supabase.from('projects').insert({
          title: newProject.title,
          slug: newProject.slug,
          client: newProject.client,
          category: newProject.category,
          summary: newProject.summary,
          description: newProject.description,
          cover_image: newProject.coverImage,
          tags: newProject.tags,
          live_url: newProject.liveUrl,
          repo_url: newProject.repoUrl,
          budget: newProject.budget,
          status: newProject.status,
          featured: newProject.featured,
        });
      } catch (e) {
        console.warn('Supabase insert note:', e);
      }
    }

    return newProject;
  }

  public async updateProject(id: string, updates: Partial<Project>, actor: string = 'Admin'): Promise<Project | null> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.projects[index] = updated;

    this.addLog(actor, 'update', 'project', `Updated project "${updated.title}" (Status: ${updated.status}).`);
    this.notify('PROJECT_UPDATED', updated);

    const supabase = getSupabase();
    if (supabase && isSupabaseActive()) {
      try {
        await supabase.from('projects').update({
          title: updated.title,
          slug: updated.slug,
          client: updated.client,
          category: updated.category,
          summary: updated.summary,
          description: updated.description,
          cover_image: updated.coverImage,
          tags: updated.tags,
          live_url: updated.liveUrl,
          repo_url: updated.repoUrl,
          budget: updated.budget,
          status: updated.status,
          featured: updated.featured,
          updated_at: updated.updatedAt,
        }).match({ slug: updated.slug });
      } catch (e) {
        console.warn('Supabase update note:', e);
      }
    }

    return updated;
  }

  public async deleteProject(id: string, actor: string = 'Admin'): Promise<boolean> {
    const target = this.projects.find((p) => p.id === id);
    if (!target) return false;

    this.projects = this.projects.filter((p) => p.id !== id);
    this.addLog(actor, 'delete', 'project', `Deleted project "${target.title}".`);
    this.notify('PROJECT_DELETED', { id });

    const supabase = getSupabase();
    if (supabase && isSupabaseActive()) {
      try {
        await supabase.from('projects').delete().match({ slug: target.slug });
      } catch (e) {
        console.warn('Supabase delete note:', e);
      }
    }

    return true;
  }

  // --- Services CRUD ---
  public getServices(): Service[] {
    return [...this.services].sort((a, b) => a.order - b.order);
  }

  public async addService(service: Omit<Service, 'id'>, actor: string = 'Admin'): Promise<Service> {
    const newService: Service = {
      ...service,
      id: 'serv-' + Math.random().toString(36).substr(2, 9),
    };
    this.services.push(newService);
    this.addLog(actor, 'create', 'service', `Added new agency service: "${newService.title}".`);
    this.notify('SERVICE_CREATED', newService);
    return newService;
  }

  public async updateService(id: string, updates: Partial<Service>, actor: string = 'Admin'): Promise<Service | null> {
    const index = this.services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated = { ...this.services[index], ...updates };
    this.services[index] = updated;
    this.addLog(actor, 'update', 'service', `Updated service "${updated.title}".`);
    this.notify('SERVICE_UPDATED', updated);
    return updated;
  }

  public async deleteService(id: string, actor: string = 'Admin'): Promise<boolean> {
    const target = this.services.find((s) => s.id === id);
    if (!target) return false;

    this.services = this.services.filter((s) => s.id !== id);
    this.addLog(actor, 'delete', 'service', `Deleted service "${target.title}".`);
    this.notify('SERVICE_DELETED', { id });
    return true;
  }

  // --- Team Members CRUD ---
  public getTeam(): TeamMember[] {
    return [...this.team];
  }

  public async addTeamMember(member: Omit<TeamMember, 'id'>, actor: string = 'Admin'): Promise<TeamMember> {
    const newMember: TeamMember = {
      ...member,
      id: 'team-' + Math.random().toString(36).substr(2, 9),
    };
    this.team.push(newMember);
    this.addLog(actor, 'create', 'team', `Added team member ${newMember.name} (${newMember.role}) with access level ${newMember.accessLevel}.`);
    this.notify('TEAM_CREATED', newMember);
    return newMember;
  }

  public async updateTeamMember(id: string, updates: Partial<TeamMember>, actor: string = 'Admin'): Promise<TeamMember | null> {
    const index = this.team.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updated = { ...this.team[index], ...updates };
    this.team[index] = updated;
    this.addLog(actor, 'update', 'team', `Updated team member ${updated.name} (Role: ${updated.role}, Access: ${updated.accessLevel}).`);
    this.notify('TEAM_UPDATED', updated);
    return updated;
  }

  public async deleteTeamMember(id: string, actor: string = 'Admin'): Promise<boolean> {
    const target = this.team.find((m) => m.id === id);
    if (!target) return false;

    this.team = this.team.filter((m) => m.id !== id);
    this.addLog(actor, 'delete', 'team', `Removed team member ${target.name}.`);
    this.notify('TEAM_DELETED', { id });
    return true;
  }

  // --- Client Enquiries Management ---
  public getEnquiries(): Enquiry[] {
    return [...this.enquiries];
  }

  public async submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'priority' | 'createdAt' | 'updatedAt'>): Promise<Enquiry> {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: 'enq-' + Math.random().toString(36).substr(2, 9),
      status: 'New',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.enquiries.unshift(newEnquiry);
    this.addLog('System', 'create', 'enquiry', `New client enquiry received from ${newEnquiry.clientName} (${newEnquiry.company || 'Private'}) for ${newEnquiry.serviceType}.`);
    this.notify('ENQUIRY_RECEIVED', newEnquiry);

    // If Supabase is active, insert into public.enquiries (allowed by RLS policy!)
    const supabase = getSupabase();
    if (supabase && isSupabaseActive()) {
      try {
        await supabase.from('enquiries').insert({
          client_name: newEnquiry.clientName,
          email: newEnquiry.email,
          company: newEnquiry.company,
          service_type: newEnquiry.serviceType,
          budget_range: newEnquiry.budgetRange,
          timeline: newEnquiry.timeline,
          message: newEnquiry.message,
          status: newEnquiry.status,
          priority: newEnquiry.priority,
        });
      } catch (err) {
        console.warn('Supabase enquiry insert note:', err);
      }
    }

    return newEnquiry;
  }

  public async updateEnquiry(id: string, updates: Partial<Enquiry>, actor: string = 'Admin'): Promise<Enquiry | null> {
    const index = this.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.enquiries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.enquiries[index] = updated;

    this.addLog(actor, 'status_change', 'enquiry', `Updated enquiry from ${updated.clientName} to status "${updated.status}" (Priority: ${updated.priority}).`);
    this.notify('ENQUIRY_UPDATED', updated);
    return updated;
  }

  public async deleteEnquiry(id: string, actor: string = 'Admin'): Promise<boolean> {
    const target = this.enquiries.find((e) => e.id === id);
    if (!target) return false;

    this.enquiries = this.enquiries.filter((e) => e.id !== id);
    this.addLog(actor, 'delete', 'enquiry', `Archived and deleted enquiry from ${target.clientName}.`);
    this.notify('ENQUIRY_DELETED', { id });
    return true;
  }

  // --- Logs & Audit Trail ---
  public getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  public addLog(actor: string, action: ActivityLog['action'], entity: ActivityLog['entity'], description: string) {
    const log: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      actor,
      action,
      entity,
      description,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(log);
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
    this.saveToStorage();
  }

  public resetToFactoryDefaults() {
    this.projects = INITIAL_PROJECTS;
    this.services = INITIAL_SERVICES;
    this.team = INITIAL_TEAM;
    this.enquiries = INITIAL_ENQUIRIES;
    this.logs = INITIAL_LOGS;
    this.saveToStorage();
    this.notify('FACTORY_RESET');
  }
}

export const dataStore = new DataStoreManager();
