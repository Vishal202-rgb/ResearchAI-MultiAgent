import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Swords, Check, Gavel, FileSearch, Target, Search, AlertCircle, Copy, BookMarked, RefreshCw, Loader2, Play, ChevronDown } from 'lucide-react';
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

const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-sm"
      >
        <span className={`text-sm ${value ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'} truncate mr-4`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search findings..."
                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto p-2 scrollbar-thin">
            {filtered.length === 0 ? (
              <li className="p-4 text-center text-sm text-gray-500 italic">No findings match your search.</li>
            ) : (
              filtered.map((f, i) => (
                <li 
                  key={i} 
                  onClick={() => { onChange(f); setIsOpen(false); setSearch(''); }}
                  className={`p-3 text-sm rounded-lg cursor-pointer transition-colors mb-1 flex items-start gap-3 ${value === f ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'}`}
                >
                  <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${value === f ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {options.indexOf(f) + 1}
                  </span>
                  <span className="line-clamp-2">{f}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
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
      const proRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'pro' });
      const proText = proRes.data.data;
      setProArgument(proText);
      setStage('counter');

      const counterRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'counter', proArgument: proText });
      const counterText = counterRes.data.data;
      setCounterArgument(counterText);
      setStage('evidence');

      const evRes = await api.post(`/research/debate/` + workspaceId, { finding: selectedFinding, stage: 'evidence', proArgument: proText, counterArgument: counterText });
      const evText = evRes.data.data;
      setEvidenceText(evText);
      setStage('judge');

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
      'Strongly Supported': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      'Supported': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'Partially Supported': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      'Weakly Supported': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      'Insufficient Evidence': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    const c = types[type] || types['Insufficient Evidence'];
    return <span className={"px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border " + c}>{type}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      {stage === 'idle' && (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-800/60 pb-6">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <Swords className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Research Debate Mode</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a verified finding to trigger an adversarial AI debate.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Target Finding</label>
              <CustomDropdown 
                options={findings} 
                value={selectedFinding} 
                onChange={setSelectedFinding} 
                placeholder="-- Search and choose a finding from the research report --" 
              />
            </div>
            
            {error && <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</div>}

            <div className="pt-4">
              <button 
                onClick={startDebate}
                disabled={!selectedFinding}
                className="w-full sm:w-auto px-8 flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" /> Initialize Agents
              </button>
            </div>
          </div>
        </div>
      )}

      {stage !== 'idle' && (
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center animate-pulse border border-indigo-100 dark:border-indigo-500/20">
                <Swords className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Live AI Debate</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">Adversarial Verification</p>
              </div>
            </div>
            {stage === 'completed' && (
              <button onClick={resetDebate} className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                <RefreshCw className="w-4 h-4" /> New Debate
              </button>
            )}
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400 dark:bg-indigo-500 rounded-l-2xl"></div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Subject of Debate</h4>
            <p className="text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
              "{selectedFinding}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-[#111] rounded-full items-center justify-center border-4 border-gray-50 dark:border-[#0a0a0a] z-10 text-gray-400">
              <span className="text-xs font-black italic">VS</span>
            </div>

            {/* PRO */}
            <div className={`bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-500 ${!proArgument && stage !== 'pro' ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Pro Agent</h3>
                </div>
                {stage === 'pro' && <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none">
                {proArgument ? <ReactMarkdown>{getMarkdownText(proArgument)}</ReactMarkdown> : (stage === 'pro' ? <span className="animate-pulse text-emerald-600/70 dark:text-emerald-400/70 font-medium">Formulating defense...</span> : 'Waiting...')}
              </div>
            </div>

            {/* COUNTER */}
            <div className={`bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-500 ${!counterArgument && stage !== 'counter' ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                    <Target className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Counter Agent</h3>
                </div>
                {stage === 'counter' && <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none">
                {counterArgument ? <ReactMarkdown>{getMarkdownText(counterArgument)}</ReactMarkdown> : (stage === 'counter' ? <span className="animate-pulse text-rose-600/70 dark:text-rose-400/70 font-medium">Formulating counterattack...</span> : 'Waiting...')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EVIDENCE CHECK */}
            <div className={`bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-500 ${!evidenceText && stage !== 'evidence' ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                    <FileSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Evidence Check</h3>
                </div>
                {stage === 'evidence' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none">
                {evidenceText ? <ReactMarkdown>{getMarkdownText(evidenceText)}</ReactMarkdown> : (stage === 'evidence' ? <span className="animate-pulse text-blue-600/70 dark:text-blue-400/70 font-medium">Verifying claims against workspace...</span> : 'Waiting...')}
              </div>
            </div>

            {/* JUDGE VERDICT */}
            <div className={`bg-gray-900 dark:bg-white rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-500 ${!verdict && stage !== 'judge' ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-800 dark:border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 dark:bg-gray-100 flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-white dark:text-gray-900" />
                  </div>
                  <h3 className="text-base font-bold text-white dark:text-gray-900">Final Verdict</h3>
                </div>
                
                {stage === 'judge' && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 font-medium"><Loader2 className="w-4 h-4 animate-spin" /> Adjudicating...</div>
                )}
                {verdict && renderVerdictBadge(verdict.verdictType)}
              </div>

              <div className="text-sm text-gray-300 dark:text-gray-700 whitespace-pre-wrap leading-relaxed mb-8 prose prose-invert dark:prose max-w-none">
                {verdict ? <ReactMarkdown>{getMarkdownText(verdict.finalVerdict)}</ReactMarkdown> : (stage === 'judge' ? <span className="animate-pulse text-gray-400 font-medium">Evaluating arguments and evidence...</span> : <span className="text-gray-600 dark:text-gray-400">Waiting...</span>)}
              </div>
              
              {verdict && verdict.keyReasons && (
                <div className="bg-gray-800/50 dark:bg-gray-50 rounded-2xl p-5 mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Key Determining Factors</h4>
                  <ul className="list-disc pl-4 space-y-2 text-sm text-gray-300 dark:text-gray-700">
                    {verdict.keyReasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {verdict && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-gray-800 dark:border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">AI Confidence</span>
                    <div className="w-32 h-2.5 bg-gray-800 dark:bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: verdict.confidenceScore + '%' }} />
                    </div>
                    <span className="text-sm font-bold text-white dark:text-gray-900">{verdict.confidenceScore}%</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => onSaveInsight(verdict.finalVerdict)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-gray-900 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                      <BookMarked className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => copyToClipboard(verdict.finalVerdict)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default DebatePanel;