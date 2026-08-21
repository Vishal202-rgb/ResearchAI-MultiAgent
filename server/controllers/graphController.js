import Workspace from '../models/Workspace.js';
import ResearchFinding from '../models/ResearchFinding.js';
import AppError from '../utils/AppError.js';
import { getWorkspaceGraph, buildGraphFromFindings } from '../services/graph/graphService.js';

export const getGraph = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));

    const graph = await getWorkspaceGraph(workspaceId);
    
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
    if (!findings) {
      return next(new AppError('No findings available to generate graph', 400));
    }

    const findingText = `Summary: ${findings.summary}\nKey Findings: ${(findings.keyFindings || []).join('\n')}`;
    const success = await buildGraphFromFindings(workspaceId, req.user._id, findingText);

    res.status(200).json({
      success,
      message: success ? 'Graph generated successfully' : 'Failed to generate graph'
    });
  } catch (error) {
    next(error);
  }
};
