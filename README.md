# DataPilot

### Autonomous AI-Powered Business Intelligence & Data Analysis Platform

![Python 3.11](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-TypeScript-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![SQL Server](https://img.shields.io/badge/Database-SQL%20Server-red?logo=microsoftsqlserver&logoColor=white)
![LangGraph](https://img.shields.io/badge/Agent-LangGraph-purple)
![MCP](https://img.shields.io/badge/AI-MCP-orange)
![RAG](https://img.shields.io/badge/AI-RAG-blueviolet)
![Docker](https://img.shields.io/badge/DevOps-Docker-blue?logo=docker&logoColor=white)
![Status](https://img.shields.io/badge/Status-Under%20Development-yellow)

---

## Overview

**DataPilot** is a full-stack AI-powered business intelligence and data analysis platform designed to help users transform raw business data into actionable insights using natural language.

The platform allows users to upload structured datasets and business documents, explore their data through interactive dashboards, and ask complex analytical questions to an AI-powered analyst.

Unlike a conventional chatbot that simply generates responses, DataPilot uses an **agentic AI architecture** to independently determine what analysis is required, select appropriate tools, query Microsoft SQL Server, perform Python-based analysis, retrieve relevant information from documents, generate visualizations, validate results, and produce explainable business insights.

> **Upload your data. Ask a question. Let the AI investigate.**

---

## Research Motivation

Modern organizations generate large volumes of structured and unstructured data. Although business intelligence platforms provide dashboards and reports, users often need technical knowledge of SQL, Python, statistics, and data visualization to perform deeper investigations.

Traditional analytics workflows are generally focused on answering:

> **What happened?**

However, business decision-making often requires answering:

> **Why did it happen?**

For example, identifying that revenue decreased by 12% is relatively straightforward. Determining whether the decline was caused by a particular product category, region, customer segment, order volume, pricing change, or other factor requires multiple analytical steps.

DataPilot aims to bridge this gap by introducing an intelligent analytical layer capable of investigating business questions autonomously.

### Existing analytics workflows primarily require:

- SQL knowledge for database analysis
- Python knowledge for advanced analysis
- BI tools for visualization
- Manual document search for business context
- Separate tools for different analytical tasks

### DataPilot aims to provide:

- Natural-language data exploration
- Autonomous multi-step analysis
- Structured and unstructured data reasoning
- AI-generated visualizations
- Evidence-backed business explanations
- Explainable and auditable agent workflows

---

## Problem Statement

Business users often have access to large datasets but may not have the technical expertise required to perform complex data analysis.

A question such as:

> **"Why did revenue decline last quarter?"**

may require:

- Revenue trend analysis
- Category-level analysis
- Regional analysis
- Customer-segment analysis
- Order-volume analysis
- Average-order-value analysis
- Statistical analysis
- Business-document retrieval
- Visualization
- Result validation

Performing these tasks manually requires switching between multiple tools and analytical workflows.

**DataPilot aims to provide a unified platform where an AI agent can coordinate these analytical tasks and provide evidence-backed business insights through a natural-language interface.**

---

## Objectives

The primary objectives of DataPilot are:

1. Build a modern full-stack analytics application.
2. Enable natural-language interaction with structured business data.
3. Integrate Microsoft SQL Server as the primary analytical database.
4. Build an AI agent capable of multi-step reasoning and tool use.
5. Enable AI-driven SQL and Python analysis.
6. Integrate Retrieval-Augmented Generation for business documents.
7. Use Model Context Protocol for standardized tool integration.
8. Generate interactive visualizations based on analytical results.
9. Implement AI evaluation and observability.
10. Implement security controls and AI guardrails.
11. Safely execute AI-generated analytical code using Docker isolation.
12. Containerize and deploy the complete application.

---

# Core Features

## 1. Dataset Upload

Users can upload business datasets such as:

- CSV files
- Excel files
- Other supported structured data formats

The system validates and processes the uploaded data before making it available for analysis.

---

## 2. Automatic Dataset Profiling

After uploading a dataset, DataPilot automatically analyzes:

- Number of rows
- Number of columns
- Column names
- Data types
- Missing values
- Duplicate records
- Unique values
- Descriptive statistics
- Data-quality issues

Example:

```text
Dataset: sales.csv

Rows:              48,231
Columns:           14
Missing Values:    342
Duplicates:        28

Date Column:       OrderDate
Revenue Column:    Revenue
Category Column:   Category
Region Column:     Region
```

---

## 3. Interactive Analytics Dashboard

DataPilot provides an interactive dashboard for exploring business data.

The dashboard can include:

- Revenue KPIs
- Order KPIs
- Customer KPIs
- Revenue trends
- Category performance
- Regional performance
- Product performance
- Interactive charts
- Data tables
- Filters
- Date-based analysis

---

## 4. AI Analyst

Users can interact with the platform using natural language.

Example questions:

```text
Which category generated the most revenue?

Which region performed best?

Why did revenue decrease in Q3?

Which products are underperforming?

Find unusual patterns in the dataset.

Compare Q2 and Q3 performance.

What are the top five business insights?

What factors are driving revenue?
```

The AI Analyst determines what information and analytical tools are required to answer the question.

---

# Agentic AI

DataPilot is designed as an **agentic AI system**, rather than a simple LLM chatbot.

A conventional chatbot follows:

```text
User Question
      ↓
LLM
      ↓
Generated Answer
```

DataPilot follows:

```text
User Question
      ↓
Understand Question
      ↓
Plan Analysis
      ↓
Select Tools
      ↓
Execute Tools
      ↓
Inspect Results
      ↓
Need More Analysis?
      │
 ┌────┴────┐
 │         │
Yes        No
 │         │
 ▼         ▼
More     Validate
Tools     Results
            │
            ▼
      Generate Charts
            │
            ▼
      Generate Answer
```

This allows the agent to perform **multi-step investigations** instead of generating an answer from the language model alone.

---

# Example Agent Workflow

### User Question

> **Why did revenue decline in Q3?**

The agent may perform the following steps:

```text
1. Understand the question
          ↓
2. Identify the relevant dataset
          ↓
3. Inspect the dataset schema
          ↓
4. Identify the revenue and date columns
          ↓
5. Calculate quarterly revenue
          ↓
6. Identify the period of decline
          ↓
7. Analyze category-level changes
          ↓
8. Analyze regional changes
          ↓
9. Analyze order volume
          ↓
10. Analyze average order value
          ↓
11. Retrieve relevant business documents
          ↓
12. Generate supporting visualizations
          ↓
13. Validate calculations
          ↓
14. Generate final explanation
```

---

# Example

### Question

```text
Why did revenue decline in Q3?
```

### Agent Execution

```text
✓ Inspected dataset
✓ Identified revenue and date columns
✓ Compared quarterly revenue
✓ Analyzed category contribution
✓ Analyzed regional contribution
✓ Compared order volume
✓ Compared average order value
✓ Retrieved relevant business context
✓ Generated supporting visualizations
✓ Validated calculations
```

### Example Result

```text
Revenue decreased by 11.9% compared with Q2.

The primary contributors were:

• Electronics revenue decreased by 18%
• South-region revenue decreased by 15%
• Average order value decreased by 8%
• Order volume decreased by 4%

The largest contribution to the decline came from
the Electronics category in the South region.

Supporting visualizations are provided with the analysis.
```

---

# AI Tools

The agent has access to specialized tools.

| Tool | Purpose |
|---|---|
| Dataset Profiler | Understand dataset structure and data quality |
| SQL Tool | Query structured data using SQL Server |
| Python Tool | Perform advanced Pandas analysis |
| Chart Tool | Generate analytical visualizations |
| RAG Tool | Retrieve relevant information from documents |
| MCP Tools | Connect the agent with external tools and data |

---

# SQL Server Integration

Microsoft SQL Server is used as the primary structured-data storage and analytical database.

The application architecture is:

```text
Next.js
   ↓
FastAPI
   ↓
SQLAlchemy
   ↓
pyodbc
   ↓
Microsoft SQL Server
```

SQL Server can store:

```text
Users
Datasets
Dataset Metadata
Conversations
Messages
Analysis Jobs
Analysis Results
```

Example analytical query:

```sql
SELECT
    Category,
    SUM(Revenue) AS TotalRevenue
FROM Sales
GROUP BY Category
ORDER BY TotalRevenue DESC;
```

The AI-generated SQL is validated before execution and is initially restricted to **read-only operations**.

---

# Retrieval-Augmented Generation

DataPilot supports the combination of structured business data and unstructured business knowledge.

Users can upload documents such as:

- Business reports
- Company policies
- Strategy documents
- Annual reports
- PDF documents
- Text documents

The RAG pipeline follows:

```text
Business Documents
       ↓
Document Processing
       ↓
Text Extraction
       ↓
Chunking
       ↓
Embeddings
       ↓
Qdrant Vector Database
       ↓
Retriever
       ↓
AI Agent
```

This allows DataPilot to answer questions that require both numerical analysis and business context.

### Example

```text
Sales Data
    +
Pricing Policy
    +
Annual Report
    ↓
AI Agent
    ↓
Business Analysis
```

User:

> "Revenue declined in Q3. Does the company's pricing policy provide an explanation?"

The agent can combine SQL analysis with document retrieval to answer the question.

---

# Vector Database

**Qdrant** is used for storing and retrieving vector embeddings for the RAG system.

The system separates:

```text
Structured Information
        ↓
SQL Server
```

from:

```text
Unstructured Information
        ↓
Qdrant
```

The AI agent can determine which source is appropriate for a given question.

Example:

```text
"What was our revenue in Q3?"
        ↓
SQL Server


"What does the pricing policy say?"
        ↓
RAG / Qdrant


"Why did revenue decline?"
        ↓
SQL Server + Python + RAG
```

---

# Model Context Protocol

DataPilot incorporates **Model Context Protocol (MCP)** as a standardized interface between the AI agent and external tools or data sources.

Conceptually:

```text
                    AI Agent
                       │
                       ▼
                      MCP
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     SQL Server    Python Tools   Documents
```

MCP provides a structured approach for exposing tools and data sources to the AI system.

---

# Agent State & Memory

DataPilot maintains relevant state throughout an analytical workflow.

Example:

```text
User:
Which region performed best?

AI:
South.

User:
Why?

AI:
South performed best because...
```

The system maintains the relevant conversational and workflow context so that follow-up questions can be interpreted correctly.

---

# Real-Time Agent Progress

Complex AI analysis can take multiple steps.

Instead of displaying only:

```text
Loading...
```

DataPilot can show user-facing progress:

```text
AI Analyst

✓ Inspected dataset
✓ Identified revenue column
✓ Queried SQL Server
✓ Compared quarterly revenue
✓ Analyzed regional performance
⟳ Generating visualizations...
```

Real-time communication can be implemented using:

- Server-Sent Events (SSE)
- WebSockets

---

# Background Jobs

Long-running analyses can be executed asynchronously.

The workflow is:

```text
User
  ↓
POST /analysis
  ↓
Create Analysis Job
  ↓
Return Job ID
  ↓
Background Worker
  ↓
Agent Analysis
  ↓
Store Results
  ↓
Frontend receives progress/results
```

Redis can be used for:

- Background job queues
- Caching
- Temporary state
- Task coordination

---

# AI Evaluation

DataPilot includes an evaluation layer to measure the quality of AI-generated analysis.

Instead of assuming that an AI response is correct, the system evaluates its performance.

Potential metrics include:

- SQL accuracy
- Answer accuracy
- Tool-selection accuracy
- RAG retrieval quality
- Response quality
- Hallucination rate
- Latency
- Token usage

Example:

```text
AI Evaluation
────────────────────

SQL Accuracy        95%
Answer Accuracy     92%
Tool Selection      94%
RAG Retrieval       90%

Average Latency     3.7 sec
```

---

# LLM Observability

Agent executions are monitored to understand how the system performs.

Example:

```text
Agent Run #1048
────────────────────────

User Question
      ↓
Planner                 0.4s
      ↓
SQL Tool                0.8s
      ↓
Python Tool             1.3s
      ↓
Validator               0.3s
      ↓
Final Response          0.7s

Total                   3.5s
```

The system can track:

- Agent executions
- Tool calls
- Latency
- Token usage
- Errors
- Failed SQL queries
- Retrieval results
- Analysis steps

---

# AI Guardrails

AI-generated operations are treated as untrusted input.

### SQL Guardrails

```text
AI Generated SQL
       ↓
SQL Validator
       ↓
Is Query Read-Only?
       │
   ┌───┴────┐
   │        │
  YES       NO
   │        │
   ▼        ▼
Execute    Reject
```

Initially, DataPilot restricts the agent to read-only SQL operations.

Potentially destructive operations such as:

```sql
DROP
DELETE
UPDATE
INSERT
ALTER
TRUNCATE
```

are rejected.

---

# Sandboxed Python Execution

AI-generated Python code should never be executed directly on the host machine.

DataPilot uses Docker-based isolation for analytical code execution.

```text
AI Agent
    ↓
Python Tool
    ↓
Docker Sandbox
    ↓
Restricted Python Environment
    ↓
Analysis Result
    ↓
AI Agent
```

The sandbox can enforce:

- CPU limits
- Memory limits
- Execution timeouts
- Restricted filesystem access
- Temporary storage
- Limited permissions
- Restricted network access

---

# System Architecture

```text
                           USER
                             │
                             ▼
                    ┌─────────────────┐
                    │     Next.js     │
                    │    Frontend     │
                    └────────┬────────┘
                             │
                        REST / SSE
                             │
                             ▼
                    ┌─────────────────┐
                    │     FastAPI     │
                    │     Backend     │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
           SQL Server      Redis        Qdrant
           Structured     Jobs/Cache    Vectors
              Data
                │            │            │
                └────────────┼────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    LangGraph    │
                    │    AI Agent     │
                    └────────┬────────┘
                             │
                             ▼
                            MCP
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          SQL Tool      Python Tool       RAG Tool
              │              │              │
              ▼              ▼              ▼
        SQL Server     Docker Sandbox     Qdrant
                             │
                             ▼
                       Analysis Results
                             │
                             ▼
                    Validation & Guardrails
                             │
                             ▼
                       Final Response
```

---

# Docker Architecture

DataPilot is designed as a multi-container application.

```text
Docker Compose
│
├── frontend
│   └── Next.js
│
├── backend
│   └── FastAPI
│
├── worker
│   └── Agent / Background Jobs
│
├── sqlserver
│   └── Microsoft SQL Server
│
├── redis
│   └── Cache / Job Queue
│
├── qdrant
│   └── Vector Database
│
└── sandbox
    └── Restricted Python Execution
```

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Plotly

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- pyodbc
- Pandas
- NumPy

## Database & Infrastructure

- Microsoft SQL Server
- Redis
- Qdrant

## AI & Agentic Systems

- OpenAI API
- LangGraph
- Model Context Protocol (MCP)
- Tool Calling
- Retrieval-Augmented Generation (RAG)
- Embeddings
- Agent State & Memory

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- CI/CD

---

# Project Structure

```text
datapilot/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tools/
│   │   └── rag/
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── worker/
│   ├── agents/
│   ├── jobs/
│   └── Dockerfile
│
├── sandbox/
│   ├── executor/
│   └── Dockerfile
│
├── database/
│   └── migrations/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# Development Roadmap

## Phase 1 — Web Application

- [ ] Next.js setup
- [ ] React components
- [ ] TypeScript
- [ ] Tailwind CSS
- [ ] Dashboard interface
- [ ] Navigation
- [ ] Dataset interface

## Phase 2 — Backend

- [ ] FastAPI
- [ ] REST APIs
- [ ] Pydantic validation
- [ ] CORS
- [ ] Error handling
- [ ] Async APIs

## Phase 3 — SQL Server

- [ ] SQL Server database
- [ ] SQLAlchemy
- [ ] pyodbc
- [ ] Database schema
- [ ] CRUD operations
- [ ] Query APIs
- [ ] Parameterized queries

## Phase 4 — Data Analytics

- [ ] CSV ingestion
- [ ] Dataset validation
- [ ] Dataset profiling
- [ ] Pandas analysis
- [ ] Interactive dashboard
- [ ] Plotly visualizations
- [ ] Filtering and aggregation

## Phase 5 — AI Integration

- [ ] OpenAI API integration
- [ ] Structured outputs
- [ ] Prompt design
- [ ] Basic AI Analyst
- [ ] Context management

## Phase 6 — Agentic AI

- [ ] Tool calling
- [ ] SQL Tool
- [ ] Python Tool
- [ ] Chart Tool
- [ ] LangGraph
- [ ] Agent state
- [ ] Multi-step workflows
- [ ] Agent memory

## Phase 7 — RAG & MCP

- [ ] Document ingestion
- [ ] Text chunking
- [ ] Embeddings
- [ ] Qdrant integration
- [ ] RAG pipeline
- [ ] MCP integration
- [ ] External tool integration

## Phase 8 — AI Engineering

- [ ] Redis
- [ ] Background jobs
- [ ] SSE / WebSockets
- [ ] AI evaluation
- [ ] LLM observability
- [ ] Agent tracing
- [ ] Performance monitoring

## Phase 9 — Security

- [ ] Read-only SQL validation
- [ ] Input validation
- [ ] Authentication
- [ ] Authorization
- [ ] AI guardrails
- [ ] Docker sandbox
- [ ] Resource limits
- [ ] Secure secret management

## Phase 10 — DevOps

- [ ] Dockerfiles
- [ ] Docker Compose
- [ ] Container networking
- [ ] Persistent volumes
- [ ] Automated testing
- [ ] GitHub Actions
- [ ] CI/CD
- [ ] Production deployment

---

# Getting Started

## Prerequisites

Make sure the following are installed:

- Python 3.11+
- Node.js 20+
- npm
- Microsoft SQL Server
- ODBC Driver for SQL Server
- Docker
- Git

---

## Clone the Repository

```bash
git clone <repository-url>
cd datapilot
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

---

## Backend Setup

Open another terminal:

```bash
cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

The backend will run on:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# Environment Variables

Create a `.env` file based on `.env.example`.

```env
OPENAI_API_KEY=your_api_key

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=DataPilot
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_URL=redis://localhost:6379

QDRANT_URL=http://localhost:6333
```

Never commit `.env` files or API keys to the repository.

---

# Docker

Once the individual services are configured:

```bash
docker compose up --build
```

To stop the application:

```bash
docker compose down
```

To rebuild the containers:

```bash
docker compose build
```

---

# Security Principles

DataPilot follows several security principles:

- Never hard-code API keys or database credentials.
- Store secrets using environment variables.
- Validate user input.
- Use parameterized SQL queries.
- Restrict AI-generated SQL to read-only operations.
- Treat AI-generated code as untrusted input.
- Never execute AI-generated Python directly on the host machine.
- Isolate code execution using Docker.
- Apply CPU and memory limits to sandbox containers.
- Apply execution timeouts.
- Restrict filesystem access.
- Restrict network access where appropriate.
- Validate tool inputs and outputs.
- Log agent failures and suspicious operations.
- Implement authentication and authorization before production deployment.

---

# Learning Objectives

DataPilot is being developed as a hands-on project to gain practical experience in modern software and AI engineering.

### Full-Stack Development

- React
- Next.js
- TypeScript
- Tailwind CSS
- REST APIs
- FastAPI
- Async programming
- SSE / WebSockets
- Authentication

### Data Engineering

- Microsoft SQL Server
- SQLAlchemy
- pyodbc
- Database design
- Data ingestion
- Pandas
- Redis
- Vector databases

### AI Engineering

- LLM APIs
- Structured outputs
- Function/tool calling
- Agentic AI
- LangGraph
- Model Context Protocol
- RAG
- Embeddings
- Agent state and memory
- AI evaluation
- LLM observability

### AI Security

- SQL validation
- AI guardrails
- Secure tool execution
- Sandboxed code execution
- Resource isolation

### DevOps

- Docker
- Docker Compose
- Container networking
- Volumes
- Background workers
- CI/CD
- Deployment

---

# Future Enhancements

Potential future improvements include:

- Multiple datasets per workspace
- Automatic dashboard generation
- Scheduled analytical reports
- Email report delivery
- Role-based access control
- Team workspaces
- Data lineage
- Advanced anomaly detection
- Forecasting
- Natural-language dashboard generation
- Multi-agent workflows
- Additional MCP integrations
- Agent benchmarking
- Human approval workflows
- Cloud deployment
- Advanced analytics recommendations

---

# Project Goals

DataPilot is designed to explore the intersection of:

```text
Full-Stack Development
          +
Data Analytics
          +
Data Engineering
          +
Agentic AI
          +
AI Infrastructure
          +
AI Security
          +
DevOps
```

The goal is not simply to build another AI chatbot.

The goal is to understand how a modern AI-powered application can be:

- Designed
- Developed
- Integrated with real databases
- Connected to external tools
- Evaluated
- Observed
- Secured
- Containerized
- Tested
- Deployed

---

# Project Status

**Under Development**

DataPilot is being developed incrementally, with each phase focusing on understanding the underlying technology before integrating it into the final platform.

---

# Author

**Devika Janardhanan**

B.Tech Computer Science & Engineering — Data Analytics

**Areas of Interest**

Data Analytics · AI Engineering · Agentic AI · Full-Stack Development · Data Engineering