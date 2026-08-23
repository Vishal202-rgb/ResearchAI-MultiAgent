import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, ArrowDownUp, CheckCircle, Scale } from 'lucide-react';
import api from '../services/api.js';

const ContradictionsModal = ({ isOpen, onClose, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !data && !loading) {
      loadContradictions();
    }
  }, [isOpen]);

  const loadContradictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/research/contradictions/${workspaceId}`);
      setData(res.data.data);
    } catch (err) {
      setError('Failed to detect contradictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderSeverityBadge = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'high') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 uppercase tracking-wider border border-red-200 dark:border-red-800">High Severity</span>;
    if (s === 'medium') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 uppercase tracking-wider border border-amber-200 dark:border-amber-800">Medium Severity</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 uppercase tracking-wider border border-blue-200 dark:border-blue-800">Low Severity</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contradiction Detector</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Cross-referencing claims and resolving conflicting evidence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-sm font-medium animate-pulse">Scanning research findings for logical conflicts...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4"/> {error}
            </div>
          ) : data ? (
            <div className="space-y-12">
              {data.contradictions && data.contradictions.length > 0 ? (
                data.contradictions.map((c, i) => (
                  <div key={i} className="relative">
                    
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg">
                        Conflict #{i + 1}
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                          {c.type?.replace(/_/g, ' ')}
                        </span>
                      </h3>
                      {renderSeverityBadge(c.severity)}
                    </div>

                    <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                      
                      <div className="flex flex-col items-center">
                        {/* CLAIM A */}
                        <div className="w-full bg-white dark:bg-[#1a1a1a] border-l-4 border-l-rose-500 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm relative">
                          <span className="absolute -top-3 left-4 px-2 py-0.5 bg-white dark:bg-[#1a1a1a] text-[10px] font-black uppercase tracking-wider text-rose-500 border border-gray-200 dark:border-gray-800 rounded">Claim A</span>
                          <p className="text-base text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{c.itemA}</p>
                          {c.supportingEvidence && (
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                              <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">Evidence:</span> {c.supportingEvidence}
                            </p>
                          )}
                        </div>

                        {/* CONFLICT RELATIONSHIP */}
                        <div className="my-6 flex flex-col items-center">
                          <div className="w-px h-6 bg-amber-300 dark:bg-amber-700/50"></div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full shadow-sm z-10">
                            <ArrowDownUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Direct Conflict</span>
                          </div>
                          <div className="w-px h-6 bg-amber-300 dark:bg-amber-700/50"></div>
                        </div>

                        {/* CLAIM B */}
                        <div className="w-full bg-white dark:bg-[#1a1a1a] border-l-4 border-l-indigo-500 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm relative">
                          <span className="absolute -top-3 left-4 px-2 py-0.5 bg-white dark:bg-[#1a1a1a] text-[10px] font-black uppercase tracking-wider text-indigo-500 border border-gray-200 dark:border-gray-800 rounded">Claim B</span>
                          <p className="text-base text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{c.itemB}</p>
                          {c.conflictingEvidence && (
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                              <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">Evidence:</span> {c.conflictingEvidence}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-gray-400" /> AI Resolution & Analysis
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">Why they conflict</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">{c.whyConflict}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">Possible Explanation</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">{c.explanation}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Contradictions Detected</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">The AI has analyzed all findings and sources and found no significant logical conflicts. The research is highly consistent.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ContradictionsModal;