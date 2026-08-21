import Workspace from '../models/Workspace.js';
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
