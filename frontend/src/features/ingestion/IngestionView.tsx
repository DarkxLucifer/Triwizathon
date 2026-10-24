'use client';

import React, { useState } from 'react';
import { AudioJob, IngestionValidationSummary } from '@/types';
import {
  FileSpreadsheet,
  UploadCloud,
  Radio,
  Volume2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface IngestionViewProps {
  ingestionHistory: IngestionValidationSummary[];
  onRecordIngestion: (summary: IngestionValidationSummary) => void;
  audioJobs: AudioJob[];
  onAddAudioJob: (job: Omit<AudioJob, 'id' | 'uploadedAt' | 'organizationId'>) => void;
  isPandaScoreConnected: boolean;
  isPandaScoreStale: boolean;
  onTogglePandaScore: () => void;
}

export function IngestionView({
  ingestionHistory,
  onRecordIngestion,
  audioJobs,
  onAddAudioJob,
  isPandaScoreConnected,
  isPandaScoreStale,
  onTogglePandaScore,
}: IngestionViewProps) {
  // CSV Import State
  const [csvText, setCsvText] = useState(
    `match_id,tournament_id,match_date,tier,map_name,player_handle,team_id,role,kills,deaths,assists,adr,kpr,rounds_played,won
m-101,pgl-major,2026-10-23T18:00:00Z,Tier 1,de_mirage,siuhy,team-mouz,IGL,19,14,6,79.5,0.73,26,1
m-102,pgl-major,2026-10-23T18:00:00Z,Tier 1,de_mirage,aleksib,team-navi,IGL,15,18,5,69.0,0.57,26,0
m-103,regional-qual,2026-10-24T12:00:00Z,Tier 2,de_nuke,neok,team-ence-academy,IGL,23,13,8,84.1,0.82,28,1
m-invalid,unknown-cup,bad_date,Tier 4,invalid_map,bad_player,team-none,UNKNOWN,-5,999,0,0,0,0,0`
  );

  // Audio Upload State
  const [selectedPlayerHandle, setSelectedPlayerHandle] = useState('siuhy');
  const [audioFileName, setAudioFileName] = useState('mouz_tactical_scrim_comms.wav');
  const [consentSigned, setConsentSigned] = useState(true);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  // Run CSV Validation & Ingestion
  const handleIngestCsv = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) return;

    let accepted = 0;
    let rejected = 0;
    const rejectionReasons: { rowNumber: number; reason: string }[] = [];
    const affectedPlayers = new Set<string>();

    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(',');
      const rowNum = idx + 2;

      if (parts.length < 10) {
        rejected++;
        rejectionReasons.push({ rowNumber: rowNum, reason: 'Malformed row: missing required columns.' });
        return;
      }

      const [mId, tId, mDate, tier, mapName, handle, teamId, role, killsStr, deathsStr] = parts;
      const kills = Number(killsStr);
      const deaths = Number(deathsStr);

      if (isNaN(kills) || kills < 0 || isNaN(deaths) || deaths > 150) {
        rejected++;
        rejectionReasons.push({ rowNumber: rowNum, reason: `Invalid numerical stat range (kills=${killsStr}, deaths=${deathsStr}).` });
        return;
      }

      if (isNaN(Date.parse(mDate))) {
        rejected++;
        rejectionReasons.push({ rowNumber: rowNum, reason: `Unparseable ISO timestamp: '${mDate}'.` });
        return;
      }

      accepted++;
      affectedPlayers.add(handle);
    });

    onRecordIngestion({
      source: 'CSV Manual Ingestion Feed',
      totalRows: lines.length - 1,
      acceptedRows: accepted,
      rejectedRows: rejected,
      rejectionReasons,
      affectedPlayers: Array.from(affectedPlayers),
      sourceFreshness: new Date().toISOString(),
      isStale: false,
      isSimulated: true,
      importedAt: new Date().toISOString(),
    });
  };

  // Run Consented Audio Job Upload
  const handleUploadAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentSigned) return;

    setIsProcessingAudio(true);
    setTimeout(() => {
      onAddAudioJob({
        playerId: selectedPlayerHandle === 'siuhy' ? 'p-siuhy' : 'p-gem-neok',
        playerHandle: selectedPlayerHandle,
        fileName: audioFileName,
        fileSizeBytes: 12500000,
        consentSigned: true,
        status: 'complete',
        completedAt: new Date().toISOString(),
        modelVersion: 'whisper-small-esports-v1.4',
        overallClarityScore: 89,
        averageConfidence: 0.91,
        humanReviewRequired: false,
        transcriptSegments: [
          {
            timestampStart: '00:05',
            timestampEnd: '00:11',
            speaker: selectedPlayerHandle,
            text: 'Drop smoke CT and execute fast A-site. Watch out for enemy sniper on catwalk.',
            confidence: 0.95,
            tacticalCalloutTags: ['smoke CT', 'execute A', 'catwalk'],
            needsHumanReview: false,
          },
          {
            timestampStart: '00:25',
            timestampEnd: '00:32',
            speaker: selectedPlayerHandle,
            text: 'One low in pit. Trade immediately, plant for stairs.',
            confidence: 0.93,
            tacticalCalloutTags: ['pit', 'trade', 'stairs'],
            needsHumanReview: false,
          },
        ],
      });
      setIsProcessingAudio(false);
    }, 1000);
  };

  return (
    <div className="bg-[#0b0b0c] text-[#ededed] p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26262a]">
        <div>
          <h1 className="text-[18px] font-bold text-[#ededed]">
            Data pipeline and comms review
          </h1>
          <p className="text-[12px] text-[#9a9aa2] mt-0.5">
            PandaScore ingestion feed, match CSV validation, and consented tactical audio review.
          </p>
        </div>

        {/* PandaScore Simulator Toggle */}
        <button
          type="button"
          onClick={onTogglePandaScore}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#26262a] bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed] text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-[#9a9aa2]" style={{ strokeWidth: 1.5 }} />
          <span>{isPandaScoreConnected ? 'Simulate live feed disconnect' : 'Restore live feed'}</span>
        </button>
      </div>

      {/* Architectural Guarantee Note */}
      <div className="p-3 bg-[#131315] border border-[#26262a] rounded-[6px] space-y-1 text-[12px]">
        <div className="flex items-center gap-2 text-[#ededed] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#9a9aa2]" style={{ strokeWidth: 1.5 }} />
          <span>Independent subsystem architecture</span>
        </div>
        <p className="text-[#9a9aa2] leading-relaxed">
          The audio review queue does not block statistical rankings. In the event of audio delay, candidates rely on objective performance metrics. Transcripts provide audit context and do not alter numerical player ratings.
        </p>
      </div>

      {/* Grid: CSV Ingest on Left, Audio Pipeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* CSV Ingestion & Validation */}
        <div className="border border-[#26262a] rounded-[6px] bg-[#131315] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
            <h2 className="text-[14px] font-bold text-[#ededed]">
              CSV and match records ingestion
            </h2>
            <span className="text-[12px] font-mono text-[#9a9aa2]">Schema v1.0.0</span>
          </div>

          <div>
            <label className="block text-[12px] text-[#9a9aa2] mb-1">
              Match stream / CSV payload
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full bg-[#0b0b0c] border border-[#26262a] rounded-[6px] p-2.5 text-[12px] font-mono text-[#ededed] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleIngestCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[#26262a] bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed] text-[13px] font-medium transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
              <span>Validate and ingest records</span>
            </button>
          </div>

          {/* Validation History Report */}
          <div className="pt-3 border-t border-[#26262a] space-y-2">
            <span className="text-[12px] font-normal text-[#9a9aa2] block">
              Recent validation reports:
            </span>
            {ingestionHistory.map((report, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0b0b0c] border border-[#26262a] rounded-[4px] space-y-1.5 text-[12px] font-mono"
              >
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#ededed] font-medium">{report.source}</span>
                  <span className="text-[#9a9aa2] text-[11px]">
                    {new Date(report.importedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-[#4ade80]">
                    Accepted: {report.acceptedRows}
                  </span>
                  <span className={report.rejectedRows > 0 ? 'text-[#f87171]' : 'text-[#9a9aa2]'}>
                    Rejected: {report.rejectedRows}
                  </span>
                  <span className="text-[#9a9aa2]">
                    Players: {report.affectedPlayers.join(', ')}
                  </span>
                </div>
                {report.rejectionReasons.length > 0 && (
                  <div className="p-2 bg-[#131315] rounded border border-[#26262a] text-[11px] text-[#f87171] space-y-0.5">
                    <span className="font-medium">Rejection details:</span>
                    {report.rejectionReasons.map((r, rIdx) => (
                      <p key={rIdx}>
                        Row {r.rowNumber}: {r.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Consented Audio Review */}
        <div className="border border-[#26262a] rounded-[6px] bg-[#131315] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
            <h2 className="text-[14px] font-bold text-[#ededed]">
              Consented voice comms review
            </h2>
            <span className="text-[12px] font-mono text-[#9a9aa2]">Whisper model</span>
          </div>

          <form onSubmit={handleUploadAudio} className="space-y-3 text-[13px]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-[#9a9aa2] mb-1">
                  Candidate handle
                </label>
                <select
                  value={selectedPlayerHandle}
                  onChange={e => setSelectedPlayerHandle(e.target.value)}
                  className="w-full bg-[#0b0b0c] border border-[#26262a] rounded-[6px] px-2.5 py-1.5 text-[13px] text-[#ededed] focus:outline-none cursor-pointer"
                >
                  <option value="siuhy">siuhy (MOUZ)</option>
                  <option value="neok">neok (ENCE Academy)</option>
                  <option value="Aleksib">Aleksib (NAVI)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] text-[#9a9aa2] mb-1">
                  Audio file (.wav / .mp3)
                </label>
                <input
                  type="text"
                  value={audioFileName}
                  onChange={e => setAudioFileName(e.target.value)}
                  className="w-full bg-[#0b0b0c] border border-[#26262a] rounded-[6px] px-2.5 py-1.5 text-[13px] font-mono text-[#ededed] focus:outline-none"
                />
              </div>
            </div>

            {/* Consent Verification */}
            <div className="p-3 bg-[#0b0b0c] border border-[#26262a] rounded-[4px] flex items-start gap-2.5">
              <input
                type="checkbox"
                id="consentCheck"
                checked={consentSigned}
                onChange={e => setConsentSigned(e.target.checked)}
                className="mt-0.5 accent-[#e8ff59] cursor-pointer"
                required
              />
              <label htmlFor="consentCheck" className="text-[12px] text-[#9a9aa2] cursor-pointer leading-relaxed">
                <span className="text-[#ededed] font-medium">Consent and privacy:</span> I confirm explicit written player authorization and team consent for competitive voice transcription.
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!consentSigned || isProcessingAudio}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[#26262a] bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed] text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
                <span>{isProcessingAudio ? 'Transcribing audio...' : 'Queue audio job'}</span>
              </button>
            </div>
          </form>

          {/* Audio Jobs Feed */}
          <div className="pt-3 border-t border-[#26262a] space-y-2">
            <span className="text-[12px] font-normal text-[#9a9aa2] block">
              Audio queue ({audioJobs.length})
            </span>
            {audioJobs.map(job => (
              <div
                key={job.id}
                className="p-3 bg-[#0b0b0c] border border-[#26262a] rounded-[4px] space-y-2 text-[12px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#ededed]">{job.playerHandle}</span>
                    <span className="text-[11px] text-[#9a9aa2] font-mono">
                      {job.status}
                    </span>
                    {job.humanReviewRequired && (
                      <span className="text-[11px] text-[#f87171] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#9a9aa2]">
                    {(job.averageConfidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {job.transcriptSegments.map((seg, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded-[4px] border border-[#26262a] bg-[#131315] text-[12px] font-mono leading-relaxed"
                    >
                      <div className="flex justify-between text-[11px] text-[#9a9aa2] mb-1 font-sans">
                        <span>[{seg.timestampStart} - {seg.timestampEnd}] {seg.speaker}</span>
                        <span>{(seg.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="font-sans text-[12px] text-[#ededed]">"{seg.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
