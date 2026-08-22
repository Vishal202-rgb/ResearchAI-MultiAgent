// /**
//  * Search service abstraction. Provider can be swapped later.
//  */
// const searchWeb = async (query, options = {}) => {
//   const apiKey = process.env.SEARCH_API_KEY;
//   const apiUrl = process.env.SEARCH_API_URL;
//   const numResults = options.numResults || 5;

//   if (!apiKey || !apiUrl) {
//     console.warn('SEARCH_API_KEY/URL not configured — using Gemini-simulated search');
//     return null;
//   }

//   try {
//     const url = `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(query)}&num=${numResults}`;
    
//     // Add a reasonable 10-second timeout to prevent indefinite hangs
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000);
    
//     const response = await fetch(url, { signal: controller.signal });
//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       throw new Error(`Search API error: ${response.status}`);
//     }

//     const data = await response.json();

//     const results = (data.items || data.results || []).map((item) => ({
//       title: item.title || '',
//       url: item.link || item.url || '',
//       publisher: item.displayLink || item.source || '',
//       publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || '',
//       snippet: item.snippet || item.description || '',
//       content: item.snippet || item.description || '',
//       relevanceScore: 0.7,
//     }));

//     return results;
//   } catch (error) {
//     console.error('Search API failed:', error.message);
//     return null;
//   }
// };

// export default searchWeb;

/**
 * Tavily web search service
 */
const searchWeb = async (query, options = {}) => {
  const apiKey = process.env.SEARCH_API_KEY;
  const apiUrl =
    process.env.SEARCH_API_URL || "https://api.tavily.com/search";

  const maxResults = options.numResults || 5;

  if (!apiKey) {
    console.warn("SEARCH_API_KEY not configured");
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: maxResults,
        include_answer: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Search API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const results = (data.results || []).map((item) => ({
      title: item.title || "",
      url: item.url || "",
      publisher: item.url
        ? new URL(item.url).hostname.replace("www.", "")
        : "",
      publishedDate: "",
      snippet: item.content || "",
      content: item.content || "",
      relevanceScore: item.score || 0,
    }));

    return results;
  } catch (error) {
    console.error("Search API failed:", error.message);
    return null;
  }
};

export default searchWeb;