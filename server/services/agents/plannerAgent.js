import callGemini from '../ai/geminiService.js';

const VALID_AGENT_TYPES = ['researcher', 'analyst', 'fact_checker', 'synthesizer'];
const VALID_PRIORITIES = ['high', 'medium', 'low'];

/**
 * Build the planner prompt for Gemini.
 */
const buildPlannerPrompt = (researchQuestion, context = {}) => {
  return `You are an expert research planner AI. Given a research question, create a detailed, structured research plan.

RESEARCH QUESTION: "${researchQuestion}"
${context.domain ? `DOMAIN: ${context.domain}` : ''}
${context.objective ? `USER OBJECTIVE: ${context.objective}` : ''}

Generate a research plan with the following JSON structure:

{
  "objective": "A clear, concise research objective (1-2 sentences)",
  "subQuestions": [
    "Sub-question 1 that helps answer the main research question",
    "Sub-question 2",
    "Sub-question 3"
  ],
  "tasks": [
    {
      "title": "Short task title",
      "description": "Detailed description of what this task involves",
      "agentType": "researcher|analyst|fact_checker|synthesizer",
      "priority": "high|medium|low"
    }
  ]
}

RULES:
- Generate 3 to 6 sub-questions that break down the main research question
- Generate 4 to 8 research tasks
- Each task must have exactly one agentType from: researcher, analyst, fact_checker, synthesizer
- Each task must have a priority: high, medium, or low
- Tasks should be ordered logically (research first, then analysis, then fact-checking, then synthesis)
- Be specific and actionable in task descriptions
- The objective should directly address the research question

Return ONLY valid JSON. No additional text.`;
};

/**
 * Validate and sanitize the planner output from Gemini.
 */
const validatePlannerOutput = (data, researchQuestion = '') => {
  const safeData = data && typeof data === 'object' ? data : {};

  // Extract objective with fallbacks
  let objective = safeData.objective || safeData.goal || safeData.research_objective || safeData.title;
  if (!objective || typeof objective !== 'string' || !objective.trim()) {
    objective = `Conduct comprehensive research to answer: "${researchQuestion || 'the research question'}"`;
  }

  // Extract sub-questions with fallbacks
  const rawSubQuestions = safeData.subQuestions || safeData.sub_questions || safeData.subquestions || safeData.questions || [];
  let subQuestions = Array.isArray(rawSubQuestions)
    ? rawSubQuestions.filter((q) => typeof q === 'string' && q.trim()).map((q) => q.trim())
    : [];

  if (subQuestions.length === 0) {
    const topic = researchQuestion ? `for "${researchQuestion}"` : 'for the research objective';
    subQuestions = [
      `What are the core background, definitions, and state-of-the-art developments ${topic}?`,
      `What are the key technical architectures, methodologies, and best practices?`,
      `What are the critical trade-offs, challenges, and future trajectories?`,
    ];
  }

  // Extract tasks with fallbacks
  const rawTasks = safeData.tasks || safeData.researchTasks || safeData.plan || safeData.steps || [];
  let tasks = Array.isArray(rawTasks) ? rawTasks : [];

  if (tasks.length === 0) {
    tasks = [
      {
        title: 'Comprehensive Source Collection',
        description: 'Search academic literature, documentation, and web sources for primary evidence.',
        agentType: 'researcher',
        priority: 'high',
      },
      {
        title: 'Cross-Source Pattern & Trend Analysis',
        description: 'Examine gathered data to extract core patterns, identify agreements, and detect contradictions.',
        agentType: 'analyst',
        priority: 'high',
      },
      {
        title: 'Claim Verification & Evidence Auditing',
        description: 'Validate key technical claims and evaluate confidence levels against verified sources.',
        agentType: 'fact_checker',
        priority: 'medium',
      },
      {
        title: 'Final Report Synthesis',
        description: 'Assemble findings, methodologies, and limitations into a structured comprehensive report.',
        agentType: 'synthesizer',
        priority: 'high',
      },
    ];
  }

  // Map and sanitize each task
  const validatedTasks = tasks.map((task, index) => {
    const rawTitle = task.title || task.name || task.task || task.task_title || (typeof task === 'string' ? task : '');
    const title = (rawTitle && typeof rawTitle === 'string' && rawTitle.trim())
      ? rawTitle.trim()
      : `Research Task ${index + 1}`;

    const rawDesc = task.description || task.details || task.summary || '';
    const description = typeof rawDesc === 'string' ? rawDesc.trim() : '';

    let agentType = (typeof task.agentType === 'string' ? task.agentType.toLowerCase().trim() : '');
    if (agentType === 'research' || agentType === 'search') agentType = 'researcher';
    if (agentType === 'analysis' || agentType === 'analyze') agentType = 'analyst';
    if (agentType === 'factcheck' || agentType === 'fact_check' || agentType === 'verify') agentType = 'fact_checker';
    if (agentType === 'synthesis' || agentType === 'synthesize') agentType = 'synthesizer';

    if (!VALID_AGENT_TYPES.includes(agentType)) {
      // Assign sensible agent type based on order if unrecognized
      agentType = VALID_AGENT_TYPES[index % VALID_AGENT_TYPES.length];
    }

    let priority = typeof task.priority === 'string' ? task.priority.toLowerCase().trim() : 'medium';
    if (!VALID_PRIORITIES.includes(priority)) {
      priority = 'medium';
    }

    return {
      title,
      description,
      agentType,
      priority,
      status: 'pending',
    };
  });

  return {
    objective: objective.trim(),
    subQuestions: subQuestions.slice(0, 6),
    tasks: validatedTasks,
  };
};

/**
 * Run the Planner Agent: calls Gemini and returns a validated research plan.
 */
const runPlannerAgent = async (researchQuestion, context = {}) => {
  const prompt = buildPlannerPrompt(researchQuestion, context);
  let rawOutput = {};
  try {
    rawOutput = await callGemini(prompt, { temperature: 0.7, maxTokens: 4096, timeoutMs: 25000, retries: 1 });
  } catch (err) {
    console.warn(`[Planner Agent] Gemini API unavailable (${err.message}). Using fallback structured research plan.`);
    rawOutput = {};
  }
  const validatedPlan = validatePlannerOutput(rawOutput, researchQuestion);
  return validatedPlan;
};

export default runPlannerAgent;
