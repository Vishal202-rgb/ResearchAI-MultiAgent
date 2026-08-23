const fs = require('fs');
let content = fs.readFileSync('server/controllers/researchController.js', 'utf8');

const target = /const result = await callGemini\(prompt, \{ temperature: 0.2, retries: 1 \}\);\s*res\.status\(200\)\.json\(\{ success: true, data: result \}\);/m;

const replacement = `const result = await callGemini(prompt, { temperature: 0.2, retries: 1 });
    
    // Merge Gemini analysis with hard data for sources to prevent hallucination and provide URLs
    if (result && typeof result === 'object') {
      result.newSources = newSources.map(s => ({ title: s.title, url: s.url }));
      result.removedSources = removedSources.map(s => ({ title: s.title, url: s.url }));
    }
    
    res.status(200).json({ success: true, data: result });`;

if (content.match(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('server/controllers/researchController.js', content, 'utf8');
  console.log('Patched result merge successfully.');
} else {
  console.error('Failed to match result merge.');
}
