import callGemini from '../ai/geminiService.js';

/**
 * Analyst Agent — analyzes findings AND performs fact-checking simultaneously
 * OPTIMIZED: Combines Analyst and Fact Checker prompts into a single API call to save Gemini quota,
 * while returning structurally separated objects to maintain the agent architecture.
 */
const runAnalystAgent = async (researchQuestion, sources, rawData, context = {}) => {
  const hasSources = sources && sources.length > 0;
  
  const sourceSummary = hasSources 
    ? sources.slice(0, 12).map((s, i) =>
        `[${i + 1}] ${s.title} (${s.publisher || 'Unknown'})\nURL: ${s.url}\nContent: ${s.content || s.snippet || 'No content'}`
      ).join('\n\n')
    : 'No sources available. State that no sources were provided.';

  const prompt = `You are a dual-role expert: Research Analyst AND Fact-Checker. 
  Analyze the provided sources to find patterns/insights, AND immediately verify the core claims against these sources.

  RESEARCH QUESTION: "${researchQuestion}"
  ${context.objective ? `OBJECTIVE: ${context.objective}` : ''}

  SOURCES TO ANALYZE AND FACT-CHECK:
  ${sourceSummary || 'No sources available'}

  Return JSON:
  {
    "analysis": {
      "patterns": ["Pattern or trend identified"],
      "agreements": ["Points where sources agree"],
      "contradictions": ["Points where sources disagree"],
      "evidenceSummary": "Overall summary of the evidence",
      "keyInsights": ["Important insight derived from analysis"],
      "gaps": ["Gaps in the research data"]
    },
    "factCheck": {
      "claims": [
        {
          "claim": "The exact claim being checked",
          "evidence": "Specific evidence from the sources",
          "confidence": 0.85,
          "status": "supported|partially_supported|contradicted|unverified",
          "sources": ["Source title 1"]
        }
      ]
    }
  }

  RULES:
  - Only cite information from the provided sources. Do NOT invent citations.
  - FactCheck status must be one of: supported, partially_supported, contradicted, unverified.
  - FactCheck confidence is a number between 0 and 1.
  - Return ONLY valid JSON.`;

  try {
    const result = await callGemini(prompt, { temperature: 0.3, maxTokens: 8000 });
    
    return {
      analysis: result.analysis || {},
      factCheck: result.factCheck || { claims: [] }
    };
  } catch (error) {
    console.error('Analyst agent failed:', error.message);
    throw error;
  }
};

export default runAnalystAgent;
