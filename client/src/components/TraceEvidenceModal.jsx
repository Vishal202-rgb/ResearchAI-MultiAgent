import React, { useState, useEffect } from 'react';
import { X, Search, FileText, CheckCircle, XCircle, Loader2, Link as LinkIcon, Calendar, ArrowUpRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../services/api.js';

const TraceEvidenceModal = ({ isOpen, onClose, finding, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && finding && !evidence && !loading) {
      loadEvidence();
    }
  }, [isOpen, finding]);

  const loadEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/research/trace/${workspaceId}`, { claim: finding });
      setEvidence(res.data.data);
    } catch (err) {
      setError('Failed to trace evidence. Please try again.');
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
              <Search className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trace Evidence</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Source traceability analysis for verified claims</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
          <div className="bg-gray-50 dark:bg-[#111111] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm mb-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-3xl"></div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 ml-2">Target Claim</h4>
            <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 leading-relaxed ml-2">
              "{finding}"
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-sm font-medium animate-pulse">Tracing sources and cross-referencing knowledge graph...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5"/> {error}
            </div>
          ) : evidence ? (
            <div className="space-y-12">
              
              {/* SUPPORTING EVIDENCE */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Supporting Evidence
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">{evidence.supporting?.length || 0}</span>
                </h3>
                
                {evidence.supporting && evidence.supporting.length > 0 ? (
                  <div className="grid gap-6">
                    {evidence.supporting.map((src, i) => (
                      <div key={i} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                        
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left Col: Metadata */}
                          <div className="md:w-1/3 flex flex-col gap-4">
                            <div>
                              {src.url ? (
                                <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-base font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 group-hover:underline transition-colors leading-snug">
                                  {src.title || src.url}
                                  <ArrowUpRight className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                </a>
                              ) : (
                                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{src.title}</h4>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {src.publisher && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5" /> <span>{src.publisher}</span>
                                </div>
                              )}
                              {src.date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5" /> <span>{src.date}</span>
                                </div>
                              )}
                              {src.url && (
                                <div className="flex items-center gap-2 mt-1">
                                  <LinkIcon className="w-3.5 h-3.5" /> <span className="truncate max-w-[200px]">{new URL(src.url).hostname}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Col: Content */}
                          <div className="md:w-2/3 flex flex-col gap-4">
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">Relevant Excerpt</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{src.snippet}"</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">Why it supports the claim</span>
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{src.reason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center text-gray-500">
                    <p className="text-sm italic">No supporting sources found in the current workspace context.</p>
                  </div>
                )}
              </div>

              {/* CONTRADICTING EVIDENCE */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  Contradicting Evidence
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">{evidence.contradicting?.length || 0}</span>
                </h3>
                
                {evidence.contradicting && evidence.contradicting.length > 0 ? (
                  <div className="grid gap-6">
                    {evidence.contradicting.map((src, i) => (
                      <div key={i} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50"></div>
                        
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left Col: Metadata */}
                          <div className="md:w-1/3 flex flex-col gap-4">
                            <div>
                              {src.url ? (
                                <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-base font-bold text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 group-hover:underline transition-colors leading-snug">
                                  {src.title || src.url}
                                  <ArrowUpRight className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                </a>
                              ) : (
                                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{src.title}</h4>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {src.publisher && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5" /> <span>{src.publisher}</span>
                                </div>
                              )}
                              {src.date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5" /> <span>{src.date}</span>
                                </div>
                              )}
                              {src.url && (
                                <div className="flex items-center gap-2 mt-1">
                                  <LinkIcon className="w-3.5 h-3.5" /> <span className="truncate max-w-[200px]">{new URL(src.url).hostname}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Col: Content */}
                          <div className="md:w-2/3 flex flex-col gap-4">
                            <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-2">Relevant Excerpt</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{src.snippet}"</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">Why it contradicts the claim</span>
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{src.reason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center text-gray-500">
                    <p className="text-sm italic">No contradicting sources found.</p>
                  </div>
                )}
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TraceEvidenceModal;