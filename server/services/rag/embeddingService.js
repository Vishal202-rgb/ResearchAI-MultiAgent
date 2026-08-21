const GEMINI_EMBEDDING_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

export const generateEmbeddings = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const model = 'gemini-embedding-001';
  const dimension = 768;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  if (!text || !text.trim()) {
    throw new Error('Cannot generate embedding for empty text');
  }

  try {
    const response = await fetch(
      `${GEMINI_EMBEDDING_BASE}/${model}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: `models/${model}`,
          content: {
            parts: [
              {
                text: text.trim(),
              },
            ],
          },
          output_dimensionality: dimension,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          `Embedding API error: ${response.status}`
      );
    }

    const embedding = data?.embedding?.values;

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Gemini returned an empty embedding');
    }

    if (embedding.length !== dimension) {
      throw new Error(
        `Embedding dimension mismatch: expected ${dimension}, got ${embedding.length}`
      );
    }

    return embedding;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
};