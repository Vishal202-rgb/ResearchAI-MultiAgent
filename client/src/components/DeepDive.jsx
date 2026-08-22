import { useState } from 'react';
import { Search, Loader2, Sparkles, Target, AlertCircle } from 'lucide-react';

const DeepDive = ({ workspaceId, finding }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runDeepDive = async () => {
    setLoading(true);
    setError(null);
    try {
      const { api } = await import('../services/api.js');
      const res = await (await import('../services/api.js')).default.post(`/research/run/${workspaceId}/deep-dive`, { finding });
      
      const textResponse = res.data.data.deepDive;
      try {
        const jsonMatch = textResponse.match(/\\{.*\\}/s);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textResponse);
        setResult(parsed);
      } catch (e) {
        setResult({ evidence: textResponse, latestSources: [], opposingFindings: '' });
      }
    } catch (err) {
      setError('Failed to run deep dive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 bg-gray-50 dark:bg-[#151515] rounded-lg p-4 border border-gray-200 dark:border-gray-800">
      {!result && !loading && !error && (
        <button onClick={runDeepDive} className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          <Target className="w-3.5 h-3.5" /> Run Deep Dive on this finding
        </button>
      )}
      
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running targeted RAG & Web Search...
        </div>
      )}

      {error && <div className="text-xs text-red-500">{error}</div>}

      {result && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Validating Evidence
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.evidence}</p>
          </div>
          
          {result.opposingFindings && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Nuance & Opposing Views
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.opposingFindings}</p>
            </div>
          )}

          {result.latestSources && result.latestSources.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                <Search className="w-3 h-3" /> Latest Sources
              </h4>
              <ul className="space-y-1">
                {result.latestSources.map((s, idx) => (
                  <li key={idx} className="text-xs">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeepDive;
