import callGemini from '../ai/geminiService.js';
import searchWeb from '../search/searchService.js';

/**
 * Researcher Agent — executes research tasks, searches the web, collects sources.
 * OPTIMIZED: Batches simulated searches and extractions to minimize Gemini API calls.
 */
const runResearcherAgent = async (tasks, researchQuestion, context = {}) => {
  const researcherTasks = tasks.filter((t) => t.agentType === 'researcher');
  if (researcherTasks.length === 0) return { sources: [], rawData: [] };

  let allSources = [];
  let allRawData = [];

  // 1. Try real web search first
  const isSimulated = !(process.env.SEARCH_API_KEY && process.env.SEARCH_API_URL);

  if (!isSimulated) {
    // Real Search - run serially/controlled to avoid blasting the search API
    for (const task of researcherTasks) {
      const searchQuery = `${researchQuestion} ${task.title}`;
      const results = await searchWeb(searchQuery);
      if (results) {
        allSources.push(...results.map(s => ({ ...s, taskTitle: task.title })));
      }
    }
  } else {
    // Simulated Search - BATCHED into ONE Gemini API call instead of N calls!
    const taskDescriptions = researcherTasks.map(t => `- Task: "${t.title}": ${t.description}`).join('\n');
    
    const simulatedPrompt = `You are a web research agent. Generate realistic web sources for ALL the following tasks in one go.
    
    RESEARCH QUESTION: "${researchQuestion}"
    ${context.domain ? `DOMAIN: ${context.domain}` : ''}
    
    TASKS:
    ${taskDescriptions}

    IMPORTANT: Do NOT invent fake or hallucinatory URLs. Set "url" to an empty string "".

    Return JSON format:
    {
      "sources": [
        {
          "taskTitle": "Must exactly match one of the task titles above",
          "title": "Article title",
          "url": "",
          "publisher": "Publisher name",
          "publishedDate": "2024-01-15",
          "snippet": "Brief excerpt",
          "content": "Detailed content",
          "relevanceScore": 0.85
        }
      ]
    }`;

    try {
      // Retries are handled implicitly by geminiService backoff
      const simulated = await callGemini(simulatedPrompt, { temperature: 0.6, maxTokens: 4000 });
      allSources = (simulated.sources || []).map((s) => ({
        ...s,
        isSimulated: true,
        relevanceScore: Math.min(1, Math.max(0, s.relevanceScore || 0.5)),
      }));
    } catch (err) {
      console.error(`Batched simulated search failed:`, err.message);
    }
  }

  // 2. Extraction - BATCHED into ONE Gemini API call for all tasks
  if (allSources.length > 0) {
    // Limit to 12 sources to avoid massive context and token limits
    const sourcesToExtract = allSources.slice(0, 12); 
    
    const extractPrompt = `Analyze the following sources and extract key information per task.

    RESEARCH QUESTION: "${researchQuestion}"

    SOURCES:
    ${sourcesToExtract.map((s, i) => `[${i + 1}] Task: ${s.taskTitle} | Title: ${s.title}\n${s.content || s.snippet}`).join('\n\n')}

    Return JSON:
    {
      "extractions": [
        {
          "taskTitle": "exact task title mapped to the source",
          "keyPoints": ["point 1", "point 2"],
          "relevantData": "Summary of relevant data"
        }
      ]
    }`;

    try {
      const extracted = await callGemini(extractPrompt, { temperature: 0.3, maxTokens: 4000 });
      allRawData = extracted.extractions || [];
    } catch (err) {
      console.error('Batched extraction failed:', err.message);
    }
  }

  return { sources: allSources, rawData: allRawData };
};

export default runResearcherAgent;
