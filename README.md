# ResearchAI — Multi-Agent Research Workspace

> An AI-powered research platform that orchestrates multiple specialized agents to perform deep web research, document analysis, knowledge extraction, and automated report synthesis.

ResearchAI is a production-oriented MERN application designed to turn a research question into a structured, evidence-backed research report.

## 🚀 Features

### 🤖 Multi-Agent Research
A coordinated AI pipeline consisting of specialized agents:

- Planner — breaks the research question into actionable tasks
- Researcher — discovers relevant web sources
- Analyst — analyzes collected evidence
- Fact Checker — validates claims and sources
- Synthesizer — generates the final research output

### 🔎 Real-Time Web Research
- Tavily-powered web search
- Verified source URLs
- Source snippets and publishers
- Evidence-backed findings
- Clickable references

### 📚 Documents & RAG
- Upload PDF/TXT documents
- Extract and chunk document content
- Generate vector embeddings
- Store embeddings in Pinecone
- Context-aware document chat

### 🧠 Knowledge Graph
- Neo4j-powered knowledge graph
- Extract entities and relationships from research
- Interactive 2D graph visualization
- Explore connections between topics and findings

### 🔬 Deep Dive Research
Select an individual finding and perform targeted follow-up research to:

- Validate evidence
- Find supporting sources
- Discover opposing viewpoints
- Find recent information

### ⚖️ Research Comparison
Compare two research workspaces and generate:

- Similarities
- Differences
- Conflicting findings
- AI-generated comparative analysis

### ⏳ Research Timeline
Automatically extracts dates from research sources and presents important events in chronological order.

### 💬 Research Chat
Ask questions about your completed research and get contextual answers based on the workspace findings.

### 🌐 Global Search
Search across research workspaces and quickly find relevant research content.

### 📄 PDF Export
Export completed research into a structured PDF report.

### 🎯 Static Demo Workspaces
Explore pre-built research demonstrations without consuming API credits.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │     React + Vite    │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                    ┌──────────▼──────────┐
                    │   Node.js + Express │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐      ┌──────────┐    ┌──────────┐
        │ MongoDB  │      │  Neo4j   │    │ Pinecone │
        │ Database │      │  Graph   │    │ Vector DB│
        └──────────┘      └──────────┘    └──────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                     ┌─────────▼─────────┐
                     │   AI / Agents     │
                     │      Gemini       │
                     └─────────┬─────────┘
                               │
                     ┌─────────▼─────────┐
                     │   Tavily Search   │
                     │   Web Research    │
                     └───────────────────┘
