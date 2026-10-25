'use client';

import React, { useState, useEffect, useRef } from 'react';

export type SupportedGame = 'valorant' | 'cs2' | 'bgmi' | 'freefire';

interface GameInfo {
  name: string;
  category: string;
  scouts: string;
  desc: string;
  image: string;
  spotlight: {
    id: string;
    name: string;
    initials: string;
    role: string;
    game: string;
    team: string;
    score: number;
    kd: string;
    buyout: string;
    clipTitle: string;
    duration: string;
    bars: Array<{ label: string; value: number }>;
  };
}

const GAME_DATA: Record<SupportedGame, GameInfo> = {
  valorant: {
    name: 'Valorant',
    category: '5v5 Character tactical FPS',
    scouts: '480 scouts active',
    desc: 'Precision crosshair placement, radiant ACS benchmarks, and clutch spike defense telemetry.',
    image: '/assets/images/valorant.jpg',
    spotlight: {
      id: 'vex',
      name: 'Vex',
      initials: 'VX',
      role: 'Duelist',
      game: 'Valorant',
      team: 'Free agent',
      score: 94,
      kd: '1.34',
      buyout: '$45,000',
      clipTitle: '1v4 Round 24 Ascent B Site Retake',
      duration: '0:38',
      bars: [
        { label: 'First blood rate', value: 96 },
        { label: 'Aim precision', value: 92 },
        { label: 'Clutch conversion', value: 95 },
        { label: 'Utility efficiency', value: 88 }
      ]
    }
  },
  cs2: {
    name: 'Counter-Strike 2',
    category: 'Premier tactical FPS',
    scouts: '510 scouts active',
    desc: 'Sub-160ms AWP flick calibration, smoke lineup efficiency, site anchoring, and Faceit telemetry.',
    image: '/assets/images/cs2.jpg',
    spotlight: {
      id: 'kairo',
      name: 'Kairo',
      initials: 'KR',
      role: 'Entry fragger',
      game: 'CS2',
      team: 'Free agent',
      score: 91,
      kd: '1.21',
      buyout: '$32,000',
      clipTitle: '0.12s AWP Flick 4k Defense on Dust2',
      duration: '0:32',
      bars: [
        { label: 'First blood rate', value: 92 },
        { label: 'Aim precision', value: 94 },
        { label: 'Clutch conversion', value: 89 },
        { label: 'Utility efficiency', value: 90 }
      ]
    }
  },
  bgmi: {
    name: 'BGMI',
    category: 'Battle royale mobile esports',
    scouts: '620 scouts active',
    desc: 'Zone rotation analytics, 400m DMR spray tracking, Pochinki drop telemetry, and high-pressure circle survivability.',
    image: '/assets/images/bgmi.jpg',
    spotlight: {
      id: 'falconx',
      name: 'FalconX',
      initials: 'FX',
      role: 'Assault fragger',
      game: 'BGMI',
      team: 'Reckoning Esports',
      score: 89,
      kd: '1.42',
      buyout: '$28,000',
      clipTitle: '1v4 Pochinki Squad Wipe with M416 Spray Transfer',
      duration: '0:52',
      bars: [
        { label: 'First blood rate', value: 90 },
        { label: 'Aim precision', value: 88 },
        { label: 'Clutch conversion', value: 93 },
        { label: 'Utility efficiency', value: 84 }
      ]
    }
  },
  freefire: {
    name: 'Free Fire',
    category: 'Fast-paced battle royale',
    scouts: '430 scouts active',
    desc: 'Sub-second Gloo Wall deployment speed, character skill synergy, high-ground sniping, and rush mechanics.',
    image: '/assets/images/freefire.jpg',
    spotlight: {
      id: 'blazex',
      name: 'BlazeX',
      initials: 'BX',
      role: 'Rusher',
      game: 'Free Fire',
      team: 'Free agent',
      score: 88,
      kd: '1.38',
      buyout: '$22,000',
      clipTitle: 'Sub-Second Gloo Wall 1v3 Clutch in Final Bermuda Circle',
      duration: '0:34',
      bars: [
        { label: 'First blood rate', value: 94 },
        { label: 'Aim precision', value: 86 },
        { label: 'Clutch conversion', value: 88 },
        { label: 'Utility efficiency', value: 82 }
      ]
    }
  }
};

