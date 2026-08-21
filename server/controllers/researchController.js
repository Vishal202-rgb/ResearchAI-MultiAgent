import Workspace from '../models/Workspace.js';
import ResearchPlan from '../models/ResearchPlan.js';
import ResearchRun from '../models/ResearchRun.js';
import ResearchFinding from '../models/ResearchFinding.js';
import Source from '../models/Source.js';
import AgentLog from '../models/AgentLog.js';
import AppError from '../utils/AppError.js';
import runPlannerAgent from '../services/agents/plannerAgent.js';
import startResearchRun from '../services/agents/researchOrchestrator.js';

// ─── Planner endpoints (Part 3 — preserved) ───

export const generatePlan = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    const researchQuestion = workspace.researchQuestion || workspace.title;

    if (!researchQuestion) {
      return next(new AppError('Workspace must have a research question or title', 400));
    }

    await ResearchPlan.deleteMany({ workspaceId, userId: req.user._id });

    const plan = await ResearchPlan.create({
      workspaceId,
      userId: req.user._id,
      researchQuestion,
      status: 'generating',
    });

    await AgentLog.create({
      workspaceId,
      researchPlanId: plan._id,
      agentType: 'planner',
      status: 'started',
      message: `Planner agent started for: "${researchQuestion}"`,
      startedAt: new Date(),
    });

    try {
      const result = await runPlannerAgent(researchQuestion, {
        domain: workspace.researchDomain,
        objective: workspace.researchObjective,
      });

      plan.objective = result.objective;
      plan.subQuestions = result.subQuestions;
      plan.tasks = result.tasks;
      plan.status = 'completed';
      await plan.save();

      if (workspace.status === 'draft') {
        workspace.status = 'active';
        await workspace.save();
      }

      await AgentLog.create({
        workspaceId,
        researchPlanId: plan._id,
        agentType: 'planner',
        status: 'completed',
        message: `Planner generated ${result.tasks.length} tasks and ${result.subQuestions.length} sub-questions`,
        startedAt: plan.createdAt,
        completedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Research plan generated successfully',
        data: { plan },
      });
    } catch (aiError) {
      plan.status = 'failed';
      await plan.save();

      await AgentLog.create({
        workspaceId,
        researchPlanId: plan._id,
        agentType: 'planner',
        status: 'failed',
        message: 'Planner agent failed',
        error: aiError.message,
        startedAt: plan.createdAt,
        completedAt: new Date(),
      });

      return next(new AppError(`AI planner failed: ${aiError.message}`, 502));
    }
  } catch (error) {
    next(error);
  }
};

export const getPlan = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    const plan = await ResearchPlan.findOne({
      workspaceId,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Research Run endpoints (Part 4) ───

export const startRun = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    // Need a completed plan first
    const plan = await ResearchPlan.findOne({
      workspaceId,
      userId: req.user._id,
      status: 'completed',
    }).sort({ createdAt: -1 });

    if (!plan) {
      return next(new AppError('No completed research plan found. Generate a plan first.', 400));
    }

    // Check if there's already a running research
    const existingRun = await ResearchRun.findOne({
      workspaceId,
      status: 'running',
    });

    if (existingRun) {
      return next(new AppError('A research run is already in progress', 400));
    }

    // Start the orchestrated research run (async)
    const run = await startResearchRun(workspace, plan, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Research run started',
      data: { run },
    });
  } catch (error) {
    next(error);
  }
};

export const getRun = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    // Get the latest run
    const run = await ResearchRun.findOne({
      workspaceId,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    // Get all runs for history
    const runs = await ResearchRun.find({
      workspaceId,
      userId: req.user._id,
    }).sort({ createdAt: -1 }).limit(10).select('status startedAt completedAt createdAt error');

    res.status(200).json({
      success: true,
      data: { run, runs },
    });
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      userId: req.user._id,
    });

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    // Get the latest completed run
    const run = await ResearchRun.findOne({
      workspaceId,
      userId: req.user._id,
      status: 'completed',
    }).sort({ createdAt: -1 });

    if (!run) {
      return res.status(200).json({
        success: true,
        data: { finding: null, sources: [], run: null },
      });
    }

    const finding = await ResearchFinding.findOne({
      workspaceId,
      researchRunId: run._id,
    });

    const sources = await Source.find({
      workspaceId,
      researchRunId: run._id,
    }).sort({ relevanceScore: -1 });

    res.status(200).json({
      success: true,
      data: { finding, sources, run },
    });
  } catch (error) {
    next(error);
  }
};
