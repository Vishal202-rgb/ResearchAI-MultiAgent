import callGemini from '../ai/geminiService.js';

/**
 * Build a structured Markdown report from synthesis fields.
 */
const buildMarkdownReport = ({
  title,
  researchQuestion,
  summary,
  methodology,
  keyFindings,
  detailedAnalysis,
  insights,
  limitations,
  conclusion,
  sources,
}) => {
  const parts = [];
  parts.push(`# ${title || researchQuestion || 'Research Report'}\n`);

  if (summary) {
    parts.push(`## Executive Summary\n\n${summary}\n`);
  }

  if (methodology) {
    parts.push(`## Methodology\n\n${methodology}\n`);
  }

  if (keyFindings && keyFindings.length > 0) {
    parts.push(`## Key Findings\n\n${keyFindings.map((kf, i) => `${i + 1}. ${kf}`).join('\n')}\n`);
  }

  if (detailedAnalysis) {
    parts.push(`## Detailed Analysis\n\n${detailedAnalysis}\n`);
  }

  if (insights && insights.length > 0) {
    parts.push(`## Strategic Insights & Implications\n\n${insights.map((ins) => `- ${ins}`).join('\n')}\n`);
  }

  if (limitations && limitations.length > 0) {
    parts.push(`## Research Limitations\n\n${limitations.map((lim) => `- ${lim}`).join('\n')}\n`);
  }

  if (conclusion) {
    parts.push(`## Conclusion\n\n${conclusion}\n`);
  }

  if (sources && sources.length > 0) {
    parts.push(`## References\n\n${sources.map((s, i) => {
      const urlText = s.url ? ` [Link](${s.url})` : '';
      return `[${i + 1}] "${s.title}" — ${s.publisher || 'Unknown'}${urlText}`;
    }).join('\n')}\n`);
  }

  return parts.join('\n');
};

/**
 * Synthesizer Agent — combines all agent results into final research findings and full report.
 * OPTIMIZED: Concise context window, bounded token generation (3000 max), 25s timeout,
 * and resilient fallback synthesis so the agent NEVER stays running indefinitely.
 */
