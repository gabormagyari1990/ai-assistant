# Customer Service Assistant

An AI-powered customer service assistant that uses OpenAI's GPT model to answer questions based on your documentation.

## Features

- Vue.js frontend with a clean chat interface
- Express.js backend server
- Document embedding using LangChain and OpenAI
- Real-time question answering based on your documentation
- Automatic context retrieval using vector similarity search

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

3. Add your documentation:

- Place your text documents in the `docs` directory
- Files should be in `.txt` format
- The system will automatically process and embed these documents

## Running the Application

1. Start the backend server:

```bash
npm start
```

2. In a separate terminal, start the frontend development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. The assistant will automatically load and process all documents in the `docs` directory when the server starts
2. Type your question in the chat interface
3. The system will:
   - Find the most relevant context from your documents
   - Generate a response using OpenAI's GPT model
   - Display the answer in the chat

## Adding New Documents

To add new documents to the knowledge base:

1. Add your `.txt` files to the `docs` directory
2. Restart the server to process the new documents

## Technical Details

- Frontend: Vue 3 with Vite
- Backend: Express.js
- Document Processing: LangChain
- Embeddings: OpenAI Embeddings
- Chat Completion: OpenAI GPT-3.5 Turbo
- Vector Similarity: Cosine similarity for context retrieval
