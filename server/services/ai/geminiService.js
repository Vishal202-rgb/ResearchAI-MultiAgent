const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const cleanAndParseJson = (content) => {
  if (typeof content !== 'string') return content;

  let cleaned = content.trim();

  // 1. Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // continue
  }

  // 2. Strip markdown code fence if present
  const markdownBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownBlockMatch && markdownBlockMatch[1]) {
    try {
      return JSON.parse(markdownBlockMatch[1].trim());
    } catch (e) {
      // continue
    }
  }

  // 3. Attempt to extract the outermost JSON object or array
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    try {
      return JSON.parse(match[0].trim());
    } catch (innerErr) {
      // continue
    }
  }

  throw new Error(`Failed to parse JSON response from Gemini. Content was: ${cleaned.slice(0, 150)}...`);
};

const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const mimeType = options.responseMimeType || 'application/json';
  const timeoutMs = options.timeoutMs || 45000;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
      responseMimeType: mimeType,
    },
  };

  let retries = options.retries !== undefined ? options.retries : 2;
  let backoff = options.initialBackoffMs || 2000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();

        // 429 Too Many Requests -> Exponential Backoff
        if (response.status === 429 && attempt < retries) {
          console.warn(`[Gemini API] 429 Too Many Requests. Retrying in ${backoff}ms (Attempt ${attempt + 1}/${retries})...`);
          await delay(backoff);
          backoff = Math.min(backoff * 2, 10000);
          continue;
        }

        // 403 Forbidden / Quota -> Abort immediately to prevent aggressive retries when quota exhausted
        if (response.status === 403) {
          console.error(`[Gemini API] 403 Quota Exhausted/Forbidden. Aborting retries.`);
          throw new Error(`Gemini Quota Exceeded or Forbidden: ${errorText}`);
        }

        // 5xx Server errors -> Retry if attempts remain
        if ([500, 502, 503, 504].includes(response.status) && attempt < retries) {
          console.warn(`[Gemini API] Server error ${response.status}. Retrying in ${backoff}ms (Attempt ${attempt + 1}/${retries})...`);
          await delay(backoff);
          backoff = Math.min(backoff * 2, 10000);
          continue;
        }

        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];

      if (!candidate) {
        const blockReason = data.promptFeedback?.blockReason;
        throw new Error(`Gemini returned no candidates${blockReason ? ` (Blocked: ${blockReason})` : ''}.`);
      }

      const content = candidate.content?.parts?.[0]?.text;

      if (!content) {
        const finishReason = candidate.finishReason || 'Unknown';
        throw new Error(`No content returned from Gemini (finishReason: ${finishReason})`);
      }

      if (mimeType === 'application/json') {
        return cleanAndParseJson(content);
      }

      return content;

    } catch (error) {
      clearTimeout(timeout);

      const isAbort = error.name === 'AbortError';
      const errorMessage = isAbort ? `Gemini API request timed out after ${timeoutMs}ms` : error.message;

      if (attempt === retries || errorMessage.includes('Quota') || errorMessage.includes('Forbidden')) {
        throw new Error(errorMessage);
      }

      console.warn(`[Gemini API] Error on attempt ${attempt + 1}: ${errorMessage}. Retrying in ${backoff}ms...`);
      await delay(backoff);
      backoff = Math.min(backoff * 2, 10000);
    }
  }

  throw new Error('Gemini request failed after all retries.');
};

export default callGemini;
