import Workspace from '../models/Workspace.js';
import ResearchFinding from '../models/ResearchFinding.js';
import AppError from '../utils/AppError.js';
import { getWorkspaceGraph, buildGraphFromFindings } from '../services/graph/graphService.js';

export const getGraph = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));

    let graph = await getWorkspaceGraph(workspaceId);

    // If graph is not yet persisted, but findings exist, auto-generate on first retrieval
    if (!graph.nodes || graph.nodes.length === 0) {
      const findings = await ResearchFinding.findOne({ workspaceId }).sort({ createdAt: -1 });
      if (findings && (findings.summary || (findings.keyFindings && findings.keyFindings.length > 0))) {
        const findingText = `Summary: ${findings.summary || ''}\nKey Findings: ${(findings.keyFindings || []).join('\n')}`;
        await buildGraphFromFindings(workspaceId, req.user._id, findingText);
        graph = await getWorkspaceGraph(workspaceId);
      }
    }

    res.status(200).json({
      success: true,
      data: { graph }
    });
  } catch (error) {
    next(error);
  }
};

export const generateGraph = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));

    const findings = await ResearchFinding.findOne({ workspaceId }).sort({ createdAt: -1 });
    if (!findings || (!findings.summary && (!findings.keyFindings || findings.keyFindings.length === 0))) {
      return res.status(200).json({
        success: false,
        message: 'No findings available to generate graph. Please complete a research run first.',
        data: { graph: { nodes: [], links: [] } }
      });
    }

    const findingText = `Summary: ${findings.summary || ''}\nKey Findings: ${(findings.keyFindings || []).join('\n')}`;
    const result = await buildGraphFromFindings(workspaceId, req.user._id, findingText);
    const graph = await getWorkspaceGraph(workspaceId);
    const success = Boolean(result && graph.nodes && graph.nodes.length > 0);

    res.status(200).json({
      success,
      message: success ? 'Graph generated successfully' : 'Failed to generate graph',
      data: { graph }
    });
  } catch (error) {
    next(error);
  }
};
