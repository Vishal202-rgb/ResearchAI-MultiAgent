import callGemini from '../ai/geminiService.js';

/**
 * Synthesizer Agent — combines all agent results into final research findings.
 */
const runSynthesizerAgent = async (researchQuestion, sources, analysis, factCheckResult, context = {}) => {
  const sourceList = sources.slice(0, 15).map((s, i) =>
    `[${i + 1}] "${s.title}" — ${s.publisher || 'Unknown'}`
  ).join('\n');

  const prompt = `You are an expert research synthesizer. Combine all research results into a comprehensive final report.

RESEARCH QUESTION: "${researchQuestion}"
${context.objective ? `OBJECTIVE: ${context.objective}` : ''}

ANALYSIS:
- Patterns: ${(analysis.patterns || []).join('; ')}
- Agreements: ${(analysis.agreements || []).join('; ')}
- Contradictions: ${(analysis.contradictions || []).join('; ')}
- Key Insights: ${(analysis.keyInsights || []).join('; ')}
- Evidence Summary: ${analysis.evidenceSummary || 'N/A'}
- Gaps: ${(analysis.gaps || []).join('; ')}

FACT-CHECKED CLAIMS:
${(factCheckResult.claims || []).map((c) => `- ${c.claim} [${c.status}, confidence: ${c.confidence}]`).join('\n')}

SOURCES USED:
${sourceList}

Synthesize everything into JSON:
{
  "summary": "A comprehensive executive summary (3-5 paragraphs) answering the research question",
  "keyFindings": [
    "Key finding 1 with source reference",
    "Key finding 2 with source reference"
  ],
  "insights": [
    "Novel insight or implication derived from the research"
  ],
  "limitations": [
    "Limitation of the research"
  ]
}

RULES:
- The summary should directly answer the research question
- Key findings must be supported by the evidence
- Include 4-8 key findings
- Include 2-5 insights
- Include 2-4 limitations
- Reference source numbers where appropriate
- Be objective and balanced

Return ONLY valid JSON.`;

  try {
    const synthesis = await callGemini(prompt, { temperature: 0.5, maxTokens: 4096 });
    return {
      summary: synthesis.summary || '',
      keyFindings: synthesis.keyFindings || [],
      insights: synthesis.insights || [],
      limitations: synthesis.limitations || [],
    };
  } catch (error) {
    console.error('Synthesizer agent failed:', error.message);
    throw error;
  }
};

export default runSynthesizerAgent;
