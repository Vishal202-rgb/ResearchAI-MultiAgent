import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/featuresService.js';
import { FileText, Loader2, RefreshCw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReportPanel = ({ workspaceId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportService.getReport(workspaceId);
      setReport(res.data.data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await reportService.generateReport(workspaceId);
      await fetchReport();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await reportService.exportPdf(workspaceId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `research_report_${workspaceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Final Research Report</h3>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {generating ? 'Generating...' : (report ? 'Regenerate' : 'Generate')}
          </button>
          
          {report && (
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-8 border border-gray-200 dark:border-gray-800/80 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : !report ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <FileText className="w-8 h-8 opacity-40 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No report generated yet.</p>
            <p className="text-xs text-gray-500 mt-1">Click Generate after completing a research run.</p>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-p:leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, href, ...props}) => {
                  const safeHref = href?.startsWith('http') ? href : `https://${href}`;
                  return <a href={safeHref} {...props} target="_blank" rel="noopener noreferrer" />;
                }
              }}
            >
              {report.markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPanel;
