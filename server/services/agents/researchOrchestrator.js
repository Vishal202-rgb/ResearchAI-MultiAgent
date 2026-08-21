import ResearchRun from '../../models/ResearchRun.js';
import AgentLog from '../../models/AgentLog.js';
import Source from '../../models/Source.js';
import ResearchFinding from '../../models/ResearchFinding.js';
import runPlannerAgent from './plannerAgent.js';
import runResearcherAgent from './researcherAgent.js';
import runAnalystAgent from './analystAgent.js';
import runFactCheckerAgent from './factCheckerAgent.js';
import runSynthesizerAgent from './synthesizerAgent.js';

const AGENTS = ['planner', 'researcher', 'analyst', 'fact_checker', 'synthesizer'];

const updateAgentStatus = async (run, agentName, status, error = '') => {
  const agentEntry = run.agentStatuses.find((a) => a.agent === agentName);
  if (agentEntry) {
    agentEntry.status = status;
    if (status === 'running') agentEntry.startedAt = new Date();
    if (status === 'completed' || status === 'failed') agentEntry.completedAt = new Date();
    if (error) agentEntry.error = error;
  }
  await run.save();
};

const logAgent = async (workspaceId, researchPlanId, agentType, status, message, error = '') => {
  await AgentLog.create({
    workspaceId,
    researchPlanId,
    agentType,
    status,
    message,
    error,
    startedAt: status === 'started' ? new Date() : undefined,
    completedAt: status !== 'started' ? new Date() : undefined,
  });
};

const runResearchPipeline = async (run, plan, workspace) => {
  const { workspaceId, _id: runId } = run;
  const researchQuestion = plan.researchQuestion;
  const context = {
    domain: workspace.researchDomain,
    objective: plan.objective || workspace.researchObjective,
  };

  try {
    // ─── STEP 1: Planner ───
    await updateAgentStatus(run, 'planner', 'running');
    await logAgent(workspaceId, plan._id, 'planner', 'started', 'Planner using existing plan');

    await updateAgentStatus(run, 'planner', 'completed');
    await logAgent(workspaceId, plan._id, 'planner', 'completed', `Planner: ${plan.tasks.length} tasks`);

    // ─── STEP 2: Researcher ───
    await updateAgentStatus(run, 'researcher', 'running');
    await logAgent(workspaceId, plan._id, 'researcher', 'started', 'Researcher agent started (Batched/Optimized)');

    const researcherResult = await runResearcherAgent(plan.tasks, researchQuestion, context);

    if (researcherResult.sources.length > 0) {
      const sourceDocs = researcherResult.sources.map((s) => ({
        workspaceId,
        researchRunId: runId,
        ...s,
      }));
      await Source.insertMany(sourceDocs);
    }

    plan.tasks.forEach((t) => { if (t.agentType === 'researcher') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(run, 'researcher', 'completed');
    await logAgent(workspaceId, plan._id, 'researcher', 'completed', `Researcher collected ${researcherResult.sources.length} sources`);

    // ─── STEP 3: Analyst ───
    await updateAgentStatus(run, 'analyst', 'running');
    await logAgent(workspaceId, plan._id, 'analyst', 'started', 'Analyst agent started (Dual-Role Optimized)');

    // Returns both analysis and factCheck properties to save API calls
    const analystOutput = await runAnalystAgent(
      researchQuestion, researcherResult.sources, researcherResult.rawData, context
    );
    const analysisResult = analystOutput.analysis || {};

    plan.tasks.forEach((t) => { if (t.agentType === 'analyst') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(run, 'analyst', 'completed');
    await logAgent(workspaceId, plan._id, 'analyst', 'completed', `Analyst found ${(analysisResult.patterns || []).length} patterns`);

    // ─── STEP 4: Fact Checker ───
    await updateAgentStatus(run, 'fact_checker', 'running');
    await logAgent(workspaceId, plan._id, 'fact_checker', 'started', 'Fact checker agent started (Optimized zero-call)');

    // Uses pre-computed fact check from the analyst output
    const factCheckResult = await runFactCheckerAgent(
      researchQuestion, researcherResult.sources, analystOutput
    );

    plan.tasks.forEach((t) => { if (t.agentType === 'fact_checker') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(run, 'fact_checker', 'completed');
    await logAgent(workspaceId, plan._id, 'fact_checker', 'completed', `Fact checker verified ${(factCheckResult.claims || []).length} claims`);

    // ─── STEP 5: Synthesizer ───
    await updateAgentStatus(run, 'synthesizer', 'running');
    await logAgent(workspaceId, plan._id, 'synthesizer', 'started', 'Synthesizer agent started');

    const synthesisResult = await runSynthesizerAgent(
      researchQuestion, researcherResult.sources, analysisResult, factCheckResult, context
    );

    plan.tasks.forEach((t) => { if (t.agentType === 'synthesizer') t.status = 'completed'; });
    await plan.save();

    await updateAgentStatus(run, 'synthesizer', 'completed');
    await logAgent(workspaceId, plan._id, 'synthesizer', 'completed', `Synthesizer produced ${(synthesisResult.keyFindings || []).length} findings`);

    // ─── Save final findings ───
    await ResearchFinding.create({
      workspaceId,
      researchRunId: runId,
      summary: synthesisResult.summary,
      keyFindings: synthesisResult.keyFindings,
      insights: synthesisResult.insights,
      limitations: synthesisResult.limitations,
      claims: factCheckResult.claims,
      rawAnalysis: analysisResult.evidenceSummary,
    });

    run.status = 'completed';
    run.completedAt = new Date();
    await run.save();

    if (workspace.status !== 'completed') {
      workspace.status = 'active';
      await workspace.save();
    }

  } catch (error) {
    console.error('Research pipeline failed:', error.message);
    const runningAgent = run.agentStatuses.find((a) => a.status === 'running');
    if (runningAgent) {
      await updateAgentStatus(run, runningAgent.agent, 'failed', error.message);
      await logAgent(workspaceId, plan._id, runningAgent.agent, 'failed', `Agent failed: ${error.message}`, error.message);
    }

    run.status = 'failed';
    run.error = error.message;
    run.completedAt = new Date();
    await run.save();
  }
};

const startResearchRun = async (workspace, plan, userId) => {
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

  runResearchPipeline(run, plan, workspace).catch(err => console.error(err));
  return run;
};

export default startResearchRun;
