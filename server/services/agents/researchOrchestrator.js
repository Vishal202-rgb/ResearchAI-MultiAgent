import ResearchRun from '../../models/ResearchRun.js';
import AgentLog from '../../models/AgentLog.js';
import Source from '../../models/Source.js';
import ResearchFinding from '../../models/ResearchFinding.js';
import Report from '../../models/Report.js';
import ResearchPlan from '../../models/ResearchPlan.js';
import Workspace from '../../models/Workspace.js';
import runPlannerAgent from './plannerAgent.js';
import runResearcherAgent from './researcherAgent.js';
import runAnalystAgent from './analystAgent.js';
import runFactCheckerAgent from './factCheckerAgent.js';
import runSynthesizerAgent from './synthesizerAgent.js';

const AGENTS = ['planner', 'researcher', 'analyst', 'fact_checker', 'synthesizer'];

const updateAgentStatus = async (runId, agentName, status, error = '') => {
  const updateFields = {
    'agentStatuses.$[elem].status': status,
    updatedAt: new Date(),
  };
  if (status === 'running') {
    updateFields['agentStatuses.$[elem].startedAt'] = new Date();
  }
  if (status === 'completed' || status === 'failed') {
    updateFields['agentStatuses.$[elem].completedAt'] = new Date();
  }
  if (error !== undefined) {
    updateFields['agentStatuses.$[elem].error'] = error;
  }

  const updatedRun = await ResearchRun.findByIdAndUpdate(
    runId,
    { $set: updateFields },
    {
      arrayFilters: [{ 'elem.agent': agentName }],
      new: true,
    }
  );
  return updatedRun;
};

const logAgent = async (workspaceId, researchPlanId, agentType, status, message, error = '') => {
  try {
    return await AgentLog.create({
      workspaceId,
      researchPlanId,
      agentType,
      status, // 'started', 'completed', or 'failed'
      message,
      error,
      startedAt: status === 'started' ? new Date() : undefined,
      completedAt: status !== 'started' ? new Date() : undefined,
    });
  } catch (err) {
    console.error(`[Research Pipeline] Failed to log agent ${agentType} (${status}):`, err.message);
  }
};

