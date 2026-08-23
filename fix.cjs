const fs = require('fs');
let text = fs.readFileSync('server/controllers/researchController.js', 'utf8');

text = text.replace(
  /prompt = \"You are the PRO Agent[^;]+;/g,
  "prompt = `You are the PRO Agent in an academic debate. Your goal is to vigorously defend and support the following research finding: \"${finding}\"\nProduce a strong, logical argument (1-2 paragraphs) that validates this claim. Do not hallucinate data, rely on general logical principles and standard industry knowledge.`;"
);

text = text.replace(
  /prompt = \"You are the COUNTER Agent[^;]+;/g,
  "prompt = `You are the COUNTER Agent in an academic debate.\nTopic: \"${finding}\"\nPro Argument: \"${proArgument}\"\nYour goal is to challenge this claim, identify weaknesses, counterexamples, or alternative perspectives. Produce a strong, logical counterargument (1-2 paragraphs).`;"
);

text = text.replace(
  /prompt = \"You are the JUDGE Agent[^;]+;/g,
  "prompt = `You are the JUDGE Agent in a research debate.\nTopic: \"${finding}\"\nPro: \"${proArgument}\"\nCounter: \"${counterArgument}\"\nEvidence Check: \"${evidenceText}\"\n\nEvaluate the entire debate. You must output a JSON object exactly matching this schema:\n{\n  \"verdictType\": \"Strongly Supported\" | \"Supported\" | \"Partially Supported\" | \"Weakly Supported\" | \"Insufficient Evidence\",\n  \"confidenceScore\": number (0 to 100),\n  \"keyReasons\": [\"Reason 1\", \"Reason 2\", \"Reason 3\"],\n  \"finalVerdict\": \"A 1-2 paragraph final ruling explaining the conclusion.\"\n}`;"
);

fs.writeFileSync('server/controllers/researchController.js', text);
console.log('Fixed prompts');
