# ResearchAI — Multi-Agent Research Workspace

**Transform complex research questions into structured, evidence-backed insights with autonomous AI agents.**

ResearchAI is an AI-powered research platform designed to automate the complete research lifecycle — from research planning and real-time source discovery to analysis, fact-checking, knowledge visualization, and report generation.

Built with the MERN stack and powered by Google Gemini, Tavily, Pinecone, and Neo4j, ResearchAI combines multiple specialized AI agents to deliver a comprehensive and intelligent research experience.

🌐 **Live Demo:** [ResearchAI](https://research-ai-multi-agent-202.vercel.app/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Multi-Agent Architecture](#-multi-agent-architecture)
- [Core Workflows](#-core-workflows)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#️-running-the-application)
- [Authentication](#-authentication)
- [Database Architecture](#️-database-architecture)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Project Status](#-project-status)
- [Author](#-author)

---

## 🚀 Overview

Traditional research involves manually searching multiple sources, reading documents, analyzing information, verifying claims, identifying contradictions, and organizing findings.

ResearchAI simplifies this process through an autonomous multi-agent architecture.

Users provide a research question, define their objectives, and create a research workspace. The system coordinates specialized AI agents to conduct research, analyze information, verify evidence, and generate structured reports.

### What makes ResearchAI different?

- **Autonomous Research:** Multiple specialized AI agents collaborate to complete research tasks.
- **Evidence-Based Insights:** Research findings are connected to supporting and contradicting sources.
- **Knowledge Discovery:** Extract entities and relationships to build interactive knowledge graphs.
- **Document Intelligence:** Retrieve contextual information from uploaded documents using RAG.
- **Research Evolution:** Identify changes, new findings, and retracted claims across research sessions.
- **Adversarial Analysis:** Challenge findings through opposing AI perspectives.

The goal is to make research more structured, transparent, traceable, and efficient.

---

## ✨ Key Features

### 🤖 1. Multi-Agent Research System

A coordinated AI workflow consisting of five specialized agents:

- **Planner Agent:** Breaks complex research questions into manageable tasks.
- **Researcher Agent:** Discovers relevant information using real-time web search.
- **Analyst Agent:** Analyzes collected information and identifies meaningful insights.
- **Fact Checker Agent:** Verifies claims against available evidence.
- **Synthesizer Agent:** Combines validated findings into a structured research report.

### 🌐 2. Real-Time Web Research

- Tavily-powered web search.
- Automated source discovery.
- Source URLs and citations.
- Evidence collection from multiple sources.
- Supporting and contradicting information.

### 📚 3. Document Intelligence with RAG

- Upload PDF and TXT documents.
- Extract and process document content.
- Generate embeddings.
- Store embeddings in Pinecone.
- Perform semantic retrieval.
- Generate contextual answers using Gemini.

### 🧠 4. Interactive Knowledge Graph

- Gemini-powered entity extraction.
- Relationship identification.
- Neo4j graph storage.
- Interactive entity and relationship visualization.
- Explore connections between research findings.

### 🔎 5. Trace Evidence

Connect research claims directly to their supporting or contradicting evidence.

- Trace individual claims.
- Inspect supporting sources.
- Identify contradicting information.
- Connect evidence from web research and uploaded documents.

### ⚔️ 6. Debate Findings

Use adversarial AI agents to challenge research conclusions.

- Pro Agent presents supporting arguments.
- Counter Agent challenges the findings.
- Compare opposing perspectives.
- Identify potential bias and unsupported claims.

### ⚠️ 7. Contradiction Detection

Automatically cross-reference research findings to identify conflicting claims and highlight inconsistencies.

### 🔄 8. Research Evolution — What Changed?

Compare previous and current research to identify:

- Newly discovered claims.
- Updated findings.
- Retracted claims.
- Changes in supporting evidence.
- Evolving research conclusions.

### 🎯 9. Deep Dive Research

Perform targeted follow-up research on individual findings.

- Additional supporting evidence.
- Latest sources.
- Opposing viewpoints.
- Additional context.

### ⚖️ 10. Research Comparison

Compare two completed research workspaces to identify:

- Similarities.
- Differences.
- Conflicting findings.
- Supporting evidence.
- Source comparisons.
- Overall synthesis.

### 💬 11. Research Chat

Interact with completed research and uploaded documents through contextual AI-powered conversations.

### ⏳ 12. Research Timeline

Visualize important research events chronologically using dates extracted from relevant sources.

### 🔍 13. Global Search

Search across research workspaces and research content.

### 📄 14. PDF Report Export

Export structured research findings into downloadable PDF reports.

### 🎨 15. User Experience

- Premium responsive interface.
- Mobile, tablet, and desktop support.
- Dark and light themes.
- Demo workspaces.
- Discovery-focused dashboard.
- JWT-based authentication.

---

## 🏗️ System Architecture

ResearchAI follows a modular full-stack architecture connecting the frontend, backend, AI services, and specialized databases.

```text
                    ┌─────────────────────────┐
                    │      React + Vite       │
                    │        Frontend         │
                    └────────────┬────────────┘
                                 │
                              REST API
                                 │
                    ┌────────────▼────────────┐
                    │    Node.js + Express    │
                    │        Backend          │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
             ▼                   ▼                   ▼
       ┌───────────┐       ┌───────────┐       ┌───────────┐
       │  MongoDB  │       │   Neo4j   │       │ Pinecone  │
       │  App Data │       │ Knowledge │       │ Vector DB │
       │           │       │   Graph   │       │    RAG    │
       └───────────┘       └───────────┘       └───────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       Gemini AI         │
                    │    Multi-Agent Core     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Tavily Search      │
                    │     Web Discovery       │
                    └─────────────────────────┘
```

### Architecture Responsibilities

| Component | Responsibility |
|---|---|
| React + Vite | User interface and workspace management |
| Node.js + Express | Backend APIs and application logic |
| MongoDB | Users, workspaces, findings, and reports |
| Gemini AI | Agent reasoning, analysis, and synthesis |
| Tavily | Real-time web search |
| Pinecone | Vector embeddings and semantic retrieval |
| Neo4j | Knowledge graph and relationship storage |

---

## 🤖 Multi-Agent Architecture

ResearchAI uses a specialized agent pipeline where each agent performs a dedicated responsibility.

```text
                 Research Question
                        │
                        ▼
                 ┌─────────────┐
                 │   Planner   │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Researcher  │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   Analyst   │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Fact Checker│
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Synthesizer │
                 └──────┬──────┘
                        │
                        ▼
                Final Research Report
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
       Web Sources  Knowledge     Timeline
                      Graph
           │
           ├──────────────► Research Chat
           │
           ├──────────────► Deep Dive
           │
           └──────────────► PDF Export
```

### Agent Responsibilities

| Agent | Primary Responsibility |
|---|---|
| Planner | Research decomposition and planning |
| Researcher | Web-based information discovery |
| Analyst | Analysis and insight extraction |
| Fact Checker | Claim and evidence verification |
| Synthesizer | Final research report generation |

---

## 🔄 Core Workflows

### 1. RAG Pipeline

ResearchAI uses Retrieval-Augmented Generation to answer questions based on uploaded documents.

```text
       PDF / TXT Upload
              │
              ▼
       Text Extraction
              │
              ▼
           Chunking
              │
              ▼
          Embeddings
              │
              ▼
          Pinecone
              │
              ▼
      Semantic Retrieval
              │
              ▼
        Gemini Context
              │
              ▼
       Contextual Answer
```

### 2. Knowledge Graph Pipeline

```text
       Research Findings
              │
              ▼
    Gemini Entity Extraction
              │
              ▼
    Entities + Relationships
              │
              ▼
      Neo4j Graph Database
              │
              ▼
   Interactive Knowledge Graph
```

### 3. Real-Time Web Research

```text
       Research Question
              │
              ▼
       Researcher Agent
              │
              ▼
        Tavily API
              │
              ▼
       Web Discovery
              │
              ▼
     Analysis + Fact Checking
              │
              ▼
       Final Research
```

### 4. Research Comparison

```text
        Workspace A
              │
              ├──────────────┐
              │              │
              │              ▼
              │      Comparison Engine
              │              ▲
              │              │
        Workspace B          │
                             │
                  ┌──────────┼──────────┐
                  ▼          ▼          ▼
             Similarities Differences Conflicts
                             │
                             ▼
                       Final Synthesis
```

### 5. Deep Dive Research

```text
        Selected Finding
               │
               ▼
           Deep Dive
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
   Supporting Latest  Opposing
   Evidence   Sources  Views
               │
               ▼
       Additional Context
```

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- React Router
- Lucide React
- react-force-graph-2d

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI & Research

- Google Gemini
- Tavily Search API
- Multi-Agent Architecture
- Retrieval-Augmented Generation (RAG)
- Prompt Engineering

### Databases

- MongoDB — Application Database
- Pinecone — Vector Database
- Neo4j — Knowledge Graph

### Deployment

- Vercel

---

## 📁 Project Structure

```text
ResearchAI-MultiAgent/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphPanel/
│   │   │   ├── ResearchChat/
│   │   │   ├── DeepDive/
│   │   │   └── ...
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Workspace/
│   │   │   ├── CompareWorkspaces/
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── agents/
│   │   │   ├── planner/
│   │   │   ├── researcher/
│   │   │   ├── analyst/
│   │   │   ├── factChecker/
│   │   │   └── synthesizer/
│   │   │
│   │   ├── ai/
│   │   ├── rag/
│   │   ├── graph/
│   │   └── chat/
│   │
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## ⚙️ Prerequisites

Before running ResearchAI locally, make sure you have:

- Node.js 18 or higher
- npm
- Git
- MongoDB or MongoDB Atlas account
- Neo4j or Neo4j Aura account
- Pinecone account
- Google Gemini API key
- Tavily API key

---

## 📥 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vishal202-rgb/ResearchAI-MultiAgent.git

cd ResearchAI-MultiAgent
```

### 2. Install Backend Dependencies

```bash
cd server

npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd client

npm install
```

---

## 🔐 Environment Configuration

Create a `.env` file inside the `server/` directory.

You can use the existing `.env.example` file as a reference.

### Server Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Tavily Search
SEARCH_API_KEY=your_tavily_api_key
SEARCH_API_URL=https://api.tavily.com/search

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index

# Neo4j
NEO4J_URI=your_neo4j_uri
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

**Important Security Practices**

- Never commit `.env` files.
- Never expose API keys or database credentials.
- Keep `.env` inside `.gitignore`.
- Use separate credentials for development and production.
- Rotate credentials if they are accidentally exposed.

---

## ▶️ Running the Application

ResearchAI requires the frontend and backend to run simultaneously.

### 1. Start the Backend

From the `server/` directory:

```bash
npm run dev
```

Expected output:

```text
MongoDB connected successfully
Neo4j connected
Server running on port 5000
```

Backend URL:

```text
http://localhost:5000
```

### 2. Start the Frontend

Open another terminal:

```bash
cd client

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Open the frontend URL in your browser to access ResearchAI.

---

## 🔐 Authentication

ResearchAI implements JWT-based authentication for secure user access.

### Authentication Flow

```text
          User
            │
            ▼
       Register / Login
            │
            ▼
        JWT Token
            │
            ▼
     Protected API Routes
            │
            ▼
   Authenticated Workspace
```

### Security Components

- JWT for authentication.
- bcryptjs for password hashing.
- Protected API routes.
- Authenticated workspace access.

---

## 🗄️ Database Architecture

ResearchAI uses specialized databases for different types of information.

| Technology | Purpose |
|---|---|
| MongoDB | User accounts, workspaces, findings, reports, and application data |
| Pinecone | Document embeddings and semantic retrieval |
| Neo4j | Knowledge graph entities and relationships |
| Gemini | AI reasoning, agents, analysis, and synthesis |
| Tavily | Real-time web search and source discovery |

This architecture separates application data, vector retrieval, and graph relationships into dedicated services.

---

## ☁️ Deployment

ResearchAI is deployed using Vercel.

### Production Configuration

1. Push your latest code to GitHub.
2. Open the Vercel Dashboard.
3. Import the connected GitHub repository.
4. Configure the appropriate build settings.
5. Add the required environment variables.
6. Deploy the application.
7. Verify the production deployment.

### Environment Variables in Vercel

Navigate to:

```text
Vercel Dashboard
    ↓
Select Project
    ↓
Settings
    ↓
Environment Variables
```

Configure the required variables:

```text
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
NODE_ENV
GEMINI_API_KEY
SEARCH_API_KEY
SEARCH_API_URL
PINECONE_API_KEY
PINECONE_INDEX
NEO4J_URI
NEO4J_USER
NEO4J_PASSWORD
```

Make sure the variables are configured for the correct deployment environment.

### Deployment Verification Checklist

- [ ] Application builds successfully.
- [ ] Production environment variables are configured.
- [ ] MongoDB connection works.
- [ ] User registration works.
- [ ] User login works.
- [ ] Protected routes work.
- [ ] Research workflow executes successfully.
- [ ] Web search integration works.
- [ ] RAG functionality works.
- [ ] Knowledge graph functionality works.
- [ ] PDF export works.

**Note:** Backend and frontend deployment configuration may differ depending on the repository's Vercel build settings.

---

## 🔮 Future Enhancements

ResearchAI can be extended with additional research and collaboration capabilities.

### Collaborative Research

- Shared research workspaces.
- Viewer and Editor permissions.
- Real-time collaboration.
- Comments and annotations.
- Activity history.

### Additional Improvements

- Research version history.
- Citation credibility scoring.
- Multi-model AI support.
- Voice-based research assistant.
- Browser extension.
- Scheduled research agents.
- Team research dashboards.

---

## 💡 Why ResearchAI?

Traditional research follows a largely manual process:

```text
Search
  ↓
Read
  ↓
Analyze
  ↓
Verify
  ↓
Compare
  ↓
Organize
  ↓
Write
```

ResearchAI brings these activities together into an intelligent, multi-agent research workspace.

```text
           Research Question
                  │
                  ▼
          Multi-Agent Research
                  │
                  ▼
       Web Sources + RAG Documents
                  │
                  ▼
       Knowledge Graph + Fact Checking
                  │
                  ▼
       Trace Evidence + Debate Findings
                  │
                  ▼
       Contradictions + What Changed?
                  │
                  ▼
          Comparison + Timeline
                  │
                  ▼
         Research Chat + Deep Dive
                  │
                  ▼
          Final Report + PDF Export
```

The result is a unified research environment that combines AI reasoning, evidence discovery, document intelligence, and knowledge representation.

---

## 📊 Project Status

**Status: Deployed Portfolio Project**

### Implemented Features

- [x] Multi-Agent Research System
- [x] Real-Time Web Search
- [x] PDF/TXT Document RAG
- [x] Pinecone Vector Search
- [x] Neo4j Knowledge Graph
- [x] Trace Evidence
- [x] Debate Findings
- [x] Contradiction Detection
- [x] Research Evolution — What Changed?
- [x] Research Chat
- [x] Deep Dive Research
- [x] Workspace Comparison
- [x] Research Timeline
- [x] Global Search
- [x] PDF Export
- [x] JWT Authentication
- [x] Demo Workspaces
- [x] Responsive Interface
- [x] Dark/Light Mode
- [x] Vercel Deployment

---

## 👨‍💻 Author

### Vishal Kumar

**Generative AI Enthusiast | Full Stack Developer | AI Agents | RAG | LLMs**

Interested in building intelligent applications using Generative AI, multi-agent systems, modern web technologies, and scalable software architectures.

- **GitHub:** [Vishal202-rgb](https://github.com/Vishal202-rgb)
- **LinkedIn:** [Vishal Kumar](https://www.linkedin.com/in/vishal202-rgb/)

---

## ⭐ Support

If you find ResearchAI useful or interesting:

- Give this repository a ⭐ on GitHub.
- Explore the project and its features.
- Share feedback and suggestions.
- Contribute ideas for future improvements.

Your support is appreciated!

---

## 📜 License

This project is licensed under the **MIT License**.
