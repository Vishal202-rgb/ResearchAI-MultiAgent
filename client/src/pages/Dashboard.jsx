import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Brain, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore.js';
import useAuthStore from '../store/authStore.js';
import WorkspaceForm from '../components/WorkspaceForm.jsx';
import Navbar from '../components/Navbar.jsx';

import { DemoWorkspaces } from '../components/DemoWorkspaces.jsx';

const statusStyles = {
  draft: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400',
  completed: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400',
  archived: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400',
};

const Dashboard = () => {
  const { workspaces, loading, fetchWorkspaces, createWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    await createWorkspace(data);
    setSubmitting(false);
    setShowCreate(false);
  };

  const filtered = workspaces.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.researchDomain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Workspaces</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your research projects and agents.</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>

        {showCreate && (
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Workspace</h2>
            <WorkspaceForm onSubmit={handleCreate} submitting={submitting} onCancel={() => setShowCreate(false)} />
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all shadow-sm"
          />
        </div>

        <DemoWorkspaces />

        <div className="mt-12 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Your Workspaces</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((workspace) => (
              <Link
                key={workspace._id}
                to={`/workspaces/${workspace._id}`}
                className="group flex flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 text-gray-500">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border ${statusStyles[workspace.status] || statusStyles.draft}`}>
                    {workspace.status}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {workspace.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                  {workspace.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                  <span>{new Date(workspace.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Open <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111111] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No workspaces found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              {search ? 'Try adjusting your search terms.' : 'Create your first workspace to start researching with AI agents.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Workspace
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
