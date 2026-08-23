const fs = require('fs');
let content = fs.readFileSync('server/controllers/researchController.js', 'utf8');

const promptTarget = /Previous Key Findings:[\s\S]*?Latest Summary:[\s\S]*?\$\{latestFindings\?\.summary \|\| ''\}/m;

const promptReplacement = `Previous Key Findings:
\${prevFindingsArr.map(f => '- ' + f).join('\\n')}
Previous Summary:
\${previousFindings?.summary || ''}

Latest Key Findings:
\${currFindingsArr.map(f => '- ' + f).join('\\n')}
Latest Summary:
\${latestFindings?.summary || ''}

Newly Added Sources:
\${newSources.map(s => '- ' + s.title).join('\\n')}

Removed Sources:
\${removedSources.map(s => '- ' + s.title).join('\\n')}`;

if (content.match(promptTarget)) {
  content = content.replace(promptTarget, promptReplacement);
  fs.writeFileSync('server/controllers/researchController.js', content, 'utf8');
  console.log('Patched History Diff prompt successfully.');
} else {
  console.error('Failed to match History Diff prompt');
}
