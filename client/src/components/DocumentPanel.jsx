import { useState, useEffect, useCallback } from "react";
import { documentService } from "../services/featuresService.js";
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const DocumentPanel = ({ workspaceId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await documentService.getDocuments(workspaceId);
      setDocuments(res.data.data.documents);
    } catch (err) {
      console.error(err);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchDocs();
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, [fetchDocs]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await documentService.uploadDocument(workspaceId, file);
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document? This will remove its data from the workspace and RAG index.")) {
      return;
    }
    
    setDeletingId(docId);
    setError(null);
    try {
      await documentService.deleteDocument(workspaceId, docId);
      await fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "indexed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "processing": return <Loader2 className="w-4 h-4 text-gray-900 dark:text-gray-100 animate-spin" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Documents & RAG</h3>
        </div>
        
        <label className={`flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-sm ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading..." : "Upload PDF/TXT"}
          <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-3">
        {documents.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
          </div>
        )}
        
        {documents.map((doc) => (
          <div key={doc._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800/80 rounded-lg transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">{doc.type.split("/")[1] || "TXT"}</span>
                  <span className="text-[10px] text-gray-400">&bull;</span>
                  <span className="text-[10px] text-gray-500">{(doc.size / 1024).toFixed(1)} KB</span>
                  <span className="text-[10px] text-gray-400">&bull;</span>
                  <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(doc.createdAt))} ago</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-2 py-1 rounded-md">
                {getStatusIcon(doc.status)}
                <span className={`text-[10px] font-medium capitalize ${
                  doc.status === "indexed" ? "text-emerald-600 dark:text-emerald-400" :
                  doc.status === "processing" ? "text-gray-900 dark:text-gray-100" :
                  doc.status === "failed" ? "text-red-600 dark:text-red-400" : "text-gray-500"
                }`}>{doc.status}</span>
              </div>
              <button
                onClick={() => handleDelete(doc._id)}
                disabled={deletingId === doc._id}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                title="Delete document"
              >
                {deletingId === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentPanel;

