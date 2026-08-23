import React, { useState, useEffect } from 'react';
import { X, History, Loader2, ArrowRight, PlusCircle, MinusCircle, Link as LinkIcon, GitCommit } from 'lucide-react';
import api from '../services/api.js';

const WhatChangedModal = ({ isOpen, onClose, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !data && !loading) {
      loadHistoryDiff();
    }
  }, [isOpen]);

  const loadHistoryDiff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/research/history/${workspaceId}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <History className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Research Update: What Changed?</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Comparing current findings against the previous run</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-sm font-medium animate-pulse">Computing semantic diff between research versions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800">
               <History className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Insufficient History</h3>
               <p className="text-sm text-gray-500 max-w-sm mb-6">{error}</p>
               <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-sm rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-sm">Close</button>
            </div>
          ) : data ? (
            <div className="space-y-10">
              
              {data.semanticDiff && (
                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-3 py-1 bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Executive Summary</div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Research changed <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-4">{data.semanticDiff.summaryLevel || 'moderately'}</span> since the last run.
                  </h3>
                  {data.semanticDiff.points && (
                    <ul className="space-y-3">
                      {data.semanticDiff.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-[#111]/60 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                          <ArrowRight className="w-5 h-5 mt-0 flex-shrink-0 text-indigo-500" /> {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* NEW FINDINGS */}
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <PlusCircle className="w-5 h-5" /> Added Findings ({data.newFindings?.length || 0})
                  </h4>
                  {data.newFindings?.length > 0 ? (
                    <ul className="space-y-4">
                      {data.newFindings.map((f, i) => (
                        <li key={i} className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border-l-4 border-l-emerald-500 border border-gray-100 dark:border-gray-800 shadow-sm relative">
                           <span className="absolute -top-2 -left-2 w-5 h-5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">+{i+1}</span>
                           {f}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500 italic text-center py-6">No net-new findings.</p>}
                </div>

                {/* REMOVED FINDINGS */}
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <MinusCircle className="w-5 h-5" /> Removed / Retracted ({data.removedFindings?.length || 0})
                  </h4>
                  {data.removedFindings?.length > 0 ? (
                    <ul className="space-y-4">
                      {data.removedFindings.map((f, i) => (
                        <li key={i} className="text-sm font-medium text-gray-500 dark:text-gray-400 line-through bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border-l-4 border-l-rose-500 border border-gray-100 dark:border-gray-800 shadow-sm opacity-80 relative">
                           <span className="absolute -top-2 -left-2 w-5 h-5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center font-bold text-[10px] border border-rose-200 dark:border-rose-800">-{i+1}</span>
                           {f}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500 italic text-center py-6">No findings were removed.</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* NEW SOURCES */}
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <PlusCircle className="w-5 h-5" /> New Sources ({data.newSources?.length || 0})
                  </h4>
                  {data.newSources?.length > 0 ? (
                    <ul className="space-y-3">
                      {data.newSources.map((s, i) => (
                        <li key={i} className="text-sm font-medium bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 overflow-hidden">
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                             <LinkIcon className="w-4 h-4 text-emerald-500" />
                           </div>
                           <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 truncate hover:underline transition-colors">{s.title || s.url}</a>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500 italic text-center py-6">No new sources.</p>}
                </div>

                {/* REMOVED SOURCES */}
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <MinusCircle className="w-5 h-5" /> Removed Sources ({data.removedSources?.length || 0})
                  </h4>
                  {data.removedSources?.length > 0 ? (
                    <ul className="space-y-3">
                      {data.removedSources.map((s, i) => (
                        <li key={i} className="text-sm font-medium text-gray-500 dark:text-gray-400 line-through bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 overflow-hidden opacity-80">
                           <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                             <LinkIcon className="w-4 h-4 text-rose-500" />
                           </div>
                           <span className="truncate">{s.title || s.url}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500 italic text-center py-6">No sources were removed.</p>}
                </div>
              </div>

              {/* SEMANTIC DIFF TIMELINE */}
              {(data.semanticDiff?.changedFindings?.length > 0 || data.semanticDiff?.changedEvidence?.length > 0) && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <GitCommit className="w-5 h-5 text-gray-400" /> Evolutionary Changes
                  </h4>
                  <div className="space-y-6">
                    
                    {data.semanticDiff?.changedFindings?.map((c, i) => (
                      <div key={'f'+i} className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                        <div className="px-6 py-3 bg-gray-100 dark:bg-[#151515] border-b border-gray-200 dark:border-gray-800">
                           <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Refined Finding</span>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-6 relative">
                           <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-[#0a0a0a] rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center z-10">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                           </div>
                           <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                             <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-3 px-2 py-1 bg-rose-100 dark:bg-rose-900/50 w-fit rounded">Previous Version</span>
                             <p className="text-sm text-gray-600 dark:text-gray-400 line-through decoration-rose-300 dark:decoration-rose-800/50 leading-relaxed">{c.previous}</p>
                           </div>
                           <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                             <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-3 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 w-fit rounded">Latest Version</span>
                             <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{c.latest}</p>
                           </div>
                        </div>
                      </div>
                    ))}

                    {data.semanticDiff?.changedEvidence?.map((c, i) => (
                      <div key={'e'+i} className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                        <div className="px-6 py-3 bg-gray-100 dark:bg-[#151515] border-b border-gray-200 dark:border-gray-800">
                           <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Updated Evidence Base</span>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-6 relative">
                           <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-[#0a0a0a] rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center z-10">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                           </div>
                           <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                             <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-3 px-2 py-1 bg-rose-100 dark:bg-rose-900/50 w-fit rounded">Previous Evidence</span>
                             <p className="text-sm text-gray-600 dark:text-gray-400 line-through decoration-rose-300 dark:decoration-rose-800/50 leading-relaxed">{c.previous}</p>
                           </div>
                           <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                             <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-3 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 w-fit rounded">Latest Evidence</span>
                             <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{c.latest}</p>
                           </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              )}
              
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WhatChangedModal;