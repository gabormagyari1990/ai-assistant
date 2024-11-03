import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

let documents = [];
let documentVectors = [];

// Initialize documents from the docs directory
async function initializeDocs() {
  try {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = await fs.readdir(docsDir);
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        
        const docs = await splitter.createDocuments([content]);
        documents.push(...docs);
        
        // Generate embeddings for each chunk
        for (const doc of docs) {
          const vector = await embeddings.embedQuery(doc.pageContent);
          documentVectors.push({
            content: doc.pageContent,
            vector
          });
        }
      }
    }
    console.log(`Initialized ${documents.length} document chunks`);
  } catch (error) {
    console.error('Error initializing documents:', error);
  }
}

// Find most relevant document chunks using cosine similarity
async function findRelevantDocuments(query, topK = 3) {
  const queryVector = await embeddings.embedQuery(query);
  
  // Calculate cosine similarity
  const similarities = documentVectors.map(doc => ({
    content: doc.content,
    similarity: cosineSimilarity(queryVector, doc.vector)
  }));
  
  // Sort by similarity and get top K results
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Cosine similarity calculation
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Find relevant documents
    const relevantDocs = await findRelevantDocuments(query);
    const context = relevantDocs.map(doc => doc.content).join('\n\n');
    
    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful customer service assistant. Use the provided context to answer questions accurately and concisely."
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuestion: ${query}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await initializeDocs();
  console.log(`Server running on port ${PORT}`);
});