const VAULT_CLIPS = [
  {
    id: 'vex',
    game: 'valorant' as SupportedGame,
    player: 'Vex',
    initials: 'VX',
    role: 'Duelist',
    title: '1v4 Matchpoint Retake on Ascent B Site',
    thumb: '/assets/images/valorant.jpg',
    score: 94,
    kd: '1.34',
    duration: '0:38',
    views: '4.8k scouts'
  },
  {
    id: 'kairo',
    game: 'cs2' as SupportedGame,
    player: 'Kairo',
    initials: 'KR',
    role: 'Entry fragger',
    title: '0.12s Fast Scope Collateral on Mirage A Ramp',
    thumb: '/assets/images/cs2.jpg',
    score: 91,
    kd: '1.21',
    duration: '0:32',
    views: '5.1k scouts'
  },
  {
    id: 'falconx',
    game: 'bgmi' as SupportedGame,
    player: 'FalconX',
    initials: 'FX',
    role: 'Assault fragger',
    title: '1v4 Squad Wipe with M416 Spray Transfer',
    thumb: '/assets/images/bgmi.jpg',
    score: 89,
    kd: '1.42',
    duration: '0:52',
    views: '6.2k scouts'
  },
  {
    id: 'blazex',
    game: 'freefire' as SupportedGame,
    player: 'BlazeX',
    initials: 'BX',
    role: 'Rusher',
    title: 'Sub-Second Gloo Wall 1v3 Final Circle Clutch',
    thumb: '/assets/images/freefire.jpg',
    score: 88,
    kd: '1.38',
    duration: '0:34',
    views: '4.3k scouts'
  }
];

const Marquee = 'marquee' as any;

interface HomePageViewProps {
  onGoToLogin: (mode?: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onGoToDashboard?: () => void;
}

export function HomePageView({
  onGoToLogin,
  isAuthenticated = false,
  onGoToDashboard,
}: HomePageViewProps) {
  const [activeGame, setActiveGame] = useState<SupportedGame>('valorant');
  const [vaultFilter, setVaultFilter] = useState<'all' | SupportedGame>('all');
  
  // Replay modal state
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [replayGame, setReplayGame] = useState<SupportedGame>('valorant');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowmo, setIsSlowmo] = useState(false);
  const [replayProgress, setReplayProgress] = useState(48);
  const [actionFeedback, setActionFeedback] = useState('');

