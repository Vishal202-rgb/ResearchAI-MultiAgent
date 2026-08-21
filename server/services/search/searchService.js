/**
 * Search service abstraction. Provider can be swapped later.
 */
const searchWeb = async (query, options = {}) => {
  const apiKey = process.env.SEARCH_API_KEY;
  const apiUrl = process.env.SEARCH_API_URL;
  const numResults = options.numResults || 5;

  if (!apiKey || !apiUrl) {
    console.warn('SEARCH_API_KEY/URL not configured — using Gemini-simulated search');
    return null;
  }

  try {
    const url = `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(query)}&num=${numResults}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();

    const results = (data.items || data.results || []).map((item) => ({
      title: item.title || '',
      url: item.link || item.url || '',
      publisher: item.displayLink || item.source || '',
      publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || '',
      snippet: item.snippet || item.description || '',
      content: item.snippet || item.description || '',
      relevanceScore: 0.7,
    }));

    return results;
  } catch (error) {
    console.error('Search API failed:', error.message);
    return null;
  }
};

export default searchWeb;
