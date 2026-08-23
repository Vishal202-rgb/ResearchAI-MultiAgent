import Workspace from '../models/Workspace.js';
import ResearchFinding from '../models/ResearchFinding.js';
import Document from '../models/Document.js';
import AppError from '../utils/AppError.js';

export const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user._id }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { workspaces },
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { title, description, researchQuestion, researchObjective, researchDomain } = req.body;

    if (!title) {
      return next(new AppError('Title is required', 400));
    }

    const workspace = await Workspace.create({
      userId: req.user._id,
      title,
      description,
      researchQuestion,
      researchObjective,
      researchDomain,
    });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { title, description, researchQuestion, researchObjective, researchDomain, status } = req.body;

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    if (title !== undefined) workspace.title = title;
    if (description !== undefined) workspace.description = description;
    if (researchQuestion !== undefined) workspace.researchQuestion = researchQuestion;
    if (researchObjective !== undefined) workspace.researchObjective = researchObjective;
    if (researchDomain !== undefined) workspace.researchDomain = researchDomain;
    if (status !== undefined) workspace.status = status;

    await workspace.save();

    res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, data: { results: [] } });
    }

    // Escape regex special characters to prevent ReDoS
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQ, 'i');
    const results = [];

    // Search Workspaces
    const workspaces = await Workspace.find({ 
      userId: req.user._id,
      $or: [{ title: regex }, { description: regex }, { researchDomain: regex }]
    }).limit(10);

    workspaces.forEach(w => {
      results.push({
        _id: `ws-${w._id}`,
        type: 'workspace',
        workspaceId: w._id,
        title: w.title,
        snippet: w.description || w.researchDomain,
        url: `/workspace/${w._id}`
      });
    });

    const userWorkspaceIds = (await Workspace.find({ userId: req.user._id }).select('_id')).map(w => w._id);

    // Search Findings
    const findings = await ResearchFinding.find({
      workspaceId: { $in: userWorkspaceIds },
      $or: [{ summary: regex }, { keyFindings: regex }, { rawAnalysis: regex }]
    }).populate('workspaceId', 'title').limit(10);

    findings.forEach(f => {
      if (f.workspaceId) {
        let snippet = f.summary || '';
        let tab = 'report';
        if (f.keyFindings && f.keyFindings.some(kf => regex.test(kf))) {
          snippet = f.keyFindings.find(kf => regex.test(kf)) || snippet;
        }
        
        results.push({
          _id: `find-${f._id}`,
          type: 'finding',
          workspaceId: f.workspaceId._id,
          title: `Finding in: ${f.workspaceId.title}`,
          snippet: snippet ? (snippet.substring(0, 150) + '...') : 'Result found in detailed analysis...',
          url: `/workspace/${f.workspaceId._id}?tab=${tab}#findings`
        });
      }
    });

    res.status(200).json({
      success: true,
      data: { results }
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceStats = async (req, res, next) => {
  try {
    const total = await Workspace.countDocuments({ userId: req.user._id });
    const active = await Workspace.countDocuments({ userId: req.user._id, status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalWorkspaces: total,
          activeResearch: active,
          documents: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
