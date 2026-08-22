import { ArrowRight, Brain, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEMOS } from '../data/demoData.js';

export const DemoWorkspaces = () => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMOS.map((demo) => (
          <Link
            key={demo.id}
            to={`/demo/${demo.id}`}
            className="group flex flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 text-gray-500">
                <Brain className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                Static Demo
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
              {demo.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
              {demo.objective}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {demo.domain}
              </span>
            </div>
            
            <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800/50 mb-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
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
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-auto">
              <span>{new Date(demo.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-1 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
