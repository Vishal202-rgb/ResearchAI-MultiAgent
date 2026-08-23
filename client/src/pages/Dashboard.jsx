import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Brain, FileText, ArrowRight, Loader2, Sparkles, Target, Zap, Bot, Database, BarChart3, Clock, MessageSquare, ShieldCheck, ChevronRight, X, LayoutDashboard, Compass, Trash2 } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore.js';
import useAuthStore from '../store/authStore.js';
import WorkspaceForm from '../components/WorkspaceForm.jsx';
import Navbar from '../components/Navbar.jsx';
import Toast from '../components/Toast.jsx';
import { DemoWorkspaces } from '../components/DemoWorkspaces.jsx';
import api from '../services/api.js';

const statusStyles = {
  draft: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400',
  completed: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400',
  archived: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400',
};

const CAPABILITIES = [
  { id: 'web', icon: Search, title: 'Real Web Search', desc: 'Live Tavily integration for up-to-date verifiable sources.', detail: 'Unlike standard LLMs with knowledge cutoffs, this platform actively searches the web to find the most recent, relevant sources, complete with verifiable URLs.' },
  { id: 'rag', icon: FileText, title: 'RAG Documents', desc: 'Upload PDFs and TXTs to inject proprietary knowledge.', detail: 'Securely upload your own documents. The system chunks and vectorizes them in Pinecone, allowing agents to seamlessly combine your private data with web research.' },
  { id: 'graph', icon: Database, title: 'Knowledge Graph', desc: 'Visualize relationships between entities and concepts.', detail: 'Every research finding is parsed into a Neo4j knowledge graph, allowing you to visually explore connections between key topics and entities.' },
  { id: 'deep-dive', icon: Target, title: 'Deep Dive', desc: 'Select any finding and run targeted follow-up research.', detail: 'Found an interesting claim? Click "Run Deep Dive" to trigger a secondary research loop exclusively focused on validating and expanding that specific finding.' },
  { id: 'compare', icon: Zap, title: 'Workspace Comparison', desc: 'Compare workspaces to find similarities and differences.', detail: 'Select any two completed research topics (e.g. AI in Healthcare vs AI in Finance) and the system will automatically contrast their findings, sources, and conclusions.' },
  { id: 'timeline', icon: Clock, title: 'Research Timeline', desc: 'Track how findings evolved over chronological sources.', detail: 'View a chronological timeline of when key sources were published and how the narrative around your research topic has shifted over time.' },
  { id: 'chat', icon: MessageSquare, title: 'Research Chat', desc: 'Chat directly with your synthesized research data.', detail: 'Ask questions about your research. The AI strictly uses the context from your gathered web sources, uploaded documents, and findings to answer.' },
  { id: 'pdf', icon: FileText, title: 'PDF Reports', desc: 'Export comprehensive reports with citations.', detail: 'Generate professional PDF reports containing all findings, sources, and the complete knowledge graph for offline reading and sharing.' },
];

