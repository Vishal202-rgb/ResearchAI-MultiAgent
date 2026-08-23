import fs from 'fs';

import Document from '../../models/Document.js';
import { getPineconeIndex } from './pineconeClient.js';
import { generateEmbeddings } from './embeddingService.js';

// ==========================================
// TEXT CHUNKER
// ==========================================
const chunkText = (text, maxWords = 500) => {
  const words = text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);

    const chunk = words.slice(start, end).join(' ');

    if (chunk.trim()) {
      chunks.push(chunk);
    }

    if (end >= words.length) {
      break;
    }

    // 50-word overlap
    start = end - 50;
  }

  return chunks;
};

// ==========================================
// PROCESS DOCUMENT
// ==========================================
export const processDocument = async (documentId) => {
  try {
    console.log(`Starting document processing: ${documentId}`);

    const doc = await Document.findById(documentId);

    if (!doc) {
      throw new Error('Document not found');
    }

    doc.status = 'processing';
    doc.error = undefined;
    await doc.save();

    // ==========================================
    // CHECK FILE
    // ==========================================
    if (!doc.path || !fs.existsSync(doc.path)) {
      throw new Error(`Document file not found: ${doc.path}`);
    }

    const dataBuffer = fs.readFileSync(doc.path);

    if (!dataBuffer || dataBuffer.length === 0) {
      throw new Error('Document file is empty');
    }

    // ==========================================
    // EXTRACT TEXT
    // ==========================================
    let text = '';

    const isPDF =
      doc.type === 'application/pdf' ||
      doc.mimetype === 'application/pdf' ||
      doc.mimeType === 'application/pdf' ||
      doc.path.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      console.log('Processing PDF document...');

      // Dynamically import to avoid Vercel crashing during module initialization
      const pdfParseModule = await import('pdf-parse');
      const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default;

      const parser = new PDFParse({
        data: dataBuffer,
      });

      try {
        const pdfData = await parser.getText();

        text = pdfData?.text || '';
        doc.pageCount = pdfData?.total || 0;
      } finally {
        await parser.destroy();
      }
    } else {
      console.log('Processing text document...');

      text = dataBuffer.toString('utf-8');
      doc.pageCount = 1;
    }

    text = text.trim();

    console.log(`Extracted text length: ${text.length}`);

    if (!text) {
      throw new Error(
        'No readable text found in document. The PDF may contain scanned images only.'
      );
    }

    // ==========================================
    // CREATE CHUNKS
    // ==========================================
    const chunks = chunkText(text);

    console.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('No chunks generated from document');
    }

    doc.chunkCount = chunks.length;
    await doc.save();

    // ==========================================
    // PINECONE
    // ==========================================
    const index = getPineconeIndex();

    if (!index) {
      console.warn(
        'Pinecone not configured. Using fallback/simulated indexing.'
      );

      doc.status = 'indexed';
      await doc.save();

      return;
    }

    console.log('Pinecone index available.');

    let vectors = [];
    let totalVectors = 0;

    // ==========================================
    // GENERATE EMBEDDINGS
    // ==========================================
    for (let i = 0; i < chunks.length; i++) {
      const currentChunk = chunks[i];

      if (!currentChunk || !currentChunk.trim()) {
        continue;
      }

      console.log(
        `Generating embedding ${i + 1}/${chunks.length}...`
      );

      const embedding = await generateEmbeddings(currentChunk);

      if (
        !Array.isArray(embedding) ||
        embedding.length === 0
      ) {
        throw new Error(
          `Invalid embedding generated for chunk ${i}`
        );
      }

      vectors.push({
        id: `${doc._id}-chunk-${i}`,
        values: embedding,
        metadata: {
          workspaceId: doc.workspaceId.toString(),
          userId: doc.userId.toString(),
          documentId: doc._id.toString(),
          text: currentChunk,
          chunkIndex: i,
        },
      });

      totalVectors++;

      // ==========================================
      // BATCH UPSERT
      // ==========================================
      if (vectors.length >= 50) {
        console.log(
          `Upserting ${vectors.length} vectors to Pinecone...`
        );

        await index.upsert({
          records: vectors,
        });

        console.log(
          `Successfully uploaded ${vectors.length} vectors.`
        );

        vectors = [];
      }
    }

    // ==========================================
    // FINAL BATCH
    // ==========================================
    if (vectors.length > 0) {
      console.log(
        `Upserting final ${vectors.length} vectors to Pinecone...`
      );

      await index.upsert({
        records: vectors,
      });

      console.log(
        `Successfully uploaded final ${vectors.length} vectors.`
      );

      vectors = [];
    }

    // ==========================================
    // VALIDATE
    // ==========================================
    if (totalVectors === 0) {
      throw new Error(
        'No vectors were generated. Document was not indexed.'
      );
    }

    console.log(
      `Successfully indexed ${totalVectors} vectors in Pinecone.`
    );

    // ==========================================
    // SUCCESS
    // ==========================================
    doc.status = 'indexed';
    doc.error = undefined;

    await doc.save();

    console.log(
      `Document processed successfully: ${documentId}`
    );

    // Clean up temporary file
    if (doc.path && fs.existsSync(doc.path)) {
      fs.unlinkSync(doc.path);
      console.log(`Cleaned up temporary file: ${doc.path}`);
    }
  } catch (error) {
    console.error(
      `Document processing failed for ${documentId}:`,
      error
    );

    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: error.message,
    });
  }
};