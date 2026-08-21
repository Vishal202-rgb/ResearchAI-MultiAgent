import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore.js';
import WorkspaceForm from '../components/WorkspaceForm.jsx';
import Toast from '../components/Toast.jsx';
import Navbar from '../components/Navbar.jsx';

const CreateWorkspace = () => {
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createWorkspace } = useWorkspaceStore();

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const result = await createWorkspace(formData);
    setSubmitting(false);

    if (result.success) {
      setToast({ message: 'Workspace created!', type: 'success' });
      setTimeout(() => navigate(`/workspaces/${result.workspace._id}`), 500);
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-200">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspaces
        </Link>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Create Workspace</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Set up a new research workspace to organize your objective.
          </p>

          <WorkspaceForm
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Create Workspace"
          />
        </div>
      </main>
    </div>
  );
};

export default CreateWorkspace;
