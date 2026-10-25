'use client';



import React, { useState, useEffect } from 'react';

import { useScoutForgeStore } from '@/lib/storage/store';

import { Navbar } from '@/components/layout/Navbar';

import { Sidebar, SidebarNavId } from '@/components/layout/Sidebar';

import { DashboardView } from '@/features/dashboard/DashboardView';

import { LeaderboardsView } from '@/features/leaderboards/LeaderboardsView';

import { RosterView } from '@/features/roster/RosterView';

import { PlayerDirectoryView } from '@/features/players/PlayerDirectoryView';

import { ScoutingBriefView } from '@/features/scouting/ScoutingBriefView';

import { RecommendationsView } from '@/features/recommendations/RecommendationsView';

import { ComparisonView } from '@/features/comparison/ComparisonView';

import { HiddenGemsView } from '@/features/hidden_gems/HiddenGemsView';

import { IngestionView } from '@/features/ingestion/IngestionView';

import { AcceptanceTestSuite } from '@/features/acceptance/AcceptanceTestSuite';

import { PlayerDashboardView } from '@/features/player_dashboard/PlayerDashboardView';

import { RoleLoginView, UserRole } from '@/features/auth/RoleLoginView';
import { OrganiserOpeningsView } from '@/features/openings/OrganiserOpeningsView';

import { Role } from '@/types';



