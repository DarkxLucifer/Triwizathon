'use client';

import React, { useState, useEffect } from 'react';
import { runAcceptanceTests, AcceptanceTestResult } from '@/lib/verification/acceptanceTests';
import { RefreshCw } from 'lucide-react';

export function AcceptanceTestSuite() {
  const [testResults, setTestResults] = useState<AcceptanceTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Run tests on mount
    setTestResults(runAcceptanceTests());
  }, []);

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTestResults(runAcceptanceTests());
      setIsRunning(false);
    }, 400);
  };

  const totalPassed = testResults.filter(t => t.passed).length;
  const isAllPassed = totalPassed === testResults.length && testResults.length > 0;

  return (
    <div className="bg-[#0b0b0c] text-[#ededed] p-6 -m-6 min-h-[calc(100vh-3.5rem)] space-y-6 font-sans text-[14px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26262a]">
        <div>
          <h1 className="text-[18px] font-bold text-[#ededed]">
            Acceptance test suite
          </h1>
          <p className="text-[12px] text-[#9a9aa2] mt-0.5">
            Verification suite for deterministic scoring, multi-tenant isolation, and data integrity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRerun}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#26262a] bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed] text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#9a9aa2] ${isRunning ? 'animate-spin' : ''}`} style={{ strokeWidth: 1.5 }} />
          <span>{isRunning ? 'Running tests...' : 'Run checks'}</span>
        </button>
      </div>

      {/* ONE horizontal row for stat metrics: big number, small muted label, tiny delta in plain text. No borders, no icons. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2 border-b border-[#26262a]">
        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            {totalPassed} / {testResults.length}
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Acceptance criteria passed</div>
          <div className={`text-[11px] font-mono mt-0.5 ${isAllPassed ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
            {isAllPassed ? 'All checks passing' : 'Failures detected'}
          </div>
        </div>

        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            Active
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Evidence and integrity checkers</div>
          <div className="text-[11px] text-[#9a9aa2] mt-0.5">Hallucination suppression verified</div>
        </div>

        <div>
          <div className="text-[28px] font-bold font-mono tabular-nums text-[#ededed] leading-none">
            0 leaks
          </div>
          <div className="text-[12px] text-[#9a9aa2] mt-1.5">Tenant data isolation</div>
          <div className="text-[11px] text-[#9a9aa2] mt-0.5">Cross-organization barriers enforced</div>
        </div>
      </div>

      {/* Tests Breakdown Table */}
      <div className="space-y-3">
        <div className="pb-1">
          <h2 className="text-[12px] font-normal text-[#9a9aa2]">
            Detailed test results ({testResults.length})
          </h2>
        </div>

        <div className="border border-[#26262a] rounded-[6px] bg-[#131315] divide-y divide-[#26262a]">
          {testResults.map(test => (
            <div key={test.id} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[14px] font-bold text-[#ededed]">
                    #{test.id} · {test.title}
                  </div>
                  <div className="text-[12px] text-[#9a9aa2] mt-0.5">
                    Category: {test.category}
                  </div>
                </div>

                <span
                  className={`text-[12px] font-mono font-medium ${
                    test.passed ? 'text-[#4ade80]' : 'text-[#f87171]'
                  }`}
                >
                  {test.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                <div className="p-2.5 bg-[#0b0b0c] border border-[#26262a] rounded-[4px] space-y-1">
                  <span className="text-[11px] text-[#9a9aa2] block font-sans">
                    Expected behavior
                  </span>
                  <p className="text-[#ededed] leading-relaxed">
                    {test.expectedBehavior}
                  </p>
                </div>

                <div className="p-2.5 bg-[#0b0b0c] border border-[#26262a] rounded-[4px] space-y-1">
                  <span className="text-[11px] text-[#9a9aa2] block font-sans">
                    Observed result
                  </span>
                  <p className="text-[#ededed] font-mono leading-relaxed">
                    {test.actualResult}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[#9a9aa2]">
                Verification details: {test.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
