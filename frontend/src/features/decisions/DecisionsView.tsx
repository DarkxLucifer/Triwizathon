'use client';

import React, { useState } from 'react';
import { DecisionLog, DecisionAction } from '@/types';
import { Card, Badge, Button } from '@/components/ui/Card';
import {
  History,
  ShieldCheck,
  Search,
  CheckCircle2,
  Eye,
  XCircle,
  FileCheck,
  Clock,
  MessageSquare,
  Edit3,
} from 'lucide-react';

interface DecisionsViewProps {
  decisions: DecisionLog[];
  onUpdateFeedback: (decisionId: string, feedback: string) => void;
  onNavigate: (screen: any) => void;
}

export function DecisionsView({
  decisions,
  onUpdateFeedback,
  onNavigate,
}: DecisionsViewProps) {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  const filteredDecisions = decisions.filter(d => {
    const matchesAction = filterAction === 'all' || d.action === filterAction;
    const matchesSearch =
      d.playerHandle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.briefTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.rationale.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: DecisionAction) => {
    switch (action) {
      case 'trial':
        return <Badge variant="emerald"><FileCheck className="w-3 h-3" /> Scrim Trial</Badge>;
      case 'advance':
        return <Badge variant="cyan"><CheckCircle2 className="w-3 h-3" /> Advance to Contract</Badge>;
      case 'watch':
        return <Badge variant="purple"><Eye className="w-3 h-3" /> Watchlist</Badge>;
      case 'reject':
        return <Badge variant="rose"><XCircle className="w-3 h-3" /> Rejected</Badge>;
    }
  };

  const handleSaveFeedback = (id: string) => {
    onUpdateFeedback(id, feedbackInput);
    setEditingId(null);
    setFeedbackInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan">Human-in-the-Loop Audit Trail</Badge>
            <span className="text-xs text-slate-400 font-mono">
              100% Decision Logging Rate
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Strategic Decision History & Outcome Feedback
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of analyst decisions, written rationales, formula versions, and subsequent post-trial outcomes.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search handle, brief, rationale..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="trial">Trial Only</option>
            <option value="watch">Watchlist Only</option>
            <option value="advance">Advance Only</option>
            <option value="reject">Reject Only</option>
          </select>
        </div>
      </div>

      {/* Decisions Feed */}
      {filteredDecisions.length === 0 ? (
        <Card className="py-16 text-center space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No decisions match the filter</h3>
          <p className="text-xs text-slate-500">
            Log decisions from the Candidate Recommendations screen to start building the historical evidence moat.
          </p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('recommendations')}>
            Go to Candidate Shortlist
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.map(decision => {
            const isEditing = editingId === decision.id;

            return (
              <Card key={decision.id} className="space-y-3 border-slate-800">
                {/* Decision Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    {getActionBadge(decision.action)}
                    <h3 className="text-base font-bold text-slate-100">
                      {decision.playerHandle}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      (Brief: {decision.briefTitle})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(decision.timestamp).toLocaleString()}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      FitScore: {decision.fitScore}
                    </span>
                  </div>
                </div>

                {/* Stored Rationale */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">
                    Recorded Strategic Rationale:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    "{decision.rationale}"
                  </p>
                </div>

                {/* Meta details: User, Formula Version */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 pt-1">
                  <span>Signed by: <strong className="text-slate-400">{decision.userEmail}</strong></span>
                  <span>Formula Version: <strong className="text-cyan-400">{decision.formulaVersion}</strong></span>
                </div>

                {/* Post-Trial Outcome Learning Loop (PRD Section 10) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      Post-Decision Outcome Feedback:
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(decision.id);
                          setFeedbackInput(decision.outcomeFeedback || '');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {decision.outcomeFeedback ? 'Update Outcome' : 'Add Outcome'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={feedbackInput}
                        onChange={e => setFeedbackInput(e.target.value)}
                        placeholder="e.g. Trial completed: signed 1-year contract; or Passed to academy..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveFeedback(decision.id)}
                        >
                          Save Feedback
                        </Button>
                      </div>
                    </div>
                  ) : decision.outcomeFeedback ? (
                    <p className="text-xs text-emerald-400/90 font-mono mt-1 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                      ✓ {decision.outcomeFeedback}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      Pending trial execution. Outcome data will feed into the offline calibration loop.
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