export default function ScoutForgeApp() {

  const store = useScoutForgeStore();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [authRole, setAuthRole] = useState<UserRole>('player');

  const [mounted, setMounted] = useState<boolean>(false);

  const [activeNav, setActiveNav] = useState<SidebarNavId>('player_portal');

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [selectedGame, setSelectedGame] = useState('All Games');

  const [searchTerm, setSearchTerm] = useState('');
  const [availableContexts, setAvailableContexts] = useState<string[]>([]);
  const canSwitchRole = availableContexts.length > 1;



  // Hydration-safe initial local storage read

  useEffect(() => {

    setMounted(true);

    const storedAuth = localStorage.getItem('scoutforge_authenticated');

    const storedRole = localStorage.getItem('scoutforge_auth_role') as UserRole | null;

    const storedTheme = localStorage.getItem('scoutforge_theme') as 'dark' | 'light' | null;



    if (storedAuth === 'true') {

      setIsAuthenticated(true);

    }

    if (storedRole === 'player' || storedRole === 'organiser') {

      setAuthRole(storedRole);

      if (storedAuth === 'true') {

        setActiveNav(storedRole === 'player' ? 'player_portal' : 'leaderboards');

      }

    }

    if (storedTheme === 'dark' || storedTheme === 'light') {

      setTheme(storedTheme);

    }

  }, []);



  const toggleTheme = () => {

    setTheme(prev => {

      const next = prev === 'light' ? 'dark' : 'light';

      localStorage.setItem('scoutforge_theme', next);

      return next;

    });

  };



  useEffect(() => {

    if (theme === 'dark') {

      document.documentElement.classList.add('dark');

    } else {

      document.documentElement.classList.remove('dark');

    }

  }, [theme]);



  // Guard: If logged in as an organiser, ensure activeNav is never player_portal or dossier

  useEffect(() => {

    if (authRole === 'organiser' && (activeNav === 'player_portal' || activeNav === 'dossier')) {

      setActiveNav('leaderboards');

    }

  }, [authRole, activeNav]);



  const handleLogin = (role: UserRole) => {

    setIsAuthenticated(true);

    setAuthRole(role);

    localStorage.setItem('scoutforge_authenticated', 'true');

    localStorage.setItem('scoutforge_auth_role', role);



    // Automatic route landing based on role

    if (role === 'player') {

      setActiveNav('player_portal');

    } else {

      setActiveNav('leaderboards');

    }

  };



  const handleLogout = () => {

    setIsAuthenticated(false);

    localStorage.setItem('scoutforge_authenticated', 'false');

  };



  const handleSwitchRole = (newRole: UserRole) => {

    setAuthRole(newRole);

    localStorage.setItem('scoutforge_auth_role', newRole);

    if (newRole === 'player') {

      setActiveNav('player_portal');

    } else {

      setActiveNav('leaderboards');

    }

  };



  const handleSelectRoleToScout = (role: string) => {

    store.createBrief({

      rosterId: store.rosters[0]?.id || 'roster-cs2-apex',

      title: `Strategic ${role} Replacement Brief`,

      gameTitle: store.currentGameTitle,

      targetRole: role as Role,

      evaluationWindowDays: 180,

      competitionTier: 'Tier 1',

      mustHaveConstraints: {

        maxBuyoutUsd: 350000,

        primaryLanguage: 'English',

        minMatches: 10,

      },

      preferredConstraints: {

        region: 'EU',

      },

      formulaVersion: `v1.0.0-cs2-${role.toLowerCase()}`,

      decisionStatus: 'open',

    });

    setActiveNav('recruitment');

  };



  const handleSelectGamer = (gamerHandle: string) => {

    setActiveNav('leaderboards');

  };



  // If not logged in, render dual role-based login portal

  if (mounted && !isAuthenticated) {

    return (

      <RoleLoginView

        onLogin={handleLogin}

        theme={theme}

        onToggleTheme={toggleTheme}

        initialRole={authRole}

      />

    );

  }



  return (

    <div

      className={`flex flex-col min-h-screen antialiased font-sans transition-colors duration-200 ${

        theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0b0b0c] text-[#ededed]'

      }`}

    >

      {/* Top Navbar */}

      <Navbar

        selectedGame={selectedGame}

        onSelectGame={setSelectedGame}

        onSelectGamer={handleSelectGamer}

        searchTerm={searchTerm}

        onSearchChange={setSearchTerm}

        theme={theme}

        onToggleTheme={toggleTheme}

        authRole={authRole}

        onSwitchRole={handleSwitchRole}

        onLogout={handleLogout}

      />



      {/* Main Layout Area */}

      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}

        <Sidebar

          activeNav={activeNav}

          onSelectNav={setActiveNav}

          orgName={authRole === 'player' ? 'Sam "Vortex"' : 'The Shadow'}

          theme={theme}

          authRole={authRole}

          onSwitchRole={handleSwitchRole}

          onLogout={handleLogout}

        />



        {/* Central Viewport */}

        <main

          className={`flex-1 overflow-y-auto p-6 transition-colors duration-200 ${

            theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-[#0b0b0c]'

          }`}

        >

          <div className="max-w-[1440px] mx-auto">

            {/* 1. Dashboard View */}

            {activeNav === 'dashboard' && (

              <DashboardView

                theme={theme}

                onNavigate={screen => {

                  if (screen === 'discover') setActiveNav('discover');

                  else if (screen === 'recruitment') setActiveNav('recruitment');

                  else if (screen === 'rosters') setActiveNav('rosters');

                  else if (screen === 'analytics') setActiveNav('analytics');

                  else if (screen === 'leaderboards') setActiveNav('leaderboards');

                  else if (screen === 'openings') setActiveNav('openings');

                }}

                onSelectRoleToScout={handleSelectRoleToScout}

              />

            )}

            {authRole === 'organiser' && activeNav === 'openings' && (
              <OrganiserOpeningsView theme={theme} />
            )}



            {/* 2. Leaderboards View (with full Light/Dark support) */}

            {activeNav === 'leaderboards' && (

              <LeaderboardsView

                theme={theme}

                onNavigate={screen => {

                  if (screen === 'discover') setActiveNav('discover');

                  else if (screen === 'recruitment') setActiveNav('recruitment');

                }}

              />

            )}



            {/* 3. Discover / Player Database */}

            {activeNav === 'discover' && (

              <PlayerDirectoryView
                theme={theme}

                players={store.players}

                onToggleCompare={store.toggleComparisonPlayer}

                comparisonPlayerIds={store.comparisonPlayerIds}

                onNavigate={screen => {

                  if (screen === 'comparison') setActiveNav('analytics');

                }}

              />

            )}



            {/* 4. Rosters View */}

            {activeNav === 'rosters' && (

              <RosterView
                theme={theme}

                rosters={store.rosters}

                onSelectRoleToScout={handleSelectRoleToScout}

                onNavigate={screen => {

                  if (screen === 'recommendations') setActiveNav('recruitment');

                }}

              />

            )}



            {/* 5. Recruitment / Candidate Shortlist */}

            {activeNav === 'recruitment' && (

              <RecommendationsView
                theme={theme}

                brief={store.activeBrief}

                recommendations={store.activeRecommendations}

                onToggleCompare={store.toggleComparisonPlayer}

                comparisonPlayerIds={store.comparisonPlayerIds}

                onSaveDecision={store.addDecision}

                onNavigate={screen => {

                  if (screen === 'comparison') setActiveNav('analytics');

                }}

              />

            )}



            {/* 6. Analytics / Comparison & Hidden Gems */}

            {activeNav === 'analytics' && (

              <div className="space-y-6">

                <ComparisonView
                  theme={theme}

                  brief={store.activeBrief}

                  players={store.players}

                  comparisonPlayerIds={store.comparisonPlayerIds}

                  onRemovePlayer={store.toggleComparisonPlayer}

                  onNavigate={screen => setActiveNav('recruitment')}

                />

                <HiddenGemsView
                  theme={theme}

                  players={store.players}

                  onToggleCompare={store.toggleComparisonPlayer}

                  comparisonPlayerIds={store.comparisonPlayerIds}

                  onNavigate={screen => setActiveNav('recruitment')}

                />

              </div>

            )}



            {/* 7. Player Portal / Gamer Dashboard View */}

            {authRole === 'player' && (activeNav === 'player_portal' || activeNav === 'dossier' || activeNav === 'openings') && (

              <PlayerDashboardView

                theme={theme}

                players={store.players}

                initialTab={activeNav === 'dossier' ? 'profile' : activeNav === 'openings' ? 'openings' : 'overview'}

                onToggleCompare={store.toggleComparisonPlayer}

                comparisonPlayerIds={store.comparisonPlayerIds}

                onNavigate={screen => {

                  if (screen === 'discover') setActiveNav('discover');

                  else if (screen === 'leaderboards') setActiveNav('leaderboards');

                  else if (screen === 'openings') setActiveNav('openings');

                  else if (screen === 'comparison') setActiveNav('analytics');

                  else if (screen === 'recommendations') setActiveNav('recruitment');

                }}

                onToggleTheme={toggleTheme}

              />

            )}



            {/* 7. Settings / Scouting Brief Config */}

            {activeNav === 'settings' && (

              <ScoutingBriefView
                theme={theme}

                briefs={store.briefs}

                activeBrief={store.activeBrief}

                onSelectActiveBrief={store.setActiveBrief}

                onCreateBrief={store.createBrief}

                onNavigate={screen => setActiveNav('recruitment')}

              />

            )}



            {/* 8. Data & Audio Pipeline */}

            {activeNav === 'ingestion' && (

              <IngestionView
                theme={theme}

                ingestionHistory={store.ingestionHistory}

                onRecordIngestion={store.recordIngestion}

                audioJobs={store.audioJobs}

                onAddAudioJob={store.addAudioJob}

                isPandaScoreConnected={store.isPandaScoreConnected}

                isPandaScoreStale={store.isPandaScoreStale}

                onTogglePandaScore={store.togglePandaScoreStatus}

              />

            )}



            {/* 9. Technical Acceptance Tests */}

            {activeNav === 'tests' && <AcceptanceTestSuite />}

          </div>

        </main>

      </div>

    </div>

  );

}

