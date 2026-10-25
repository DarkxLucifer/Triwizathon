'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Target,
  Zap,
  Crosshair,
  Flame,
  Swords,
  Shield,
  Sparkles,
  DollarSign,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { openingsApi, RosterOpeningItem, CreateOpeningPayload } from '@/lib/api/openings';
import { ApplicationItem } from '@/lib/api/player';

interface OrganiserOpeningsViewProps {
  theme?: 'dark' | 'light';
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const SUPPORTED_GAMES = [
  'Counter-Strike 2',
  'Valorant',
  'League of Legends',
  'Rocket League',
  'BGMI',
];

const ROLES_BY_GAME: Record<string, string[]> = {
  'Counter-Strike 2': ['Sniper / AWPer', 'IGL / In-Game Leader', 'Entry Fragger', 'Rifler / Lurker', 'Support'],
  'Valorant': ['Duelist', 'Initiator', 'Controller / Smokes', 'Sentinel', 'IGL / Flex'],
  'League of Legends': ['Top Laner', 'Jungler', 'Mid Laner', 'ADC / Marksman', 'Support'],
  'Rocket League': ['Striker', 'First Man', 'Second Man', 'Third Man / Goalkeeper', 'Flex'],
  'BGMI': ['Assaulter', 'Sniper / DMR', 'IGL / Tactician', 'Filter / Rusher', 'Support / Medic'],
};

export function OrganiserOpeningsView({
  theme = 'dark',
  onShowToast,
}: OrganiserOpeningsViewProps) {
  const isLight = theme === 'light';

  // Tab State
  const [activeTab, setActiveTab] = useState<'openings' | 'applicants'>('openings');
  const [openings, setOpenings] = useState<RosterOpeningItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('All');
  const [selectedOpeningFilter, setSelectedOpeningFilter] = useState<number | 'all'>('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationItem | null>(null);

  // Form State
  const [formGame, setFormGame] = useState('Counter-Strike 2');
  const [formRole, setFormRole] = useState('Sniper / AWPer');
  const [formTitle, setFormTitle] = useState('');
  const [formMinRank, setFormMinRank] = useState('FACEIT Level 10 / 2200+ ELO');
  const [formScrimWindow, setFormScrimWindow] = useState('18:00 - 23:30 CET (5 days/wk)');
  const [formPackage, setFormPackage] = useState('$1,500/mo + Prize Share + Bootcamps');
  const [formUrgency, setFormUrgency] = useState<'Immediate' | 'High' | 'Medium' | 'Low'>('High');
  const [formDescription, setFormDescription] = useState('');

  // Update role options when game changes
  const handleGameChange = (game: string) => {
    setFormGame(game);
    const roles = ROLES_BY_GAME[game] || ROLES_BY_GAME['Counter-Strike 2'];
    setFormRole(roles[0]);

    if (game === 'Counter-Strike 2') {
      setFormMinRank('FACEIT Level 10 / 2200+ ELO');
      setFormTitle('Dedicated CS2 AWPer / Sniper for Premier Division');
    } else if (game === 'Valorant') {
      setFormMinRank('Radiant / Immortal 3');
      setFormTitle('VCT Challengers Primary Duelist / Jett Specialist');
    } else if (game === 'League of Legends') {
      setFormMinRank('Master / Grandmaster 300+ LP');
      setFormTitle('High ELO Mid Laner for Regional Circuit');
    } else if (game === 'Rocket League') {
      setFormMinRank('Grand Champion III / Supersonic Legend');
      setFormTitle('RLCS Main Circuit Mechanical Striker');
    } else if (game === 'BGMI') {
      setFormMinRank('Conqueror / 6.0+ KD in Scrims');
      setFormTitle('BGIS Contender Squad Lead Assaulter');
    }
  };

  // Load live openings and applications
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      const [opsRes, appsRes] = await Promise.all([
        openingsApi.getOpenings({ token }),
        openingsApi.getOrgApplications({ token }),
      ]);
      setOpenings(opsRes || []);
      setApplications(appsRes || []);
    } catch (err: any) {
      console.warn('Failed to load organiser openings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Opening Creation
  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please fill in opening title and description.');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      const payload: CreateOpeningPayload = {
        title: formTitle.trim(),
        role_name: formRole,
        game_name: formGame,
        min_rank_text: formMinRank.trim(),
        scrim_window: formScrimWindow.trim(),
        package_text: formPackage.trim(),
        urgency: formUrgency,
        description: formDescription.trim(),
        status: 'open',
      };

      const newOp = await openingsApi.createOpening(payload, token);
      setOpenings(prev => [newOp, ...prev]);
      setIsCreateModalOpen(false);

      // Reset form
      setFormTitle('');
      setFormDescription('');

      if (onShowToast) {
        onShowToast(`Vacancy "${newOp.title}" published! Players can now apply.`, 'success');
      } else {
        alert(`Vacancy "${newOp.title}" published successfully!`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create vacancy posting.');
    } finally {
      setCreating(false);
    }
  };

  // Handle Application Status Update
  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('scoutforge_access_token') || undefined;
      const updated = await openingsApi.updateApplicationStatus(
        appId,
        newStatus,
        `Status updated to ${newStatus} by scouting director.`,
        token
      );
      setApplications(prev =>
        prev.map(a => (a.id === appId ? { ...a, status: updated.status, reviewer_notes: updated.reviewer_notes } : a))
      );
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant(prev => (prev ? { ...prev, status: updated.status, reviewer_notes: updated.reviewer_notes } : null));
      }
      if (onShowToast) {
        onShowToast(`Application status updated to "${newStatus}".`, 'success');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update application status.');
    }
  };

