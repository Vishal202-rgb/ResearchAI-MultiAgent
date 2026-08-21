import callGemini from '../ai/geminiService.js';
import { retrieveRelevantContext } from '../rag/retrievalService.js';
import ChatMessage from '../../models/ChatMessage.js';

export const handleChatMessage = async (workspaceId, userId, query) => {
  // 1. Retrieve RAG context
  const ragContext = await retrieveRelevantContext(query, workspaceId, userId, 3);
  const contextString = ragContext.map((c, i) => `[Doc ${i+1}] ${c.text}`).join('\n\n');

  // 2. Fetch recent chat history
  const history = await ChatMessage.find({ workspaceId, userId })
    .sort({ createdAt: -1 })
    .limit(10);
  
  history.reverse(); // oldest first for chronological context
  
  const historyString = history.map(h => `${h.role === 'user' ? 'USER' : 'ASSISTANT'}: ${h.content}`).join('\n');

  // 3. Construct prompt
  const prompt = `You are a research assistant answering questions about a specific workspace.

CONTEXT FROM DOCUMENTS:
${contextString || 'No document context available.'}

RECENT CHAT HISTORY:
${historyString || 'No previous chat.'}

USER QUESTION: "${query}"

Provide a helpful, accurate answer based ONLY on the provided context or general knowledge if the context doesn't cover it. If citing the documents, reference them (e.g., [Doc 1]).
`;

  // 4. Generate response
  try {
    const rawResponse = await callGemini(prompt, { temperature: 0.7 });
    
    // Sometimes Gemini returns JSON if we forced it previously, but for chat we just want text.
    // If our `callGemini` service strictly parses JSON, we should probably bypass the JSON parsing for chat,
    // or wrap the chat prompt to ask for JSON: { "reply": "...", "sources": [] }
    
    // Let's modify the prompt to explicitly ask for JSON to match our existing geminiService:
    const jsonPrompt = prompt + `\n\nReturn JSON in this format:
    {
      "reply": "Your markdown formatted response",
      "sources": [
        { "title": "Doc 1", "snippet": "relevant snippet", "url": "" }
      ]
    }`;

    const jsonResponse = await callGemini(jsonPrompt, { temperature: 0.7 });

    // 5. Save assistant message
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
