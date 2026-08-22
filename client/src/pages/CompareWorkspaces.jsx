import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Loader2, RefreshCw, AlertCircle, Sparkles, Search, Check, ChevronDown, Info } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore.js';
import Navbar from '../components/Navbar.jsx';

const DEMO_COMPARISON = {
  ws1Title: "Generative AI in Software Development",
  ws2Title: "AI Applications in Healthcare",
  comparison: {
    similarities: [
      "Both domains show significant productivity gains and workflow automation.",
      "High reliance on robust data privacy and security measures.",
      "Integration of AI requires upskilling of the current workforce."
    ],
    differences: [
      "Software engineering AI focuses on code generation and bug detection, whereas healthcare AI focuses on diagnostics and patient care.",
      "Healthcare AI faces much stricter regulatory compliance (HIPAA, FDA) compared to software development.",
      "Software AI is primarily text-to-text, while healthcare heavily utilizes computer vision (medical imaging)."
    ],
    conflictingFindings: [
      "While software engineering reports immediate ROI from AI tools (like Copilot), healthcare reports slower, long-term ROI due to rigorous clinical trials and integration hurdles."
    ],
    conclusion: "Although Generative AI is transforming both software development and healthcare by automating routine tasks, the pace and focus of adoption differ drastically. Software engineering rapidly integrates AI for direct productivity boosts in coding, facing minimal regulatory friction. In contrast, healthcare adopts AI cautiously, prioritizing diagnostic accuracy, patient safety, and strict regulatory compliance, leading to a slower but highly impactful transformation."
  }
};

const ComparisonReport = ({ result, isDemo }) => (
  <div className={`space-y-6 animate-in fade-in ${isDemo ? 'opacity-90' : ''}`}>
    {isDemo && (
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 mb-8 shadow-sm">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          <strong>Demo Comparison:</strong> You need at least two completed research workspaces to run a real comparison. 
          Below is a static example of how ResearchAI synthesizes findings across different topics.
        </p>
      </div>
    )}

    {isDemo && (
      <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 text-center md:text-left shadow-sm">
        <div className="flex-1 font-semibold text-gray-900 dark:text-white">{result.ws1Title}</div>
        <div className="text-xs font-bold text-gray-400 bg-white dark:bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">VS</div>
        <div className="flex-1 font-semibold text-gray-900 dark:text-white">{result.ws2Title}</div>
      </div>
    )}

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-[#111111] border border-green-200 dark:border-green-900/30 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Similarities
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {(result.comparison.similarities || []).map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div className="bg-white dark:bg-[#111111] border border-amber-200 dark:border-amber-900/30 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
          <GitCompare className="w-4 h-4" /> Differences
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {(result.comparison.differences || []).map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    </div>

    {result.comparison.conflictingFindings && result.comparison.conflictingFindings.length > 0 && (
      <div className="bg-white dark:bg-[#111111] border border-red-200 dark:border-red-900/30 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Conflicting Findings
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {result.comparison.conflictingFindings.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>
    )}

    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Synthesis & Conclusion</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {result.comparison.conclusion}
      </p>
    </div>
  </div>
);

const WorkspaceCombobox = ({ label, value, onChange, workspaces, disabledId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      const selectedWs = workspaces.find(w => w._id === value);
      if (selectedWs) setSearch(selectedWs.title);
    } else {
      setSearch('');
    }
  }, [value, workspaces]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (value) {
          const selectedWs = workspaces.find(w => w._id === value);
          if (selectedWs && search !== selectedWs.title) setSearch(selectedWs.title);
        } else {
          setSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef, value, workspaces, search]);

  const filtered = workspaces.filter(w => 
    w._id !== disabledId && 
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 w-full relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (value) onChange('');
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search workspaces..."
          className="w-full bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all shadow-sm"
        />
        <button 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map(w => (
                <li 
                  key={w._id}
                  onClick={() => {
                    onChange(w._id);
                    setSearch(w.title);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <span className="truncate pr-4">{w.title}</span>
                  {value === w._id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No matching workspace found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompareWorkspaces = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [ws1, setWs1] = useState('');
  const [ws2, setWs2] = useState('');
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCompare = async () => {
    if (!ws1 || !ws2 || ws1 === ws2) {
      setError('Please select two different workspaces.');
      return;
    }
    setError('');
    setComparing(true);
    setResult(null);

    try {
      const { api } = await import('../services/api.js');
      const res = await (await import('../services/api.js')).default.get(`/reports/compare?ws1=${ws1}&ws2=${ws2}`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare workspaces. Ensure both have completed research runs.');
    } finally {
      setComparing(false);
    }
  };

  const completedWorkspaces = workspaces.filter(w => w.status === 'completed' || w.status === 'active');
  const showDemo = completedWorkspaces.length < 2 && !result;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-6">
            <GitCompare className="w-5 h-5 text-gray-500" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Compare Workspaces</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <WorkspaceCombobox 
              label="Workspace 1"
              value={ws1}
              onChange={setWs1}
              workspaces={completedWorkspaces}
              disabledId={ws2}
            />
            <div className="text-gray-400 font-medium md:mt-6 hidden md:block">VS</div>
            <WorkspaceCombobox 
              label="Workspace 2"
              value={ws2}
              onChange={setWs2}
              workspaces={completedWorkspaces}
              disabledId={ws1}
            />
          </div>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <button
            onClick={handleCompare}
            disabled={comparing || !ws1 || !ws2}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            {comparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {comparing ? 'Analyzing...' : 'Run Comparison'}
          </button>
        </div>

        {result && <ComparisonReport result={result} isDemo={false} />}
        {showDemo && <ComparisonReport result={DEMO_COMPARISON} isDemo={true} />}
      </main>
    </div>
  );
};

export default CompareWorkspaces;