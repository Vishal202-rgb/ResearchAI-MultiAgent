import { useState } from 'react';
import { Search, Loader2, Sparkles, Target, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

const renderText = (content) => {
  if (!content) return null;
  
  if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
    return <p className="text-sm">{String(content)}</p>;
  }
  
  if (Array.isArray(content)) {
    return (
      <ul className="list-disc pl-5 space-y-1 mt-1 text-sm">
        {content.map((item, idx) => (
          <li key={idx}>{renderText(item)}</li>
        ))}
      </ul>
    );
  }
  
  if (typeof content === 'object') {
    return (
      <div className="space-y-2 mt-1 text-sm">
        {Object.entries(content).map(([key, val], idx) => (
          <div key={idx} className="flex flex-col">
            <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <div className="pl-2">
              {renderText(val)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return null;
};

const DeepDive = ({ workspaceId, finding }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runDeepDive = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/research/run/${workspaceId}/deep-dive`, { finding });
      
      let data = res.data?.data?.deepDive;
      
      if (!data) {
        throw new Error("Invalid response format");
      }

      if (typeof data === 'string') {
        try {
          const jsonMatch = data.match(/\{.*\}/s);
          data = JSON.parse(jsonMatch ? jsonMatch[0] : data);
        } catch (e) {
          data = { evidence: data };
        }
      }

      setResult({
        evidence: data.evidence || data.ValidatingEvidence || '',
        opposingFindings: data.opposingFindings || data.Nuance || '',
        latestSources: Array.isArray(data.latestSources) ? data.latestSources : []
      });
    } catch (err) {
      console.error(err);
      setError('Failed to run deep dive. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-auto">
      {!result && !loading && !error && (
        <button onClick={runDeepDive} className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          <Target className="w-3.5 h-3.5" /> Run Deep Dive on this finding
        </button>
      )}
      
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running targeted RAG & Web Search...
        </div>
      )}

      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}

      {result && (
        <div className="space-y-4 animate-in fade-in mt-4">
          {result.evidence && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Validating Evidence
              </h4>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {renderText(result.evidence)}
              </div>
            </div>
          )}
          
          {result.opposingFindings && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Nuance & Opposing Views
              </h4>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {renderText(result.opposingFindings)}
              </div>
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
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                        {s.title || s.url}
                      </a>
                    ) : (
                      <div className="text-xs">{renderText(s)}</div>
                    )}
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
