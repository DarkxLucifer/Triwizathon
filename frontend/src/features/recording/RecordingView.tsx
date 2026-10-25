'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  Monitor,
  Mic,
  Camera,
  CameraOff,
  MicOff,
  Play,
  Square,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
  Share2,
  RefreshCw,
  ExternalLink,
  XCircle,
  Eye,
  Info,
  Radio,
  FileText,
  Lock,
} from 'lucide-react';
import {
  recordingsApi,
  RecordingSession,
  RecordingCheck,
} from '@/lib/api/recordings';

interface RecordingViewProps {
  theme?: 'dark' | 'light';
}

// SHA-256 calculation in browser using SubtleCrypto
async function computeBlobSha256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function RecordingView({ theme = 'dark' }: RecordingViewProps) {
  const isLight = theme === 'light';

  // Consent & Device States
  const [consentGiven, setConsentGiven] = useState(false);
  const [enableCamera, setEnableCamera] = useState(true);
  const [enableMic, setEnableMic] = useState(true);

  // Active Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerSec, setTimerSec] = useState(0);
  const [activeSession, setActiveSession] = useState<RecordingSession | null>(null);

  // Chunk & Progress Metrics
  const [screenChunkCount, setScreenChunkCount] = useState(0);
  const [cameraChunkCount, setCameraChunkCount] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Warning & Error Alerts
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Historical Recordings List
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);

  // Detail Modal / Selected Session
  const [selectedSession, setSelectedSession] = useState<RecordingSession | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Share Modal State
  const [shareModalSession, setShareModalSession] = useState<RecordingSession | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number>(1);
  const [isSharing, setIsSharing] = useState(false);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Media Stream & Recorder Refs
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const webcamRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webcamVideoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const screenIndexRef = useRef(0);
  const cameraIndexRef = useRef(0);
  const screenEndedEarlyRef = useRef(false);

  // Fetch recordings list
  const loadRecordings = useCallback(async () => {
    setIsLoadingRecordings(true);
    try {
      const data = await recordingsApi.listSessions();
      setRecordings(data);
    } catch (err: any) {
      console.warn('Failed to load recordings:', err.message);
    } finally {
      setIsLoadingRecordings(false);
    }
  }, []);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      webcamStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format bytes to MB
  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Start Capture Sequence
  const handleStartCapture = async () => {
    if (!consentGiven) {
      setErrorMessage('Explicit privacy consent is required before starting recording.');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setErrorMessage('Your browser does not support getDisplayMedia screen capture. Please use desktop Chrome, Edge, or Firefox.');
      return;
    }

    setErrorMessage(null);
    setWarningMessage(null);
    setIsStarting(true);
    screenEndedEarlyRef.current = false;
    screenIndexRef.current = 0;
    cameraIndexRef.current = 0;
    setScreenChunkCount(0);
    setCameraChunkCount(0);
    setUploadedBytes(0);

    try {
      // 1. Create session and challenge on server
      const captureMode = enableCamera ? 'dual' : 'screen_only';
      const session = await recordingsApi.createSession(captureMode, true);
      setActiveSession(session);

      // 2. Request Screen Share
      let screenStream: MediaStream;
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true, // request system audio
        });
        screenStreamRef.current = screenStream;
      } catch (err: any) {
        setIsStarting(false);
        if (err.name === 'NotAllowedError') {
          setWarningMessage('Screen sharing was cancelled or denied by user.');
        } else {
          setErrorMessage(`Screen capture error: ${err.message}`);
        }
        return;
      }

      // Track screen early end
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrack.onended = () => {
        screenEndedEarlyRef.current = true;
        setWarningMessage('Screen sharing was stopped early via the browser controls.');
        handleStopRecording();
      };

      // 3. Request Webcam & Mic (if enabled)
      let webcamStream: MediaStream | null = null;
      if (enableCamera || enableMic) {
        try {
          webcamStream = await navigator.mediaDevices.getUserMedia({
            video: enableCamera,
            audio: enableMic,
          });
          webcamStreamRef.current = webcamStream;
          if (webcamVideoPreviewRef.current && enableCamera) {
            webcamVideoPreviewRef.current.srcObject = webcamStream;
          }
        } catch (camErr: any) {
          console.warn('Camera/mic access failed, falling back to screen-only:', camErr.message);
          setWarningMessage('Webcam/Microphone access was denied. Continuing in screen-only capture mode.');
          webcamStream = null;
        }
      }

      // 4. Countdown 3-2-1
      setCountdown(3);
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 900));
      }
      setCountdown(null);

      // 5. Select Best Supported MIME Type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4',
      ];
      const selectedMime = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

      // 6. Setup Screen MediaRecorder (5-second timeslice)
      const screenRecorder = new MediaRecorder(screenStream, { mimeType: selectedMime });
      screenRecorderRef.current = screenRecorder;

      screenRecorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0 && session) {
          const idx = screenIndexRef.current++;
          setScreenChunkCount(prev => prev + 1);
          setUploadedBytes(prev => prev + e.data.size);
          setUploadStatus(`Streaming screen chunk #${idx + 1}...`);
          try {
            const sha = await computeBlobSha256(e.data);
            await recordingsApi.uploadChunk(session.id, 'screen', idx, sha, e.data);
            setUploadStatus(`Screen chunk #${idx + 1} synced`);
          } catch (uploadErr: any) {
            console.error(`Failed to upload screen chunk #${idx}:`, uploadErr);
          }
        }
      };

      // 7. Setup Camera MediaRecorder (if stream present)
      let webcamRecorder: MediaRecorder | null = null;
      if (webcamStream) {
        webcamRecorder = new MediaRecorder(webcamStream, { mimeType: selectedMime });
        webcamRecorderRef.current = webcamRecorder;

        webcamRecorder.ondataavailable = async (e: BlobEvent) => {
          if (e.data && e.data.size > 0 && session) {
            const idx = cameraIndexRef.current++;
            setCameraChunkCount(prev => prev + 1);
            setUploadedBytes(prev => prev + e.data.size);
            setUploadStatus(`Streaming camera chunk #${idx + 1}...`);
            try {
              const sha = await computeBlobSha256(e.data);
              await recordingsApi.uploadChunk(session.id, 'camera', idx, sha, e.data);
              setUploadStatus(`Camera chunk #${idx + 1} synced`);
            } catch (uploadErr: any) {
              console.error(`Failed to upload camera chunk #${idx}:`, uploadErr);
            }
          }
        };
      }

      // Start recorders with 5,000 ms (5s) timeslice
      screenRecorder.start(5000);
      if (webcamRecorder) webcamRecorder.start(5000);

      setIsRecording(true);
      setTimerSec(0);
      timerIntervalRef.current = setInterval(() => {
        setTimerSec(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      setErrorMessage(`Failed to initiate recording session: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // Stop Capture & Finalize
  const handleStopRecording = async () => {
    if (!isRecording && !isStarting) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setIsRecording(false);
    setIsFinalizing(true);
    setUploadStatus('Flushing final stream buffers to server...');

    try {
      // Stop recorders
      if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
        screenRecorderRef.current.stop();
      }
      if (webcamRecorderRef.current && webcamRecorderRef.current.state !== 'inactive') {
        webcamRecorderRef.current.stop();
      }

      // Wait a moment for last chunks to flush
      await new Promise(r => setTimeout(r, 1200));

      // Stop stream tracks
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      webcamStreamRef.current?.getTracks().forEach(t => t.stop());

      // Finalize session on backend
      if (activeSession) {
        setUploadStatus('Running server verification checks & Whisper analysis...');
        const finalized = await recordingsApi.finalizeSession(activeSession.id, {
          screen_ended_early: screenEndedEarlyRef.current,
          display_surface: 'monitor',
        });
        setActiveSession(null);
        await loadRecordings();
        setSelectedSession(finalized);
        setDetailModalOpen(true);
      }
    } catch (err: any) {
      setErrorMessage(`Error finalizing recording: ${err.message}`);
    } finally {
      setIsFinalizing(false);
      setUploadStatus('');
    }
  };

  // Abort active session
  const handleAbortRecording = async () => {
    if (!activeSession) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsRecording(false);
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    webcamStreamRef.current?.getTracks().forEach(t => t.stop());

    try {
      await recordingsApi.abortSession(activeSession.id);
      setActiveSession(null);
      await loadRecordings();
    } catch (err: any) {
      console.warn('Abort error:', err.message);
    }
  };

  // Delete session
  const handleDelete = async (id: number) => {
    try {
      await recordingsApi.deleteSession(id);
      setDeletingId(null);
      if (selectedSession?.id === id) {
        setDetailModalOpen(false);
        setSelectedSession(null);
      }
      await loadRecordings();
    } catch (err: any) {
      setErrorMessage(`Failed to delete recording: ${err.message}`);
    }
  };

  // Share session
  const handleShareSubmit = async () => {
    if (!shareModalSession) return;
    setIsSharing(true);
    try {
      await recordingsApi.shareSession(shareModalSession.id, selectedOrgId);
      setShareModalSession(null);
      await loadRecordings();
    } catch (err: any) {
      setErrorMessage(`Share failed: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  // Revoke session
  const handleRevokeShare = async (sessionId: number, orgId: number) => {
    try {
      await recordingsApi.revokeSession(sessionId, orgId);
      await loadRecordings();
    } catch (err: any) {
      setErrorMessage(`Revoke failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26262a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#e8ff59] animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-[#e8ff59] uppercase font-semibold">
              Anti-Cheat Session Verification
            </span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
            Recording & Telemetry Attestation
          </h1>
          <p className="text-xs text-[#9a9aa2] mt-0.5">
            Capture live full-screen matches with simultaneous webcam verification, continuous streaming upload, and spoken challenge anti-cheat checks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRecordings}
            className={`px-3 py-1.5 rounded-[6px] border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-[#131315] border-[#26262a] text-[#ededed] hover:bg-[#19191d]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecordings ? 'animate-spin' : ''}`} />
            Refresh History
          </button>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {warningMessage && (
        <div className="p-3.5 rounded-[6px] border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="text-[11px] opacity-90 mt-0.5">{warningMessage}</p>
          </div>
          <button type="button" onClick={() => setWarningMessage(null)} className="text-amber-400 hover:text-amber-200 text-xs">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-[6px] border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-start gap-2.5">
          <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Action Failed</p>
            <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Recorder Console / Right "What Will Be Checked" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* RECORDER CARD (Span 2) */}
        <div
          className={`lg:col-span-2 p-5 rounded-[8px] border transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#26262a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#e8ff59]/10 border border-[#e8ff59]/30 flex items-center justify-center text-[#e8ff59]">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                  Live Recorder Studio
                </h2>
                <p className="text-[11px] text-[#9a9aa2]">
                  Dual track streaming: Screen & Webcam + Microphone
                </p>
              </div>
            </div>

            {/* Status Chip */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  REC {formatTime(timerSec)}
                </span>
              ) : isFinalizing ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40 inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  FINALIZING
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-[#9a9aa2] bg-[#0b0b0c] border border-[#26262a]">
                  IDLE / STANDBY
                </span>
              )}
            </div>
          </div>

          {/* Privacy Consent Checkbox */}
          <div className={`p-3.5 rounded-[6px] mb-4 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                disabled={isRecording || isFinalizing}
                onChange={e => setConsentGiven(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#26262a] text-[#e8ff59] focus:ring-0 cursor-pointer accent-[#e8ff59]"
              />
              <div className="text-[12px] leading-relaxed">
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  Explicit Consent & Privacy Attestation
                </span>
                <p className="text-[#9a9aa2] text-[11px] mt-0.5">
                  I consent to capture full-screen gameplay video and microphone audio for trial verification. Data is retained for 14 days and remains private until explicitly shared with an organization. No facial recognition templates or biometrics are generated or stored. You can delete this recording and derived evidence at any time.
                </p>
              </div>
            </label>
          </div>

          {/* Device Toggles & Challenge Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Device Toggles */}
            <div className={`p-3.5 rounded-[6px] border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className="text-[11px] font-mono uppercase text-[#9a9aa2] font-semibold block">
                Capture Stream Inputs
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#ededed] flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-[#e8ff59]" /> Primary Screen Share
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                  Mandatory
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#ededed] flex items-center gap-2">
                  {enableCamera ? <Camera className="w-3.5 h-3.5 text-blue-400" /> : <CameraOff className="w-3.5 h-3.5 text-zinc-500" />}
                  Webcam Picture-in-Picture
                </span>
                <button
                  type="button"
                  disabled={isRecording || isFinalizing}
                  onClick={() => setEnableCamera(!enableCamera)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    enableCamera
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-[#131315] text-[#9a9aa2] border border-[#26262a]'
                  }`}
                >
                  {enableCamera ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#ededed] flex items-center gap-2">
                  {enableMic ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-zinc-500" />}
                  Voice Microphone Comms
                </span>
                <button
                  type="button"
                  disabled={isRecording || isFinalizing}
                  onClick={() => setEnableMic(!enableMic)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    enableMic
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#131315] text-[#9a9aa2] border border-[#26262a]'
                  }`}
                >
                  {enableMic ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Cryptographic Challenge Code Box */}
            <div className={`p-3.5 rounded-[6px] border flex flex-col justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <div>
                <span className="text-[11px] font-mono uppercase text-[#e8ff59] font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Spoken Challenge Code
                </span>
                <p className="text-[11px] text-[#9a9aa2] mt-1 leading-snug">
                  Read aloud once recording begins. Whisper AI verifies your live presence.
                </p>
              </div>

              <div className="mt-2.5 p-2 bg-[#131315] border border-[#26262a] rounded-[4px] text-center">
                {activeSession?.challenge ? (
                  <span className="text-xl font-mono font-bold tracking-widest text-[#e8ff59]">
                    {activeSession.challenge.code}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[#9a9aa2] italic">
                    [Generated when you click Start]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Recording Monitor & Webcam Preview */}
          {isRecording && (
            <div className="mb-4 p-4 rounded-[6px] bg-[#0b0b0c] border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {enableCamera && (
                  <div className="w-28 h-20 bg-black rounded-[4px] border border-[#26262a] overflow-hidden relative shrink-0">
                    <video
                      ref={webcamVideoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/70 px-1 rounded text-white">
                      CAM
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-[#ededed]">Live Streaming Active</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#9a9aa2] mt-1">
                    Screen chunks: {screenChunkCount} | Cam chunks: {cameraChunkCount} | Streamed: {formatBytes(uploadedBytes)}
                  </p>
                  {uploadStatus && (
                    <p className="text-[10px] font-mono text-[#e8ff59] mt-0.5">{uploadStatus}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex-1 md:flex-none px-4 py-2 rounded-[6px] text-xs font-semibold bg-red-600 hover:bg-red-500 text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" /> Stop & Finalize
                </button>
                <button
                  type="button"
                  onClick={handleAbortRecording}
                  className="px-3 py-2 rounded-[6px] text-xs text-[#9a9aa2] hover:text-white border border-[#26262a] hover:bg-[#19191d] transition-colors"
                >
                  Abort
                </button>
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="mb-4 p-6 rounded-[6px] bg-[#0b0b0c] border border-[#e8ff59]/50 text-center animate-pulse">
              <span className="text-4xl font-mono font-black text-[#e8ff59]">{countdown}</span>
              <p className="text-xs text-[#9a9aa2] font-mono uppercase tracking-wider mt-1">
                Starting Capture... Speak challenge code clearly!
              </p>
            </div>
          )}

          {/* Action Footer Buttons */}
          {!isRecording && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-[#9a9aa2]">
                Timeslice: 5.0s chunks | Codec: VP9/Opus WebM | Idempotent Assembly
              </div>
              <button
                type="button"
                disabled={!consentGiven || isStarting || isFinalizing}
                onClick={handleStartCapture}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-[6px] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !consentGiven || isStarting || isFinalizing
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    : 'bg-[#e8ff59] hover:bg-[#d6f03d] text-[#0b0b0c] border border-[#e8ff59] font-bold shadow-sm'
                }`}
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Preparing Capture...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Start Anti-Cheat Recording
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT CARD: "WHAT WILL BE CHECKED" */}
        <div
          className={`p-5 rounded-[8px] border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#131315] border-[#26262a]'
          }`}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#26262a]">
            <Shield className="w-4 h-4 text-[#e8ff59]" />
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
              Automated Integrity Checks
            </h3>
          </div>

          <p className="text-[11px] text-[#9a9aa2] leading-relaxed">
            Every recording undergoes five deterministic verification tests. Here is what each check proves and does not prove:
          </p>

          <div className="space-y-3 text-[11px]">
            <div className="p-2.5 rounded-[4px] bg-[#0b0b0c] border border-[#26262a]">
              <span className="font-semibold text-[#ededed] block">1. Spoken Challenge Code</span>
              <p className="text-emerald-400 mt-0.5">✓ Proves live human presence at session start.</p>
              <p className="text-[#9a9aa2]">✗ Does not prove continued gameplay throughout match.</p>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#0b0b0c] border border-[#26262a]">
              <span className="font-semibold text-[#ededed] block">2. Chunk Delivery Lifecycle</span>
              <p className="text-emerald-400 mt-0.5">✓ Proves chunks streamed sequentially in real time.</p>
              <p className="text-[#9a9aa2]">✗ Does not rule out hardware capture-card passthroughs.</p>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#0b0b0c] border border-[#26262a]">
              <span className="font-semibold text-[#ededed] block">3. FFprobe Stream Telemetry</span>
              <p className="text-emerald-400 mt-0.5">✓ Validates resolution, steady 30+ fps, and codecs.</p>
              <p className="text-[#9a9aa2]">✗ Does not verify in-game resolution stretch factors.</p>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#0b0b0c] border border-[#26262a]">
              <span className="font-semibold text-[#ededed] block">4. Duplicate Fingerprint Match</span>
              <p className="text-emerald-400 mt-0.5">✓ Guarantees clip has not been submitted by others.</p>
              <p className="text-[#9a9aa2]">✗ Does not prevent private offline re-recordings.</p>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#0b0b0c] border border-[#26262a]">
              <span className="font-semibold text-[#ededed] block">5. Display Surface & Continuity</span>
              <p className="text-emerald-400 mt-0.5">✓ Confirms full monitor was shared without early stop.</p>
              <p className="text-[#9a9aa2]">✗ Does not detect secondary physical monitor usage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MY RECORDINGS TABLE */}
      <div
        className={`p-5 rounded-[8px] border transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#131315] border-[#26262a]'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#26262a]">
          <div>
            <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
              My Anti-Cheat Recordings
            </h2>
            <p className="text-[11px] text-[#9a9aa2]">
              Historical gameplay sessions stored in encrypted server vaults
            </p>
          </div>
          <span className="text-xs font-mono text-[#9a9aa2]">
            {recordings.length} session{recordings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-10 h-10 text-[#9a9aa2] mx-auto mb-2 opacity-40" />
            <h4 className="text-sm font-semibold text-[#ededed]">No recordings found</h4>
            <p className="text-xs text-[#9a9aa2] max-w-sm mx-auto mt-1">
              Start your first anti-cheat verified session above. All stream chunks and audio checks will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#26262a] text-[#9a9aa2] font-mono text-[11px] uppercase">
                  <th className="pb-2.5 pr-4">Session Date</th>
                  <th className="pb-2.5 px-4">Duration</th>
                  <th className="pb-2.5 px-4">Capture Mode</th>
                  <th className="pb-2.5 px-4">Label</th>
                  <th className="pb-2.5 px-4">Status</th>
                  <th className="pb-2.5 px-4">Integrity Checks</th>
                  <th className="pb-2.5 px-4">Org Share</th>
                  <th className="pb-2.5 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262a]/60">
                {recordings.map(s => {
                  const passedChecks = s.checks.filter(c => c.status === 'passed').length;
                  const warningChecks = s.checks.filter(c => c.status === 'warning').length;
                  const failedChecks = s.checks.filter(c => c.status === 'failed').length;
                  const activeShare = s.shares.find(sh => sh.is_active);

                  return (
                    <tr key={s.id} className="hover:bg-[#0b0b0c]/40 transition-colors">
                      <td className="py-3 pr-4 font-mono text-[11px] text-[#ededed]">
                        {new Date(s.started_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[#9a9aa2]">
                        {formatTime(s.duration_sec)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#0b0b0c] border border-[#26262a] text-[#ededed]">
                          {s.mode === 'dual' ? 'Dual (Screen+Cam)' : 'Screen Only'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                            s.label === 'live_recorded'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {s.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                            s.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : s.status === 'incomplete'
                              ? 'bg-amber-500/10 text-amber-400'
                              : s.status === 'recording'
                              ? 'bg-red-500/10 text-red-400 animate-pulse'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {passedChecks > 0 && (
                            <span className="text-emerald-400" title={`${passedChecks} checks passed`}>
                              ✓{passedChecks}
                            </span>
                          )}
                          {warningChecks > 0 && (
                            <span className="text-amber-400" title={`${warningChecks} checks warning`}>
                              !{warningChecks}
                            </span>
                          )}
                          {failedChecks > 0 && (
                            <span className="text-red-400" title={`${failedChecks} checks failed`}>
                              ✗{failedChecks}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        {activeShare ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-[10px]">
                              Shared: {activeShare.org_name || `Org #${activeShare.org_id}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevokeShare(s.id, activeShare.org_id)}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#9a9aa2] font-mono text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                      </td>

                      <td className="py-3 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSession(s);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-[#0b0b0c] border border-[#26262a] text-[#ededed] hover:border-[#e8ff59] transition-colors"
                            title="Play & View Checks"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShareModalSession(s)}
                            className="p-1.5 rounded bg-[#0b0b0c] border border-[#26262a] text-blue-400 hover:border-blue-400 transition-colors"
                            title="Share with Org"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(s.id)}
                            className="p-1.5 rounded bg-[#0b0b0c] border border-[#26262a] text-red-400 hover:border-red-400 transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL & PLAYBACK MODAL */}
      {detailModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131315] border border-[#26262a] rounded-[8px] max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#26262a]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#e8ff59] font-semibold">
                  Recording Telemetry Dossier #{selectedSession.id}
                </span>
                <h3 className="text-lg font-bold text-[#ededed]">
                  Session Attestation & Video Playback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="text-[#9a9aa2] hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Video Players (Screen & Camera) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#9a9aa2] uppercase block mb-1.5">
                  Screen Stream Capture
                </span>
                <div className="aspect-video bg-black rounded border border-[#26262a] overflow-hidden flex items-center justify-center">
                  {selectedSession.final_screen_path ? (
                    <video
                      controls
                      playsInline
                      src={recordingsApi.getStreamUrl(selectedSession.id, 'screen')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#9a9aa2]">No screen video assembled</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#9a9aa2] uppercase block mb-1.5">
                  Webcam Stream Capture
                </span>
                <div className="aspect-video bg-black rounded border border-[#26262a] overflow-hidden flex items-center justify-center">
                  {selectedSession.final_camera_path ? (
                    <video
                      controls
                      playsInline
                      src={recordingsApi.getStreamUrl(selectedSession.id, 'camera')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#9a9aa2]">
                      {selectedSession.mode === 'screen_only' ? 'Screen-only mode (No webcam recorded)' : 'No camera video assembled'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Integrity Check Results */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-[#9a9aa2] font-semibold">
                Integrity Checks Evaluation
              </h4>
              <div className="space-y-2">
                {selectedSession.checks.map(check => (
                  <div
                    key={check.id}
                    className="p-3 rounded bg-[#0b0b0c] border border-[#26262a] flex items-start gap-3"
                  >
                    {check.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : check.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#ededed] capitalize">
                          {check.check_type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                            check.status === 'passed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : check.status === 'warning'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {check.status}
                        </span>
                      </div>
                      <p className="text-[#9a9aa2] text-[11px] mt-0.5">{check.summary}</p>
                      {check.details_json && (
                        <pre className="mt-1.5 p-2 bg-black/60 rounded text-[10px] font-mono text-zinc-400 overflow-x-auto">
                          {JSON.stringify(check.details_json, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-[#26262a]">
              <span className="text-[11px] font-mono text-[#9a9aa2]">
                Token: {selectedSession.session_token.slice(0, 16)}...
              </span>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-1.5 rounded bg-[#0b0b0c] border border-[#26262a] text-xs text-white hover:bg-[#19191d]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#131315] border border-[#26262a] rounded-[8px] max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#ededed]">Share Recording with Organization</h3>
            <p className="text-xs text-[#9a9aa2]">
              Select an esports organization to grant trial scouting access to session #{shareModalSession.id}. You can revoke access at any time.
            </p>

            <div>
              <label className="text-xs text-[#9a9aa2] block mb-1">Target Organization</label>
              <select
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(Number(e.target.value))}
                className="w-full p-2 bg-[#0b0b0c] border border-[#26262a] rounded text-xs text-[#ededed] focus:outline-none"
              >
                <option value={1}>Sentinels Esports (Org #1)</option>
                <option value={2}>Cloud9 Esports (Org #2)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShareModalSession(null)}
                className="px-3 py-1.5 rounded border border-[#26262a] text-xs text-[#9a9aa2] hover:bg-[#19191d]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSharing}
                onClick={handleShareSubmit}
                className="px-4 py-1.5 rounded bg-[#e8ff59] text-[#0b0b0c] text-xs font-semibold hover:bg-[#d6f03d]"
              >
                {isSharing ? 'Sharing...' : 'Confirm Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#131315] border border-[#26262a] rounded-[8px] max-w-sm w-full p-5 space-y-3">
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Permanently Delete Recording?
            </h3>
            <p className="text-xs text-[#9a9aa2]">
              This will permanently delete session #{deletingId}, all assembled screen and webcam video files, stream chunks, and derived integrity checks from server vaults. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded border border-[#26262a] text-xs text-[#9a9aa2] hover:bg-[#19191d]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
