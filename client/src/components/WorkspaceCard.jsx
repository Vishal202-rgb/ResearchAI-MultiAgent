import { Link } from 'react-router-dom';
import { Trash2, Clock, ArrowRight } from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  archived: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

const WorkspaceCard = ({ workspace, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/workspaces/${workspace._id}`}
            className="text-lg font-semibold text-white hover:text-primary-400 transition-colors truncate block"
          >
            {workspace.title}
          </Link>
          {workspace.researchDomain && (
            <p className="text-xs text-gray-500 mt-1">{workspace.researchDomain}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border shrink-0 ml-3 ${statusColors[workspace.status]}`}
        >
          {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
        </span>
      </div>

      {workspace.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{workspace.description}</p>
      )}

      {workspace.researchQuestion && (
        <p className="text-sm text-gray-500 italic mb-4 line-clamp-2">
          &ldquo;{workspace.researchQuestion}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(workspace.updatedAt)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(workspace._id);
            }}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Delete workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            to={`/workspaces/${workspace._id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all"
          >
            Open
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
