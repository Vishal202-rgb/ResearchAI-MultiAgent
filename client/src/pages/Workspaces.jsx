import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Search, LogOut, Brain } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore.js';
import WorkspaceCard from '../components/WorkspaceCard.jsx';
import Toast from '../components/Toast.jsx';
import useAuthStore from '../store/authStore.js';

const Workspaces = () => {
  const { workspaces, loading, fetchWorkspaces, deleteWorkspace } = useWorkspaceStore();
  const { user, logout } = useAuthStore();
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;
    const result = await deleteWorkspace(id);
    if (result.success) {
      setToast({ message: 'Workspace deleted successfully', type: 'success' });
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.researchDomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-lg font-semibold text-white">ResearchAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Workspaces</h1>
            <p className="text-gray-400 mt-1">Manage your research workspaces</p>
          </div>
          <Link
            to="/workspaces/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </Link>
        </div>

        {/* Search */}
        {workspaces.length > 0 && (
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* Loading */}
        {loading && workspaces.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Workspace Grid */}
        {!loading && filteredWorkspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace._id}
                workspace={workspace}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* No Search Results */}
        {!loading && workspaces.length > 0 && filteredWorkspaces.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-gray-400 text-sm">Try a different search term</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && workspaces.length === 0 && (
          <div className="bg-gray-900/40 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No workspaces yet</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              Create your first research workspace to get started with AI-powered research.
            </p>
            <Link
              to="/workspaces/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Workspace
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Workspaces;
