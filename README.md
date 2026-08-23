# 🔬 ResearchAI — Multi-Agent Research Workspace

> An AI-powered multi-agent research platform that transforms complex research questions into structured, evidence-backed insights using autonomous AI agents, real-time web search, RAG, vector databases, and knowledge graphs.

ResearchAI is a full-stack MERN-based AI research workspace that automates the complete research lifecycle — from research planning and source discovery to analysis, fact-checking, synthesis, knowledge visualization, comparison, deep-dive research, and PDF report generation.

---

## 🚀 Features

- 🤖 **Multi-Agent Research** — Planner, Researcher, Analyst, Fact Checker and Synthesizer agents.
- 🌐 **Real-Time Web Search** — Tavily-powered search with source URLs and citations.
- 📚 **Document RAG** — Upload PDF/TXT documents and perform contextual research using Pinecone.
- 🧠 **Knowledge Graph** — Neo4j-powered entity and relationship visualization.
- 💬 **Research Chat** — Ask questions about completed research and documents.
- 🎯 **Deep Dive Research** – Perform targeted follow-up research on individual findings.
- 🔎 **Trace Evidence** – Map claims directly to supporting and contradicting web sources and RAG documents.
- ⚔️ **Debate Findings** – Trigger Pro vs Counter adversarial AI agents to challenge bias and hallucination.
- ⚠️ **Contradiction Detection** – Automatically cross-reference findings to highlight conflicting claims.
- 🔄 **What Changed?** – Run evolutionary analysis between past and present research to track new and retracted claims.
- 📱 **Premium Responsive UI** – Flawlessly optimized across mobile, tablet, and desktop viewports with discovery-first UX.
- ⚖️ **Research Comparison** – Compare two completed research workspaces.
- ⏳ **Research Timeline** — Visualize important research events chronologically.
- 🔎 **Global Search** — Search across workspaces and research content.
- 📄 **PDF Export** — Export research results into structured PDF reports.
- 🎯 **Demo Workspaces** — Explore pre-built research without consuming API credits.
- 🔐 **JWT Authentication** — Secure registration, login and protected APIs.
- 🌓 **Dark/Light Mode** — Responsive premium interface.

---

## 🏗️ System Architecture

```text
                         ┌────────────────────────┐
                         │      React + Vite      │
                         │       Frontend         │
                         └────────────┬───────────┘
                                      │
                                  REST API
                                      │
                         ┌────────────▼───────────┐
                         │    Node.js + Express   │
                         │        Backend         │
                         └────────────┬───────────┘
                                      │
              ┌───────────────────────┼────────────────────────┐
              │                       │                        │
              ▼                       ▼                        ▼
       ┌────────────┐          ┌────────────┐          ┌────────────┐
       │  MongoDB   │          │   Neo4j    │          │  Pinecone  │
       │ Application│          │ Knowledge  │          │ Vector DB  │
       │   Data     │          │   Graph    │          │    RAG     │
       └────────────┘          └────────────┘          └────────────┘
                                      │
                                      ▼
                           ┌────────────────────┐
                           │     Gemini AI      │
                           │  Multi-Agent Core  │
                           └─────────┬──────────┘
                                     │
                                     ▼
                           ┌────────────────────┐
                           │   Tavily Search    │
                           │   Real Web Search  │
                           └────────────────────┘
```

---

## 🔄 Multi-Agent Research Workflow

```text
                    Research Question
                           │
                           ▼
                      ┌─────────┐
                      │ Planner │
                      └────┬────┘
                           │
                           ▼
                    ┌────────────┐
                    │ Researcher │
                    └─────┬──────┘
                          │
                          ▼
                      ┌─────────┐
                      │ Analyst │
                      └────┬────┘
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
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Web Sources   Knowledge Graph  Timeline
             │
             ├──────────────► Research Chat
             │
             ├──────────────► Deep Dive
             │
             └──────────────► PDF Export
```

---

## 📚 RAG Pipeline

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

---

## 🧠 Knowledge Graph Pipeline

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

---

## ⚖️ Research Comparison

Users can select two completed research workspaces and compare:

- Similarities
- Differences
- Conflicting findings
- Supporting evidence
- Sources
- Overall synthesis

```text
Workspace A ──────┐
                  ├──► Comparison Engine
Workspace B ──────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         Similarities Differences Conflicts
                         │
                         ▼
                    Final Synthesis
```

---

## 🔬 Deep Dive Research

Users can select any research finding and perform targeted follow-up research.

```text
Selected Finding
       │
       ▼
    Deep Dive
       │
       ├── Supporting Evidence
       ├── Latest Sources
       ├── Opposing Views
       └── Additional Context
```

---

## ⏳ Research Timeline

ResearchAI extracts relevant dates from verified sources and organizes research events chronologically.

