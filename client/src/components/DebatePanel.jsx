import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Swords, Check, Gavel, FileSearch, Target, Search, AlertCircle, Copy, BookMarked, RefreshCw, Loader2, Play } from 'lucide-react';
import api from '../services/api.js';

const getMarkdownText = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    const text = content.text || content.argument || content.counterArgument || content.evidence || content.evidence_analysis || content.content || content.finalVerdict;
    if (text && typeof text === 'string') return text;
    
    const stringValues = Object.values(content).filter(v => typeof v === 'string');
    if (stringValues.length > 0) return stringValues.join('\n\n');
    return '';
  }
  return String(content);
};

const DebatePanel = ({ workspaceId, results, onSaveInsight, initialFinding }) => {
  const findings = results?.keyFindings || [];
  
  const [selectedFinding, setSelectedFinding] = useState(initialFinding || '');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState('idle'); // idle, pro, counter, evidence, judge, completed
  
  const [proArgument, setProArgument] = useState('');
  const [counterArgument, setCounterArgument] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [verdict, setVerdict] = useState(null);
  
  const [error, setError] = useState('');

  const startDebate = async () => {
    if (!selectedFinding) return;
    
    setRunning(true);
    setStage('pro');
    setError('');
    setProArgument('');
    setCounterArgument('');
    setEvidenceText('');
    setVerdict(null);

    try {
      // PRO
      const proRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'pro' });
      const proText = proRes.data.data;
      setProArgument(proText);
      setStage('counter');

      // COUNTER
      const counterRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'counter', proArgument: proText });
      const counterText = counterRes.data.data;
      setCounterArgument(counterText);
      setStage('evidence');

      // EVIDENCE
      const evRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'evidence', proArgument: proText, counterArgument: counterText });
      const evText = evRes.data.data;
      setEvidenceText(evText);
      setStage('judge');

      // JUDGE
      const judgeRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'judge', proArgument: proText, counterArgument: counterText, evidenceText: evText });
      setVerdict(judgeRes.data.data);
      setStage('completed');

    } catch (err) {
      console.error(err);
      setError('Debate encountered an error. Please try again.');
      setStage('idle');
    } finally {
      setRunning(false);
    }
  };

  const resetDebate = () => {
    setStage('idle');
    setProArgument('');
    setCounterArgument('');
    setEvidenceText('');
    setVerdict(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderVerdictBadge = (type) => {
    const types = {
      'Strongly Supported': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      'Supported': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'Partially Supported': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      'Weakly Supported': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      'Insufficient Evidence': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    const c = types[type] || types['Insufficient Evidence'];
    return <span className={"px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border " + c}>{type}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* SETUP PANEL */}
      {stage === 'idle' && (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-6 h-6 text-gray-900 dark:text-white" />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Research Debate Mode</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a finding to trigger an evidence-backed multi-agent debate.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Finding to Debate</label>
              <select 
                value={selectedFinding}
                onChange={(e) => setSelectedFinding(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              >
                <option value="">-- Choose a finding from this workspace --</option>
                {findings.map((f, i) => (
                  <option key={i} value={f}>{f}</option>
                ))}
              </select>
            </div>
            
            {error && <div className="text-sm text-red-500">{error}</div>}

            <button 
              onClick={startDebate}
              disabled={!selectedFinding}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" /> Start AI Debate
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE DEBATE / RESULTS */}
      {stage !== 'idle' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5" /> Live Debate
            </h2>
            {stage === 'completed' && (
              <button onClick={resetDebate} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Run Another Debate
              </button>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-[#111111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 font-medium italic shadow-sm">
            "{selectedFinding}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PRO */}
            <div className={"bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-opacity duration-500 " + (!proArgument && stage !== 'pro' ? 'opacity-50' : 'opacity-100')}>
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Pro Agent
                </h3>
                {stage === 'pro' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none prose-sm">
                {proArgument ? <ReactMarkdown>{getMarkdownText(proArgument)}</ReactMarkdown> : (stage === 'pro' ? 'Formulating argument...' : 'Waiting...')}
              </div>
            </div>

            {/* COUNTER */}
            <div className={"bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-opacity duration-500 " + (!counterArgument && stage !== 'counter' ? 'opacity-50' : 'opacity-100')}>
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" /> Counter Agent
                </h3>
                {stage === 'counter' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none prose-sm">
                {counterArgument ? <ReactMarkdown>{getMarkdownText(counterArgument)}</ReactMarkdown> : (stage === 'counter' ? 'Formulating counterargument...' : 'Waiting...')}
              </div>
            </div>
          </div>

          {/* EVIDENCE CHECK */}
          <div className={"bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-opacity duration-500 " + (!evidenceText && stage !== 'evidence' ? 'opacity-50' : 'opacity-100')}>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" /> Evidence Check
              </h3>
              {stage === 'evidence' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none prose-sm">
              {evidenceText ? <ReactMarkdown>{getMarkdownText(evidenceText)}</ReactMarkdown> : (stage === 'evidence' ? 'Verifying claims against workspace context and live web...' : 'Waiting...')}
            </div>
          </div>

          {/* JUDGE VERDICT */}
          <div className={"bg-white dark:bg-[#111111] border-2 " + (verdict ? 'border-gray-400 dark:border-gray-600' : 'border-gray-200 dark:border-gray-800') + " rounded-xl p-6 shadow-md transition-all duration-500 " + (!verdict && stage !== 'judge' ? 'opacity-50' : 'opacity-100')}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-gray-700 dark:text-gray-300" /> Judge Verdict
              </h3>
              
              {stage === 'judge' && (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</div>
              )}
              {verdict && renderVerdictBadge(verdict.verdictType)}
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-6 prose dark:prose-invert max-w-none prose-sm">
              {verdict ? <ReactMarkdown>{getMarkdownText(verdict.finalVerdict)}</ReactMarkdown> : (stage === 'judge' ? 'Evaluating arguments and evidence...' : 'Waiting...')}
            </div>
            
            {verdict && verdict.keyReasons && (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Key Reasons</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {verdict.keyReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {verdict && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Confidence:</span>
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 dark:bg-gray-300" style={{ width: verdict.confidenceScore + '%' }} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{verdict.confidenceScore}%</span>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => onSaveInsight(verdict.finalVerdict)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <BookMarked className="w-3.5 h-3.5" /> Save Insight
                  </button>
                  <button onClick={() => copyToClipboard(verdict.finalVerdict)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy Result
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default DebatePanel;



