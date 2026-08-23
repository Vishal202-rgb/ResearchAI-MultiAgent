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
    const { default: searchWeb } = await import('../services/search/searchService.js');
    const { retrieveRelevantContext } = await import('../services/rag/retrievalService.js');
    const { default: callGemini } = await import('../services/ai/geminiService.js');
    const { default: Workspace } = await import('../models/Workspace.js');

    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found or unauthorized', 404));

    // 1 & 2. Run Web search and RAG retrieval in parallel
    const [searchResults, ragResults] = await Promise.all([
      searchWeb(finding, { numResults: 3 }),
      retrieveRelevantContext(finding, workspaceId, req.user._id, 3)
    ]);

    const webContext = (searchResults || []).map(s => `[${s.title}](${s.url}): ${s.snippet}`).join('\n');
    const docContext = (ragResults || []).map(d => d.text).join('\n');

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

    const result = await callGemini(prompt, { temperature: 0.3, retries: 0 });

    res.status(200).json({
      success: true,
      data: { deepDive: result }
    });
  } catch (error) {
    next(error);
  }
};

export const runDebateStage = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { finding, stage, proArgument, counterArgument, evidenceText } = req.body;

    if (!finding || !stage) return next(new AppError('Finding and stage are required', 400));

    const { default: searchWeb } = await import('../services/search/searchService.js');
    const { retrieveRelevantContext } = await import('../services/rag/retrievalService.js');
    const { default: callGemini } = await import('../services/ai/geminiService.js');
    const { default: Workspace } = await import('../models/Workspace.js');

    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));

    let prompt = '';
    let result = '';

    if (stage === 'pro') {
      prompt = `You are the PRO Agent in an academic debate. Your goal is to vigorously defend and support the following research finding: "${finding}"
Produce a strong, logical argument (1-2 paragraphs) that validates this claim. Do not hallucinate data, rely on general logical principles and standard industry knowledge.`;
      result = await callGemini(prompt, { temperature: 0.7, retries: 1 });
    } 
    else if (stage === 'counter') {
      prompt = `You are the COUNTER Agent in an academic debate.
Topic: "${finding}"
Pro Argument: "${proArgument}"
Your goal is to challenge this claim, identify weaknesses, counterexamples, or alternative perspectives. Produce a strong, logical counterargument (1-2 paragraphs).`;
      result = await callGemini(prompt, { temperature: 0.7, retries: 1 });
    }
    else if (stage === 'evidence') {
      const [searchResults, ragResults] = await Promise.all([
        searchWeb(finding, { numResults: 3 }),
        retrieveRelevantContext(finding, workspaceId, req.user._id, 3)
      ]);
      const webContext = (searchResults || []).map(s => `[${s.title}](${s.url}): ${s.snippet}`).join('\n');
      const docContext = (ragResults || []).map(d => d.text).join('\n');
      
      prompt = `You are the EVIDENCE Agent in an academic debate.\nTopic: "${finding}"\nPro Argument: "${proArgument}"\nCounter Argument: "${counterArgument}"\n\nAvailable Evidence:\nWEB SOURCES:\n${webContext}\nDOCUMENT CONTEXT:\n${docContext}\n\nAnalyze the arguments against the available evidence. Which points are factually supported by the evidence? Which are unverified? Provide an objective evidence check (1-2 paragraphs). Return ONLY text, no markdown headers unless necessary.`;
      result = await callGemini(prompt, { temperature: 0.3, retries: 1 });
    }
    else if (stage === 'judge') {
      prompt = `You are the JUDGE Agent in a research debate.
Topic: "${finding}"
Pro: "${proArgument}"
Counter: "${counterArgument}"
Evidence Check: "${evidenceText}"

Evaluate the entire debate. You must output a JSON object exactly matching this schema:
{
  "verdictType": "Strongly Supported" | "Supported" | "Partially Supported" | "Weakly Supported" | "Insufficient Evidence",
  "confidenceScore": number (0 to 100),
  "keyReasons": ["Reason 1", "Reason 2", "Reason 3"],
  "finalVerdict": "A 1-2 paragraph final ruling explaining the conclusion."
}`;
      const rawResult = await callGemini(prompt, { temperature: 0.3, retries: 1 });
      
      try {
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResult);
      } catch (e) {
        result = {
          verdictType: "Insufficient Evidence",
          confidenceScore: 50,
          keyReasons: ["Failed to parse judge output"],
          finalVerdict: rawResult
        };
      }
    } else {
      return next(new AppError('Invalid debate stage', 400));
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const traceEvidence = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { claim } = req.body;
    
    if (!claim) return next(new AppError('Claim is required', 400));
    
    const { default: Source } = await import('../models/Source.js');
    const { default: ResearchRun } = await import('../models/ResearchRun.js');
    const { retrieveRelevantContext } = await import('../services/rag/retrievalService.js');
    const { default: callGemini } = await import('../services/ai/geminiService.js');
    
    const { default: Workspace } = await import('../models/Workspace.js');
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));
    const run = await ResearchRun.findOne({ workspaceId, status: 'completed' }).sort({ createdAt: -1 });
    if (!run) return next(new AppError('No completed research run found', 404));
    
    const sources = await Source.find({ workspaceId, researchRunId: run._id });
    const ragContext = await retrieveRelevantContext(claim, workspaceId, req.user._id, 5);
    
    const conciseSources = sources.map((s, i) => `[Source ${i + 1}] | Title: ${s.title} | URL: ${s.url} | Publisher: ${s.publisher} | Date: ${s.publishedDate} | Snippet: ${s.snippet}`).join('\n');
    const ragSummaries = ragContext.map(r => `ID: ${r.id} | Content: ${r.content}`).join('\n');
    
    const prompt = `You are an AI research assistant. Your task is to trace the evidence for this claim: "${claim}"
    
The claim likely contains bracketed references like [Source 1], [Source 2], etc.
Match these references explicitly to the provided web sources which are numbered [Source 1], [Source 2], etc.
If the claim specifically cites a source, include it in the supporting evidence and explain why.

Here are the collected web sources:
${conciseSources}

Here are related RAG document snippets:
${ragSummaries}

Analyze these sources and document snippets. Determine which ones support the claim and which ones contradict or challenge it.
Return the result strictly as a JSON object matching this schema:
{
  "supporting": [
    {
      "sourceId": "The ID of the source or document",
      "title": "Title",
      "publisher": "Publisher (if any)",
      "url": "URL (if any)",
      "date": "Date (if any)",
      "snippet": "Short relevant snippet from the source text",
      "reason": "Why this supports the claim (1-2 sentences)"
    }
  ],
  "contradicting": [
    {
      "sourceId": "The ID",
      "title": "Title",
      "publisher": "...",
      "url": "...",
      "date": "...",
      "snippet": "...",
      "reason": "Why this contradicts or challenges the claim"
    }
  ]
}
If no sources support or contradict, leave the arrays empty.
`;

    const result = await callGemini(prompt, { temperature: 0.2, retries: 1 });
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const detectContradictions = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    const { default: Source } = await import('../models/Source.js');
    const { default: ResearchRun } = await import('../models/ResearchRun.js');
    const { default: ResearchFinding } = await import('../models/ResearchFinding.js');
    const { default: callGemini } = await import('../services/ai/geminiService.js');
    
    const { default: Workspace } = await import('../models/Workspace.js');
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));
    const run = await ResearchRun.findOne({ workspaceId, status: 'completed' }).sort({ createdAt: -1 });
    if (!run) return next(new AppError('No completed research run found', 404));
    
    const findingDoc = await ResearchFinding.findOne({ researchRunId: run._id });
    const sources = await Source.find({ researchRunId: run._id }).limit(20);
    
    const findingsText = findingDoc?.keyFindings?.join('\n') || '';
    const claimsText = findingDoc?.claims?.map(c => c.claim).join('\n') || '';
    const conciseSources = sources.map(s => `Title: ${s.title} | Snippet: ${s.snippet}`).join('\n');
    
    const prompt = `You are a rigorous AI Fact-Checker and Contradiction Detector.
Analyze the following research findings/claims and the collected source evidence.
Look for MEANINGFUL contradictions (e.g. conflicting data points, opposite conclusions).
Do not assume two sources contradict each other simply because their wording differs. Use actual evidence to determine if a meaningful contradiction exists.

Findings/Claims:
${findingsText}
${claimsText}

Source Evidence:
${conciseSources}

Return the result as a strict JSON object with this schema:
{
  "contradictions": [
    {
      "type": "claim_vs_claim" | "source_vs_source" | "claim_vs_source",
      "itemA": "Text of claim A or source A",
      "itemB": "Text of claim B or source B",
      "whyConflict": "Explanation of the conflict",
      "explanation": "Possible explanation (e.g., Different datasets, Different time periods, Different methodologies, Different populations, Or genuinely conflicting evidence)",
      "severity": "High" | "Medium" | "Low",
      "supportingEvidence": "Summary of evidence supporting A",
      "conflictingEvidence": "Summary of evidence supporting B"
    }
  ]
}
If there are no meaningful contradictions, return { "contradictions": [] }
`;

    const result = await callGemini(prompt, { temperature: 0.2, retries: 1 });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getHistoryDiff = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { default: ResearchRun } = await import('../models/ResearchRun.js');
    const { default: ResearchFinding } = await import('../models/ResearchFinding.js');
    const { default: Source } = await import('../models/Source.js');
    const { default: callGemini } = await import('../services/ai/geminiService.js');
    
    const { default: Workspace } = await import('../models/Workspace.js');
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));
    const findings = await ResearchFinding.find({ workspaceId }).sort({ createdAt: -1 }).limit(2);
    
    if (findings.length < 2) {
      return res.status(200).json({ success: true, data: { notEnoughHistory: true } });
    }
    
    const [latestFindings, previousFindings] = findings;
    const latestRunId = latestFindings.researchRunId;
    const previousRunId = previousFindings.researchRunId;
    
    const latestSources = await Source.find({ researchRunId: latestRunId });
    const previousSources = await Source.find({ researchRunId: previousRunId });
    
    const getUrls = (sources) => sources.map(s => s.url).filter(Boolean);
    const prevUrls = getUrls(previousSources);
    const currUrls = getUrls(latestSources);
    
    const newSources = latestSources.filter(s => s.url && !prevUrls.includes(s.url));
    const removedSources = previousSources.filter(s => s.url && !currUrls.includes(s.url));
    
    const prevFindingsArr = previousFindings?.keyFindings || [];
    const currFindingsArr = latestFindings?.keyFindings || [];
    
    const newFindings = currFindingsArr.filter(f => !prevFindingsArr.includes(f));
    const removedFindings = prevFindingsArr.filter(f => !currFindingsArr.includes(f));
    
    const prompt = `You are a Research Diff Analyzer. Compare the previous research results to the latest research results.
Determine if the research changed significantly, moderately, or minimally. Explain the most important changes in 3-5 concise points.

Previous Key Findings:
${prevFindingsArr.map(f => '- ' + f).join('\n')}
Previous Summary:
${previousFindings?.summary || ''}

Latest Key Findings:
${currFindingsArr.map(f => '- ' + f).join('\n')}
Latest Summary:
${latestFindings?.summary || ''}

Newly Added Sources:
${newSources.map(s => '- ' + s.title).join('\n')}

Removed Sources:
${removedSources.map(s => '- ' + s.title).join('\n')}

Return a strict JSON object matching this schema:
{
  "summaryLevel": "significantly" | "moderately" | "minimally",
  "points": ["point 1", "point 2", "point 3"],
  "changedFindings": [
    { "previous": "previous finding text", "latest": "how it evolved in the latest" }
  ],
  "changedEvidence": [
    { "previous": "previous evidence summary", "latest": "latest evidence summary" }
  ]
}
`;

    const semanticDiff = await callGemini(prompt, { temperature: 0.1, retries: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        notEnoughHistory: false,
        newFindings: newFindings,
        removedFindings: removedFindings,
        newSources: newSources.map(s => ({ title: s.title, url: s.url, publisher: s.publisher })),
        removedSources: removedSources.map(s => ({ title: s.title, url: s.url, publisher: s.publisher })),
        semanticDiff
      }
    });
  } catch (error) {
    next(error);
  }
};


