import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Trash2, X, Loader2, Target, HelpCircle, 
  ListChecks, AlertCircle, RefreshCw, Play, CheckCircle2, Circle, 
  LayoutDashboard, FileUp, Network, MessageSquare, Download, Sparkles, Quote, Brain, Activity, Clock
} from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore.js';
import useAuthStore from '../store/authStore.js';
import useResearchStore from '../store/researchStore.js';
import WorkspaceForm from '../components/WorkspaceForm.jsx';
import WorkspaceStats from '../components/WorkspaceStats.jsx';
import Toast from '../components/Toast.jsx';
import Navbar from '../components/Navbar.jsx';

import DocumentPanel from '../components/DocumentPanel.jsx';
import GraphPanel from '../components/GraphPanel.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import ReportPanel from '../components/ReportPanel.jsx';
import TimelinePanel from '../components/TimelinePanel.jsx';
import DeepDive from '../components/DeepDive.jsx';

const statusStyles = {
  draft: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400',
  completed: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400',
  archived: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400',
};

const agentTypeLabels = {
  planner: 'Planner',
  researcher: 'Researcher',
  analyst: 'Analyst',
  fact_checker: 'Fact Checker',
  synthesizer: 'Synthesizer',
};

const Tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'documents', label: 'Documents & RAG', icon: FileUp },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'chat', label: 'Research Chat', icon: MessageSquare },
  { id: 'report', label: 'Final Report', icon: Download },
];

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace, loading: wsLoading, fetchWorkspace, updateWorkspace, deleteWorkspace, clearCurrentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  
  const { 
    plan, run, runs, results, sources,
    generating, running, 
    generatePlan, fetchPlan, startRun, fetchRun, fetchResults, clearResearch 
  } = useResearchStore();
  
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Clear out stale state if we are loading a different workspace
    if (currentWorkspace && currentWorkspace._id !== id) {
      clearCurrentWorkspace();
      clearResearch();
    }

    let isMounted = true;
    const loadData = async () => {
      await fetchWorkspace(id);
      if (!isMounted) return;
      
      const planRes = await fetchPlan(id);
      if (!isMounted) return;
      
      if (planRes.success && planRes.plan) {
        const runRes = await fetchRun(id);
        if (!isMounted) return;
        
        if (runRes.success && runRes.run?.status === 'completed') {
          fetchResults(id);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      // Intentionally NOT clearing store state here to avoid race conditions with React StrictMode / Fast Navigation
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let interval;
    if (run?.status === 'running' || running) {
      interval = setInterval(async () => {
        const res = await fetchRun(id);
        if (res.run?.status === 'completed' || res.run?.status === 'failed') {
          clearInterval(interval);
          if (res.run?.status === 'completed') {
            fetchResults(id);
            setToast({ message: 'Research completed successfully!', type: 'success' });
          } else {
            setToast({ message: 'Research run failed', type: 'error' });
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status, running, id]);

  const handleGeneratePlan = async () => {
    const result = await generatePlan(id);
    if (result.success) setToast({ message: 'Research plan generated successfully!', type: 'success' });
    else setToast({ message: result.message, type: 'error' });
  };

  const handleExecuteResearch = async () => {
    const result = await startRun(id);
    if (result.success) setToast({ message: 'Research engine started!', type: 'success' });
    else setToast({ message: result.message, type: 'error' });
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    const result = await updateWorkspace(id, formData);
    setSubmitting(false);
    if (result.success) { setToast({ message: 'Workspace updated!', type: 'success' }); setEditing(false); }
    else setToast({ message: result.message, type: 'error' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;
    const result = await deleteWorkspace(id);
    if (result.success) navigate('/workspaces');
    else setToast({ message: result.message, type: 'error' });
  };

  const isInvalidOrStale = !currentWorkspace || currentWorkspace._id !== id;

  if (wsLoading && isInvalidOrStale) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  );

  if (!wsLoading && isInvalidOrStale) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Workspace not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Deleted or no access.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workspaces
        </Link>
      </div>
    </div>
  );

  const workspace = currentWorkspace;
  const hasPlan = plan && plan.status === 'completed';
  const isRunning = run && run.status === 'running';
  const hasResults = results && run?.status === 'completed';

  return (
    <div className="min-h-screen flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workspaces
        </Link>

        {editing ? (
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Workspace</h2>
              <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <WorkspaceForm initialData={workspace} onSubmit={handleUpdate} submitting={submitting} submitLabel="Save Changes" />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">{workspace.title}</h1>
                  <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border shrink-0 ${statusStyles[workspace.status] || statusStyles.draft}`}>
                    {workspace.status}
                  </span>
                </div>
                {workspace.researchDomain && <p className="text-sm text-gray-500 dark:text-gray-400">{workspace.researchDomain}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-[#111] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-gray-200 hover:bg-red-50 dark:bg-[#111] dark:text-red-400 dark:border-gray-800 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
            {workspace.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-0">{workspace.description}</p>}
          </div>
        )}

        <div className="mb-8">
          <WorkspaceStats stats={{ 
            documents: sources ? sources.filter(s => s.url && s.url.startsWith('http')).length : 0, 
            sources: sources ? sources.filter(s => s.url && s.url.startsWith('http')).length : 0, 
            findings: results?.keyFindings?.length || 0, 
            researchRuns: runs?.length || (hasPlan ? 1 : 0) 
          }} />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto scrollbar-hide">
          {Tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                ? 'border-black text-black dark:border-white dark:text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'documents' && <DocumentPanel workspaceId={id} />}
          {activeTab === 'graph' && <GraphPanel workspaceId={id} />}
          {activeTab === 'chat' && <ChatPanel workspaceId={id} />}
          {activeTab === 'report' && <ReportPanel workspaceId={id} />}
          {activeTab === 'timeline' && <TimelinePanel sources={sources} />}
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Actions */}
              {!hasPlan && !generating && (
                <button onClick={handleGeneratePlan} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-lg shadow-sm transition-colors">
                  <Brain className="w-4 h-4" /> Generate Research Plan
                </button>
              )}
              {generating && (
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center shadow-sm">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI Planner Working...</h3>
                </div>
              )}
              {hasPlan && !isRunning && !hasResults && (
                <button onClick={handleExecuteResearch} className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-sm font-medium rounded-lg shadow-sm transition-colors">
                  <Play className="w-4 h-4 fill-current" /> Execute Multi-Agent Research
                </button>
              )}

              {/* Running Status */}
              {isRunning && run && (
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800">
                    <div className="h-full bg-black dark:bg-white animate-pulse w-full"></div>
                  </div>
                  <div className="flex items-center gap-3 mb-6 mt-2">
                    <Activity className="w-5 h-5 text-gray-900 dark:text-white" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Research in progress...</h2>
                  </div>
                  <div className="space-y-3">
                    {run.agentStatuses?.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800/50">
                        {s.status === 'completed' && <CheckCircle2 className="text-emerald-500 w-4 h-4" />}
                        {s.status === 'running' && <Loader2 className="text-gray-900 dark:text-white animate-spin w-4 h-4" />}
                        {s.status === 'pending' && <Circle className="text-gray-400 w-4 h-4" />}
                        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-200">{agentTypeLabels[s.agent] || s.agent}</span>
                        <span className="text-xs text-gray-500 capitalize">{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              {hasResults && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Detailed Research Report
                    </h2>
                    <button onClick={handleExecuteResearch} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Run Again
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Executive Summary</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{results.summary}</p>
                  </div>

                  {results.keyFindings && results.keyFindings.length > 0 && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Key Findings</h3>
                      <ul className="space-y-6">
                        {results.keyFindings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                            <div className="flex-1">
                              <span className="leading-relaxed block">{finding}</span>
                              <DeepDive workspaceId={id} finding={finding} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.rawAnalysis && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Detailed Analysis</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{results.rawAnalysis}</p>
                    </div>
                  )}

                  {results.claims && results.claims.length > 0 && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Fact-Checked Evidence</h3>
                      <div className="grid gap-3">
                        {results.claims.map((c, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800/50">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className="text-gray-900 dark:text-gray-200 text-sm font-medium leading-snug">{c.claim}</p>
                              <span className="px-2 py-0.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] text-[10px] uppercase font-semibold rounded text-gray-500 shrink-0">
                                {c.status.replace('_', ' ')} ({(c.confidence*100).toFixed(0)}%)
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <Quote className="w-3 h-3 shrink-0 mt-0.5 opacity-60" />
                              <p className="leading-relaxed">{c.evidence}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {sources && (
                    sources.filter(s => s.url && s.url.startsWith('http')).length > 0 ? (
                      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Web Sources / References</h3>
                        <div className="space-y-4">
                          {sources.filter(s => s.url && s.url.startsWith('http')).map((s, i) => (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800/50 transition-colors">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-1 mb-1">{s.title}</h4>
                              <p className="text-xs text-gray-500 mb-2 truncate">{s.publisher} • {s.url}</p>
                              {s.snippet && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 border-l-2 border-gray-300 dark:border-gray-700 pl-2 ml-1">{s.snippet}</p>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Web Sources / References</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No web sources were found or retrieved for this research run.</p>
                      </div>
                    )
                  )}

                  {run && run.status === 'completed' && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Research Metadata</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">Status</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Completed</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">Completion Date</span>
                          <span className="text-gray-900 dark:text-gray-200">{new Date(run.completedAt || run.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">Duration</span>
                          <span className="text-gray-900 dark:text-gray-200">
                            {run.startedAt && run.completedAt 
                              ? `${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)} seconds` 
                              : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">Sources Analyzed</span>
                          <span className="text-gray-900 dark:text-gray-200">{sources ? sources.filter(s => s.url && s.url.startsWith('http')).length : 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceDetails;
