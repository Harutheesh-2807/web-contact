import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  Users, 
  Inbox, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Globe, 
  Database, 
  Eye, 
  Menu, 
  X, 
  Activity, 
  TrendingUp, 
  Check, 
  Filter, 
  DollarSign,
  ChevronRight,
  Shield,
  Layers,
  Save,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { Project, Service, TeamMember, Enquiry, AdminRole, ProjectStatus, EnquiryStatus, EnquiryPriority } from '../types';
import { SupabaseModal } from './SupabaseModal';
import { isSupabaseActive } from '../lib/supabase';

interface AdminDashboardProps {
  onViewPublicSite: () => void;
}

type TabType = 'overview' | 'projects' | 'services' | 'team' | 'enquiries' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewPublicSite }) => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Data State
  const [projects, setProjects] = useState<Project[]>(dataStore.getProjects());
  const [services, setServices] = useState<Service[]>(dataStore.getServices());
  const [team, setTeam] = useState<TeamMember[]>(dataStore.getTeam());
  const [enquiries, setEnquiries] = useState<Enquiry[]>(dataStore.getEnquiries());
  const [logs, setLogs] = useState(dataStore.getLogs());

  // Search & Filter State
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('All');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>('All');

  // Modals for CRUD
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setProjects(dataStore.getProjects());
      setServices(dataStore.getServices());
      setTeam(dataStore.getTeam());
      setEnquiries(dataStore.getEnquiries());
      setLogs(dataStore.getLogs());
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await dataStore.syncWithSupabase();
    setTimeout(() => {
      setIsSyncing(false);
      triggerToast('Real-time sync complete across devices and database.');
    }, 600);
  };

  // Metrics Calculations
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const activeProjectsCount = projects.filter(p => p.status === 'In Development' || p.status === 'Planning').length;
  const liveProjectsCount = projects.filter(p => p.status === 'Live').length;
  const newEnquiriesCount = enquiries.filter(e => e.status === 'New').length;
  const urgentEnquiriesCount = enquiries.filter(e => e.priority === 'Urgent').length;

  // Filtered lists
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(projectSearch.toLowerCase()) || 
                          p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesStatus = projectStatusFilter === 'All' || p.status === projectStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEnquiries = enquiries.filter(e => {
    return enquiryStatusFilter === 'All' || e.status === enquiryStatusFilter;
  });

  // Project CRUD Handlers
  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const client = formData.get('client') as string;
    const category = formData.get('category') as Project['category'];
    const summary = formData.get('summary') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as string;
    const liveUrl = formData.get('liveUrl') as string;
    const repoUrl = formData.get('repoUrl') as string;
    const budget = Number(formData.get('budget')) || 0;
    const status = formData.get('status') as ProjectStatus;
    const featured = formData.get('featured') === 'on';
    const tagsString = formData.get('tags') as string;
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingProject) {
      await dataStore.updateProject(editingProject.id, {
        title,
        slug,
        client,
        category,
        summary,
        description,
        coverImage,
        liveUrl,
        repoUrl,
        budget,
        status,
        featured,
        tags,
      }, user?.name || 'Admin');
      triggerToast(`Project "${title}" updated successfully.`);
    } else {
      await dataStore.addProject({
        title,
        slug,
        client,
        category,
        summary,
        description,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        liveUrl,
        repoUrl,
        budget,
        status,
        featured,
        tags: tags.length ? tags : ['React', 'TypeScript', 'Tailwind'],
      }, user?.name || 'Admin');
      triggerToast(`Project "${title}" created.`);
    }

    setProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action will sync across all devices.`)) {
      await dataStore.deleteProject(id, user?.name || 'Admin');
      triggerToast(`Project "${title}" removed.`);
    }
  };

  // Service CRUD Handlers
  const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const tagline = formData.get('tagline') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as Service['category'];
    const priceStarting = Number(formData.get('priceStarting')) || 0;
    const deliveryTime = formData.get('deliveryTime') as string;
    const active = formData.get('active') === 'on';
    const featuresRaw = (formData.get('features') as string).split('\n').map(s => s.trim()).filter(Boolean);
    const deliverablesRaw = (formData.get('deliverables') as string).split('\n').map(s => s.trim()).filter(Boolean);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingService) {
      await dataStore.updateService(editingService.id, {
        title,
        slug,
        tagline,
        description,
        category,
        priceStarting,
        deliveryTime,
        active,
        features: featuresRaw,
        deliverables: deliverablesRaw,
      }, user?.name || 'Admin');
      triggerToast(`Service "${title}" updated.`);
    } else {
      await dataStore.addService({
        title,
        slug,
        tagline,
        description,
        category,
        icon: 'Layers',
        priceStarting,
        deliveryTime,
        active,
        features: featuresRaw,
        deliverables: deliverablesRaw,
        order: services.length + 1,
      }, user?.name || 'Admin');
      triggerToast(`Service "${title}" created.`);
    }

    setServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (window.confirm(`Delete service "${title}"?`)) {
      await dataStore.deleteService(id, user?.name || 'Admin');
      triggerToast(`Service "${title}" deleted.`);
    }
  };

  // Team CRUD Handlers
  const handleSaveTeamMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const accessLevel = formData.get('accessLevel') as AdminRole;
    const email = formData.get('email') as string;
    const avatar = formData.get('avatar') as string;
    const bio = formData.get('bio') as string;
    const skillsRaw = (formData.get('skills') as string).split(',').map(s => s.trim()).filter(Boolean);
    const status = formData.get('status') as TeamMember['status'];

    if (editingTeamMember) {
      await dataStore.updateTeamMember(editingTeamMember.id, {
        name,
        role,
        accessLevel,
        email,
        avatar,
        bio,
        skills: skillsRaw,
        status,
      }, user?.name || 'Admin');
      triggerToast(`Team member "${name}" updated.`);
    } else {
      await dataStore.addTeamMember({
        name,
        role,
        accessLevel,
        email,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio,
        skills: skillsRaw,
        status,
        joinedDate: new Date().toISOString().split('T')[0],
      }, user?.name || 'Admin');
      triggerToast(`Team member "${name}" added.`);
    }

    setTeamModalOpen(false);
    setEditingTeamMember(null);
  };

  const handleDeleteTeamMember = async (id: string, name: string) => {
    if (window.confirm(`Remove team member "${name}"?`)) {
      await dataStore.deleteTeamMember(id, user?.name || 'Admin');
      triggerToast(`Team member "${name}" removed.`);
    }
  };

  // Enquiry Update Handler
  const handleUpdateEnquiryStatus = async (id: string, status: EnquiryStatus, priority?: EnquiryPriority, notes?: string) => {
    const updates: Partial<Enquiry> = { status };
    if (priority) updates.priority = priority;
    if (notes !== undefined) updates.internalNotes = notes;

    await dataStore.updateEnquiry(id, updates, user?.name || 'Admin');
    triggerToast(`Enquiry status updated to "${status}".`);
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#161a26] border border-purple-500/50 text-purple-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#10131a] border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight">AuraDev Studio</div>
            <div className="text-[10px] text-purple-400 font-mono">Admin Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/80"
            title="Sync Database"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 rounded-lg bg-zinc-800/80 hover:bg-zinc-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0d1017] border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div>
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/40">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white tracking-tight leading-none">AuraDev Studio</h1>
                <span className="text-[10px] font-mono text-purple-400">Enterprise Admin</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="p-4 mx-3 my-3 bg-[#131722] border border-zinc-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-md">
              {user?.name ? user.name.slice(0, 2) : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-purple-300 font-mono capitalize truncate">
                {user?.role?.replace('_', ' ') || 'Super Admin'}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview &amp; Stats</span>
            </button>

            <button
              onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4" />
                <span>Projects (CRUD)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'services'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {services.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'team'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Team &amp; Roles</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {team.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('enquiries'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'enquiries'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" />
                <span>Client Enquiries</span>
              </div>
              {newEnquiriesCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-white font-bold animate-pulse">
                  {newEnquiriesCount} New
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Supabase &amp; RLS</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          <button
            onClick={onViewPublicSite}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#141823] hover:bg-zinc-800 text-zinc-300 transition-all border border-zinc-800/80"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              Live Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <button
            onClick={() => setShowSupabaseModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 transition-all border border-purple-500/30"
          >
            <span className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Supabase Status
            </span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseActive() ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0d1017]/80 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
              {activeTab === 'overview' && 'Executive Dashboard'}
              {activeTab === 'projects' && 'Project Management & Deployments'}
              {activeTab === 'services' && 'Agency Services & Pricing Matrix'}
              {activeTab === 'team' && 'Team Architecture & Access Roles'}
              {activeTab === 'enquiries' && 'Client Enquiries & Pipeline CRM'}
              {activeTab === 'security' && 'Supabase & Row Level Security (RLS)'}
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time multi-device database synchronization enabled
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
            </button>

            <button
              onClick={onViewPublicSite}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Agency Site</span>
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 flex-1">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & STATS                                   */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Projects</span>
                    <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/30">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">{activeProjectsCount}</div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                    <span className="text-emerald-400 font-semibold">{liveProjectsCount} Live</span> in production
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pipeline Value</span>
                    <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">${totalBudget.toLocaleString()}</div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                    Across {projects.length} recorded enterprise milestones
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Client Enquiries</span>
                    <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">{enquiries.length}</div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                    <span className="text-purple-400 font-semibold">{newEnquiriesCount} Pending review</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Urgent Leads</span>
                    <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-500/30">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">{urgentEnquiriesCount}</div>
                  <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                    Requiring immediate technical response
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Recent Enquiries & Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enquiries Pipeline Triage */}
                <div className="lg:col-span-2 bg-[#11141e] border border-zinc-800/80 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <span>Lead Pipeline Triage</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                          Live CRM
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">Incoming inquiries from the public agency website</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('enquiries')}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      View All ({enquiries.length})
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {enquiries.slice(0, 3).map((enq) => (
                      <div
                        key={enq.id}
                        className="p-4 rounded-xl bg-[#151924] border border-zinc-800/80 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">{enq.clientName}</span>
                            <span className="text-xs text-zinc-400">({enq.company || 'Direct Client'})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              enq.status === 'New' ? 'bg-purple-950 text-purple-300 border-purple-500/30' :
                              enq.status === 'Reviewing' ? 'bg-amber-950 text-amber-300 border-amber-500/30' :
                              enq.status === 'Quoted' ? 'bg-indigo-950 text-indigo-300 border-indigo-500/30' :
                              'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {enq.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate max-w-lg">{enq.message}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500 font-mono">
                            <span>Service: {enq.serviceType}</span>
                            <span>•</span>
                            <span>Budget: {enq.budgetRange}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                          >
                            Details
                          </button>
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)}
                            className="bg-[#191e2b] border border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-purple-500"
                          >
                            <option value="New">New</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Quoted">Quoted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit & Activity Logs */}
                <div className="bg-[#11141e] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span>Audit Trail</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mb-4">Immutable admin event log</p>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {logs.slice(0, 7).map((log) => (
                        <div key={log.id} className="text-xs border-l-2 border-purple-500/40 pl-3 py-0.5">
                          <div className="text-zinc-200 leading-snug">{log.description}</div>
                          <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 font-mono">
                            <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="text-purple-400/80">{log.actor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Active Storage: IndexedDB + Supabase</span>
                    <span className="text-emerald-400 font-mono">Sync Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PROJECTS MANAGEMENT (CRUD)                         */}
          {/* ========================================================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11141e] border border-zinc-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search projects, clients, tech tags..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full bg-[#161a25] border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value)}
                    className="bg-[#161a25] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Planning">Planning</option>
                    <option value="In Development">In Development</option>
                    <option value="Testing & QA">Testing &amp; QA</option>
                    <option value="Live">Live</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Project</span>
                </button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover & Badges */}
                      <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#11141e] via-[#11141e]/30 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md border ${
                            project.status === 'Live' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                            project.status === 'In Development' ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' :
                            'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}>
                            {project.status}
                          </span>
                          {project.featured && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-400/30 font-semibold backdrop-blur-md">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-4 right-4">
                          <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                            {project.category}
                          </span>
                          <h4 className="font-bold text-white text-base leading-tight">
                            {project.title}
                          </h4>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                          <span>Client: <strong className="text-zinc-200">{project.client}</strong></span>
                          <span>Budget: <strong className="text-emerald-400">${project.budget.toLocaleString()}</strong></span>
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {project.summary}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.tags.map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-[#181d2a] text-zinc-300 border border-zinc-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-zinc-800/80 flex items-center justify-between bg-[#0e1119]">
                      <div className="flex items-center gap-2">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live Demo
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setProjectModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SERVICES MANAGEMENT (CRUD)                         */}
          {/* ========================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between bg-[#11141e] border border-zinc-800/80 rounded-2xl p-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Agency Service Catalog</h3>
                  <p className="text-xs text-zinc-400">Configure offerings, pricing tiers, and deliverables</p>
                </div>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-950/60 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((serv) => (
                  <div
                    key={serv.id}
                    className="p-5 rounded-2xl bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30">
                          {serv.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            serv.active ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {serv.active ? 'Active Offering' : 'Paused'}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">{serv.title}</h4>
                      <p className="text-xs text-zinc-400 mb-3">{serv.tagline}</p>

                      <div className="bg-[#151924] rounded-xl p-3 border border-zinc-800 mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Starting Rate</div>
                          <div className="text-base font-black text-white">${serv.priceStarting.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Estimated Timeline</div>
                          <div className="text-xs font-semibold text-zinc-300">{serv.deliveryTime}</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="text-[11px] font-semibold text-zinc-300">Core Features:</div>
                        {serv.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingService(serv);
                          setServiceModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                      >
                        Edit Service
                      </button>
                      <button
                        onClick={() => handleDeleteService(serv.id, serv.title)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: TEAM & ROLES (RBAC)                                 */}
          {/* ========================================================= */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between bg-[#11141e] border border-zinc-800/80 rounded-2xl p-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Agency Team &amp; Access Control</h3>
                  <p className="text-xs text-zinc-400">Manage member privileges, roles, and administrative authentication</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTeamMember(null);
                    setTeamModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-950/60 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-base truncate">{member.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              member.accessLevel === 'super_admin' ? 'bg-purple-950 text-purple-300 border-purple-500/40' :
                              member.accessLevel === 'lead_developer' ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40' :
                              'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}>
                              {member.accessLevel.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 font-medium">{member.role}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{member.email}</div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{member.bio}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {member.skills.map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-[#171b26] text-zinc-300 border border-zinc-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">
                        Status: <strong className="text-emerald-400">{member.status}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTeamMember(member);
                            setTeamModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => handleDeleteTeamMember(member.id, member.name)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ENQUIRIES & LEADS CRM                              */}
          {/* ========================================================= */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11141e] border border-zinc-800/80 rounded-2xl p-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Client Enquiries Pipeline</h3>
                  <p className="text-xs text-zinc-400">Real client submissions with priority tagging and status progression</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  <select
                    value={enquiryStatusFilter}
                    onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                    className="bg-[#161a25] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="All">All Inquiries ({enquiries.length})</option>
                    <option value="New">New</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Quoted">Quoted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-[#11141e] border border-zinc-800/80 hover:border-purple-500/40 rounded-2xl p-5 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{enq.clientName}</h4>
                          <span className="text-xs text-zinc-400">({enq.company || 'Direct Contact'})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            enq.priority === 'Urgent' ? 'bg-rose-950 text-rose-300 border-rose-500/40' :
                            enq.priority === 'High' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {enq.priority} Priority
                          </span>
                        </div>
                        <div className="text-xs text-purple-400 font-mono mt-0.5">{enq.email}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)}
                          className="bg-[#171b26] border border-zinc-700 text-xs rounded-xl px-3 py-1.5 text-zinc-200 font-semibold focus:outline-none focus:border-purple-500"
                        >
                          <option value="New">Status: New</option>
                          <option value="Reviewing">Status: Reviewing</option>
                          <option value="Quoted">Status: Quoted</option>
                          <option value="In Progress">Status: In Progress</option>
                          <option value="Closed">Status: Closed</option>
                        </select>
                        <a
                          href={`mailto:${enq.email}?subject=AuraDev Studio - Regarding your inquiry on ${enq.serviceType}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                        >
                          Reply Email
                        </a>
                      </div>
                    </div>

                    <div className="py-3">
                      <p className="text-xs text-zinc-300 leading-relaxed bg-[#151923] p-3 rounded-xl border border-zinc-800/80">
                        {enq.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-2 gap-2">
                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span>Service: <strong className="text-zinc-200">{enq.serviceType}</strong></span>
                        <span>Budget: <strong className="text-emerald-400">{enq.budgetRange}</strong></span>
                        <span>Timeline: <strong className="text-zinc-200">{enq.timeline}</strong></span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Submitted: {new Date(enq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: SUPABASE & ROW LEVEL SECURITY (RLS)                */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-[#11141e] border border-purple-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Row Level Security (RLS) Policy Engine
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Zero-trust database architecture powered by PostgreSQL and Supabase
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSupabaseModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all cursor-pointer"
                  >
                    Configure Supabase Client
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-[#151924] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-200">Table: projects</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold">RLS Active</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Public SELECT permitted for portfolio display; INSERT/UPDATE/DELETE strictly restricted to authenticated AuraDev admins.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#151924] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-200">Table: enquiries</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold">RLS Active</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Public clients permitted to INSERT new proposals; SELECT and management restricted solely to authenticated admin profiles.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#151924] border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-200">Secret Key Guard</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 font-semibold">Enforced</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Frontend clients only access public anon JWT. <code className="text-purple-300">service_role</code> master keys are shielded.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL: PROJECT CREATE / EDIT                              */}
      {/* ========================================================= */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#12151e] border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base">
                {editingProject ? 'Edit Project Specifications' : 'Deploy New Client Project'}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Project Title</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingProject?.title || ''}
                    placeholder="e.g. Apex High-Frequency Portal"
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Client Organization</label>
                  <input
                    name="client"
                    required
                    defaultValue={editingProject?.client || ''}
                    placeholder="e.g. Apex Global Corp"
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProject?.category || 'SaaS Platform'}
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Web Portal">Web Portal</option>
                    <option value="AI / Tech">AI / Tech</option>
                    <option value="Corporate Branding">Corporate Branding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Budget ($ USD)</label>
                  <input
                    type="number"
                    name="budget"
                    defaultValue={editingProject?.budget || 45000}
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProject?.status || 'In Development'}
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Development">In Development</option>
                    <option value="Testing & QA">Testing & QA</option>
                    <option value="Live">Live</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Summary (Short Pitch)</label>
                <input
                  name="summary"
                  required
                  defaultValue={editingProject?.summary || ''}
                  placeholder="One sentence client summary"
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Technical Architecture &amp; Details</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProject?.description || ''}
                  placeholder="Full scope, technology stack choices, database schema..."
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Cover Image URL</label>
                  <input
                    name="coverImage"
                    defaultValue={editingProject?.coverImage || ''}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Live URL Preview</label>
                  <input
                    name="liveUrl"
                    defaultValue={editingProject?.liveUrl || ''}
                    placeholder="https://client-demo.auradev.studio"
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Tags (Comma-separated)</label>
                <input
                  name="tags"
                  defaultValue={editingProject?.tags?.join(', ') || 'React 19, TypeScript, Supabase, Tailwind'}
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  defaultChecked={editingProject?.featured || false}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="featured" className="text-xs font-semibold text-zinc-300">
                  Feature prominently on public agency homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-950/60"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SERVICE CREATE / EDIT                              */}
      {/* ========================================================= */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#12151e] border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base">
                {editingService ? 'Edit Agency Service' : 'Add New Service Offering'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Service Title</label>
                <input
                  name="title"
                  required
                  defaultValue={editingService?.title || ''}
                  placeholder="e.g. Custom AI Agents & Web Systems"
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Tagline</label>
                <input
                  name="tagline"
                  required
                  defaultValue={editingService?.tagline || ''}
                  placeholder="Short value proposition"
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingService?.category || 'Full-Stack Development'}
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="UI/UX System">UI/UX System</option>
                    <option value="API & Cloud">API &amp; Cloud</option>
                    <option value="Optimization & Scale">Optimization &amp; Scale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Starting Price ($)</label>
                  <input
                    type="number"
                    name="priceStarting"
                    defaultValue={editingService?.priceStarting || 7500}
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Delivery Time</label>
                <input
                  name="deliveryTime"
                  defaultValue={editingService?.deliveryTime || '3 - 6 Weeks'}
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Features (One per line)</label>
                <textarea
                  name="features"
                  rows={3}
                  defaultValue={editingService?.features?.join('\n') || 'Enterprise Component Architecture\nSupabase Row Level Security\nAutomated CI/CD Testing'}
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={editingService ? editingService.active : true}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="active" className="text-xs font-semibold text-zinc-300">
                  Active offering visible to clients
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TEAM MEMBER CREATE / EDIT                          */}
      {/* ========================================================= */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#12151e] border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base">
                {editingTeamMember ? 'Edit Team Member & Roles' : 'Onboard Team Member'}
              </h3>
              <button onClick={() => setTeamModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Full Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingTeamMember?.name || ''}
                    placeholder="e.g. Jordan Cole"
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Role Title</label>
                  <input
                    name="role"
                    required
                    defaultValue={editingTeamMember?.role || ''}
                    placeholder="e.g. Lead Cloud Architect"
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Admin Access Level</label>
                  <select
                    name="accessLevel"
                    defaultValue={editingTeamMember?.accessLevel || 'lead_developer'}
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="lead_developer">Lead Developer</option>
                    <option value="lead_designer">Lead Designer</option>
                    <option value="project_manager">Project Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Official Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingTeamMember?.email || ''}
                    placeholder="jordan@auradev.studio"
                    className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Avatar Image URL</label>
                <input
                  name="avatar"
                  defaultValue={editingTeamMember?.avatar || ''}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingTeamMember?.bio || ''}
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Skills (Comma-separated)</label>
                <input
                  name="skills"
                  defaultValue={editingTeamMember?.skills?.join(', ') || 'React, PostgreSQL, RLS, Tailwind'}
                  className="w-full bg-[#171b26] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};
