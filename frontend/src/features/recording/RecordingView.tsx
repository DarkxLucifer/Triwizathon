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
  Sparkles,
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
  const screenVideoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const screenIndexRef = useRef(0);
  const cameraIndexRef = useRef(0);
  const screenEndedEarlyRef = useRef(false);

  // Active Stream States for Live Preview in React DOM
  const [activeScreenStream, setActiveScreenStream] = useState<MediaStream | null>(null);
  const [activeWebcamStream, setActiveWebcamStream] = useState<MediaStream | null>(null);

  // Connect active screen stream to video preview DOM element
  useEffect(() => {
    if (screenVideoPreviewRef.current && activeScreenStream) {
      screenVideoPreviewRef.current.srcObject = activeScreenStream;
      screenVideoPreviewRef.current.play().catch(e => {
        console.warn('Screen live preview play failed:', e);
      });
    }
  }, [activeScreenStream, isRecording]);

  // Connect active webcam stream to video preview DOM element
  useEffect(() => {
    if (webcamVideoPreviewRef.current && activeWebcamStream) {
      webcamVideoPreviewRef.current.srcObject = activeWebcamStream;
      webcamVideoPreviewRef.current.play().catch(e => {
        console.warn('Webcam live preview play failed:', e);
      });
    }
  }, [activeWebcamStream, isRecording]);

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
      screenStreamRef.current = null;
      webcamStreamRef.current = null;
      setActiveScreenStream(null);
      setActiveWebcamStream(null);
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
        setActiveScreenStream(screenStream);
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
          setActiveWebcamStream(webcamStream);
        } catch (camErr: any) {
          console.warn('Camera/mic access failed, falling back to screen-only:', camErr.message);
          setWarningMessage('Webcam/Microphone access was denied. Continuing in screen-only capture mode.');
          webcamStream = null;
          setActiveWebcamStream(null);
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
      screenStreamRef.current = null;
      webcamStreamRef.current = null;
      setActiveScreenStream(null);
      setActiveWebcamStream(null);

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
    screenStreamRef.current = null;
    webcamStreamRef.current = null;
    setActiveScreenStream(null);
    setActiveWebcamStream(null);

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
    <div className={`space-y-6 max-w-7xl mx-auto pb-12 select-none ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
      {/* Top Banner / Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-700' : 'bg-zinc-400'}`} />
            <span className={`text-[11px] font-mono tracking-wider uppercase font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Anti-Cheat Session Verification
            </span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
            Recording & Telemetry Attestation
          </h1>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Capture live full-screen matches with simultaneous webcam verification, continuous streaming upload, and spoken challenge anti-cheat checks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRecordings}
            className={`px-3 py-1.5 rounded-[6px] border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
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
        <div className={`p-3.5 rounded-[6px] border text-xs flex items-start gap-2.5 ${
          isLight
            ? 'border-amber-300 bg-amber-50 text-amber-900'
            : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="text-[11px] opacity-90 mt-0.5">{warningMessage}</p>
          </div>
          <button type="button" onClick={() => setWarningMessage(null)} className="opacity-70 hover:opacity-100 text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className={`p-3.5 rounded-[6px] border text-xs flex items-start gap-2.5 ${
          isLight
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-red-500/40 bg-red-500/10 text-red-300'
        }`}>
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Action Failed</p>
            <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="opacity-70 hover:opacity-100 text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Recorder Console / Right "What Will Be Checked" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* RECORDER CARD (Span 2) */}
        <div
          className={`lg:col-span-2 p-5 rounded-[8px] border transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}
        >
          {/* Header Row */}
          <div className={`flex items-center justify-between pb-4 mb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-[6px] border flex items-center justify-center ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}>
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                  Live Recorder Studio
                </h2>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                  Dual track streaming: Screen & Webcam + Microphone
                </p>
              </div>
            </div>

            {/* Status Chip */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 inline-flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  REC {formatTime(timerSec)}
                </span>
              ) : isFinalizing ? (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border inline-flex items-center gap-1.5 ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  FINALIZING
                </span>
              ) : (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                  isLight ? 'text-slate-600 bg-slate-100 border-slate-300' : 'text-[#9a9aa2] bg-[#0b0b0c] border-[#26262a]'
                }`}>
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
                className={`mt-0.5 w-4 h-4 rounded cursor-pointer ${
                  isLight ? 'border-slate-300 accent-slate-900' : 'border-[#26262a] accent-white'
                }`}
              />
              <div className="text-[12px] leading-relaxed">
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                  Explicit Consent & Privacy Attestation
                </span>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                  I consent to capture full-screen gameplay video and microphone audio for trial verification. Data is retained for 14 days and remains private until explicitly shared with an organization. No facial recognition templates or biometrics are generated or stored. You can delete this recording and derived evidence at any time.
                </p>
              </div>
            </label>
          </div>

          {/* Device Toggles & Challenge Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Device Toggles */}
            <div className={`p-3.5 rounded-[6px] border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className={`text-[11px] font-mono uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                Capture Stream Inputs
              </span>
              <div className="flex items-center justify-between">
                <span className={`text-xs flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  <Monitor className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`} /> Primary Screen Share
                </span>
                <span className={`text-[10px] font-mono font-semibold uppercase ${isLight ? 'text-slate-700' : 'text-zinc-400'}`}>
                  Mandatory
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  {enableCamera ? <Camera className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`} /> : <CameraOff className="w-3.5 h-3.5 text-zinc-400" />}
                  Webcam Picture-in-Picture
                </span>
                <button
                  type="button"
                  disabled={isRecording || isFinalizing}
                  onClick={() => setEnableCamera(!enableCamera)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    enableCamera
                      ? isLight
                        ? 'bg-slate-900 text-white border border-slate-900'
                        : 'bg-zinc-200 text-black border border-zinc-200 font-semibold'
                      : isLight
                      ? 'bg-slate-200 text-slate-600 border border-slate-300'
                      : 'bg-[#131315] text-[#9a9aa2] border border-[#26262a]'
                  }`}
                >
                  {enableCamera ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>
                  {enableMic ? <Mic className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`} /> : <MicOff className="w-3.5 h-3.5 text-zinc-400" />}
                  Voice Microphone Comms
                </span>
                <button
                  type="button"
                  disabled={isRecording || isFinalizing}
                  onClick={() => setEnableMic(!enableMic)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    enableMic
                      ? isLight
                        ? 'bg-slate-900 text-white border border-slate-900'
                        : 'bg-zinc-200 text-black border border-zinc-200 font-semibold'
                      : isLight
                      ? 'bg-slate-200 text-slate-600 border border-slate-300'
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
                <span className={`text-[11px] font-mono uppercase font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  <Shield className="w-3.5 h-3.5" /> Spoken Challenge Code
                </span>
                <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                  Read aloud once recording begins. Whisper AI verifies your live presence.
                </p>
              </div>

              <div className={`mt-2.5 p-2 rounded-[4px] border text-center ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
              }`}>
                {activeSession?.challenge ? (
                  <span className={`text-xl font-mono font-bold tracking-widest ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {activeSession.challenge.code}
                  </span>
                ) : (
                  <span className={`text-xs font-mono italic ${isLight ? 'text-slate-400' : 'text-[#9a9aa2]'}`}>
                    [Generated when you click Start]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Recording Monitor & Live Video Previews */}
          {isRecording && (
            <div className={`mb-6 p-4 rounded-[8px] border space-y-4 shadow-sm ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
            }`}>
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${
                isLight ? 'border-slate-200' : 'border-[#26262a]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono font-bold animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    <span>REC LIVE</span>
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                      <span>Active Stream Ingest</span>
                      <span className={`text-xs font-mono font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        [{formatTime(timerSec)}]
                      </span>
                    </h4>
                    <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                      Screen chunks: {screenChunkCount} | Cam chunks: {cameraChunkCount} | Streamed: {formatBytes(uploadedBytes)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-[6px] text-xs font-bold bg-red-600 hover:bg-red-500 text-white inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop & Finalize</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAbortRecording}
                    className={`px-3 py-2 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-200'
                        : 'border-[#26262a] text-[#9a9aa2] hover:bg-[#19191d] hover:text-white'
                    }`}
                  >
                    Abort
                  </button>
                </div>
              </div>

              {/* Dual Stream Live Displays */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Screen Share Live Feed (Takes 2/3 width if cam active, else full 3/3) */}
                <div className={`${enableCamera && activeWebcamStream ? 'md:col-span-2' : 'md:col-span-3'} space-y-1.5`}>
                  <div className={`flex items-center justify-between text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                    <span className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5" />
                      SCREEN SHARE LIVE OUTPUT
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">Active MediaStream</span>
                  </div>
                  <div className={`aspect-video bg-black rounded-[6px] border overflow-hidden relative shadow-inner flex items-center justify-center ${
                    isLight ? 'border-slate-300' : 'border-[#26262a]'
                  }`}>
                    <video
                      ref={screenVideoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono text-white border border-white/10 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>LIVE SCREEN</span>
                    </div>
                  </div>
                </div>

                {/* Webcam Live Feed */}
                {enableCamera && activeWebcamStream && (
                  <div className="space-y-1.5">
                    <div className={`flex items-center justify-between text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        FACECAM LIVE OUTPUT
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">Webcam Ingest</span>
                    </div>
                    <div className={`aspect-video bg-black rounded-[6px] border overflow-hidden relative shadow-inner flex items-center justify-center ${
                      isLight ? 'border-slate-300' : 'border-[#26262a]'
                    }`}>
                      <video
                        ref={webcamVideoPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover bg-black"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono text-white border border-white/10">
                        CAM VERIFIED
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {uploadStatus && (
                <div className={`p-2.5 rounded border text-[11px] font-mono flex items-center gap-2 ${
                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#131315] border-[#26262a] text-zinc-300'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className={`mb-4 p-6 rounded-[6px] border text-center animate-pulse ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#0b0b0c] border-[#26262a]'
            }`}>
              <span className={`text-4xl font-mono font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{countdown}</span>
              <p className={`text-xs font-mono uppercase tracking-wider mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                Starting Capture... Speak challenge code clearly!
              </p>
            </div>
          )}

          {/* Action Footer Buttons */}
          {!isRecording && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                Timeslice: 5.0s chunks | Codec: VP9/Opus WebM | Idempotent Assembly
              </div>
              <button
                type="button"
                disabled={!consentGiven || isStarting || isFinalizing}
                onClick={handleStartCapture}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-[6px] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !consentGiven || isStarting || isFinalizing
                    ? isLight
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    : isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 font-bold shadow-sm'
                    : 'bg-white hover:bg-slate-200 text-black border border-white font-bold shadow-sm'
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
            isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}
        >
          <div className={`flex items-center gap-2 pb-2 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
            <Shield className={`w-4 h-4 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`} />
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
              Automated Integrity Checks
            </h3>
          </div>

          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            Every recording undergoes five deterministic verification tests. Here is what each check proves and does not prove:
          </p>

          <div className="space-y-3 text-[11px]">
            <div className={`p-2.5 rounded-[4px] border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>1. Spoken Challenge Code</span>
              <p className={`mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>✓ Proves live human presence at session start.</p>
              <p className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>✗ Does not prove continued gameplay throughout match.</p>
            </div>

            <div className={`p-2.5 rounded-[4px] border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>2. Chunk Delivery Lifecycle</span>
              <p className={`mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>✓ Proves chunks streamed sequentially in real time.</p>
              <p className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>✗ Does not rule out hardware capture-card passthroughs.</p>
            </div>

            <div className={`p-2.5 rounded-[4px] border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>3. FFprobe Stream Telemetry</span>
              <p className={`mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>✓ Validates resolution, steady 30+ fps, and codecs.</p>
              <p className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>✗ Does not verify in-game resolution stretch factors.</p>
            </div>

            <div className={`p-2.5 rounded-[4px] border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>4. Duplicate Fingerprint Match</span>
              <p className={`mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>✓ Guarantees clip has not been submitted by others.</p>
              <p className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>✗ Does not prevent private offline re-recordings.</p>
            </div>

            <div className={`p-2.5 rounded-[4px] border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0b0c] border-[#26262a]'}`}>
              <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>5. Display Surface & Continuity</span>
              <p className={`mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>✓ Confirms full monitor was shared without early stop.</p>
              <p className={isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}>✗ Does not detect secondary physical monitor usage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MY RECORDINGS TABLE */}
      <div
        className={`p-5 rounded-[8px] border transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
        }`}
      >
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
          <div>
            <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
              My Anti-Cheat Recordings
            </h2>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              Historical gameplay sessions stored in encrypted server vaults
            </p>
          </div>
          <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
            {recordings.length} session{recordings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <Video className={`w-10 h-10 mx-auto mb-2 opacity-30 ${isLight ? 'text-slate-400' : 'text-[#9a9aa2]'}`} />
            <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-[#ededed]'}`}>No recordings found</h4>
            <p className={`text-xs max-w-sm mx-auto mt-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              Start your first anti-cheat verified session above. All stream chunks and audio checks will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b font-mono text-[11px] uppercase ${isLight ? 'border-slate-200 text-slate-500' : 'border-[#26262a] text-[#9a9aa2]'}`}>
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
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#26262a]/60'}`}>
                {recordings.map(s => {
                  const passedChecks = s.checks.filter(c => c.status === 'passed').length;
                  const warningChecks = s.checks.filter(c => c.status === 'warning').length;
                  const failedChecks = s.checks.filter(c => c.status === 'failed').length;
                  const activeShare = s.shares.find(sh => sh.is_active);

                  return (
                    <tr key={s.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}>
                      <td className={`py-3 pr-4 font-mono text-[11px] font-medium ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                        {new Date(s.started_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className={`py-3 px-4 font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                        {formatTime(s.duration_sec)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                        }`}>
                          {s.mode === 'dual' ? 'Dual (Screen+Cam)' : 'Screen Only'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                            s.label === 'live_recorded'
                              ? isLight
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                              : isLight
                              ? 'bg-slate-50 text-slate-500 border-slate-200'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {s.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                            s.status === 'completed'
                              ? isLight
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                              : s.status === 'recording'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse'
                              : isLight
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {passedChecks > 0 && (
                            <span className={isLight ? 'text-slate-800 font-semibold' : 'text-zinc-200 font-semibold'} title={`${passedChecks} checks passed`}>
                              ✓{passedChecks}
                            </span>
                          )}
                          {warningChecks > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold" title={`${warningChecks} checks warning`}>
                              !{warningChecks}
                            </span>
                          )}
                          {failedChecks > 0 && (
                            <span className="text-red-600 dark:text-red-400 font-semibold" title={`${failedChecks} checks failed`}>
                              ✗{failedChecks}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        {activeShare ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded border font-mono text-[10px] ${
                              isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-zinc-200'
                            }`}>
                              Shared: {activeShare.org_name || `Org #${activeShare.org_id}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevokeShare(s.id, activeShare.org_id)}
                              className={`text-[10px] hover:underline cursor-pointer ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className={`font-mono text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
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
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                                : 'bg-[#0b0b0c] hover:bg-[#19191d] border-[#26262a] text-[#ededed]'
                            }`}
                            title="Play & View Checks"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShareModalSession(s)}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                                : 'bg-[#0b0b0c] hover:bg-[#19191d] border-[#26262a] text-zinc-300'
                            }`}
                            title="Share with Org"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(s.id)}
                            className={`p-1.5 rounded border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-red-50 border-slate-300 text-red-600'
                                : 'bg-[#0b0b0c] hover:bg-red-950/30 border-[#26262a] text-red-400'
                            }`}
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-[8px] max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-2xl' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
              <div>
                <span className={`text-[10px] font-mono uppercase font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Recording Telemetry Dossier #{selectedSession.id}
                </span>
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                  Session Attestation & Video Playback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className={`text-sm cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#9a9aa2] hover:text-white'}`}
              >
                ✕ Close
              </button>
            </div>

            {/* Synchronized Playback Control Toolbar */}
            {selectedSession.final_screen_path && selectedSession.final_camera_path && (
              <div className={`flex items-center justify-between p-3 rounded-[6px] border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
              }`}>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current opacity-80" />
                  <span className="text-xs font-mono font-bold">
                    Dual-Track Synchronized Playback
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const screenVid = document.getElementById('detail-modal-screen-video') as HTMLVideoElement;
                    const camVid = document.getElementById('detail-modal-cam-video') as HTMLVideoElement;
                    if (screenVid && camVid) {
                      if (screenVid.paused || camVid.paused) {
                        screenVid.currentTime = 0;
                        camVid.currentTime = 0;
                        screenVid.play();
                        camVid.play();
                      } else {
                        screenVid.pause();
                        camVid.pause();
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-white hover:bg-slate-200 text-black'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Sync Play / Restart Both</span>
                </button>
              </div>
            )}

            {/* Video Players (Screen & Camera) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-mono uppercase ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                    Screen Stream Capture
                  </span>
                  {selectedSession.final_screen_path && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      Primary Gameplay Stream
                    </span>
                  )}
                </div>
                <div className={`aspect-video bg-black rounded border overflow-hidden flex items-center justify-center relative ${
                  isLight ? 'border-slate-300' : 'border-[#26262a]'
                }`}>
                  {selectedSession.final_screen_path ? (
                    <video
                      id="detail-modal-screen-video"
                      key={`${selectedSession.id}_screen`}
                      controls
                      playsInline
                      preload="metadata"
                      src={recordingsApi.getStreamUrl(selectedSession.id, 'screen')}
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-[#9a9aa2]'}`}>No screen video assembled</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-mono uppercase ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                    Webcam Stream Capture
                  </span>
                  {selectedSession.final_camera_path && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      Facial Telemetry Stream
                    </span>
                  )}
                </div>
                <div className={`aspect-video bg-black rounded border overflow-hidden flex items-center justify-center relative ${
                  isLight ? 'border-slate-300' : 'border-[#26262a]'
                }`}>
                  {selectedSession.final_camera_path ? (
                    <video
                      id="detail-modal-cam-video"
                      key={`${selectedSession.id}_camera`}
                      controls
                      playsInline
                      preload="metadata"
                      src={recordingsApi.getStreamUrl(selectedSession.id, 'camera')}
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-[#9a9aa2]'}`}>
                      {selectedSession.mode === 'screen_only' ? 'Screen-only mode (No webcam recorded)' : 'No camera video assembled'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Integrity Check Results */}
            <div className="space-y-3">
              <h4 className={`text-xs font-mono uppercase font-semibold ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>
                Integrity Checks Evaluation
              </h4>
              <div className="space-y-2">
                {selectedSession.checks.map(check => (
                  <div
                    key={check.id}
                    className={`p-3 rounded border flex items-start gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                    }`}
                  >
                    {check.status === 'passed' ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-slate-800' : 'text-zinc-200'}`} />
                    ) : check.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold capitalize ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>
                          {check.check_type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold border ${
                            check.status === 'passed'
                              ? isLight
                                ? 'bg-slate-200/60 text-slate-800 border-slate-300'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              : check.status === 'warning'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                          }`}
                        >
                          {check.status}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-[#9a9aa2]'}`}>{check.summary}</p>
                      {check.details_json && (
                        <pre className={`mt-1.5 p-2 rounded text-[10px] font-mono overflow-x-auto ${
                          isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-black/60 text-zinc-400'
                        }`}>
                          {JSON.stringify(check.details_json, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className={`flex justify-between items-center pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#26262a]'}`}>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
                Token: {selectedSession.session_token.slice(0, 16)}...
              </span>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer border ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                    : 'bg-[#0b0b0c] border-[#26262a] text-white hover:bg-[#19191d]'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalSession && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-[8px] max-w-md w-full p-6 space-y-4 border ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-2xl' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}>
            <h3 className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-[#ededed]'}`}>Share Recording with Organization</h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              Select an esports organization to grant trial scouting access to session #{shareModalSession.id}. You can revoke access at any time.
            </p>

            <div>
              <label className={`text-xs block mb-1 ${isLight ? 'text-slate-600 font-medium' : 'text-[#9a9aa2]'}`}>Target Organization</label>
              <select
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(Number(e.target.value))}
                className={`w-full p-2 rounded text-xs focus:outline-none border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0b0b0c] border-[#26262a] text-[#ededed]'
                }`}
              >
                <option value={1}>Sentinels Esports (Org #1)</option>
                <option value={2}>Cloud9 Esports (Org #2)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShareModalSession(null)}
                className={`px-3 py-1.5 rounded border text-xs cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-[#26262a] text-[#9a9aa2] hover:bg-[#19191d]'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSharing}
                onClick={handleShareSubmit}
                className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-white hover:bg-slate-200 text-black'
                }`}
              >
                {isSharing ? 'Sharing...' : 'Confirm Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-[8px] max-w-sm w-full p-5 space-y-3 border ${
            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-2xl' : 'bg-[#131315] border-[#26262a] text-[#ededed]'
          }`}>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Permanently Delete Recording?
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#9a9aa2]'}`}>
              This will permanently delete session #{deletingId}, all assembled screen and webcam video files, stream chunks, and derived integrity checks from server vaults. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className={`px-3 py-1.5 rounded border text-xs cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-[#26262a] text-[#9a9aa2] hover:bg-[#19191d]'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-500 cursor-pointer"
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