  // Filtered lists
  const filteredOpenings = openings.filter(op => {
    const matchesSearch =
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (op.title_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGameFilter === 'All' || (op.title_name || '').includes(selectedGameFilter);
    return matchesSearch && matchesGame;
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.player_handle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.player_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.opening_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.cover_note || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpening =
      selectedOpeningFilter === 'all' || app.opening_id === selectedOpeningFilter;
    return matchesSearch && matchesOpening;
  });

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] p-6 space-y-6 transition-colors font-sans ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'
      }`}
    >
      {/* Top Banner & Primary Action */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${
          isLight ? 'border-slate-200' : 'border-[#26262a]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                isLight
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : 'bg-[#131315] text-[#e8ff59] border-[#e8ff59]/30'
              }`}
            >
              TALENT RECRUITMENT & VACANCY MANAGEMENT
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Recruitment Postings & Candidate Pipeline
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Create trial postings for open roster positions, collect player applications, and evaluate incoming competitor dossiers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className={`p-2 rounded-[6px] border text-xs transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                : 'border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#9a9aa2] hover:text-[#ededed]'
            }`}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#e8ff59]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              handleGameChange('Counter-Strike 2');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] font-black text-xs cursor-pointer transition-all bg-[#e8ff59] hover:bg-[#d8ef49] text-black shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Recruitment Post</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-[8px] border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>ACTIVE OPENINGS</span>
            <Briefcase className="w-4 h-4 text-[#e8ff59]" />
          </div>
          <div className="text-2xl font-black">{openings.length}</div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Published across {SUPPORTED_GAMES.length} competitive titles
          </div>
        </div>

        <div
          className={`p-4 rounded-[8px] border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>TOTAL APPLICANTS</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black">{applications.length}</div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            {applications.filter(a => a.status === 'applied').length} awaiting scout evaluation
          </div>
        </div>

        <div
          className={`p-4 rounded-[8px] border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>SHORTLISTED FOR TRIAL</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black">
            {applications.filter(a => a.status === 'shortlisted' || a.status === 'trial').length}
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Candidates advanced to live tactical scrims
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div
          className={`p-1 rounded-[6px] border flex gap-1 w-fit ${
            isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('openings')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'openings'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/40 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-[#9a9aa2] hover:text-[#ededed]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Active Vacancy Posts ({openings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('applicants')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'applicants'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'bg-[#0b0b0c] text-[#e8ff59] border border-[#e8ff59]/40 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-[#9a9aa2] hover:text-[#ededed]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Applicant Pipeline ({applications.length})</span>
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by title, player, role..."
              className={`pl-8 pr-3 py-1.5 rounded-[6px] text-xs border focus:outline-none transition-colors ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-800'
                  : 'bg-[#131315] border-[#26262a] text-[#ededed] focus:border-[#e8ff59]'
              }`}
            />
          </div>

          {activeTab === 'openings' ? (
            <select
              value={selectedGameFilter}
              onChange={e => setSelectedGameFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border focus:outline-none cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-[#131315] border-[#26262a] text-[#ededed]'
              }`}
            >
              <option value="All">All Games</option>
              {SUPPORTED_GAMES.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedOpeningFilter}
              onChange={e => setSelectedOpeningFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border focus:outline-none cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-[#131315] border-[#26262a] text-[#ededed]'
              }`}
            >
              <option value="all">All Vacancies</option>
              {openings.map(o => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* --- TAB 1: ACTIVE VACANCY POSTS --- */}
      {activeTab === 'openings' && (
        <div className="space-y-4">
          {filteredOpenings.length === 0 ? (
            <div
              className={`p-10 text-center rounded-[8px] border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#131315] border-[#26262a]'
              }`}
            >
              <Briefcase className="w-10 h-10 mx-auto text-[#9a9aa2] mb-3 opacity-60" />
              <h3 className="text-sm font-bold">No Vacancy Postings Found</h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                You haven't created any recruitment postings matching this filter. Click below to publish your first team opening!
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-[6px] font-bold text-xs bg-[#e8ff59] hover:bg-[#d8ef49] text-black cursor-pointer shadow-sm"
              >
                + Create Recruitment Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpenings.map(op => {
                const count = applications.filter(a => a.opening_id === op.id).length;
                return (
                  <div
                    key={op.id}
                    className={`rounded-[8px] border p-5 flex flex-col justify-between transition-all hover:border-[#e8ff59]/50 ${
                      isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131315] border-[#26262a]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                            op.urgency === 'Immediate'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : op.urgency === 'High'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {op.urgency} Urgency
                        </span>

                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                            isLight
                              ? 'bg-slate-100 border-slate-300 text-slate-700'
                              : 'bg-[#0b0b0c] border-[#26262a] text-[#9a9aa2]'
                          }`}
                        >
                          {op.title_name || 'Counter-Strike 2'}
                        </span>
                      </div>

                      {/* Title & Role */}
                      <h3 className="text-base font-extrabold leading-snug line-clamp-2">
                        {op.title}
                      </h3>
                      <div className="text-xs font-semibold text-[#e8ff59] mt-1 mb-3">
                        Role: {op.role_name}
                      </div>

                      <p
                        className={`text-xs line-clamp-3 mb-4 ${
                          isLight ? 'text-slate-600' : 'text-[#9a9aa2]'
                        }`}
                      >
                        {op.description}
                      </p>

                      {/* Criteria Grid */}
                      <div
                        className={`p-3 rounded-[6px] border text-xs space-y-1.5 mb-4 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>
                            Min Rank:
                          </span>
                          <span className="font-bold">{op.min_rank_text}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>
                            Schedule:
                          </span>
                          <span className="font-medium text-[11px]">{op.scrim_window}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>
                            Package:
                          </span>
                          <span className="font-bold text-emerald-500">{op.package_text}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div
                      className={`pt-3 border-t flex items-center justify-between ${
                        isLight ? 'border-slate-200' : 'border-[#26262a]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOpeningFilter(op.id);
                          setActiveTab('applicants');
                        }}
                        className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          count > 0 ? 'text-[#e8ff59] hover:underline' : isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{count} Applicant{count === 1 ? '' : 's'}</span>
                      </button>

                      <span
                        className={`text-[10px] font-mono ${
                          isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                        }`}
                      >
                        Published {new Date(op.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: APPLICANT PIPELINE --- */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div
              className={`p-10 text-center rounded-[8px] border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#131315] border-[#26262a]'
              }`}
            >
              <Users className="w-10 h-10 mx-auto text-[#9a9aa2] mb-3 opacity-60" />
              <h3 className="text-sm font-bold">No Applications Received Yet</h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                When players view your recruitment posts on the Player Dashboard and click "Apply Now", their applications and dossiers will appear here.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-[8px] border overflow-hidden ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131315] border-[#26262a]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      className={`border-b font-mono text-[11px] uppercase ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-500'
                          : 'border-[#26262a] bg-[#0b0b0c] text-[#9a9aa2]'
                      }`}
                    >
                      <th className="py-3 px-4">Applicant / Player</th>
                      <th className="py-3 px-4">Applied Opening</th>
                      <th className="py-3 px-4">FitScore</th>
                      <th className="py-3 px-4">Submission / Dossier Note</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {filteredApplications.map(app => (
                      <tr
                        key={app.id}
                        className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-[#18181b]'
                        }`}
                      >
                        {/* Player Column */}
                        <td className="py-3.5 px-4 font-bold">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-[4px] bg-[#e8ff59] text-black font-black flex items-center justify-center text-xs shrink-0">
                              {(app.player_handle || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-[13px]">
                                {app.player_handle || 'Player'}
                              </div>
                              <div
                                className={`text-[11px] font-normal ${
                                  isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                                }`}
                              >
                                {app.player_name || 'Competitor'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Opening Title & Role */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-xs">{app.opening_title}</div>
                          <div
                            className={`text-[11px] font-mono ${
                              isLight ? 'text-slate-500' : 'text-[#9a9aa2]'
                            }`}
                          >
                            {app.role_name}
                          </div>
                        </td>

                        {/* FitScore */}
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] border ${
                              (app.overall_score || 85) >= 90
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-[#e8ff59]/10 text-[#e8ff59] border-[#e8ff59]/30'
                            }`}
                          >
                            {Math.round(app.overall_score || 88)} FitScore
                          </span>
                        </td>

                        {/* Cover Note Snippet */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p
                            className={`line-clamp-2 text-[11px] ${
                              isLight ? 'text-slate-600' : 'text-[#9a9aa2]'
                            }`}
                            title={app.cover_note || ''}
                          >
                            {app.cover_note || 'Application submitted for roster consideration.'}
                          </p>
                          <div
                            className={`text-[10px] font-mono mt-0.5 ${
                              isLight ? 'text-slate-400' : 'text-[#9a9aa2]'
                            }`}
                          >
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-bold border uppercase ${
                              app.status === 'shortlisted' || app.status === 'trial'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : app.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : app.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : isLight
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-[#0b0b0c] text-[#ededed] border-[#26262a]'
                            }`}
                          >
                            {app.status === 'trial'
                              ? 'Trial Scrims'
                              : app.status === 'shortlisted'
                              ? 'Shortlisted'
                              : app.status}
                          </span>
                        </td>

                        {/* Actions Dropdown / Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status !== 'shortlisted' && app.status !== 'trial' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                                className="px-2 py-1 rounded-[4px] text-[11px] font-bold border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                title="Shortlist Candidate for Trial Scrims"
                              >
                                Shortlist
                              </button>
                            )}

                            {app.status !== 'accepted' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                className="px-2 py-1 rounded-[4px] text-[11px] font-bold border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                title="Accept Applicant to Roster"
                              >
                                Accept
                              </button>
                            )}

                            {app.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                className={`px-2 py-1 rounded-[4px] text-[11px] font-medium border transition-colors cursor-pointer ${
                                  isLight
                                    ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                    : 'border-[#26262a] text-[#9a9aa2] hover:text-red-400 hover:border-red-500/30'
                                }`}
                                title="Reject Application"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- CREATE RECRUITMENT POST MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[8px] border p-6 sm:p-7 relative transition-all shadow-2xl ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[6px] bg-[#e8ff59] text-black">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Create Recruitment Post</h2>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                    Publish a roster opening for competitive players to apply.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a1a1d] text-[#9a9aa2]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOpening} className="space-y-4">
              {/* Game Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">Game Title *</label>
                <select
                  value={formGame}
                  onChange={e => handleGameChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-[6px] text-xs font-bold border focus:outline-none transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                      : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                  }`}
                >
                  {SUPPORTED_GAMES.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Needed */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">Tactical Role Needed *</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  className={`w-full px-3 py-2 rounded-[6px] text-xs font-bold border focus:outline-none transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                      : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                  }`}
                >
                  {(ROLES_BY_GAME[formGame] || []).map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">Opening Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Dedicated AWPer / Sniper for CS2 Premier Squad"
                  className={`w-full px-3 py-2 rounded-[6px] text-xs font-medium border focus:outline-none transition-colors ${
                    isLight
                      ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                      : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                  }`}
                />
              </div>

              {/* 2-Column Specs: Min Rank & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Minimum Rank / ELO *</label>
                  <input
                    type="text"
                    required
                    value={formMinRank}
                    onChange={e => setFormMinRank(e.target.value)}
                    placeholder="e.g. FACEIT Level 10 / 2200+ ELO"
                    className={`w-full px-3 py-2 rounded-[6px] text-xs border focus:outline-none transition-colors ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                        : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Recruitment Urgency *</label>
                  <select
                    value={formUrgency}
                    onChange={e => setFormUrgency(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-[6px] text-xs font-bold border focus:outline-none transition-colors cursor-pointer ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                        : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  >
                    <option value="Immediate">Immediate Trial</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low / Bench Pool</option>
                  </select>
                </div>
              </div>

              {/* 2-Column Specs: Scrim Schedule & Package */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Scrim Hours & Window *</label>
                  <input
                    type="text"
                    required
                    value={formScrimWindow}
                    onChange={e => setFormScrimWindow(e.target.value)}
                    placeholder="e.g. 18:00 - 23:30 CET"
                    className={`w-full px-3 py-2 rounded-[6px] text-xs border focus:outline-none transition-colors ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                        : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">Package & Compensation *</label>
                  <input
                    type="text"
                    required
                    value={formPackage}
                    onChange={e => setFormPackage(e.target.value)}
                    placeholder="e.g. $1,500/mo + Prize Share"
                    className={`w-full px-3 py-2 rounded-[6px] text-xs border focus:outline-none transition-colors ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                        : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">Role Description & Expectations *</label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Outline squad objectives, comms expectations, clutch requirements, and upcoming tournaments..."
                  className={`w-full px-3 py-2 rounded-[6px] text-xs border focus:outline-none transition-colors ${
                    isLight
                      ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-900'
                      : 'border-[#26262a] bg-[#0b0b0c] text-[#ededed] focus:border-[#e8ff59]'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-4 py-2 rounded-[6px] text-xs font-bold border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      : 'border-[#26262a] hover:bg-[#1a1a1d] text-[#ededed]'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-[6px] text-xs font-black bg-[#e8ff59] hover:bg-[#d8ef49] text-black transition-colors cursor-pointer shadow-sm"
                >
                  {creating ? 'Publishing...' : 'Publish Vacancy Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
