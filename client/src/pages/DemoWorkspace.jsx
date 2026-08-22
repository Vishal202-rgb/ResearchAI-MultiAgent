import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Target, Globe, Lightbulb, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { DEMOS } from '../data/demoData.js';

const DemoWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const demo = DEMOS.find(d => d.id === id);

  if (!demo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Demo not found</h2>
          <button onClick={() => navigate('/dashboard')} className="text-gray-900 dark:text-white font-medium hover:underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspaces
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {demo.title}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> DEMO / READ ONLY
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-medium">
                {demo.domain}
              </span>
              <span>Updated {new Date(demo.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> Research Objective
              </h3>
              <p className="text-gray-900 dark:text-gray-200 leading-relaxed text-lg font-medium">
                {demo.objective}
              </p>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Key Findings
              </h3>
              <ul className="space-y-4">
                {demo.findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm sticky top-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Web Sources
              </h3>
              <div className="space-y-4">
                {demo.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800/50 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                      {src.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">{src.publisher} • {src.url}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoWorkspace;
