import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { graphService } from '../services/featuresService.js';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

const COLORS = {
  Concept: { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
  Technology: { bg: '#dcfce7', text: '#166534', border: '#4ade80' },
  Company: { bg: '#fef08a', text: '#854d0e', border: '#fde047' },
  Person: { bg: '#fce7f3', text: '#9d174d', border: '#f472b6' },
  Default: { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' },
  DarkConcept: { bg: '#3730a3', text: '#e0e7ff', border: '#4f46e5' },
  DarkTechnology: { bg: '#166534', text: '#dcfce7', border: '#15803d' },
  DarkCompany: { bg: '#854d0e', text: '#fef08a', border: '#a16207' },
  DarkPerson: { bg: '#9d174d', text: '#fce7f3', border: '#be185d' },
  DarkDefault: { bg: '#374151', text: '#f9fafb', border: '#4b5563' },
};

const GraphPanel = ({ workspaceId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hoverNode, setHoverNode] = useState(null);
  const { theme } = useTheme();
  const fgRef = useRef();

  const isDark = theme === 'dark';

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const res = await graphService.getGraph(workspaceId);
      const rawNodes = res.data.data.graph.nodes || [];
      const rawLinks = res.data.data.graph.links || [];
      
      // Calculate degrees to find central node
      const degrees = {};
      rawLinks.forEach(link => {
        degrees[link.source] = (degrees[link.source] || 0) + 1;
        degrees[link.target] = (degrees[link.target] || 0) + 1;
      });

      let maxDegree = 0;
      let centralNodeId = null;
      Object.entries(degrees).forEach(([id, deg]) => {
        if (deg > maxDegree) {
          maxDegree = deg;
          centralNodeId = id;
        }
      });

      const processedNodes = rawNodes.map(node => ({
        ...node,
        isCentral: node.id === centralNodeId,
        val: node.id === centralNodeId ? 3 : 1
      }));

      setGraphData({ nodes: processedNodes, links: rawLinks });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Adjust forces to prevent overlap and increase link distance
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const fg = fgRef.current;
      fg.d3Force('charge').strength(-400);
      fg.d3Force('link').distance(100);
      fg.d3Force('collide', fg.d3Force('collide') || window.d3?.forceCollide().radius(n => (n.isCentral ? 40 : 25) + 5));
    }
  }, [graphData]);

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

  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.2, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.2, 400);
  const handleFit = () => fgRef.current?.zoomToFit(400, 50);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const isHovered = hoverNode === node.id;
    const label = node.id;
    const fontSize = node.isCentral ? 14 / globalScale : 10 / globalScale;
    
    // Style based on category and theme
    const typeKey = node.label || 'Default';
    const themeKey = isDark ? `Dark${typeKey}` : typeKey;
    const style = COLORS[themeKey] || COLORS[isDark ? 'DarkDefault' : 'Default'];

    const radius = node.isCentral ? 25 : 18;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = isHovered ? style.border : style.bg;
    ctx.fill();
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.strokeStyle = style.border;
    ctx.stroke();

    // Draw text inside
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isHovered && isDark ? '#ffffff' : (isHovered && !isDark ? '#ffffff' : style.text);
    ctx.font = `${isHovered ? 'bold ' : ''}${fontSize}px Sans-Serif`;

    // Wrapping text logic
    const words = label.split(' ');
    let line = '';
    const lines = [];
    const maxW = radius * 1.8;
    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxW && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let startY = node.y - (totalHeight / 2) + (lineHeight / 2);
    
    lines.forEach(l => {
      ctx.fillText(l.trim(), node.x, startY);
      startY += lineHeight;
    });
  }, [hoverNode, isDark]);

  const paintLink = useCallback((link, ctx, globalScale) => {
    if (!link.label || globalScale < 1.5) return;
    
    const start = link.source;
    const end = link.target;
    
    // Ignore uninitialized coordinates
    if (typeof start.x !== 'number' || typeof end.x !== 'number') return;
    
    const textPos = Object.assign(...['x', 'y'].map(c => ({
      [c]: start[c] + (end[c] - start[c]) / 2
    })));

    const fontSize = 8 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const label = link.label.replace(/_/g, ' ');
    
    ctx.fillStyle = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(textPos.x - textWidth / 2 - 2, textPos.y - fontSize / 2 - 2, textWidth + 4, fontSize + 4);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
    ctx.fillText(label, textPos.x, textPos.y);
  }, [isDark]);

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative h-[600px] flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-gray-900 dark:text-white" />
          <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Knowledge Graph</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1 mr-2 border border-gray-200 dark:border-gray-800">
            <button onClick={handleZoomIn} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded transition-colors" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded transition-colors" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleFit} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded transition-colors" title="Fit to Screen">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50/50 dark:bg-[#0a0a0a]/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800/80 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-center p-6">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Network className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Knowledge Graph Available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">Complete a research run to analyze relationships between entities, then click regenerate to visualize them.</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.isCentral ? 25 : 18, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            linkCanvasObjectMode={() => 'after'}
            linkCanvasObject={paintLink}
            linkColor={() => isDark ? '#374151' : '#d1d5db'}
            linkWidth={1.5}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            onNodeHover={node => setHoverNode(node ? node.id : null)}
            cooldownTicks={100}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
            width={800}
            height={500}
            backgroundColor={isDark ? 'transparent' : 'transparent'}
          />
        )}
      </div>
    </div>
  );
};

export default GraphPanel;
