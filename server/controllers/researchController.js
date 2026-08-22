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
    const runs = await ResearchRun.find({
      workspaceId,
      userId: req.user._id,
      status: 'completed',
    }).sort({ createdAt: 1 });

    if (runs.length === 0) {
      return res.status(200).json({
        success: true,
        data: { finding: null, sources: [], run: null },
      });
    }

    const latestRun = runs[runs.length - 1];

    // Get ALL findings for the workspace
    const allFindings = await ResearchFinding.find({ workspaceId }).sort({ createdAt: 1 });
    let finding = null;

    if (allFindings.length > 0) {
      finding = allFindings[allFindings.length - 1].toObject();
      
      // If multiple runs exist, merge key findings and claims to preserve history
      if (allFindings.length > 1) {
        const mergedKeyFindings = new Set();
        const mergedClaims = new Map();
        
        allFindings.forEach(f => {
          (f.keyFindings || []).forEach(kf => mergedKeyFindings.add(kf));
          (f.claims || []).forEach(c => {
            mergedClaims.set(c.claim, c);
          });
        });
        
        finding.keyFindings = Array.from(mergedKeyFindings);
        finding.claims = Array.from(mergedClaims.values());
      }
    }

    // Get ALL sources for this workspace to preserve timeline history and avoid fake data
    const allSources = await Source.find({ workspaceId }).sort({ relevanceScore: -1 });
    
    // Deduplicate sources by exact URL
    const uniqueSourcesMap = new Map();
    allSources.forEach(s => {
      if (s.url && !uniqueSourcesMap.has(s.url)) {
        uniqueSourcesMap.set(s.url, s);
      }
    });
    
    const sources = Array.from(uniqueSourcesMap.values());

    res.status(200).json({
      success: true,
      data: { finding, sources, run: latestRun },
    });
  } catch (error) {
    next(error);
  }
};

export const deepDive = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { finding } = req.body;

    if (!finding) return next(new AppError('Finding text is required for deep dive', 400));

    // Simple targeted research
    const { default: searchWeb } = await import('../services/rag/searchService.js');
    const { retrieveRelevantContext } = await import('../services/rag/retrievalService.js');
    const { default: callGemini } = await import('../services/ai/geminiService.js');

    // 1. Web search for latest sources
    const searchResults = await searchWeb(finding, { maxResults: 3 });
    const webContext = searchResults.map(s => `[${s.title}](${s.url}): ${s.snippet}`).join('\n');

    // 2. RAG retrieval
    const ragResults = await retrieveRelevantContext(finding, workspaceId, req.user._id, 3);
    const docContext = ragResults.map(d => d.text).join('\n');

    const prompt = `Perform a targeted deep dive on the following finding: "${finding}"

WEB SOURCES (Latest):
${webContext}

DOCUMENT CONTEXT (RAG):
${docContext}

Synthesize a targeted deep dive report focusing on:
1. Validating Evidence (What supports this?)
2. Latest Sources (What is the most recent data?)
3. Opposing Findings / Nuance (What contradicts or adds nuance?)

Return JSON ONLY:
{
  "evidence": "Detailed validation text",
  "latestSources": [{"title": "Source 1", "url": "URL"}],
  "opposingFindings": "Contradictions or nuances"
}`;

    const result = await callGemini(prompt, { temperature: 0.3 });

    res.status(200).json({
      success: true,
      data: { deepDive: result }
    });
  } catch (error) {
    next(error);
  }
};
