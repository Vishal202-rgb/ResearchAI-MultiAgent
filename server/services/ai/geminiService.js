const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const mimeType = options.responseMimeType || 'application/json';

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 2048,
      responseMimeType: mimeType,
    },
  };

  let retries = options.retries !== undefined ? options.retries : 3;
  let backoff = 2000; // start with 2s

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 429 Too Many Requests -> Exponential Backoff
        if (response.status === 429 && attempt < retries) {
          console.warn(`[Gemini API] 429 Too Many Requests. Retrying in ${backoff}ms (Attempt ${attempt + 1}/${retries})...`);
          await delay(backoff);
          backoff *= 2;
          continue;
        }
        
        // 403 Forbidden / Quota -> Abort immediately to prevent aggressive retries when quota exhausted
        if (response.status === 403) {
          console.error(`[Gemini API] 403 Quota Exhausted/Forbidden. Aborting retries.`);
          throw new Error(`Gemini Quota Exceeded or Forbidden: ${errorText}`);
        }

        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No content returned from Gemini');
      }

      if (mimeType === 'application/json') {
        content = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(content);
      }
      
      return content;
      
    } catch (error) {
      if (attempt === retries || error.message.includes('Quota') || error.message.includes('Forbidden')) {
        throw error;
      }
      console.warn(`[Gemini API] Transient error: ${error.message}. Retrying in ${backoff}ms...`);
      await delay(backoff);
      backoff *= 2; // Exponentially increase backoff
    }
  }
};

export default callGemini;
