'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, X } from 'lucide-react';

export type GameKey = 'BGMI' | 'Valorant' | 'CS2';

export const ROLES: Record<GameKey, string[]> = {
  BGMI: ['IGL', 'Entry Fragger', 'Assaulter', 'Support', 'Sniper', 'Flex'],
  Valorant: ['IGL', 'Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'],
  CS2: ['IGL', 'Entry', 'AWPer', 'Lurker', 'Support', 'Rifler'],
};

export interface LeaderboardPlayer {
  id: string;
  handle: string;
  realName: string;
  country: string;
  region: string;
  role: string;
  game: GameKey;
  team: string;
  score: number;
  // BGMI stats
  kd?: number;
  winRate?: number;
  impact?: number;
  consistency?: number;
  // Valorant stats
  acs?: number;
  // CS2 stats
  adr?: number;
  kpr?: number;
  // Skill benchmarks for detail panel
  skills: {
    aim: number;
    rotation: number;
    survival: number;
    teamPlay: number;
    clutch: number;
  };
}

export const ALL_LEADERBOARD_PLAYERS: LeaderboardPlayer[] = [
  // BGMI Roster
  {
    id: 'bgmi-1',
    handle: 'Jonathan',
    realName: 'Jonathan Amaral',
    country: 'India',
    region: 'India & APAC',
    role: 'Entry Fragger',
    game: 'BGMI',
    team: 'Team GodLike',
    score: 98,
    kd: 4.21,
    winRate: 72,
    impact: 96,
    consistency: 92,
    skills: { aim: 98, rotation: 86, survival: 78, teamPlay: 88, clutch: 92 },
  },
  {
    id: 'bgmi-2',
    handle: 'Mavi',
    realName: 'Harmandeep Singh',
    country: 'India',
    region: 'India & APAC',
    role: 'IGL',
    game: 'BGMI',
    team: 'Global Esports',
    score: 95,
    kd: 3.42,
    winRate: 68,
    impact: 91,
    consistency: 94,
    skills: { aim: 88, rotation: 98, survival: 85, teamPlay: 94, clutch: 89 },
  },
  {
    id: 'bgmi-3',
    handle: 'Goblin',
    realName: 'Harsh Paudwal',
    country: 'India',
    region: 'India & APAC',
    role: 'Assaulter',
    game: 'BGMI',
    team: 'Team Soul',
    score: 94,
    kd: 3.89,
    winRate: 65,
    impact: 94,
    consistency: 89,
    skills: { aim: 95, rotation: 82, survival: 79, teamPlay: 86, clutch: 94 },
  },
  {
    id: 'bgmi-4',
    handle: 'NinjaJOD',
    realName: 'Shubham Ranjan',
    country: 'India',
    region: 'India & APAC',
    role: 'Assaulter',
    game: 'BGMI',
    team: 'Team XSpark',
    score: 93,
    kd: 3.78,
    winRate: 66,
    impact: 93,
    consistency: 90,
    skills: { aim: 96, rotation: 84, survival: 80, teamPlay: 87, clutch: 91 },
  },
  {
    id: 'bgmi-5',
    handle: 'Spower',
    realName: 'Rudra',
    country: 'India',
    region: 'India & APAC',
    role: 'Flex',
    game: 'BGMI',
    team: 'iQOO Soul',
    score: 92,
    kd: 3.65,
    winRate: 64,
    impact: 90,
    consistency: 87,
    skills: { aim: 94, rotation: 80, survival: 81, teamPlay: 85, clutch: 90 },
  },
  {
    id: 'bgmi-6',
    handle: 'ShadowOG',
    realName: 'Arjun Mandhalkar',
    country: 'India',
    region: 'India & APAC',
    role: 'Sniper',
    game: 'BGMI',
    team: 'Team XSpark',
    score: 90,
    kd: 3.25,
    winRate: 63,
    impact: 88,
    consistency: 91,
    skills: { aim: 97, rotation: 83, survival: 88, teamPlay: 86, clutch: 89 },
  },
  {
    id: 'bgmi-7',
    handle: 'Hector',
    realName: 'Sohail Shaikh',
    country: 'India',
    region: 'India & APAC',
    role: 'Support',
    game: 'BGMI',
    team: 'Team Soul',
    score: 89,
    kd: 2.95,
    winRate: 64,
    impact: 85,
    consistency: 93,
    skills: { aim: 86, rotation: 89, survival: 92, teamPlay: 95, clutch: 84 },
  },
  {
    id: 'bgmi-8',
    handle: 'Sensei',
    realName: 'Deepak Negi',
    country: 'India',
    region: 'India & APAC',
    role: 'IGL',
    game: 'BGMI',
    team: 'Reckoning Esports',
    score: 88,
    kd: 2.84,
    winRate: 61,
    impact: 86,
    consistency: 89,
    skills: { aim: 84, rotation: 94, survival: 82, teamPlay: 92, clutch: 87 },
  },
  {
    id: 'bgmi-9',
    handle: 'Aquanox',
    realName: 'Harsh Rao',
    country: 'India',
    region: 'India & APAC',
    role: 'Entry Fragger',
    game: 'BGMI',
    team: 'Revenues Esports',
    score: 87,
    kd: 3.15,
    winRate: 60,
    impact: 87,
    consistency: 84,
    skills: { aim: 91, rotation: 79, survival: 76, teamPlay: 83, clutch: 88 },
  },
  {
    id: 'bgmi-10',
    handle: 'Snax',
    realName: 'Raj Varma',
    country: 'India',
    region: 'India & APAC',
    role: 'Sniper',
    game: 'BGMI',
    team: 'Team IND',
    score: 86,
    kd: 2.9,
    winRate: 59,
    impact: 84,
    consistency: 86,
    skills: { aim: 93, rotation: 81, survival: 84, teamPlay: 84, clutch: 86 },
  },
  {
    id: 'bgmi-11',
    handle: 'Punk',
    realName: 'Manmeet Singh',
    country: 'India',
    region: 'India & APAC',
    role: 'Flex',
    game: 'BGMI',
    team: 'Reckoning Esports',
    score: 85,
    kd: 2.82,
    winRate: 58,
    impact: 83,
    consistency: 85,
    skills: { aim: 87, rotation: 83, survival: 82, teamPlay: 86, clutch: 85 },
  },
  {
    id: 'bgmi-12',
    handle: 'Neyoo',
    realName: 'Suraj Majumdar',
    country: 'India',
    region: 'India & APAC',
    role: 'Support',
    game: 'BGMI',
    team: 'Team GodLike',
    score: 84,
    kd: 2.75,
    winRate: 58,
    impact: 82,
    consistency: 88,
    skills: { aim: 85, rotation: 85, survival: 89, teamPlay: 91, clutch: 82 },
  },

  // Valorant Roster
  {
    id: 'val-1',
    handle: 'Aspas',
    realName: 'Erick Santos',
    country: 'Brazil',
    region: 'Americas',
    role: 'Duelist',
    game: 'Valorant',
    team: 'Leviatán',
    score: 97,
    acs: 258,
    kd: 1.36,
    winRate: 69,
    skills: { aim: 98, rotation: 85, survival: 84, teamPlay: 88, clutch: 94 },
  },
  {
    id: 'val-2',
    handle: 'Alfajer',
    realName: 'Emir Ali Beder',
    country: 'Turkey',
    region: 'EMEA',
    role: 'Sentinel',
    game: 'Valorant',
    team: 'Fnatic',
    score: 96,
    acs: 242,
    kd: 1.31,
    winRate: 72,
    skills: { aim: 97, rotation: 89, survival: 93, teamPlay: 91, clutch: 95 },
  },
  {
    id: 'val-3',
    handle: 'TenZ',
    realName: 'Tyson Ngo',
    country: 'Canada',
    region: 'Americas',
    role: 'Duelist',
    game: 'Valorant',
    team: 'Sentinels',
    score: 95,
    acs: 246,
    kd: 1.28,
    winRate: 67,
    skills: { aim: 99, rotation: 86, survival: 80, teamPlay: 87, clutch: 92 },
  },
  {
    id: 'val-4',
    handle: 'Leo',
    realName: 'Leo Jannesson',
    country: 'Sweden',
    region: 'EMEA',
    role: 'Initiator',
    game: 'Valorant',
    team: 'Fnatic',
    score: 95,
    acs: 232,
    kd: 1.27,
    winRate: 71,
    skills: { aim: 94, rotation: 93, survival: 91, teamPlay: 96, clutch: 93 },
  },
  {
    id: 'val-5',
    handle: 'Derke',
    realName: 'Nikita Sirmitev',
    country: 'Finland',
    region: 'EMEA',
    role: 'Duelist',
    game: 'Valorant',
    team: 'Fnatic',
    score: 94,
    acs: 248,
    kd: 1.25,
    winRate: 68,
    skills: { aim: 94, rotation: 83, survival: 82, teamPlay: 90, clutch: 89 },
  },
  {
    id: 'val-6',
    handle: 'Less',
    realName: 'Felipe Basso',
    country: 'Brazil',
    region: 'Americas',
    role: 'Sentinel',
    game: 'Valorant',
    team: 'LOUD',
    score: 94,
    acs: 236,
    kd: 1.24,
    winRate: 66,
    skills: { aim: 95, rotation: 88, survival: 92, teamPlay: 89, clutch: 94 },
  },
  {
    id: 'val-7',
    handle: 'MaKo',
    realName: 'Kim Myeong-kwan',
    country: 'South Korea',
    region: 'Pacific',
    role: 'Controller',
    game: 'Valorant',
    team: 'DRX',
    score: 93,
    acs: 224,
    kd: 1.22,
    winRate: 65,
    skills: { aim: 92, rotation: 95, survival: 94, teamPlay: 94, clutch: 91 },
  },
  {
    id: 'val-8',
    handle: 'Chronicle',
    realName: 'Timofey Khromov',
    country: 'Russia',
    region: 'EMEA',
    role: 'Flex',
    game: 'Valorant',
    team: 'Fnatic',
    score: 93,
    acs: 228,
    kd: 1.2,
    winRate: 70,
    skills: { aim: 93, rotation: 92, survival: 88, teamPlay: 93, clutch: 90 },
  },
  {
    id: 'val-9',
    handle: 'Boaster',
    realName: 'Jake Howlett',
    country: 'United Kingdom',
    region: 'EMEA',
    role: 'IGL',
    game: 'Valorant',
    team: 'Fnatic',
    score: 92,
    acs: 198,
    kd: 1.04,
    winRate: 69,
    skills: { aim: 82, rotation: 97, survival: 86, teamPlay: 96, clutch: 85 },
  },
  {
    id: 'val-10',
    handle: 'Cryocells',
    realName: 'Matthew Panganiban',
    country: 'United States',
    region: 'Americas',
    role: 'Duelist',
    game: 'Valorant',
    team: '100 Thieves',
    score: 91,
    acs: 234,
    kd: 1.19,
    winRate: 61,
    skills: { aim: 94, rotation: 81, survival: 85, teamPlay: 86, clutch: 91 },
  },
  {
    id: 'val-11',
    handle: 'Saadhak',
    realName: 'Matias Delipetro',
    country: 'Argentina',
    region: 'Americas',
    role: 'IGL',
    game: 'Valorant',
    team: 'LOUD',
    score: 90,
    acs: 202,
    kd: 1.06,
    winRate: 64,
    skills: { aim: 86, rotation: 96, survival: 84, teamPlay: 95, clutch: 86 },
  },
  {
    id: 'val-12',
    handle: 'Crashies',
    realName: 'Austin Roberts',
    country: 'United States',
    region: 'Americas',
    role: 'Initiator',
    game: 'Valorant',
    team: 'NRG',
    score: 89,
    acs: 214,
    kd: 1.12,
    winRate: 62,
    skills: { aim: 89, rotation: 90, survival: 87, teamPlay: 92, clutch: 88 },
  },
  {
    id: 'val-13',
    handle: 'Marved',
    realName: 'Jimmy Nguyen',
    country: 'Canada',
    region: 'Americas',
    role: 'Controller',
    game: 'Valorant',
    team: 'Sentinels',
    score: 88,
    acs: 210,
    kd: 1.09,
    winRate: 60,
    skills: { aim: 90, rotation: 91, survival: 86, teamPlay: 89, clutch: 89 },
  },
  {
    id: 'val-14',
    handle: 'Victor',
    realName: 'Victor Wong',
    country: 'United States',
    region: 'Americas',
    role: 'Flex',
    game: 'Valorant',
    team: 'NRG',
    score: 87,
    acs: 216,
    kd: 1.08,
    winRate: 59,
    skills: { aim: 88, rotation: 87, survival: 84, teamPlay: 89, clutch: 85 },
  },

  // CS2 Roster
  {
    id: 'cs2-1',
    handle: 'Donk',
    realName: 'Danil Kryshkovets',
    country: 'Russia',
    region: 'Europe (EU)',
    role: 'Entry',
    game: 'CS2',
    team: 'Team Spirit',
    score: 98,
    adr: 92.4,
    kpr: 0.88,
    winRate: 74,
    skills: { aim: 99, rotation: 84, survival: 72, teamPlay: 87, clutch: 91 },
  },
  {
    id: 'cs2-2',
    handle: 'ZywOo',
    realName: 'Mathieu Herbaut',
    country: 'France',
    region: 'Europe (EU)',
    role: 'AWPer',
    game: 'CS2',
    team: 'Team Vitality',
    score: 98,
    adr: 87.6,
    kpr: 0.85,
    winRate: 70,
    skills: { aim: 97, rotation: 92, survival: 91, teamPlay: 93, clutch: 98 },
  },
  {
    id: 'cs2-3',
    handle: 'NiKo',
    realName: 'Nikola Kovač',
    country: 'Bosnia',
    region: 'Europe (EU)',
    role: 'Rifler',
    game: 'CS2',
    team: 'G2 Esports',
    score: 97,
    adr: 86.2,
    kpr: 0.82,
    winRate: 68,
    skills: { aim: 98, rotation: 88, survival: 82, teamPlay: 89, clutch: 92 },
  },
  {
    id: 'cs2-4',
    handle: 'M0NESY',
    realName: 'Ilya Osipov',
    country: 'Russia',
    region: 'Europe (EU)',
    role: 'AWPer',
    game: 'CS2',
    team: 'G2 Esports',
    score: 96,
    adr: 84.1,
    kpr: 0.83,
    winRate: 67,
    skills: { aim: 98, rotation: 86, survival: 88, teamPlay: 89, clutch: 95 },
  },
  {
    id: 'cs2-5',
    handle: 'Ropz',
    realName: 'Robin Kool',
    country: 'Estonia',
    region: 'Europe (EU)',
    role: 'Lurker',
    game: 'CS2',
    team: 'FaZe Clan',
    score: 95,
    adr: 82.5,
    kpr: 0.78,
    winRate: 66,
    skills: { aim: 96, rotation: 95, survival: 92, teamPlay: 91, clutch: 97 },
  },
  {
    id: 'cs2-6',
    handle: 'Siuhy',
    realName: 'Kamil Szkaradek',
    country: 'Poland',
    region: 'Europe (EU)',
    role: 'IGL',
    game: 'CS2',
    team: 'MOUZ',
    score: 93,
    adr: 78.4,
    kpr: 0.73,
    winRate: 64,
    skills: { aim: 85, rotation: 94, survival: 83, teamPlay: 94, clutch: 86 },
  },
  {
    id: 'cs2-7',
    handle: 'Broky',
    realName: 'Helvijs Saukants',
    country: 'Latvia',
    region: 'Europe (EU)',
    role: 'AWPer',
    game: 'CS2',
    team: 'FaZe Clan',
    score: 92,
    adr: 78.9,
    kpr: 0.76,
    winRate: 66,
    skills: { aim: 92, rotation: 88, survival: 94, teamPlay: 90, clutch: 96 },
  },
  {
    id: 'cs2-8',
    handle: 'b1t',
    realName: 'Valeriy Vakhovskiy',
    country: 'Ukraine',
    region: 'Europe (EU)',
    role: 'Entry',
    game: 'CS2',
    team: 'NAVI',
    score: 92,
    adr: 80.1,
    kpr: 0.75,
    winRate: 65,
    skills: { aim: 97, rotation: 84, survival: 81, teamPlay: 88, clutch: 89 },
  },
  {
    id: 'cs2-9',
    handle: 'EliGE',
    realName: 'Jonathan Jablonowski',
    country: 'United States',
    region: 'Americas',
    role: 'Rifler',
    game: 'CS2',
    team: 'Complexity',
    score: 91,
    adr: 83.4,
    kpr: 0.77,
    winRate: 62,
    skills: { aim: 93, rotation: 85, survival: 79, teamPlay: 87, clutch: 89 },
  },
  {
    id: 'cs2-10',
    handle: 'Aleksib',
    realName: 'Aleksi Virolainen',
    country: 'Finland',
    region: 'Europe (EU)',
    role: 'IGL',
    game: 'CS2',
    team: 'NAVI',
    score: 90,
    adr: 74.5,
    kpr: 0.68,
    winRate: 65,
    skills: { aim: 83, rotation: 95, survival: 85, teamPlay: 95, clutch: 87 },
  },
  {
    id: 'cs2-11',
    handle: 'Frozen',
    realName: 'David Čerňanský',
    country: 'Slovakia',
    region: 'Europe (EU)',
    role: 'Lurker',
    game: 'CS2',
    team: 'FaZe Clan',
    score: 90,
    adr: 79.2,
    kpr: 0.74,
    winRate: 64,
    skills: { aim: 91, rotation: 90, survival: 86, teamPlay: 90, clutch: 91 },
  },
  {
    id: 'cs2-12',
    handle: 'Rain',
    realName: 'Håvard Nygaard',
    country: 'Norway',
    region: 'Europe (EU)',
    role: 'Entry',
    game: 'CS2',
    team: 'FaZe Clan',
    score: 89,
    adr: 81.4,
    kpr: 0.72,
    winRate: 63,
    skills: { aim: 90, rotation: 83, survival: 80, teamPlay: 91, clutch: 88 },
  },
  {
    id: 'cs2-13',
    handle: 'Karrigan',
    realName: 'Finn Andersen',
    country: 'Denmark',
    region: 'Europe (EU)',
    role: 'Support',
    game: 'CS2',
    team: 'FaZe Clan',
    score: 87,
    adr: 66.8,
    kpr: 0.58,
    winRate: 64,
    skills: { aim: 80, rotation: 98, survival: 79, teamPlay: 96, clutch: 86 },
  },
  {
    id: 'cs2-14',
    handle: 'Perfecto',
    realName: 'Ilya Zalutskiy',
    country: 'Russia',
    region: 'Europe (EU)',
    role: 'Support',
    game: 'CS2',
    team: 'Cloud9',
    score: 86,
    adr: 68.2,
    kpr: 0.6,
    winRate: 61,
    skills: { aim: 87, rotation: 89, survival: 95, teamPlay: 93, clutch: 92 },
  },
];

