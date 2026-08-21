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
 * Validate the planner output from Gemini.
 */
const validatePlannerOutput = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid planner output: expected an object');
  }

  if (!data.objective || typeof data.objective !== 'string') {
    throw new Error('Invalid planner output: missing or invalid objective');
  }

  if (!Array.isArray(data.subQuestions) || data.subQuestions.length < 1) {
    throw new Error('Invalid planner output: missing or empty subQuestions');
  }

  if (!Array.isArray(data.tasks) || data.tasks.length < 1) {
    throw new Error('Invalid planner output: missing or empty tasks');
  }

  // Validate and sanitize each task
  const validatedTasks = data.tasks.map((task, index) => {
    if (!task.title || typeof task.title !== 'string') {
      throw new Error(`Invalid task at index ${index}: missing title`);
    }

    const agentType = VALID_AGENT_TYPES.includes(task.agentType)
      ? task.agentType
      : 'researcher';

    const priority = VALID_PRIORITIES.includes(task.priority)
      ? task.priority
      : 'medium';

    return {
      title: task.title.trim(),
      description: (task.description || '').trim(),
      agentType,
      priority,
      status: 'pending',
    };
  });

  return {
    objective: data.objective.trim(),
    subQuestions: data.subQuestions
      .filter((q) => typeof q === 'string' && q.trim())
      .map((q) => q.trim())
      .slice(0, 6),
    tasks: validatedTasks,
  };
};

/**
 * Run the Planner Agent: calls Gemini and returns a validated research plan.
 */
const runPlannerAgent = async (researchQuestion, context = {}) => {
  const prompt = buildPlannerPrompt(researchQuestion, context);
  const rawOutput = await callGemini(prompt, { temperature: 0.7 });
  const validatedPlan = validatePlannerOutput(rawOutput);
  return validatedPlan;
};

export default runPlannerAgent;