  // Submit modal state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    player: '',
    game: 'valorant',
    role: '',
    rank: '',
    url: '',
    notes: '',
  });

  // Subtle Web Audio Synth SFX
  const playTactileClick = (freq = 480, duration = 0.04) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Replay timeline interval
  useEffect(() => {
    if (!isReplayOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setReplayProgress((prev) => {
        const next = prev + (isSlowmo ? 0.3 : 0.8);
        return next > 100 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isReplayOpen, isPlaying, isSlowmo]);

  const handleCardClick = (clip: typeof VAULT_CLIPS[0]) => {
    playTactileClick(600, 0.05);
    handleOpenReplay(clip.game);
  };

  const handleOpenReplay = (game: SupportedGame) => {
    setReplayGame(game);
    setReplayProgress(40);
    setIsPlaying(true);
    setIsSlowmo(false);
    setActionFeedback('');
    setIsReplayOpen(true);
  };

  const handleInviteToTrial = () => {
    if (isAuthenticated && onGoToDashboard) {
      onGoToDashboard();
    } else {
      onGoToLogin('login');
    }
  };

  const handleCopyTelemetry = () => {
    const sp = GAME_DATA[replayGame].spotlight;
    const summary = `${sp.name} (${sp.game} • ${sp.role}) - Scout Score: ${sp.score}, K/D: ${sp.kd}. Verified via ScoutForge Telemetry.`;
    navigator.clipboard?.writeText(summary);
    setActionFeedback('Report telemetry copied to clipboard!');
    showToast('Report telemetry copied to clipboard!');
  };

  const handleSubmitClip = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitOpen(false);
    if (isAuthenticated && onGoToDashboard) {
      showToast(`Clip submitted successfully for ${submitForm.player || 'Player'}!`);
      onGoToDashboard();
    } else {
      showToast('Please sign in to complete telemetry verification.');
      onGoToLogin('signup');
    }
  };

  const filteredVault = VAULT_CLIPS.filter(
    (clip) => vaultFilter === 'all' || clip.game === vaultFilter
  );

  const activeSpotlight = GAME_DATA[replayGame]?.spotlight || GAME_DATA.valorant.spotlight;
  const currentSec = Math.floor((replayProgress / 100) * 38);

  return (
    <div className="homepage-container">
      {/* Header Navigation */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <a href="#" className="brand-link" aria-label="ScoutForge home">
              <img
                src="/assets/images/scoutforge_logo.png"
                alt="ScoutForge"
                className="brand-logo-img"
              />
            </a>
          </div>

          <div className="header-right">
            {isAuthenticated ? (
              <button
                type="button"
                className="btn-nav-auth"
                onClick={onGoToDashboard}
              >
                Dashboard →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-nav-auth"
                  id="nav-login-btn"
                  onClick={() => {
                    playTactileClick(520, 0.04);
                    onGoToLogin('login');
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="btn-nav-auth"
                  id="nav-signup-btn"
                  onClick={() => {
                    playTactileClick(520, 0.04);
                    onGoToLogin('signup');
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section" id="hero">
          <div className="hero-container">
            {/* Left Column: Hero Narrative, Game Switcher, Metrics */}
            <div className="hero-content">
              <div className="hero-status-pill">
                <span className="live-pulse-dot"></span>
                <span className="status-pill-text">Competitive telemetry radar</span>
              </div>

              <h1 className="hero-title">Evaluate competitive talent across official titles</h1>

              <p className="hero-description">
                ScoutForge connects collegiate coaches, tier-1 organizations, and pro scouts with verified talent across{' '}
                <strong>Valorant, CS2, BGMI, and Free Fire</strong>. Track precision crosshair telemetry, clutch win rates, and certified roles.
              </p>

              {/* The 4 Stat Metrics in ONE horizontal row (No borders, no icons, plain text deltas) */}
              <div className="hero-metrics-strip" id="metrics">
                <div className="metric-block">
                  <span className="metric-num mono">248</span>
                  <span className="metric-lbl">Active candidates</span>
                  <span className="metric-diff mono">+12% vs last month</span>
                </div>
                <div className="metric-block">
                  <span className="metric-num mono">36</span>
                  <span className="metric-lbl">Scouting reports</span>
                  <span className="metric-diff mono">+28% vs last month</span>
                </div>
                <div className="metric-block">
                  <span className="metric-num mono">1,180</span>
                  <span className="metric-lbl">Profiles evaluated</span>
                  <span className="metric-diff mono">+32% vs last month</span>
                </div>
                <div className="metric-block">
                  <span className="metric-num mono">4</span>
                  <span className="metric-lbl">Official game titles</span>
                  <span className="metric-diff mono">Tier-1 certified</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase & Candidate Spotlight */}
            <div className="hero-visual">
              {/* Interactive Game Banners Accordion */}
              <div className="game-accordion" id="game-accordion" role="region" aria-label="Game showcase">
                {/* Card 1: Valorant */}
                <div
                  className={`game-card ${activeGame === 'valorant' ? 'active' : ''}`}
                  onClick={() => setActiveGame('valorant')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect Valorant"
                >
                  <img src="/assets/images/valorant.jpg" alt="Valorant Tactical FPS" className="game-card-bg" />
                  <div className="game-card-overlay"></div>
                  <div className="card-spine">
                    <span className="spine-tag">5v5 tactical</span>
                    <span className="spine-title">Valorant</span>
                  </div>
                  <div className="card-expanded-content">
                    <div className="expanded-top">
                      <span className="card-category">5v5 Character tactical FPS</span>
                      <span className="card-scouts-active mono">480 scouts active</span>
                    </div>
                    <h2 className="card-game-title">Valorant</h2>
                    <p className="card-game-desc">Precision crosshair placement, radiant ACS benchmarks, and clutch spike defense telemetry.</p>
                  </div>
                </div>

                {/* Card 2: CS2 */}
                <div
                  className={`game-card ${activeGame === 'cs2' ? 'active' : ''}`}
                  onClick={() => setActiveGame('cs2')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect Counter-Strike 2"
                >
                  <img src="/assets/images/cs2.jpg" alt="Counter-Strike 2" className="game-card-bg" />
                  <div className="game-card-overlay"></div>
                  <div className="card-spine">
                    <span className="spine-tag">Premier shooter</span>
                    <span className="spine-title">CS2</span>
                  </div>
                  <div className="card-expanded-content">
                    <div className="expanded-top">
                      <span className="card-category">Premier tactical FPS</span>
                      <span className="card-scouts-active mono">510 scouts active</span>
                    </div>
                    <h2 className="card-game-title">Counter-Strike 2</h2>
                    <p className="card-game-desc">Sub-160ms AWP flick calibration, smoke lineup efficiency, site anchoring, and Faceit telemetry.</p>
                  </div>
                </div>

                {/* Card 3: BGMI */}
                <div
                  className={`game-card ${activeGame === 'bgmi' ? 'active' : ''}`}
                  onClick={() => setActiveGame('bgmi')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect BGMI"
                >
                  <img src="/assets/images/bgmi.jpg" alt="Battlegrounds Mobile India" className="game-card-bg" />
                  <div className="game-card-overlay"></div>
                  <div className="card-spine">
                    <span className="spine-tag">Battle royale</span>
                    <span className="spine-title">BGMI</span>
                  </div>
                  <div className="card-expanded-content">
                    <div className="expanded-top">
                      <span className="card-category">Battle royale mobile esports</span>
                      <span className="card-scouts-active mono">620 scouts active</span>
                    </div>
                    <h2 className="card-game-title">BGMI Esports</h2>
                    <p className="card-game-desc">Zone rotation analytics, 400m DMR spray tracking, Pochinki drop telemetry, and high-pressure circle survivability.</p>
                  </div>
                </div>

                {/* Card 4: Free Fire */}
                <div
                  className={`game-card ${activeGame === 'freefire' ? 'active' : ''}`}
                  onClick={() => setActiveGame('freefire')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect Free Fire"
                >
                  <img src="/assets/images/freefire.jpg" alt="Garena Free Fire" className="game-card-bg" />
                  <div className="game-card-overlay"></div>
                  <div className="card-spine">
                    <span className="spine-tag">Survival BR</span>
                    <span className="spine-title">Free Fire</span>
                  </div>
                  <div className="card-expanded-content">
                    <div className="expanded-top">
                      <span className="card-category">Fast-paced battle royale</span>
                      <span className="card-scouts-active mono">430 scouts active</span>
                    </div>
                    <h2 className="card-game-title">Garena Free Fire</h2>
                    <p className="card-game-desc">Sub-second Gloo Wall deployment speed, character skill synergy, high-ground sniping, and rush mechanics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Retro-Digital Telemetry Matrix Strip (Moving Marquee) */}
        <div className="telemetry-ticker-bar">
          <Marquee className="ticker-marquee" behavior="scroll" direction="left" scrollamount="6">
            <span className="ticker-entry"><strong className="t-accent">Scout alert:</strong> Sentinels scout reviewed <strong>Vex</strong>&apos;s 1v4 Ace on Ascent (Valorant)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Role verified:</strong> <strong>Kairo</strong> verified for sub-160ms AWP entry reaction (CS2)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Roster trial:</strong> Reckoning Esports initiated trial evaluation for <strong>FalconX</strong> (BGMI)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Verified clip:</strong> <strong>BlazeX</strong> submitted sub-second Gloo Wall clutch (Free Fire)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Radar status:</strong> 248 active candidates live across Valorant, CS2, BGMI & Free Fire</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Scout alert:</strong> Sentinels scout reviewed <strong>Vex</strong>&apos;s 1v4 Ace on Ascent (Valorant)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Role verified:</strong> <strong>Kairo</strong> verified for sub-160ms AWP entry reaction (CS2)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Roster trial:</strong> Reckoning Esports initiated trial evaluation for <strong>FalconX</strong> (BGMI)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Verified clip:</strong> <strong>BlazeX</strong> submitted sub-second Gloo Wall clutch (Free Fire)</span>
            <span className="ticker-dot">•</span>
            <span className="ticker-entry"><strong className="t-accent">Radar status:</strong> 248 active candidates live across Valorant, CS2, BGMI & Free Fire</span>
          </Marquee>
        </div>

        {/* SECTION: Verified Gameplay Vault */}
        <section className="section-vault" id="vault">
          <div className="page-container">
            <div className="section-header-block">
              <div>
                <h2 className="section-title">Verified gameplay vault</h2>
                <span className="section-caption">Match score (based on roster needs)</span>
              </div>

              {/* Filter buttons */}
              <div className="filter-pills" role="tablist" aria-label="Game filter">
                <button
                  type="button"
                  className={`btn-filter ${vaultFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setVaultFilter('all')}
                >
                  All games
                </button>
                <button
                  type="button"
                  className={`btn-filter ${vaultFilter === 'valorant' ? 'active' : ''}`}
                  onClick={() => setVaultFilter('valorant')}
                >
                  Valorant
                </button>
                <button
                  type="button"
                  className={`btn-filter ${vaultFilter === 'cs2' ? 'active' : ''}`}
                  onClick={() => setVaultFilter('cs2')}
                >
                  CS2
                </button>
                <button
                  type="button"
                  className={`btn-filter ${vaultFilter === 'bgmi' ? 'active' : ''}`}
                  onClick={() => setVaultFilter('bgmi')}
                >
                  BGMI
                </button>
                <button
                  type="button"
                  className={`btn-filter ${vaultFilter === 'freefire' ? 'active' : ''}`}
                  onClick={() => setVaultFilter('freefire')}
                >
                  Free Fire
                </button>
              </div>
            </div>

            {/* Grid of Verified Clutch Clips */}
            <div className="vault-grid" id="vault-grid">
              {filteredVault.map((clip) => (
                <div
                  key={clip.id}
                  className="clutch-card"
                  onClick={() => handleCardClick(clip)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Watch ${clip.title}`}
                >
                  <div className="clutch-thumb-wrap">
                    <img src={clip.thumb} alt={clip.title} className="clutch-thumb-img" loading="lazy" />
                    <span className="clutch-duration mono">▶ {clip.duration}</span>
                  </div>
                  <div className="clutch-body">
                    <div className="clutch-meta-top">
                      <div className="clutch-player-wrap">
                        <span className="avatar-initials">{clip.initials}</span>
                        <span className="clutch-player-name">{clip.player}</span>
                      </div>
                      <span className="role-text">{clip.role}</span>
                    </div>
                    <h3 className="clutch-title">{clip.title}</h3>
                    <div className="clutch-stats-row">
                      <span>
                        Score: <strong className="score-text mono">{clip.score}</strong>
                      </span>
                      <span className="mono">{clip.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Telemetry Replay Modal */}
      <div className={`modal-backdrop ${isReplayOpen ? 'active' : ''}`} aria-hidden={!isReplayOpen}>
        <div className="modal-surface replay-modal-surface" role="dialog" aria-labelledby="replay-modal-title">
          <div className="modal-header">
            <div>
              <span className="modal-subtag" id="modal-game-badge">
                {GAME_DATA[replayGame].name} • Telemetry
              </span>
              <h2 className="modal-title" id="replay-modal-title">
                {activeSpotlight.name} — {activeSpotlight.clipTitle}
              </h2>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => setIsReplayOpen(false)}
              aria-label="Close replay"
            >
              Close
            </button>
          </div>

          {/* Video Replay HUD Frame */}
          <div className="replay-viewport">
            <img
              src={GAME_DATA[replayGame].image}
              alt="Match telemetry frame"
              className="replay-frame-img"
              id="replay-frame-img"
            />
            <div className="replay-hud">
              <div className="hud-top">
                <span className="hud-status-chip">● Telemetry replay</span>
                <span className="hud-round-label" id="hud-round-label">
                  Match telemetry • {GAME_DATA[replayGame].name}
                </span>
                <span className="hud-fps mono">240 fps • 8ms ping</span>
              </div>

              <div className="hud-crosshair-wrap">
                <div className="crosshair-plus"></div>
                <div className="hit-indicator mono">Headshot 160 hp</div>
              </div>

              <div className="hud-bottom">
                <div className="hud-progress-track">
                  <div className="hud-progress-fill" style={{ width: `${replayProgress}%` }}></div>
                </div>
                <div className="hud-ctrls">
                  <button
                    type="button"
                    className="btn-outline btn-xs"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    type="button"
                    className={`btn-outline btn-xs ${isSlowmo ? 'active' : ''}`}
                    onClick={() => setIsSlowmo(!isSlowmo)}
                  >
                    {isSlowmo ? '1.0x Normal' : '0.5x Slow-mo'}
                  </button>
                  <span className="hud-time mono" id="hud-time-readout">
                    0:{currentSec < 10 ? '0' + currentSec : currentSec} / 0:38
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Breakdown Scorecard */}
          <div className="replay-telemetry-breakdown">
            <div className="breakdown-header">
              <h3 className="section-title">Scout telemetry breakdown</h3>
              <span className="score-text mono" id="modal-match-score">
                Match score: {activeSpotlight.score}
              </span>
            </div>

            <div className="bars-container" id="modal-bars-container">
              {activeSpotlight.bars.map((bar, i) => (
                <div key={i} className="bar-row">
                  <span className="bar-label">{bar.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${bar.value}%` }}></div>
                  </div>
                  <span className="bar-value mono">{bar.value}</span>
                </div>
              ))}
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-primary"
                id="btn-modal-invite"
                onClick={handleInviteToTrial}
              >
                {isAuthenticated ? 'View Candidate Dossier' : 'Sign in to Invite to Trial'}
              </button>
              <button
                type="button"
                className="btn-outline"
                id="btn-modal-share"
                onClick={handleCopyTelemetry}
              >
                Copy report telemetry
              </button>
            </div>
            {actionFeedback && (
              <div className="action-feedback" id="modal-feedback" aria-live="polite">
                {actionFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Gameplay Clip Modal */}
      <div className={`modal-backdrop ${isSubmitOpen ? 'active' : ''}`} aria-hidden={!isSubmitOpen}>
        <div className="modal-surface" role="dialog" aria-labelledby="submit-modal-title">
          <div className="modal-header">
            <h2 className="section-title" id="submit-modal-title">
              Submit gameplay clip for scouting
            </h2>
            <button
              type="button"
              className="text-link"
              onClick={() => setIsSubmitOpen(false)}
              aria-label="Close modal"
            >
              Close
            </button>
          </div>

          <form id="submit-clip-form" className="modal-form" onSubmit={handleSubmitClip}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clip-player">Gamertag / Name</label>
                <input
                  type="text"
                  id="clip-player"
                  required
                  placeholder="e.g. Vex#NA1"
                  value={submitForm.player}
                  onChange={(e) => setSubmitForm({ ...submitForm, player: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="clip-game">Game title</label>
                <select
                  id="clip-game"
                  required
                  value={submitForm.game}
                  onChange={(e) => setSubmitForm({ ...submitForm, game: e.target.value })}
                >
                  <option value="valorant">Valorant</option>
                  <option value="cs2">Counter-Strike 2</option>
                  <option value="bgmi">BGMI</option>
                  <option value="freefire">Free Fire</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clip-role">In-game role</label>
                <input
                  type="text"
                  id="clip-role"
                  required
                  placeholder="e.g. Duelist / Entry"
                  value={submitForm.role}
                  onChange={(e) => setSubmitForm({ ...submitForm, role: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="clip-rank">Current rank / tier</label>
                <input
                  type="text"
                  id="clip-rank"
                  required
                  placeholder="e.g. Radiant / Faceit 10"
                  value={submitForm.rank}
                  onChange={(e) => setSubmitForm({ ...submitForm, rank: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="clip-url">Gameplay URL (YouTube, Medal, Drive)</label>
              <input
                type="url"
                id="clip-url"
                required
                placeholder="https://youtube.com/watch?v=..."
                value={submitForm.url}
                onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="clip-notes">Match context / Clutch summary</label>
              <input
                type="text"
                id="clip-notes"
                required
                placeholder="e.g. 1v4 Ascent B site retake on matchpoint"
                value={submitForm.notes}
                onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setIsSubmitOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Submit for verification
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Toast Container */}
      {toastMessage && (
        <div className="toast-bar active" id="toast-bar" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
