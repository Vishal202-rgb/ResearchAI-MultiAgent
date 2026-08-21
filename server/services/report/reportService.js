import callGemini from '../ai/geminiService.js';

export const generateReportContent = async (workspace, findings, sources) => {
  const sourceList = sources.map((s, i) => {
    const urlText = (s.url && !s.isSimulated) ? ` (${s.url})` : '';
    return `[${i + 1}] "${s.title}" - ${s.publisher || 'Unknown'}${urlText}`;
  }).join('\n');
  
  const findingClaims = (findings.claims || []).map(c => `- ${c.claim} (Status: ${c.status})`).join('\n');

  const prompt = `You are an expert academic writer. Generate a comprehensive research report.

RESEARCH QUESTION: ${workspace.researchQuestion}
DOMAIN: ${workspace.researchDomain || 'General'}

EXECUTIVE SUMMARY FROM SYNTHESIZER:
${findings.summary}

KEY FINDINGS:
${(findings.keyFindings || []).join('\n')}

EVIDENCE & CLAIMS:
${findingClaims}

LIMITATIONS:
${(findings.limitations || []).join('\n')}

SOURCES:
${sourceList}

Generate a detailed, professional report in JSON format:
{
  "title": "A professional title for the report",
  "executiveSummary": "Refined executive summary",
  "methodology": "How the research was conducted (Multi-agent web search + fact checking)",
  "detailedAnalysis": "In-depth analysis sections using markdown headings",
  "conclusion": "Final concluding thoughts",
  "markdown": "The FULL report combined in beautiful Markdown format, including Title, Executive Summary, Methodology, Key Findings, Detailed Analysis, Limitations, Conclusion, and References."
}

RULES:
- Use academic but accessible tone.
- Ensure the markdown is fully formatted with headers (##).
- Include the citation references [1], [2] throughout the markdown.
- IMPORTANT: In the References section, only create hyperlinks for sources that explicitly have a URL provided above. If no URL is provided for a source, do NOT invent one, just list the title as plain text.
Return ONLY valid JSON.`;

  try {
    const reportData = await callGemini(prompt, { temperature: 0.3, maxTokens: 8000 });
    return reportData;
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
};