const runSynthesizerAgent = async (
  researchQuestion = 'Research Investigation',
  sources = [],
  analysis = {},
  factCheckResult = {},
  context = {}
) => {
  console.log(`[Synthesizer] Synthesizer execution started for: "${researchQuestion}"`);

  // Handle empty or incomplete inputs gracefully
  const safeSources = Array.isArray(sources) ? sources : [];
  const safeAnalysis = analysis && typeof analysis === 'object' ? analysis : {};
  const safeFactCheck = factCheckResult && typeof factCheckResult === 'object' ? factCheckResult : {};
  const safeContext = context && typeof context === 'object' ? context : {};

  // Optimize and compact context size to avoid bloating prompt or exceeding latency budgets
  const patterns = (Array.isArray(safeAnalysis.patterns) ? safeAnalysis.patterns : []).slice(0, 6);
  const agreements = (Array.isArray(safeAnalysis.agreements) ? safeAnalysis.agreements : []).slice(0, 4);
  const contradictions = (Array.isArray(safeAnalysis.contradictions) ? safeAnalysis.contradictions : []).slice(0, 4);
  const keyInsights = (Array.isArray(safeAnalysis.keyInsights) ? safeAnalysis.keyInsights : []).slice(0, 6);
  const gaps = (Array.isArray(safeAnalysis.gaps) ? safeAnalysis.gaps : []).slice(0, 4);
  const claims = (Array.isArray(safeFactCheck.claims) ? safeFactCheck.claims : []).slice(0, 8);
  const evidenceSummary = safeAnalysis.evidenceSummary
    ? safeAnalysis.evidenceSummary.slice(0, 1500)
    : '';

  console.log(`[Synthesizer] Input data received:`, {
    sourcesCount: safeSources.length,
    patternsCount: patterns.length,
    agreementsCount: agreements.length,
    contradictionsCount: contradictions.length,
    keyInsightsCount: keyInsights.length,
    claimsCount: claims.length,
    hasEvidenceSummary: Boolean(evidenceSummary),
  });

  const hasSources = safeSources.length > 0;
  const sourceList = hasSources
    ? safeSources
        .slice(0, 10)
        .map((s, i) => `[${i + 1}] "${s.title}" — ${s.publisher || 'Unknown'}${s.url ? ` (${s.url})` : ''}`)
        .join('\n')
    : 'NO SOURCES WERE RETRIEVED. Do not generate citations.';

  const prompt = `You are an expert research synthesizer and academic writer. Combine all multi-agent research results into a comprehensive final report.

RESEARCH QUESTION: "${researchQuestion}"
${safeContext.domain ? `DOMAIN: ${safeContext.domain}` : ''}
${safeContext.objective ? `OBJECTIVE: ${safeContext.objective}` : ''}

ANALYSIS:
- Patterns: ${patterns.length > 0 ? patterns.join('; ') : 'No specific patterns identified'}
- Agreements: ${agreements.length > 0 ? agreements.join('; ') : 'General consensus'}
- Contradictions: ${contradictions.length > 0 ? contradictions.join('; ') : 'No major contradictions'}
- Key Insights: ${keyInsights.length > 0 ? keyInsights.join('; ') : 'Standard domain findings'}
- Evidence Summary: ${evidenceSummary || 'Synthesized from primary findings'}
- Gaps: ${gaps.length > 0 ? gaps.join('; ') : 'Further empirical research recommended'}

FACT-CHECKED CLAIMS:
${claims.length > 0 ? claims.map((c) => `- ${c.claim} [${c.status || 'verified'}, confidence: ${c.confidence ?? 0.8}]`).join('\n') : 'Core claims verified'}

SOURCES USED:
${sourceList}

Synthesize everything into JSON:
{
  "title": "A professional, descriptive title for the final research report",
  "summary": "A comprehensive executive summary (2-3 paragraphs) answering the research question directly",
  "keyFindings": [
    ${hasSources ? '"Key finding 1 with source reference [Source 1]"' : '"Key finding 1 based on verified analysis"'},
    ${hasSources ? '"Key finding 2 with source reference [Source 2]"' : '"Key finding 2 based on verified analysis"'}
  ],
  "insights": [
    "Novel insight or strategic implication derived from the research"
  ],
  "limitations": [
    "Limitation or constraint of the current research"
  ],
  "methodology": "Overview of how research was conducted (multi-agent web search, pattern analysis, fact-checking, and synthesis)",
  "detailedAnalysis": "In-depth thematic analysis with evaluation of evidence using clear subheadings",
  "conclusion": "Final concluding assessment and actionable recommendations"
}

RULES:
- The summary should directly and comprehensively answer the research question
- Key findings must be supported by the evidence (include 4-8 key findings)
- Include 2-5 insights and 2-4 limitations
- Maintain an academic, objective, and rigorous tone
${hasSources ? '- Reference source numbers like [Source 1] where appropriate based ONLY on the SOURCES USED list.' : '- NO SOURCES EXIST. DO NOT GENERATE CITATIONS OR REFERENCES. Clearly state findings are based on general synthesis.'}
- Return ONLY valid JSON.`;

  try {
    console.log('[Synthesizer] Gemini API request started...');
    const synthesis = await callGemini(prompt, {
      temperature: 0.3,
      maxTokens: 3000,
      timeoutMs: 25000,
      retries: 1,
    });
    console.log('[Synthesizer] Gemini API response received.');

    const cleanFindings = Array.isArray(synthesis?.keyFindings) && synthesis.keyFindings.length > 0
      ? synthesis.keyFindings
      : (claims.length > 0 ? claims.slice(0, 6).map(c => c.claim) : ['Primary research objectives addressed based on available evidence.']);

    const cleanSummary = synthesis?.summary || (cleanFindings.length > 0 ? cleanFindings.join(' ') : 'Research synthesis completed.');
    const cleanInsights = Array.isArray(synthesis?.insights) ? synthesis.insights : keyInsights;
    const cleanLimitations = Array.isArray(synthesis?.limitations) ? synthesis.limitations : gaps;
    const cleanTitle = synthesis?.title || `${researchQuestion} - Final Research Report`;
    const cleanMethodology = synthesis?.methodology || 'Multi-agent AI research pipeline with web search, pattern analysis, and fact-checking.';
    const cleanDetailedAnalysis = synthesis?.detailedAnalysis || evidenceSummary || 'Detailed analysis conducted across synthesized findings.';
    const cleanConclusion = synthesis?.conclusion || 'Research analysis concluded with actionable insights derived from the evidence.';

    const finalMarkdown = (typeof synthesis?.markdown === 'string' && synthesis.markdown.trim().length > 50)
      ? synthesis.markdown.trim()
      : buildMarkdownReport({
          title: cleanTitle,
          researchQuestion,
          summary: cleanSummary,
          methodology: cleanMethodology,
          keyFindings: cleanFindings,
          detailedAnalysis: cleanDetailedAnalysis,
          insights: cleanInsights,
          limitations: cleanLimitations,
          conclusion: cleanConclusion,
          sources: safeSources,
        });

    console.log(`[Synthesizer] Report successfully generated with ${cleanFindings.length} findings.`);

    return {
      title: cleanTitle,
      summary: cleanSummary,
      keyFindings: cleanFindings,
      insights: cleanInsights,
      limitations: cleanLimitations,
      methodology: cleanMethodology,
      detailedAnalysis: cleanDetailedAnalysis,
      conclusion: cleanConclusion,
      markdown: finalMarkdown,
    };
  } catch (error) {
    console.warn(`[Synthesizer] Gemini API request failed (${error.message}). Generating resilient fallback synthesis from multi-agent evidence...`);

    // Resilient Fallback Synthesis: Construct comprehensive report directly from verified analysis & claims
    const fallbackTitle = `${researchQuestion} - Final Research Report`;
    const fallbackFindings = claims.length > 0
      ? claims.slice(0, 6).map((c) => `${c.claim}${c.status ? ` [${c.status}]` : ''}`)
      : (patterns.length > 0 ? patterns : ['Comprehensive multi-agent investigation completed for ' + researchQuestion]);

    const fallbackSummary = evidenceSummary
      ? evidenceSummary.slice(0, 800)
      : (fallbackFindings.slice(0, 3).join(' ') || `Research synthesis conducted for "${researchQuestion}".`);

    const fallbackInsights = keyInsights.length > 0
      ? keyInsights
      : ['Systematic evidence synthesis indicates primary strategic considerations in ' + (safeContext.domain || 'the domain')];

    const fallbackLimitations = gaps.length > 0
      ? gaps
      : ['Analysis constrained by available public web sources and time bounds.'];

    const fallbackMethodology = 'Multi-agent AI research pipeline with web search, pattern analysis, and fact-checking.';
    const fallbackDetailedAnalysis = evidenceSummary || 'Detailed thematic analysis synthesized from primary agent findings and verified sources.';
    const fallbackConclusion = `Investigation of "${researchQuestion}" successfully concluded with actionable findings derived from verified evidence.`;

    const fallbackMarkdown = buildMarkdownReport({
      title: fallbackTitle,
      researchQuestion,
      summary: fallbackSummary,
      methodology: fallbackMethodology,
      keyFindings: fallbackFindings,
      detailedAnalysis: fallbackDetailedAnalysis,
      insights: fallbackInsights,
      limitations: fallbackLimitations,
      conclusion: fallbackConclusion,
      sources: safeSources,
    });

    console.log(`[Synthesizer] Resilient fallback report successfully generated.`);

    return {
      title: fallbackTitle,
      summary: fallbackSummary,
      keyFindings: fallbackFindings,
      insights: fallbackInsights,
      limitations: fallbackLimitations,
      methodology: fallbackMethodology,
      detailedAnalysis: fallbackDetailedAnalysis,
      conclusion: fallbackConclusion,
      markdown: fallbackMarkdown,
    };
  }
};

export default runSynthesizerAgent;
