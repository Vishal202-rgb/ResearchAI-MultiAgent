const fs = require('fs');
let content = fs.readFileSync('server/controllers/researchController.js', 'utf8');

const traceEvidenceTargetFlexible = /const conciseSources = sources\.map[\s\S]*?contradict or[\s\S]*?challenge it\./m;

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

Analyze these sources and document snippets. Determine which ones support the claim and which ones contradict or challenge it.`;

if (content.match(traceEvidenceTargetFlexible)) {
  content = content.replace(traceEvidenceTargetFlexible, traceEvidenceReplacement);
  fs.writeFileSync('server/controllers/researchController.js', content, 'utf8');
  console.log('Patched Trace Evidence successfully.');
} else {
  console.error('Failed to match Trace Evidence');
}
