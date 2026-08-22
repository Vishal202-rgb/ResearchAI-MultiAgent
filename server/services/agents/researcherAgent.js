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
    // Real Search - Run independently in parallel, limit to top 3 per task
    const uniqueQueries = new Set();
    const searchPromises = researcherTasks
      .map(task => {
        // Optimize: avoid duplicate queries
        const searchQuery = `${researchQuestion} ${task.title}`;
        if (uniqueQueries.has(searchQuery.toLowerCase())) return null;
        uniqueQueries.add(searchQuery.toLowerCase());
        
        return searchWeb(searchQuery).then(results => 
          (results || []).slice(0, 3).map(s => ({ ...s, taskTitle: task.title }))
        ).catch(err => {
          console.error(`Search failed for "${searchQuery}":`, err.message);
          return []; // Graceful fallback
        });
      })
      .filter(Boolean); // Remove nulls (duplicates)

    const searchResults = await Promise.all(searchPromises);
    allSources = searchResults.flat();
  } else {
    console.warn('Search API not configured. Simulated web searches are disabled to prevent URL hallucinations.');
    // allSources remains empty, guaranteeing we only use verified real sources.
  }

  // 2. Strict filtering and Deduplication
  const uniqueSources = [];
  const seenIdentifiers = new Set();
  
  for (const s of allSources) {
    // Ensure the source has a valid, real URL. No simulated/hallucinated URLs allowed.
    if (!s.url || !s.url.startsWith('http')) continue;

    const identifier = (s.url).toLowerCase().trim();
    if (identifier && !seenIdentifiers.has(identifier)) {
      seenIdentifiers.add(identifier);
      uniqueSources.push(s);
    }
  }

  // Optimization: Skip redundant extraction step. 
  // Analyst Agent will extract and analyze directly from the sources to save 1 full API call and reduce latency.
  const finalSources = uniqueSources.slice(0, 12);

  return { sources: finalSources, rawData: [] };
};

export default runResearcherAgent;