const runResearchPipeline = async (run, plan, workspace) => {
  const { workspaceId, _id: runId } = run;
  const researchQuestion = plan.researchQuestion;
  const context = {
    domain: workspace.researchDomain,
    objective: plan.objective || workspace.researchObjective,
  };

  let currentAgent = null;

  try {
    // ─── STEP 1: Planner ───
    currentAgent = 'planner';
    await updateAgentStatus(runId, 'planner', 'running');
    await logAgent(workspaceId, plan._id, 'planner', 'started', 'Planner using existing plan');

    await updateAgentStatus(runId, 'planner', 'completed');
    await logAgent(workspaceId, plan._id, 'planner', 'completed', `Planner: ${plan.tasks.length} tasks`);

    // ─── STEP 2: Researcher ───
    currentAgent = 'researcher';
    await updateAgentStatus(runId, 'researcher', 'running');
    await logAgent(workspaceId, plan._id, 'researcher', 'started', 'Researcher agent started (Batched/Optimized)');

    const researcherResult = await runResearcherAgent(plan.tasks, researchQuestion, context);
    const collectedSources = Array.isArray(researcherResult?.sources) ? researcherResult.sources : [];

    if (collectedSources.length > 0) {
      const sourceDocs = collectedSources.map((s) => ({
        workspaceId,
        researchRunId: runId,
        ...s,
      }));
      await Source.insertMany(sourceDocs);
    }

    plan.tasks.forEach((t) => { if (t.agentType === 'researcher') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(runId, 'researcher', 'completed');
    await logAgent(workspaceId, plan._id, 'researcher', 'completed', `Researcher collected ${collectedSources.length} sources`);

    // ─── STEP 3: Analyst ───
    currentAgent = 'analyst';
    await updateAgentStatus(runId, 'analyst', 'running');
    await logAgent(workspaceId, plan._id, 'analyst', 'started', 'Analyst agent started (Dual-Role Optimized)');

    // Returns both analysis and factCheck properties to save API calls
    const analystOutput = await runAnalystAgent(
      researchQuestion, collectedSources, researcherResult?.rawData || [], context
    );
    const analysisResult = analystOutput?.analysis || {};

    plan.tasks.forEach((t) => { if (t.agentType === 'analyst') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(runId, 'analyst', 'completed');
    await logAgent(workspaceId, plan._id, 'analyst', 'completed', `Analyst found ${(analysisResult.patterns || []).length} patterns`);

    // Persist intermediate analysis findings
    await ResearchFinding.findOneAndUpdate(
      { researchRunId: runId },
      {
        workspaceId,
        researchRunId: runId,
        rawAnalysis: analysisResult.evidenceSummary || '',
        insights: analysisResult.keyInsights || [],
      },
      { upsert: true, new: true }
    );

    // ─── STEP 4: Fact Checker ───
    currentAgent = 'fact_checker';
    await updateAgentStatus(runId, 'fact_checker', 'running');
    await logAgent(workspaceId, plan._id, 'fact_checker', 'started', 'Fact checker agent started (Optimized zero-call)');

    // Uses pre-computed fact check from the analyst output
    const factCheckResult = await runFactCheckerAgent(
      researchQuestion, collectedSources, analystOutput
    );
    const validatedClaims = Array.isArray(factCheckResult?.claims) ? factCheckResult.claims : [];

    plan.tasks.forEach((t) => { if (t.agentType === 'fact_checker') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(runId, 'fact_checker', 'completed');
    await logAgent(workspaceId, plan._id, 'fact_checker', 'completed', `Fact checker verified ${validatedClaims.length} claims`);

    // Persist verified claims to findings
    await ResearchFinding.findOneAndUpdate(
      { researchRunId: runId },
      { claims: validatedClaims },
      { upsert: true, new: true }
    );

    // ─── STEP 5: Synthesizer ───
    currentAgent = 'synthesizer';
    console.log(`[Research Pipeline] Synthesizer execution started for run: ${runId}`);
    await updateAgentStatus(runId, 'synthesizer', 'running');
    await logAgent(workspaceId, plan._id, 'synthesizer', 'started', 'Synthesizer agent started');

    console.log(`[Research Pipeline] Input data received for synthesis:`, {
      sourcesCount: collectedSources.length,
      patternsCount: (analysisResult.patterns || []).length,
      claimsCount: validatedClaims.length,
      objective: context.objective || 'None',
    });

    const synthesisResult = await runSynthesizerAgent(
      researchQuestion, collectedSources, analysisResult, factCheckResult, context
    );

    plan.tasks.forEach((t) => { if (t.agentType === 'synthesizer') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(runId, 'synthesizer', 'completed');
    await logAgent(workspaceId, plan._id, 'synthesizer', 'completed', `Synthesizer produced ${(synthesisResult.keyFindings || []).length} findings`);

    // ─── Save final findings ───
    await ResearchFinding.findOneAndUpdate(
      { researchRunId: runId },
      {
        workspaceId,
        researchRunId: runId,
        summary: synthesisResult.summary,
        keyFindings: synthesisResult.keyFindings,
        insights: synthesisResult.insights,
        limitations: synthesisResult.limitations,
        claims: validatedClaims,
        rawAnalysis: analysisResult.evidenceSummary || '',
      },
      { upsert: true, new: true }
    );

    // ─── Save final report (prevent duplicates for this run) ───
    await Report.deleteMany({ researchRunId: runId });
    const finalReport = await Report.create({
      workspaceId,
      userId: run.userId,
      researchRunId: runId,
      title: synthesisResult.title || `${workspace.title || 'Research'} - Final Report`,
      executiveSummary: synthesisResult.summary || '',
      researchQuestion,
      methodology: synthesisResult.methodology || 'Multi-agent AI research pipeline with web search, pattern analysis, and fact-checking.',
      keyFindings: synthesisResult.keyFindings || [],
      detailedAnalysis: synthesisResult.detailedAnalysis || analysisResult.evidenceSummary || '',
      limitations: synthesisResult.limitations || [],
      conclusion: synthesisResult.conclusion || '',
      references: collectedSources.map((s) => ({
        title: s.title,
        url: s.url,
        publisher: s.publisher,
      })),
      markdown: synthesisResult.markdown,
    });
    console.log(`[Research Pipeline] Final report successfully saved with ID: ${finalReport._id}`);

    // Mark research run as completed
    await ResearchRun.findByIdAndUpdate(runId, {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        error: '',
      }
    });

    if (workspace.status !== 'completed') {
      workspace.status = 'active';
      await workspace.save();
    }

    console.log(`[Research Pipeline] Research run ${runId} completed successfully.`);

  } catch (error) {
    const errorMsg = error.message || 'Unknown research pipeline failure';
    console.error(`[Research Pipeline] Run ${runId} failed at agent "${currentAgent}":`, errorMsg);

    if (currentAgent) {
      await updateAgentStatus(runId, currentAgent, 'failed', errorMsg);
      await logAgent(workspaceId, plan._id, currentAgent, 'failed', `Agent failed: ${errorMsg}`, errorMsg);
    }

    await ResearchRun.findByIdAndUpdate(runId, {
      $set: {
        status: 'failed',
        error: errorMsg,
        completedAt: new Date(),
      }
    });
  }
};

/**
 * Advances the Researcher stage atomically.
 */
export const advanceResearcherStage = async (runId, workspaceId) => {
  const staleThreshold = new Date(Date.now() - 5 * 1000);

  const claimedRun = await ResearchRun.findOneAndUpdate(
    {
      _id: runId,
      status: 'running',
      $or: [
        { 'agentStatuses': { $elemMatch: { agent: 'researcher', status: 'pending' } } },
        { 'agentStatuses': { $elemMatch: { agent: 'researcher', status: 'running', startedAt: { $lt: staleThreshold } } } },
      ],
    },
    {
      $set: {
        'agentStatuses.$[elem].status': 'running',
        'agentStatuses.$[elem].startedAt': new Date(),
        updatedAt: new Date(),
      },
    },
    {
      arrayFilters: [{ 'elem.agent': 'researcher' }],
      new: true,
    }
  );

  if (!claimedRun) return null;

  try {
    const [workspace, planDoc] = await Promise.all([
      Workspace.findById(workspaceId),
      ResearchPlan.findById(claimedRun.researchPlanId),
    ]);

    const researchQuestion = planDoc?.researchQuestion || workspace?.researchQuestion || workspace?.title || 'Research Analysis';
    const context = {
      domain: workspace?.researchDomain,
      objective: planDoc?.objective || workspace?.researchObjective,
    };

    // Mark planner completed if pending
    await updateAgentStatus(runId, 'planner', 'completed');

    const researcherResult = await runResearcherAgent(planDoc?.tasks || [], researchQuestion, context);
    const collectedSources = Array.isArray(researcherResult?.sources) ? researcherResult.sources : [];

    // Save sources if collected (prevent duplicate insertions)
    await Source.deleteMany({ researchRunId: runId });
    if (collectedSources.length > 0) {
      const sourceDocs = collectedSources.map((s) => ({
        workspaceId,
        researchRunId: runId,
        ...s,
      }));
      await Source.insertMany(sourceDocs);
    }

    if (planDoc && Array.isArray(planDoc.tasks)) {
      planDoc.tasks.forEach((t) => { if (t.agentType === 'researcher') t.status = 'completed'; });
      await planDoc.save();
    }

    await updateAgentStatus(runId, 'researcher', 'completed');
    await logAgent(workspaceId, claimedRun.researchPlanId, 'researcher', 'completed', `Researcher collected ${collectedSources.length} sources`);

    return claimedRun;
  } catch (error) {
    const errorMsg = error.message || 'Researcher stage failed';
    console.error(`[Research Pipeline] Advance researcher failed for run ${runId}:`, errorMsg);
    await updateAgentStatus(runId, 'researcher', 'failed', errorMsg);
    throw error;
  }
};

/**
 * Advances the Analyst & Fact Checker stage atomically.
 */
export const advanceAnalystStage = async (runId, workspaceId) => {
  const staleThreshold = new Date(Date.now() - 5 * 1000);

  const claimedRun = await ResearchRun.findOneAndUpdate(
    {
      _id: runId,
      status: 'running',
      'agentStatuses': {
        $all: [
          { $elemMatch: { agent: 'researcher', status: 'completed' } },
        ],
      },
      $or: [
        { 'agentStatuses': { $elemMatch: { agent: 'analyst', status: 'pending' } } },
        { 'agentStatuses': { $elemMatch: { agent: 'analyst', status: 'running', startedAt: { $lt: staleThreshold } } } },
      ],
    },
    {
      $set: {
        'agentStatuses.$[elem].status': 'running',
        'agentStatuses.$[elem].startedAt': new Date(),
        updatedAt: new Date(),
      },
    },
    {
      arrayFilters: [{ 'elem.agent': 'analyst' }],
      new: true,
    }
  );

  if (!claimedRun) return null;

  try {
    const [workspace, planDoc, sources] = await Promise.all([
      Workspace.findById(workspaceId),
      ResearchPlan.findById(claimedRun.researchPlanId),
      Source.find({ researchRunId: runId }),
    ]);

    const researchQuestion = planDoc?.researchQuestion || workspace?.researchQuestion || workspace?.title || 'Research Analysis';
    const context = {
      domain: workspace?.researchDomain,
      objective: planDoc?.objective || workspace?.researchObjective,
    };

    const analystOutput = await runAnalystAgent(researchQuestion, sources, [], context);
    const analysisResult = analystOutput?.analysis || {};
    const factCheckerResult = await runFactCheckerAgent(researchQuestion, sources, analystOutput);

    if (planDoc && Array.isArray(planDoc.tasks)) {
      planDoc.tasks.forEach((t) => {
        if (t.agentType === 'analyst' || t.agentType === 'fact_checker') t.status = 'completed';
      });
      await planDoc.save();
    }

    await updateAgentStatus(runId, 'analyst', 'completed');
    await updateAgentStatus(runId, 'fact_checker', 'completed');

    await ResearchFinding.findOneAndUpdate(
      { researchRunId: runId },
      {
        workspaceId,
        researchRunId: runId,
        summary: analysisResult.evidenceSummary || 'Analysis generated from collected sources.',
        keyFindings: analysisResult.keyInsights || analysisResult.patterns || [],
        insights: analysisResult.keyInsights || [],
        limitations: analysisResult.gaps || [],
        claims: factCheckerResult?.claims || [],
        rawAnalysis: analysisResult.evidenceSummary || '',
      },
      { upsert: true, new: true }
    );

    return claimedRun;
  } catch (error) {
    const errorMsg = error.message || 'Analyst stage failed';
    console.error(`[Research Pipeline] Advance analyst failed for run ${runId}:`, errorMsg);
    await updateAgentStatus(runId, 'analyst', 'failed', errorMsg);
    await updateAgentStatus(runId, 'fact_checker', 'failed', errorMsg);
    throw error;
  }
};

/**
 * Resumes or advances the Synthesizer stage if it was suspended or stalled.
 * Atomically claims execution to prevent duplicate executions across polling requests.
 */
export const resumeSynthesizerStage = async (runId, workspaceId) => {
  const staleThreshold = new Date(Date.now() - 5 * 1000);

  const claimedRun = await ResearchRun.findOneAndUpdate(
    {
      _id: runId,
      status: 'running',
      'agentStatuses': {
        $all: [
          { $elemMatch: { agent: 'fact_checker', status: 'completed' } },
        ],
      },
      $or: [
        { 'agentStatuses': { $elemMatch: { agent: 'synthesizer', status: 'pending' } } },
        { 'agentStatuses': { $elemMatch: { agent: 'synthesizer', status: 'running', startedAt: { $lt: staleThreshold } } } },
      ],
    },
    {
      $set: {
        'agentStatuses.$[elem].status': 'running',
        'agentStatuses.$[elem].startedAt': new Date(),
        updatedAt: new Date(),
      },
    },
    {
      arrayFilters: [{ 'elem.agent': 'synthesizer' }],
      new: true,
    }
  );

  if (!claimedRun) {
    return null;
  }

  console.log(`[Research Pipeline] Resuming synthesizer stage for run: ${runId}`);

  try {
    const [workspace, planDoc, sources, existingFinding] = await Promise.all([
      Workspace.findById(workspaceId),
      ResearchPlan.findById(claimedRun.researchPlanId),
      Source.find({ researchRunId: runId }),
      ResearchFinding.findOne({ researchRunId: runId }),
    ]);

    const researchQuestion = planDoc?.researchQuestion || workspace?.researchQuestion || workspace?.title || 'Research Analysis';
    const context = {
      domain: workspace?.researchDomain,
      objective: planDoc?.objective || workspace?.researchObjective,
    };

    const analysisResult = {
      patterns: existingFinding?.insights || [],
      evidenceSummary: existingFinding?.rawAnalysis || '',
      keyInsights: existingFinding?.insights || [],
    };

    const factCheckResult = {
      claims: existingFinding?.claims || [],
    };

    const synthesisResult = await runSynthesizerAgent(
      researchQuestion, sources, analysisResult, factCheckResult, context
    );

    if (planDoc && Array.isArray(planDoc.tasks)) {
      planDoc.tasks.forEach((t) => { if (t.agentType === 'synthesizer') t.status = 'completed'; });
      await planDoc.save();
    }

    await updateAgentStatus(runId, 'synthesizer', 'completed');
    await logAgent(workspaceId, claimedRun.researchPlanId, 'synthesizer', 'completed', `Synthesizer produced ${(synthesisResult.keyFindings || []).length} findings`);

    await ResearchFinding.findOneAndUpdate(
      { researchRunId: runId },
      {
        workspaceId,
        researchRunId: runId,
        summary: synthesisResult.summary,
        keyFindings: synthesisResult.keyFindings,
        insights: synthesisResult.insights,
        limitations: synthesisResult.limitations,
        claims: existingFinding?.claims || [],
        rawAnalysis: analysisResult.evidenceSummary,
      },
      { upsert: true, new: true }
    );

    await Report.deleteMany({ researchRunId: runId });
    await Report.create({
      workspaceId,
      userId: claimedRun.userId,
      researchRunId: runId,
      title: synthesisResult.title || `${workspace?.title || 'Research'} - Final Report`,
      executiveSummary: synthesisResult.summary || '',
      researchQuestion,
      methodology: synthesisResult.methodology || 'Multi-agent AI research pipeline with web search, pattern analysis, and fact-checking.',
      keyFindings: synthesisResult.keyFindings || [],
      detailedAnalysis: synthesisResult.detailedAnalysis || analysisResult.evidenceSummary || '',
      limitations: synthesisResult.limitations || [],
      conclusion: synthesisResult.conclusion || '',
      references: sources.map((s) => ({
        title: s.title,
        url: s.url,
        publisher: s.publisher,
      })),
      markdown: synthesisResult.markdown,
    });

    await ResearchRun.findByIdAndUpdate(runId, {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        error: '',
      },
    });

    if (workspace && workspace.status !== 'completed') {
      workspace.status = 'active';
      await workspace.save();
    }

    console.log(`[Research Pipeline] Resumed synthesizer stage for run ${runId} completed successfully.`);
    return claimedRun;
  } catch (error) {
    const errorMsg = error.message || 'Resumed synthesizer stage failed';
    console.error(`[Research Pipeline] Resume synthesizer failed for run ${runId}:`, errorMsg);
    await updateAgentStatus(runId, 'synthesizer', 'failed', errorMsg);
    await ResearchRun.findByIdAndUpdate(runId, {
      $set: {
        status: 'failed',
        error: errorMsg,
        completedAt: new Date(),
      },
    });
    throw error;
  }
};

/**
 * Top-level advancement coordinator called on polling requests.
 * Drives the pipeline forward stage by stage safely across serverless restarts.
 */
export const advancePipelineStage = async (runId, workspaceId) => {
  const run = await ResearchRun.findById(runId);
  if (!run || run.status !== 'running') return null;

  const getStatus = (name) => run.agentStatuses.find((a) => a.agent === name)?.status;

  const researcherStatus = getStatus('researcher');
  const analystStatus = getStatus('analyst');
  const factCheckerStatus = getStatus('fact_checker');
  const synthesizerStatus = getStatus('synthesizer');

  if (researcherStatus === 'pending' || researcherStatus === 'running') {
    return await advanceResearcherStage(runId, workspaceId);
  }

  if (researcherStatus === 'completed' && (analystStatus === 'pending' || analystStatus === 'running')) {
    return await advanceAnalystStage(runId, workspaceId);
  }

  if (factCheckerStatus === 'completed' && (synthesizerStatus === 'pending' || synthesizerStatus === 'running')) {
    return await resumeSynthesizerStage(runId, workspaceId);
  }

  return null;
};

export const startResearchRun = async (workspace, plan, userId) => {
  const run = await ResearchRun.create({
    workspaceId: workspace._id,
    userId,
    researchPlanId: plan._id,
    status: 'running',
    startedAt: new Date(),
    agentStatuses: AGENTS.map((agent) => ({
      agent,
      status: 'pending',
    })),
  });

  // In non-serverless environments (standalone Node), run pipeline in background.
  // In Vercel / serverless environments, unawaited promises freeze on response,
  // so the pipeline is driven safely stage-by-stage by advancePipelineStage on client polling.
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.SERVERLESS);

  if (!isServerless && !process.env.DISABLE_BACKGROUND_PIPELINE) {
    runResearchPipeline(run, plan, workspace).catch(async (err) => {
      console.error('[Research Pipeline] Unhandled background error in runResearchPipeline:', err.message);
      try {
        await ResearchRun.findByIdAndUpdate(run._id, {
          $set: {
            status: 'failed',
            error: err.message || 'Pipeline execution failed unexpectedly',
            completedAt: new Date(),
          }
        });
      } catch (saveErr) {
        console.error('Failed to mark run as failed after unhandled error:', saveErr.message);
      }
    });
  }

  return run;
};

export { runResearchPipeline };
export default startResearchRun;
