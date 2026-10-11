import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  ExternalLink, 
  Layers, 
  Database, 
  ShieldCheck, 
  Users, 
  Mail, 
  Send, 
  Check, 
  Code2, 
  Cpu, 
  Compass, 
  Palette, 
  Zap, 
  X,
  MessageSquare,
  Building,
  DollarSign,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { dataStore } from '../lib/dataStore';
import { Project, Service, TeamMember } from '../types';
import { useAuth } from '../context/AuthContext';

interface PublicWebsiteProps {
  onGoToAdmin: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onGoToAdmin }) => {
  const { user } = useAuth();

  const [projects] = useState<Project[]>(dataStore.getProjects());
  const [services] = useState<Service[]>(dataStore.getServices());
  const [team] = useState<TeamMember[]>(dataStore.getTeam());

  // Category Filter for Portfolio
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Proposal / Enquiry Form State
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceType, setServiceType] = useState(services[0]?.title || 'Bespoke Web Application Engineering');
  const [budgetRange, setBudgetRange] = useState('$25,000 - $50,000');
  const [timeline, setTimeline] = useState('4 - 8 Weeks');
  const [message, setMessage] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);

  const categories = ['All', 'SaaS Platform', 'E-Commerce', 'Web Portal', 'AI / Tech'];

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !email || !message) return;

    setIsSubmittingEnquiry(true);
    try {
      const created = await dataStore.submitEnquiry({
        clientName,
        email,
        company,
        serviceType,
        budgetRange,
        timeline,
        message,
      });

      setSubmittedEnquiryId(created.id);
      setClientName('');
      setEmail('');
      setCompany('');
      setMessage('');
    } catch (err) {
      console.error('Enquiry submission error:', err);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleSelectServiceForQuote = (serviceTitle: string) => {
    setServiceType(serviceTitle);
    const element = document.getElementById('contact-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 selection:bg-purple-600 selection:text-white">
      {/* ========================================================= */}
      {/* NAVIGATION BAR                                            */}
      {/* ========================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0f16]/85 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-800 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/60 border border-purple-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                AuraDev <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 font-mono">Studio</span>
              </span>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
                High-Performance Web Systems
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <a href="#services" className="hover:text-purple-400 transition-colors">Services</a>
            <a href="#work" className="hover:text-purple-400 transition-colors">Portfolio</a>
            <a href="#team" className="hover:text-purple-400 transition-colors">Architects</a>
            <a href="#contact" className="hover:text-purple-400 transition-colors">Estimate</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToAdmin}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                user
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/40'
                  : 'bg-[#151924] border-zinc-700/80 text-zinc-200 hover:text-white hover:border-purple-500/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>{user ? `Admin Hub (${user.name.split(' ')[0]})` : 'Admin Portal'}</span>
            </button>

            <a
              href="#contact"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950/50 transition-all"
            >
              <span>Get Proposal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-900/20 blur-[140px] pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151925] border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Accepting Q4 2026 Enterprise Engineering Contracts</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Architecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300">High-Performance</span> Web Ecosystems
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We engineer mission-critical digital products for forward-thinking enterprises. Powered by modern React, TypeScript, Supabase, and ironclad Row Level Security.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#contact"
              className="px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-950/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Initiate Project Brief</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#work"
              className="px-8 py-4 rounded-2xl text-sm font-semibold text-zinc-200 bg-[#131722] hover:bg-zinc-800 border border-zinc-700/80 transition-all flex items-center gap-2"
            >
              <span>Explore Selected Work</span>
            </a>
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-12 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#11141e]/80 border border-zinc-800/80">
              <div className="text-2xl font-black text-white">99.98%</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Uptime SLA Guaranteed</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#11141e]/80 border border-zinc-800/80">
              <div className="text-2xl font-black text-purple-400">&lt; 85ms</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Global Edge Latency</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#11141e]/80 border border-zinc-800/80">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Strict TypeScript &amp; RLS</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#11141e]/80 border border-zinc-800/80">
              <div className="text-2xl font-black text-indigo-400">42+</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Production Deployments</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SERVICES SECTION                                          */}
      {/* ========================================================= */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Engineering Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Modular Services Engineered for Scale
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md">
            Every solution is architected with obsessive precision, clean architecture, automated testing, and comprehensive handover documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((serv) => (
            <div
              key={serv.id}
              className="bg-[#10131b] border border-zinc-800/80 hover:border-purple-500/40 rounded-3xl p-8 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/10 rounded-full blur-2xl group-hover:bg-purple-900/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30">
                    {serv.category}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">Starting at</span>
                    <span className="text-lg font-black text-white">${serv.priceStarting.toLocaleString()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {serv.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {serv.description}
                </p>

                <div className="space-y-2 mb-6">
                  {serv.features.map((feature, i) => (
                    <div key={i} className="text-xs text-zinc-300 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  Delivery: <strong className="text-zinc-300">{serv.deliveryTime}</strong>
                </span>
                <button
                  onClick={() => handleSelectServiceForQuote(serv.title)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Select for Proposal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* PORTFOLIO / SELECTED WORK                                 */}
      {/* ========================================================= */}
      <section id="work" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>Production Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered Client Deployments
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                    : 'bg-[#131620] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[#10131b] border border-zinc-800/80 hover:border-purple-500/40 rounded-3xl overflow-hidden transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-[#10131b]/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-[#0a0c10]/80 backdrop-blur-md text-purple-300 border border-purple-500/40">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Client: <strong className="text-zinc-200">{project.client}</strong></span>
                    <span className="text-emerald-400 font-mono font-semibold">{project.status}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {project.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#151925] text-zinc-300 border border-zinc-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Technical Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center gap-1.5"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* TEAM SECTION                                              */}
      {/* ========================================================= */}
      <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>Systems Architects</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The AuraDev Core Team
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Senior software engineers and creative directors personally leading every client build.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-[#10131b] border border-zinc-800/80 hover:border-purple-500/30 rounded-3xl p-6 transition-all flex flex-col justify-between"
            >
              <div>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover mb-4 border border-purple-500/30 shadow-lg"
                />
                <h4 className="font-bold text-white text-base">{member.name}</h4>
                <div className="text-xs text-purple-400 font-semibold mb-2">{member.role}</div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{member.bio}</p>
              </div>

              <div className="flex flex-wrap gap-1 pt-3 border-t border-zinc-800/80">
                {member.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-[#161a25] text-zinc-400 border border-zinc-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* PROPOSAL & ENQUIRY ESTIMATION ENGINE                      */}
      {/* ========================================================= */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-zinc-800/80">
        <div id="contact-section" className="bg-[#10131c] border border-purple-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-900/10 blur-[90px] pointer-events-none" />

          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 inline-block">
              Immediate Technical Proposal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Request an Architectural Scope
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Submit your project details. It automatically routes into our secure Admin CRM pipeline.
            </p>
          </div>

          {submittedEnquiryId ? (
            <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Proposal Successfully Dispatched</h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Your brief has been logged in our system under ticket <code className="text-emerald-300 font-mono">{submittedEnquiryId}</code>. Our Lead Systems Architect will review your specifications and follow up within 24 hours.
              </p>
              <button
                onClick={() => setSubmittedEnquiryId(null)}
                className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                Submit Another Specification
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Dr. Jennifer Hayes"
                    className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jennifer@enterprise.com"
                    className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. BioSynthetics Global"
                    className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Requested Service Tier
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                    <option value="Custom Complex Multi-Platform">Custom Complex Multi-Platform</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Estimated Budget Bracket
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                    <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                    <option value="$100,000+">$100,000+ Enterprise Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Target Deployment Window
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Urgent (Under 4 Weeks)">Urgent (Under 4 Weeks)</option>
                    <option value="4 - 8 Weeks">4 - 8 Weeks</option>
                    <option value="2 - 3 Months">2 - 3 Months</option>
                    <option value="Flexible / Q1 2027">Flexible / Q1 2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Technical Project Brief &amp; Requirements
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your application goals, target user scale, required integrations (e.g. Supabase, Stripe, AI models), and key deadlines..."
                  className="w-full bg-[#151924] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingEnquiry}
                className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingEnquiry ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Proposal to AuraDev Pipeline</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="py-12 border-t border-zinc-800/80 bg-[#07090e] text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">AuraDev Studio</span>
            <span>&bull;</span>
            <span>Enterprise Web Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onGoToAdmin}
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* TECHNICAL BLUEPRINT MODAL                                 */}
      {/* ========================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#12151e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30">
                {selectedProject.category}
              </span>
              <h3 className="text-2xl font-black text-white mt-2">{selectedProject.title}</h3>
              <p className="text-xs text-zinc-400 font-mono mt-1">Client: {selectedProject.client}</p>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden mb-6 bg-zinc-900 border border-zinc-800">
              <img
                src={selectedProject.coverImage}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed mb-6">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Architecture Summary</h4>
                <p>{selectedProject.description || selectedProject.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-lg bg-[#181d28] border border-zinc-700 text-purple-200 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              {selectedProject.liveUrl ? (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-2"
                >
                  <span>Launch Live Deployment</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-zinc-500">Enterprise Private Deployment</span>
              )}

              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
