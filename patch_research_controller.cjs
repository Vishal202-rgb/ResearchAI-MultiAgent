const fs = require('fs');
let content = fs.readFileSync('server/controllers/researchController.js', 'utf8');

const traceEvidenceTargetFlexible = /const conciseSources = sources\.map\([\s\S]*?contradict or \nchallenge it\./m;

const traceEvidenceReplacement = `const conciseSources = sources.map((s, i) => \`[Source \${i + 1}] | Title: \${s.title} | URL: \${s.url} | Publisher: \${s.publisher} | Date: \${s.publishedDate} | Snippet: \${s.snippet}\`).join('\\n');
    const ragSummaries = ragContext.map(r => \`ID: \${r.id} | Content: \${r.content}\`).join('\\n');
    
    const prompt = \`You are an AI research assistant. Your task is to trace the evidence for this claim: "\${claim}"
    
The claim likely contains bracketed references like [Source 1], [Source 2], etc.
Match these references explicitly to the provided web sources which are numbered [Source 1], [Source 2], etc.
If the claim specifically cites a source, include it in the supporting evidence and explain why.

Here are the collected web sources:
\${conciseSources}

Here are related RAG document snippets:
\${ragSummaries}

Analyze these sources and document snippets. Determine which ones support the claim and which ones contradict or challenge it.\`;`;

if (content.match(traceEvidenceTargetFlexible)) {
  content = content.replace(traceEvidenceTargetFlexible, traceEvidenceReplacement);
} else {
  console.error('Failed to match Trace Evidence');
}

const getHistoryDiffTarget = /const runs = await ResearchRun\.find\(\{ workspaceId, status: 'completed' \}\)\.sort\(\{ createdAt: -1 \}\)\.limit\(2\);\s*if \(runs\.length < 2\) \{\s*return res\.status\(200\)\.json\(\{ success: true, data: \{ notEnoughHistory: true \} \}\);\s*\}\s*const \[latestRun, previousRun\] = runs;\s*const latestFindings = await ResearchFinding\.findOne\(\{ researchRunId: latestRun\._id \}\);\s*const previousFindings = await ResearchFinding\.findOne\(\{ researchRunId: previousRun\._id \}\);/m;

const getHistoryDiffReplacement = `const findings = await ResearchFinding.find({ workspaceId }).sort({ createdAt: -1 }).limit(2);
    
    if (findings.length < 2) {
      return res.status(200).json({ success: true, data: { notEnoughHistory: true } });
    }
    
    const [latestFindings, previousFindings] = findings;
    const latestRunId = latestFindings.researchRunId;
    const previousRunId = previousFindings.researchRunId;`;

if (content.match(getHistoryDiffTarget)) {
  content = content.replace(getHistoryDiffTarget, getHistoryDiffReplacement);
} else {
  console.error('Failed to match History Diff target 1');
}

const getHistoryDiffSourcesTarget = /const latestSources = await Source\.find\(\{ researchRunId: latestRun\._id \}\);\s*const previousSources = await Source\.find\(\{ researchRunId: previousRun\._id \}\);/m;
const getHistoryDiffSourcesReplacement = `const latestSources = await Source.find({ researchRunId: latestRunId });
    const previousSources = await Source.find({ researchRunId: previousRunId });`;

if (content.match(getHistoryDiffSourcesTarget)) {
  content = content.replace(getHistoryDiffSourcesTarget, getHistoryDiffSourcesReplacement);
} else {
  console.error('Failed to match History Diff target 2');
}

fs.writeFileSync('server/controllers/researchController.js', content, 'utf8');
console.log('Patched successfully.');
