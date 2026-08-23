import React, { useEffect, useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Globe, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Tag, 
  Loader2, 
  MessageSquareText, 
  Check, 
  Calendar 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import useLibraryStore from '../store/libraryStore';

const Library = () => {
  const { insights, sources, loading, fetchLibrary, updateInsight, deleteInsight, updateSource, deleteSource } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('insights');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState(''); // 'insight' or 'source'
  const [editNote, setEditNote] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  const handleEdit = (item, type) => {
    setEditingId(item._id);
    setEditType(type);
    setEditNote(item.personalNote || '');
    setEditTags(item.tags?.join(', ') || '');
  };

  const handleSaveEdit = async () => {
    const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);
    const updateData = { personalNote: editNote, tags: tagsArray };
    
    let res;
    if (editType === 'insight') {
      res = await updateInsight(editingId, updateData);
    } else {
      res = await updateSource(editingId, updateData);
    }

    if (res.success) {
      showToast('Updated successfully');
      setEditingId(null);
    } else {
      showToast(res.message || 'Failed to update', 'error');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this saved item?')) return;
    
    let res;
    if (type === 'insight') {
      res = await deleteInsight(id);
    } else {
      res = await deleteSource(id);
    }

    if (res.success) {
      showToast('Deleted successfully');
    } else {
      showToast(res.message || 'Failed to delete', 'error');
    }
  };

  const filteredInsights = insights.filter(i => 
    i.findingText.toLowerCase().includes(search.toLowerCase()) || 
    i.workspaceId?.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    i.personalNote?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSources = sources.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.url.toLowerCase().includes(search.toLowerCase()) || 
    s.workspaceId?.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    s.personalNote?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors w-full flex flex-col">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              My Research Library
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Your saved insights and verified sources across all workspaces.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword, tag, or workspace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 mb-8 w-full">
          <button
            onClick={() => setActiveTab('insights')}
            className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'insights' 
                ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Saved Insights ({insights.length})
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'sources' 
                ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Saved Sources ({sources.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 w-full">
            <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
          </div>
        ) : (
          <div className="w-full space-y-6">
            
            {/* INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <>
                {filteredInsights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl w-full">
                    <BookMarked className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved insights</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      {search ? "No insights match your search." : "Save important findings from your workspaces to build your knowledge base."}
                    </p>
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInsights.map(insight => (
                      <div key={insight._id} className="group flex flex-col h-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-900/50 relative overflow-hidden">
                        
                        <div className="flex items-start justify-between mb-4">
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 truncate max-w-[180px]">
                            {insight.workspaceId?.title || 'Unknown Workspace'}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(insight, 'insight')} className="text-gray-400 hover:text-gray-900 dark:text-white transition-colors p-1" title="Edit Note/Tags">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(insight._id, 'insight')} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-900 dark:text-gray-100 font-medium mb-4 flex-1 line-clamp-4 group-hover:line-clamp-none transition-all">
                          {insight.findingText}
                        </p>

                        {/* Note & Tags Display */}
                        {(insight.personalNote || (insight.tags && insight.tags.length > 0)) && (
                          <div className="mb-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                            {insight.personalNote && (
                              <div className="flex items-start gap-2 mb-2 text-sm text-gray-700 dark:text-gray-300">
                                <MessageSquareText className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
                                <span className="italic">{insight.personalNote}</span>
                              </div>
                            )}
                            {insight.tags && insight.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {insight.tags.map((tag, i) => (
                                  <span key={i} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400">
                                    <Tag className="w-2.5 h-2.5" /> {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Edit Form Inline */}
                        {editingId === insight._id && editType === 'insight' && (
                          <div className="mb-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Personal Note</label>
                            <textarea
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="w-full text-sm bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                              rows="2"
                              placeholder="Add a personal note..."
                            />
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              className="w-full text-sm bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                              placeholder="e.g. AI, Healthcare, Q3"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                              <button onClick={handleSaveEdit} className="text-xs px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-lg flex items-center gap-1 transition-colors">
                                <Check className="w-3 h-3" /> Save
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(insight.createdAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => handleCopy(insight.findingText)}
                            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* SOURCES TAB */}
            {activeTab === 'sources' && (
              <>
                {filteredSources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl w-full">
                    <Globe className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved sources</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      {search ? "No sources match your search." : "Save important links and citations for quick reference."}
                    </p>
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSources.map(source => (
                      <div key={source._id} className="group flex flex-col h-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-900/50 relative overflow-hidden">
                        
                        <div className="flex items-start justify-between mb-4">
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 truncate max-w-[180px]">
                            {source.workspaceId?.title || 'Unknown Workspace'}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(source, 'source')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1" title="Edit Note/Tags">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(source._id, 'source')} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {source.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                          {source.publisher || new URL(source.url).hostname} {source.date && `• ${source.date}`}
                        </p>

                        {/* Note & Tags Display */}
                        {(source.personalNote || (source.tags && source.tags.length > 0)) && (
                          <div className="mb-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                            {source.personalNote && (
                              <div className="flex items-start gap-2 mb-2 text-sm text-gray-700 dark:text-gray-300">
                                <MessageSquareText className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
                                <span className="italic">{source.personalNote}</span>
                              </div>
                            )}
                            {source.tags && source.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {source.tags.map((tag, i) => (
                                  <span key={i} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400">
                                    <Tag className="w-2.5 h-2.5" /> {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Edit Form Inline */}
                        {editingId === source._id && editType === 'source' && (
                          <div className="mb-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Personal Note</label>
                            <textarea
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="w-full text-sm bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                              rows="2"
                              placeholder="Add a personal note..."
                            />
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              className="w-full text-sm bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                              placeholder="e.g. Reference, Paper, Q3"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                              <button onClick={handleSaveEdit} className="text-xs px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-lg flex items-center gap-1 transition-colors">
                                <Check className="w-3 h-3" /> Save
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
                          <button 
                            onClick={() => handleCopy(`${source.title}\n${source.url}`)}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" /> Cite
                          </button>
                          
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
                          >
                            Open <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default Library;
