import { useState, useEffect, useCallback } from 'react';
import { graphService } from '../services/featuresService.js';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Loader2, RefreshCw } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

const GraphPanel = ({ workspaceId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { theme } = useTheme();

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const res = await graphService.getGraph(workspaceId);
      setGraphData(res.data.data.graph);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await graphService.generateGraph(workspaceId);
      await fetchGraph();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-hidden h-[600px] flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Knowledge Graph</h3>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {generating ? 'Generating...' : 'Regenerate Graph'}
        </button>
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800/80 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col gap-2">
            <Network className="w-6 h-6 opacity-40 mb-1" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No knowledge graph available.</p>
            <p className="text-xs text-gray-500">Run research then click Generate Graph.</p>
          </div>
        ) : (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="id"
            nodeColor={() => isDark ? '#ffffff' : '#000000'}
            linkColor={() => isDark ? '#333333' : '#e5e7eb'}
            nodeRelSize={4}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            width={800}
            height={500}
            backgroundColor={isDark ? '#0a0a0a' : '#f9fafb'}
          />
        )}
      </div>
    </div>
  );
};

export default GraphPanel;