const GAMES: GameKey[] = ['BGMI', 'Valorant', 'CS2'];

interface LeaderboardsViewProps {
  theme?: 'dark' | 'light';
  onNavigate?: (screen: string) => void;
}

export function LeaderboardsView({ onNavigate, theme = 'dark' }: LeaderboardsViewProps) {
  const isLight = theme === 'light';
  // Filter state
  const [selectedGame, setSelectedGame] = useState<GameKey>('BGMI');
  const [selectedRole, setSelectedRole] = useState<string>('All roles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Sorting state (Default sort: Score descending)
  const [sortKey, setSortKey] = useState<string>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Sync state from URL query parameters on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get('game');
    const roleParam = params.get('role');

    if (gameParam && (gameParam === 'BGMI' || gameParam === 'Valorant' || gameParam === 'CS2')) {
      setSelectedGame(gameParam as GameKey);
      if (roleParam) {
        setSelectedRole(roleParam);
      }
    }
  }, []);

  // Sync state to URL query string so organizations can bookmark or share filtered views
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('game', selectedGame);

    if (selectedRole && selectedRole !== 'All roles') {
      params.set('role', selectedRole);
    } else {
      params.delete('role');
    }

    const queryString = params.toString();
    const newRelativePathQuery = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [selectedGame, selectedRole]);

  // Handle Game selection change: resets Role to "All roles" and swaps role list
  const handleGameChange = (game: GameKey) => {
    setSelectedGame(game);
    setSelectedRole('All roles');
  };

  // Filter players: player.game === selectedGame && (role === "All roles" || player.role === role) && search match
  const filteredPlayers = useMemo(() => {
    return ALL_LEADERBOARD_PLAYERS.filter(p => {
      if (p.game !== selectedGame) return false;
      if (selectedRole !== 'All roles' && p.role !== selectedRole) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesHandle = p.handle.toLowerCase().includes(query);
        const matchesRealName = p.realName.toLowerCase().includes(query);
        if (!matchesHandle && !matchesRealName) return false;
      }
      return true;
    });
  }, [selectedGame, selectedRole, searchQuery]);

  // Sort players
  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      let valA: any = (a as any)[sortKey];
      let valB: any = (b as any)[sortKey];

      if (valA === undefined) valA = 0;
      if (valB === undefined) valB = 0;

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPlayers, sortKey, sortDir]);

  // Handle Column Header Sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      // Default to ascending for text columns, descending for numeric
      if (key === 'handle' || key === 'role' || key === 'team') {
        setSortDir('asc');
      } else {
        setSortDir('desc');
      }
    }
  };

  const renderSortIndicator = (key: string) => {
    if (sortKey !== key) {
      return (
        <ArrowUpDown
          className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity"
          style={{ strokeWidth: 1.5 }}
        />
      );
    }
    return sortDir === 'desc' ? (
      <ArrowDown
        className={`w-3.5 h-3.5 ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}
        style={{ strokeWidth: 1.5 }}
      />
    ) : (
      <ArrowUp
        className={`w-3.5 h-3.5 ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}
        style={{ strokeWidth: 1.5 }}
      />
    );
  };

  // Resolved active player for detail panel
  const activePlayer = useMemo(() => {
    if (selectedPlayerId) {
      const match = sortedPlayers.find(p => p.id === selectedPlayerId);
      if (match) return match;
    }
    return sortedPlayers[0] || null;
  }, [sortedPlayers, selectedPlayerId]);

  return (
    <div className="bg-[#0b0b0c] text-[#ededed] p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-4 font-sans text-[14px]">
      {/* Title */}
      <div className="pb-2">
        <h1 className="text-[18px] font-bold text-[#ededed]">Leaderboards</h1>
        <p className="text-[12px] text-[#9a9aa2] mt-0.5">
          Competitive performance rankings across verified rosters and titles.
        </p>
      </div>

      {/* FILTER BAR (above the table, no cards, no pills, no glow, 6px radius) */}
      <div className="border border-[#26262a] rounded-[6px] bg-[#131315] divide-y divide-[#26262a]">
        {/* Row 1: Game segmented text control & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5">
          {/* Game Segmented Text Control: BGMI | Valorant | CS2 */}
          <div className="flex items-center gap-6">
            {GAMES.map(game => {
              const isSelected = selectedGame === game;
              return (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleGameChange(game)}
                  className={`text-[13px] font-medium transition-colors cursor-pointer pb-1.5 -mb-px ${
                    isSelected
                      ? 'text-[#e8ff59] border-b-2 border-[#e8ff59]'
                      : 'text-[#9a9aa2] hover:text-[#ededed] border-b-2 border-transparent'
                  }`}
                >
                  {game}
                </button>
              );
            })}
          </div>

          {/* Search Input & Result count */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#9a9aa2] font-mono">
              Showing {sortedPlayers.length} {sortedPlayers.length === 1 ? 'player' : 'players'}
            </span>
            <input
              type="text"
              placeholder="Search by player name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0b0b0c] border border-[#26262a] rounded-[6px] px-3 py-1 text-[12px] text-[#ededed] placeholder-[#9a9aa2] focus:outline-none w-52"
            />
          </div>
        </div>

        {/* Row 2: Role Plain Text Options ("All roles" + the roles for the selected game) */}
        <div className="flex flex-wrap items-center gap-5 px-4 py-2">
          <button
            type="button"
            onClick={() => setSelectedRole('All roles')}
            className={`text-[12px] transition-colors cursor-pointer pb-1 -mb-px ${
              selectedRole === 'All roles'
                ? 'text-[#e8ff59] border-b-2 border-[#e8ff59] font-medium'
                : 'text-[#9a9aa2] hover:text-[#ededed] border-b-2 border-transparent'
            }`}
          >
            All roles
          </button>

          {ROLES[selectedGame].map(roleName => {
            const isSelected = selectedRole === roleName;
            return (
              <button
                key={roleName}
                type="button"
                onClick={() => setSelectedRole(roleName)}
                className={`text-[12px] transition-colors cursor-pointer pb-1 -mb-px ${
                  isSelected
                    ? 'text-[#e8ff59] border-b-2 border-[#e8ff59] font-medium'
                    : 'text-[#9a9aa2] hover:text-[#ededed] border-b-2 border-transparent'
                }`}
              >
                {roleName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Table on Left, Detail Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Column */}
        <div className={activePlayer ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="border border-[#26262a] rounded-[6px] bg-[#131315] overflow-x-auto">
            {sortedPlayers.length === 0 ? (
              <div className="py-12 text-center text-[#9a9aa2] text-[13px]">
                No players for this role yet.
              </div>
            ) : (
              <table className="w-full text-left text-[14px] border-collapse">
                <thead className="sticky top-0 bg-[#131315] z-10 border-b border-[#26262a]">
                  <tr>
                    {/* Rank */}
                    <th
                      onClick={() => handleSort('rank')}
                      className="py-2.5 px-3 w-14 text-center text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Rank</span>
                        {renderSortIndicator('rank')}
                      </div>
                    </th>

                    {/* Player */}
                    <th
                      onClick={() => handleSort('handle')}
                      className="py-2.5 px-3 text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Player</span>
                        {renderSortIndicator('handle')}
                      </div>
                    </th>

                    {/* Role */}
                    <th
                      onClick={() => handleSort('role')}
                      className="py-2.5 px-3 text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Role</span>
                        {renderSortIndicator('role')}
                      </div>
                    </th>

                    {/* Team */}
                    <th
                      onClick={() => handleSort('team')}
                      className="py-2.5 px-3 text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Team</span>
                        {renderSortIndicator('team')}
                      </div>
                    </th>

                    {/* Score */}
                    <th
                      onClick={() => handleSort('score')}
                      className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Score</span>
                        {renderSortIndicator('score')}
                      </div>
                    </th>

                    {/* Game-specific stat headers */}
                    {selectedGame === 'BGMI' && (
                      <>
                        <th
                          onClick={() => handleSort('kd')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>K/D</span>
                            {renderSortIndicator('kd')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('winRate')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Win rate</span>
                            {renderSortIndicator('winRate')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('impact')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Impact</span>
                            {renderSortIndicator('impact')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('consistency')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Consistency</span>
                            {renderSortIndicator('consistency')}
                          </div>
                        </th>
                      </>
                    )}

                    {selectedGame === 'Valorant' && (
                      <>
                        <th
                          onClick={() => handleSort('acs')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>ACS</span>
                            {renderSortIndicator('acs')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('kd')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>K/D</span>
                            {renderSortIndicator('kd')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('winRate')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Win rate</span>
                            {renderSortIndicator('winRate')}
                          </div>
                        </th>
                      </>
                    )}

                    {selectedGame === 'CS2' && (
                      <>
                        <th
                          onClick={() => handleSort('adr')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>ADR</span>
                            {renderSortIndicator('adr')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('kpr')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>KPR</span>
                            {renderSortIndicator('kpr')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('winRate')}
                          className="py-2.5 px-3 text-right text-[12px] font-normal text-[#9a9aa2] cursor-pointer select-none group"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Win rate</span>
                            {renderSortIndicator('winRate')}
                          </div>
                        </th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {sortedPlayers.map((player, index) => {
                    const isSelected = activePlayer?.id === player.id;
                    const initials = player.handle.slice(0, 2).toUpperCase();
                    // Rank is recalculated within the filtered list (rank 1 = best in that role)
                    const recalculatedRank = index + 1;

                    return (
                      <tr
                        key={player.id}
                        onClick={() => setSelectedPlayerId(player.id)}
                        className={`border-b border-[#26262a] transition-colors duration-[120ms] cursor-pointer hover:bg-[#1a1a1d] ${
                          isSelected
                            ? 'border-l-2 border-l-[#e8ff59] bg-[#18181b]'
                            : 'border-l-2 border-l-transparent'
                        }`}
                      >
                        {/* Recalculated Rank: plain number only */}
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-[13px] text-[#9a9aa2]">
                          {recalculatedRank}
                        </td>

                        {/* Player: 28px initials avatar in --surface, handle bold, real name below */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-[4px] bg-[#131315] border border-[#26262a] flex items-center justify-center text-[11px] font-mono font-bold text-[#ededed] shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-[#ededed]">
                                {player.handle}
                              </div>
                              <div className="text-[12px] text-[#9a9aa2] mt-0.5">
                                {player.realName} · {player.country}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role: plain muted text, NO colored pills */}
                        <td className="py-3 px-3 text-[#9a9aa2]">
                          {player.role}
                        </td>

                        {/* Team: plain text */}
                        <td className="py-3 px-3 text-[#ededed]">
                          {player.team}
                        </td>

                        {/* Score: lime text only, monospace tabular-nums, no background highlighter */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#e8ff59]">
                          {player.score}
                        </td>

                        {/* Game-specific stat cells */}
                        {selectedGame === 'BGMI' && (
                          <>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.kd?.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.winRate}%
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.impact}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.consistency}
                            </td>
                          </>
                        )}

                        {selectedGame === 'Valorant' && (
                          <>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.acs}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.kd?.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.winRate}%
                            </td>
                          </>
                        )}

                        {selectedGame === 'CS2' && (
                          <>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.adr?.toFixed(1)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.kpr?.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#ededed]">
                              {player.winRate}%
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Player Detail Panel: name, team, region, plain definition list of stats, then 4-5 horizontal bars with numbers at the right end */}
        {activePlayer && (
          <div className="lg:col-span-4 border border-[#26262a] rounded-[6px] bg-[#131315] p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26262a]">
              <div>
                <h2 className="text-[16px] font-bold text-[#ededed]">
                  {activePlayer.handle}
                </h2>
                <p className="text-[12px] text-[#9a9aa2] mt-0.5">
                  {activePlayer.team} · {activePlayer.region} · {activePlayer.game}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlayerId(null)}
                className="text-[#9a9aa2] hover:text-[#ededed] cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
              </button>
            </div>

            {/* Plain definition list of stats (label left, value right) */}
            <div className="space-y-2 text-[13px] border-b border-[#26262a] pb-4">
              <div className="flex justify-between items-center">
                <span className="text-[#9a9aa2]">Role</span>
                <span className="text-[#ededed]">{activePlayer.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9a9aa2]">Performance score</span>
                <span className="font-mono tabular-nums font-semibold text-[#e8ff59]">
                  {activePlayer.score}
                </span>
              </div>

              {selectedGame === 'BGMI' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">K/D ratio</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.kd?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Win rate</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Impact</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.impact}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Consistency</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.consistency}
                    </span>
                  </div>
                </>
              )}

              {selectedGame === 'Valorant' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Average combat score (ACS)</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.acs}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">K/D ratio</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.kd?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Win rate</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.winRate}%
                    </span>
                  </div>
                </>
              )}

              {selectedGame === 'CS2' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Average damage per round (ADR)</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.adr?.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Kills per round (KPR)</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.kpr?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9a9aa2]">Win rate</span>
                    <span className="font-mono tabular-nums text-[#ededed]">
                      {activePlayer.winRate}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Skill breakdown: 5 horizontal bars with the number at the right end */}
            <div className="space-y-2.5">
              <h3 className="text-[12px] font-normal text-[#9a9aa2]">
                Skill breakdown
              </h3>
              {Object.entries(activePlayer.skills).map(([skill, val]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#9a9aa2] capitalize">{skill}</span>
                    <span className="font-mono tabular-nums text-[#ededed] font-medium">{val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#26262a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ededed] transition-all duration-300"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Plain Action Link */}
            <div className="pt-3 border-t border-[#26262a] flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('discover');
                }}
                className="text-[13px] text-[#9a9aa2] hover:text-[#ededed] hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                View full profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
