import { getPineconeIndex } from './pineconeClient.js';
import { generateEmbeddings } from './embeddingService.js';

export const retrieveRelevantContext = async (query, workspaceId, userId, topK = 3) => {
  const index = getPineconeIndex();
  
  if (!index) {
    return [];
  }

  try {
    const queryEmbedding = await generateEmbeddings(query);
    
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        workspaceId: { $eq: workspaceId.toString() },
        userId: { $eq: userId.toString() }
      }
    });
    
    return (results.matches || []).map(match => ({
      text: match.metadata.text,
      documentId: match.metadata.documentId,
      score: match.score
    }));
  } catch (error) {
    console.error('RAG Retrieval error:', error);
    return [];
  }
};