```text
2022 ───── 2023 ───── 2024 ───── 2025 ───── 2026
  │           │           │           │           │
 Study       Paper       Trend      Report      Latest
```

---

## 🛠️ Tech Stack

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
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Workspace/
│   │   │   ├── CompareWorkspaces/
│   │   │   └── ...
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
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
│   │   ├── ai/
│   │   ├── rag/
│   │   ├── graph/
│   │   └── chat/
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

Install the following:

- Node.js 18+
- npm
- Git
- MongoDB / MongoDB Atlas
- Neo4j / Neo4j Aura
- Pinecone Account
- Google Gemini API Key
- Tavily API Key

---

## 📥 Installation & Setup

### 1. Clone Repository

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

## 🔐 Environment Variables

Create the following file:

```text
server/.env
```

You can use `.env.example` as the template.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Tavily
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

> ⚠️ Never commit `.env` files or expose API keys publicly.

---

## ▶️ Run the Application

### Start Backend

From the `server` directory:

```bash
npm run dev
```

Expected output:

```text
MongoDB connected successfully
Neo4j connected
Server running on port 5000
```

Backend:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

---

## 🔐 Authentication Flow

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

Passwords are securely hashed using `bcryptjs`.

---

## 🌐 Web Search Flow

```text
Research Question
       │
       ▼
Researcher Agent
       │
       ▼
Tavily Search API
       │
       ▼
Real Web Sources
       │
       ▼
Analysis + Fact Checking
       │
       ▼
Final Research
```

---

## 🗄️ Database Responsibilities

| Technology | Purpose |
|------------|---------|
| MongoDB | Users, workspaces, findings, reports and application data |
| Pinecone | Document embeddings and semantic retrieval |
| Neo4j | Entities and relationships for the knowledge graph |
| Gemini | AI reasoning, agents, synthesis and analysis |
| Tavily | Real-time web search and source discovery |

---

## 🧪 Development Workflow

Run both services simultaneously:

```text
Terminal 1
────────────────────────
cd server
npm run dev

Terminal 2
────────────────────────
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## ☁️ Deployment

ResearchAI can be deployed using Vercel.

### Production Environment Variables

Add these variables in:

```text
Vercel Dashboard
→ Project
→ Settings
→ Environment Variables
```

Required variables:

```text
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
GEMINI_API_KEY
SEARCH_API_KEY
SEARCH_API_URL
PINECONE_API_KEY
PINECONE_INDEX
NEO4J_URI
NEO4J_USER
NEO4J_PASSWORD
CLIENT_URL
NODE_ENV
```

### Deployment Checklist

```text
1. Push code to GitHub
        ↓
2. Import repository into Vercel
        ↓
3. Configure environment variables
        ↓
4. Configure build settings
        ↓
5. Deploy
        ↓
6. Test authentication
        ↓
7. Test research workflow
        ↓
8. Test RAG
        ↓
9. Test Knowledge Graph
        ↓
10. Test PDF Export
```

> Never store production secrets inside GitHub.

---

## 🔮 Future Scope

### 👥 Collaborative Research

Enable multiple users to collaborate inside the same research workspace.

Planned capabilities:

- Workspace sharing
- Viewer / Editor permissions
- Real-time collaboration
- Comments and annotations
- Activity history

### Additional Improvements

- Research version history
- Citation credibility scoring
- Multi-model support
- Voice-based research assistant
- Browser extension
- Scheduled research agents
- Team research dashboards

---

## 💡 Why ResearchAI?

Traditional research requires manually:

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

ResearchAI brings these steps into one intelligent workspace:

```text
Research Question
       ↓
Multi-Agent Research
       ↓
Real Web Sources + RAG Documents
       ↓
Knowledge Graph + Fact Checking
       ↓
Trace Evidence + Debate Findings
       ↓
Contradictions + What Changed?
       ↓
Comparison + Timeline
       ↓
Research Chat + Deep Dive
       ↓
Final Report + PDF Export
```

---

## 📌 Project Status

### 🟢 Production-Ready Portfolio Project

Currently implemented:

- Multi-Agent Research
- Real-Time Web Search
- PDF/TXT RAG
- Pinecone Vector Search
- Neo4j Knowledge Graph
- Trace Evidence & Debate Findings
- Contradiction Detection
- What Changed? (Research Evolution)
- Research Chat
- Deep Dive Research
- Workspace Comparison
- Research Timeline
- Global Search
- PDF Export
- JWT Authentication
- Demo Workspaces
- Responsive Premium UI
- Dark/Light Mode
- Vercel Deployment

---

## 👨‍💻 Author

**Vishal Kumar**

B.Tech Final Year Student  
Generative AI & Full Stack Developer

---

## ⭐ Support

If you find ResearchAI useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is licensed under the MIT License.
