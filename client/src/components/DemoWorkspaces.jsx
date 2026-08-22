import { ArrowRight, Brain, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEMOS } from '../data/demoData.js';

export const DemoWorkspaces = ({ searchQuery = '' }) => {
  const filteredDemos = DEMOS.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.objective && d.objective.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filteredDemos.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
        No demo workspaces match your search.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDemos.map((demo) => (
          <div key={demo.id} className="relative group">
            <Link
              to={`/demo/${demo.id}`}
              className="flex flex-col h-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-900/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/0 group-hover:to-gray-50/50 dark:group-hover:to-gray-800/20 transition-colors pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex items-start justify-between mb-3 relative">
                <div className="w-8 h-8 rounded bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                  <Brain className="w-4 h-4 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-400">
                  STATIC DEMO
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 relative group-hover:text-black dark:group-hover:text-white transition-colors">
                {demo.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 relative">
                {demo.objective}
              </p>

              <div className="flex items-center gap-2 mb-4 relative">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {demo.domain}
                </span>
              </div>
              
              <div className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3 border border-gray-200 dark:border-gray-800/50 mb-4 relative transition-colors group-hover:bg-gray-100 dark:group-hover:bg-gray-800/50">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Web Sources
                </h4>
                <ul className="space-y-1.5">
                  {demo.sources.map((src, i) => (
                    <li key={i}>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
                        {src.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-auto relative">
                <span className="font-medium">{new Date(demo.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-1 font-semibold group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
