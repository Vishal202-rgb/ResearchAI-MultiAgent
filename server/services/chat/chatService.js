import callGemini from '../ai/geminiService.js';
import { retrieveRelevantContext } from '../rag/retrievalService.js';
import ChatMessage from '../../models/ChatMessage.js';
import ResearchFinding from '../../models/ResearchFinding.js';
import Source from '../../models/Source.js';
import { getWorkspaceGraph } from '../graph/graphService.js';

export const handleChatMessage = async (workspaceId, userId, query) => {
  // 1. Retrieve RAG context (Documents)
  const ragContext = await retrieveRelevantContext(query, workspaceId, userId, 3);
  const documentContext = ragContext.map((c, i) => `[Doc ${i+1}] ${c.text}`).join('\n\n');

  // 2. Retrieve Web Sources & Findings
  const finding = await ResearchFinding.findOne({ workspaceId, userId }).sort({ createdAt: -1 });
  const sources = await Source.find({ workspaceId, userId }).sort({ relevanceScore: -1 }).limit(10);
  
  const sourcesContext = sources.map((s, i) => `[Source ${i+1}] ${s.title} (${s.url || 'No URL'}): ${s.snippet}`).join('\n');
  const findingsContext = finding 
    ? `SUMMARY: ${finding.summary}\nKEY FINDINGS: ${(finding.keyFindings || []).join('; ')}` 
    : 'No research findings generated yet.';

  // 3. Retrieve Graph Context
  const graphData = await getWorkspaceGraph(workspaceId);
  const graphContext = (graphData && graphData.links.length > 0)
    ? graphData.links.map(l => `${l.source} -[${l.label}]-> ${l.target}`).join('\n')
    : 'No knowledge graph generated yet.';

  // 4. Fetch recent chat history
  const history = await ChatMessage.find({ workspaceId, userId })
    .sort({ createdAt: -1 })
    .limit(10);
  
  history.reverse(); // oldest first for chronological context
  const historyString = history.map(h => `${h.role === 'user' ? 'USER' : 'ASSISTANT'}: ${h.content}`).join('\n');

  // 5. Construct comprehensive prompt
  const prompt = `You are an expert research assistant answering questions about a specific workspace.

--- RAG DOCUMENT CONTEXT ---
${documentContext || 'No documents uploaded/indexed.'}

--- WEB SOURCES ---
${sourcesContext || 'No web sources available.'}

--- RESEARCH FINDINGS ---
${findingsContext}

--- KNOWLEDGE GRAPH (RELATIONSHIPS) ---
${graphContext}

--- RECENT CHAT HISTORY ---
${historyString || 'No previous chat.'}

USER QUESTION: "${query}"

Provide a helpful, accurate, and detailed answer based ONLY on the provided context (Documents, Web Sources, Findings, and Graph). 
If citing information, reference the source clearly (e.g., [Source 1] or [Doc 1]). Do not hallucinate data.

Return JSON in this format:
{
  "reply": "Your markdown formatted response here. Provide detailed insights.",
  "sources": [
    { "title": "Source or Doc title", "snippet": "relevant snippet", "url": "URL if available" }
  ]
}`;

  // 6. Generate response
  try {
    const jsonResponse = await callGemini(prompt, { temperature: 0.5, maxTokens: 4000 });

    // 7. Save assistant message
    const assistantMessage = await ChatMessage.create({
      workspaceId,
      userId,
      role: 'assistant',
      content: jsonResponse.reply || JSON.stringify(jsonResponse),
      sources: jsonResponse.sources || []
    });

    return assistantMessage;
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to generate chat response');
  }
};
