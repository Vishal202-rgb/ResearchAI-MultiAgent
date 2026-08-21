import { FileText, Target, Activity, FileUp } from 'lucide-react';

const WorkspaceStats = ({ stats }) => {
  const statItems = [
    { label: 'Documents', value: stats.documents || 0, icon: FileUp, color: 'text-gray-500' },
    { label: 'Sources', value: stats.sources || 0, icon: Target, color: 'text-gray-500' },
    { label: 'Findings', value: stats.findings || 0, icon: FileText, color: 'text-gray-500' },
    { label: 'Runs', value: stats.researchRuns || 0, icon: Activity, color: 'text-gray-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
          </div>
          <div className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center ${item.color}`}>
            <item.icon className="w-4 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceStats;
