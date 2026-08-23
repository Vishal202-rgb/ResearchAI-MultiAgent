import { FileText, Target, Activity, FileUp, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

const WorkspaceStats = ({ stats, status }) => {
  const statItems = [
    { label: 'Documents', value: stats.documents || 0, icon: FileUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Sources', value: stats.sources || 0, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Findings', value: stats.findings || 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Research Runs', value: stats.researchRuns || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ];

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Research Intelligence Dashboard
        </h3>
        {status === 'completed' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
            <TrendingUp className="w-3.5 h-3.5" /> High Confidence
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.label}</p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceStats;
