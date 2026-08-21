/**
 * Fact Checker Agent — verifies claims against evidence and sources.
 * OPTIMIZED: Receives pre-computed fact check from the combined Analyst prompt
 * to save Gemini API quota, preserving conceptual separation in the orchestrator pipeline 
 * without making duplicate API calls.
 */
const runFactCheckerAgent = async (researchQuestion, sources, analystOutput) => {
  
  // 1. Quota Optimization: Instantly use the pre-computed fact checks generated during the Analyst phase!
  if (analystOutput && analystOutput.factCheck && analystOutput.factCheck.claims) {
    const validatedClaims = (analystOutput.factCheck.claims || []).map((c) => ({
      claim: c.claim || '',
      evidence: c.evidence || '',
      confidence: Math.min(1, Math.max(0, c.confidence || 0)),
      status: ['supported', 'partially_supported', 'contradicted', 'unverified'].includes(c.status)
        ? c.status
        : 'unverified',
      sources: Array.isArray(c.sources) ? c.sources : [],
    }));

    return { claims: validatedClaims };
  }

  // 2. Fallback if the analyst output lacked factCheck data
  return { claims: [] };
};

export default runFactCheckerAgent;