const FeatureCard = ({ cap }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      className="group relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700 overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/0 group-hover:to-gray-50/50 dark:group-hover:to-gray-800/20 transition-colors pointer-events-none" />
      
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      
      <div className="flex items-start gap-4 relative">
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors shadow-sm">
          <cap.icon className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">{cap.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{cap.desc}</p>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-in slide-in-from-top-2 relative">
          {cap.detail}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { workspaces, loading, fetchWorkspaces, createWorkspace, deleteWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    await createWorkspace(data);
    setSubmitting(false);
    setShowCreate(false);
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSubmitting(true);
    const result = await createWorkspace({ title: searchInput, domain: 'General' });
    setSubmitting(false);
    if (result && result.success && result.workspace) {
      navigate(`/workspaces/${result.workspace._id}`, { state: { autoStart: true } });
    } else {
      // Fallback if success flag is missing
      fetchWorkspaces();
      setSearchInput('');
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;
    const result = await deleteWorkspace(id);
    if (result.success) {
      setToast({ message: 'Workspace deleted successfully.', type: 'success' });
    } else {
      setToast({ message: result.message || 'Failed to delete workspace', type: 'error' });
    }
  };

  const filtered = workspaces
    .filter(w => 
      w.title.toLowerCase().includes(search.toLowerCase()) || 
      (w.description && w.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const prompts = [
    "Impact of AI on healthcare",
    "Future of renewable energy",
    "Best technologies for autonomous agents"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* COMMAND CENTER */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-8 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gray-200/50 dark:bg-gray-800/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gray-200/50 dark:bg-gray-800/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Compass className="w-8 h-8 text-gray-400 shrink-0" />
              <span className="leading-tight">What do you want to research?</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed px-2">
              Enter a topic and our multi-agent AI workflow will gather, analyze, and synthesize verifiable web sources for you.
            </p>
            
            <form onSubmit={handleQuickCreate} className="mb-6 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g., How will AI agents transform software development by 2030?"
                  className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-lg rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!searchInput.trim() || submitting}
                className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                {submitting ? "Starting..." : "Start AI Research"}
              </button>
            </form>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              <span className="text-xs text-gray-500 font-medium w-full text-center md:w-auto md:text-left mb-2 md:mb-0 mr-0 md:mr-2">Try:</span>
              {prompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSearchInput(p)}
                  className="text-xs px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl transition-colors text-left leading-relaxed break-words max-w-full h-auto"
                >
                  {p}
                </button>
              ))}
            </div>
            
            {/* Visual Workflow */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row items-center justify-center md:justify-between gap-6 md:gap-2 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-widest border-t border-gray-100 dark:border-gray-800/50 pt-8">
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-all shadow-sm"><Target className="w-4 h-4" /></div>
                Planner
              </div>
              <ChevronRight className="w-4 h-4 hidden md:block opacity-30" />
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-all shadow-sm"><Search className="w-4 h-4" /></div>
                Researcher
              </div>
              <ChevronRight className="w-4 h-4 hidden md:block opacity-30" />
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-all shadow-sm"><BarChart3 className="w-4 h-4" /></div>
                Analyst
              </div>
              <ChevronRight className="w-4 h-4 hidden md:block opacity-30" />
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-all shadow-sm"><ShieldCheck className="w-4 h-4" /></div>
                <span className="text-center">Fact Checker</span>
              </div>
              <ChevronRight className="w-4 h-4 hidden md:block opacity-30" />
              <div className="flex flex-col items-center gap-2 group cursor-default col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-all shadow-sm"><FileText className="w-4 h-4" /></div>
                Synthesizer
              </div>
            </div>
          </div>
        </div>

        {/* CAPABILITIES */}
        <div className="mb-12">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Research Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((cap) => (
              <FeatureCard key={cap.id} cap={cap} />
            ))}
          </div>
        </div>

        {/* RESEARCH LIBRARY SECTION */}
        <div className="mt-16 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Research Library
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Find and continue your research
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workspaces, topics & findings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all shadow-sm"
              />
            </div>

            <Link
              to="/compare"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden md:inline">Compare</span>
            </Link>

            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New</span>
            </button>
          </div>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full ml-auto">
              {filtered.length} {filtered.length === 1 ? 'Workspace' : 'Workspaces'}
            </span>
          </div>
        )}

        {showCreate && (
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Workspace</h2>
            <WorkspaceForm onSubmit={handleCreate} submitting={submitting} onCancel={() => setShowCreate(false)} />
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((workspace) => (
              <div key={workspace._id} className="relative group">
                <Link
                  to={`/workspaces/${workspace._id}`}
                  className="flex flex-col h-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-900/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/0 group-hover:to-gray-50/50 dark:group-hover:to-gray-800/20 transition-colors pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-3 relative">
                    <div className="w-8 h-8 rounded bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                      <Brain className="w-4 h-4 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border ${statusStyles[workspace.status] || statusStyles.draft}`}>
                        {workspace.status}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, workspace._id)}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors z-10"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 relative group-hover:text-black dark:group-hover:text-white transition-colors">
                    {workspace.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 flex-1 relative">
                    {workspace.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-4 border-t border-gray-100 dark:border-gray-800/50 relative">
                    <span className="font-medium">{new Date(workspace.updatedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 font-semibold group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      Open <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : !loading && search ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111111] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No workspaces found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              We couldn't find any user workspaces matching "{search}".
            </p>
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111111] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No workspaces yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Use the Command Center above to start your first multi-agent research.
            </p>
          </div>
        ) : null}

        {/* DEMO RESEARCH SECTION */}
        <div className="mt-16 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Demo Research
          </h2>
        </div>
        
        <DemoWorkspaces searchQuery={search} />

        {loading && (
          <div className="flex justify-center py-12 mt-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
