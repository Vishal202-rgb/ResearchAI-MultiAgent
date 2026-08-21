import { Pinecone } from '@pinecone-database/pinecone';

let pc = null;
let index = null;

export const initPinecone = () => {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('PINECONE_API_KEY is not configured. RAG will use fallback/simulated mode.');
    return null;
  }

  try {
    pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    if (process.env.PINECONE_INDEX) {
      index = pc.index(process.env.PINECONE_INDEX);
      if (process.env.PINECONE_HOST) {
        // Some setups require host
        index = pc.index(process.env.PINECONE_INDEX, process.env.PINECONE_HOST);
      }
    }
    
    return index;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    return null;
  }
};

export const getPineconeIndex = () => {
  if (!index) return initPinecone();
  return index;
};
