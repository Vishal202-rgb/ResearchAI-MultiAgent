// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// const callGemini = async (prompt, options = {}) => {
//   const apiKey = process.env.GEMINI_API_KEY;
//   const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

//   if (!apiKey) {
//     throw new Error('GEMINI_API_KEY is not configured.');
//   }

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

//   const mimeType = options.responseMimeType || 'application/json';

//   const payload = {
//     contents: [{ parts: [{ text: prompt }] }],
//     generationConfig: {
//       temperature: options.temperature || 0.7,
//       maxOutputTokens: options.maxTokens || 2048,
//       responseMimeType: mimeType,
//     },
//   };

//   let retries = options.retries !== undefined ? options.retries : 3;
//   let backoff = 2000; // start with 2s

//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
        
//         // 429 Too Many Requests -> Exponential Backoff
//         if (response.status === 429 && attempt < retries) {
//           console.warn(`[Gemini API] 429 Too Many Requests. Retrying in ${backoff}ms (Attempt ${attempt + 1}/${retries})...`);
//           await delay(backoff);
//           backoff *= 2;
//           continue;
//         }
        
//         // 403 Forbidden / Quota -> Abort immediately to prevent aggressive retries when quota exhausted
//         if (response.status === 403) {
//           console.error(`[Gemini API] 403 Quota Exhausted/Forbidden. Aborting retries.`);
//           throw new Error(`Gemini Quota Exceeded or Forbidden: ${errorText}`);
//         }

//         throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();
//       let content = data.candidates?.[0]?.content?.parts?.[0]?.text;

//       if (!content) {
//         throw new Error('No content returned from Gemini');
//       }

//       if (mimeType === 'application/json') {
//         content = content.replace(/```json\n?|\n?```/g, '').trim();
//         return JSON.parse(content);
//       }
      
//       return content;
      
//     } catch (error) {
//       if (attempt === retries || error.message.includes('Quota') || error.message.includes('Forbidden')) {
//         throw error;
//       }
//       console.warn(`[Gemini API] Transient error: ${error.message}. Retrying in ${backoff}ms...`);
//       await delay(backoff);
//       backoff *= 2; // Exponentially increase backoff
//     }
//   }
// };

// export default callGemini;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

const getRetryDelay = (response, fallbackDelay) => {
  const retryAfter = response?.headers?.get('retry-after');

  if (retryAfter) {
    // Retry-After can be a number of seconds or an HTTP date.
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000;
    }

    const retryDate = new Date(retryAfter).getTime();

    if (Number.isFinite(retryDate)) {
      return Math.max(0, retryDate - Date.now());
    }
  }

  return fallbackDelay;
};

const extractGeminiText = (data) => {
  const candidate = data?.candidates?.[0];

  if (!candidate) {
    const blockReason = data?.promptFeedback?.blockReason;

    throw new Error(
      blockReason
        ? `Gemini blocked the prompt: ${blockReason}`
        : 'Gemini returned no candidate.'
    );
  }

  const text = candidate.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error(
      `Gemini returned an empty response. Finish reason: ${
        candidate.finishReason || 'Unknown'
      }`
    );
  }

  return text;
};

const parseJsonResponse = (content) => {
  // Remove Markdown code fences if the model returns them.
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Gemini returned invalid JSON. Response starts with: ${cleaned.slice(
        0,
        300
      )}`
    );
  }
};

const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Override this in Vercel Environment Variables if needed.
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('A valid prompt is required.');
  }

  const responseMimeType =
    options.responseMimeType ?? 'application/json';

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
      responseMimeType,
    },
  };

  const retries = Math.max(0, options.retries ?? 3);
  const timeoutMs = options.timeoutMs ?? 45000;

  let backoff = options.initialBackoffMs ?? 2000;
  const maxBackoff = options.maxBackoffMs ?? 15000;

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  );

  url.searchParams.set('key', apiKey);

  for (let attempt = 0; attempt <= retries; attempt++) {
    let response;

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        const errorText = await response.text();

        const error = new Error(
          `Gemini API error: ${response.status} - ${errorText}`
        );

        error.status = response.status;

        if (
          RETRYABLE_STATUS_CODES.includes(response.status) &&
          attempt < retries
        ) {
          const waitTime = Math.min(
            getRetryDelay(response, backoff),
            maxBackoff
          );

          console.warn(
            `[Gemini API] HTTP ${response.status}. ` +
              `Retrying in ${waitTime}ms ` +
              `(Attempt ${attempt + 1}/${retries}).`
          );

          await delay(waitTime);
          backoff = Math.min(backoff * 2, maxBackoff);
          continue;
        }

        throw error;
      }

      const data = await response.json();
      const content = extractGeminiText(data);

      if (responseMimeType === 'application/json') {
        return parseJsonResponse(content);
      }

      return content;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isRetryableStatus =
        error.status &&
        RETRYABLE_STATUS_CODES.includes(error.status);

      const isNetworkOrTimeoutError =
        !error.status ||
        error.name === 'AbortError' ||
        error.name === 'TypeError';

      if (
        isLastAttempt ||
        (!isRetryableStatus && !isNetworkOrTimeoutError)
      ) {
        console.error('[Gemini API] Request failed:', error.message);
        throw error;
      }

      const waitTime = Math.min(backoff, maxBackoff);

      console.warn(
        `[Gemini API] Temporary failure: ${error.message}. ` +
          `Retrying in ${waitTime}ms ` +
          `(Attempt ${attempt + 1}/${retries}).`
      );

      await delay(waitTime);
      backoff = Math.min(backoff * 2, maxBackoff);
    }
  }

  throw new Error('Gemini request failed after all retry attempts.');
};

export default callGemini;
