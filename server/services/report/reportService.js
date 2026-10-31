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
    const reportData = await callGemini(prompt, {
      temperature: 0.3,
      maxTokens: 3000,
      timeoutMs: 25000,
      retries: 1,
    });
    return reportData;
  } catch (error) {
    console.warn('Report generation AI call failed, generating fallback structured report:', error.message);
    const title = `${workspace.title || workspace.researchQuestion || 'Research Report'} - Final Report`;
    const execSummary = findings.summary || (findings.keyFindings && findings.keyFindings.join(' ')) || 'Research findings synthesized from available evidence.';
    const methodology = 'Multi-agent AI research pipeline with web search, pattern analysis, and fact-checking.';
    const detailedAnalysis = findings.rawAnalysis || 'In-depth analysis synthesized across multi-agent findings.';
    const conclusion = 'The research findings provide structured evidence and strategic implications for the objective.';

    const mdSections = [
      `# ${title}\n`,
      `## Executive Summary\n\n${execSummary}\n`,
      `## Methodology\n\n${methodology}\n`,
      findings.keyFindings && findings.keyFindings.length > 0 ? `## Key Findings\n\n${findings.keyFindings.map((kf, i) => `${i + 1}. ${kf}`).join('\n')}\n` : '',
      `## Detailed Analysis\n\n${detailedAnalysis}\n`,
      findings.limitations && findings.limitations.length > 0 ? `## Limitations\n\n${findings.limitations.map(l => `- ${l}`).join('\n')}\n` : '',
      `## Conclusion\n\n${conclusion}\n`,
      sources.length > 0 ? `## References\n\n${sources.map((s, i) => `[${i + 1}] "${s.title}" - ${s.publisher || 'Unknown'}${s.url ? ` (${s.url})` : ''}`).join('\n')}\n` : '',
    ].filter(Boolean).join('\n');

    return {
      title,
      executiveSummary: execSummary,
      methodology,
      detailedAnalysis,
      conclusion,
      markdown: mdSections,
    };
  }
};
