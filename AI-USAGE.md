# AI Collaboration & Attribution Log

This document transparently outlines the tools, workflows, prompts, architectural decisions, and human verification processes involved in building **FieldBeat TN**.

---

##  AI Tools Utilized

* **Gemini / LLM Assistant:** Architectural planning, schema design, boilerplate code acceleration, debugging, and test generation.
* **GitHub Copilot / IDE Assistance:** In-line syntax autocompletion, React hooks layout, and Tailwind CSS utility class styling.

---

##  Key Areas Where AI Was Leveraged

### 1. Relational Schema & ORM Modeling
* **AI Contribution:** Drafted the initial SQLAlchemy models (`BDM`, `Outlet`, `VisitLog`) with SQLite column mappings and foreign key relationships.
* **Human Verification & Refinement:** Adjusted the multi-tier audit schema to reflect realistic Indian retail channels (**General Trade**, **Mobile Specialist**, **Apple Premium Reseller**) and enforced thread-safe SQLite settings (`check_same_thread=False`).

### 2. Prioritization & Dormancy Algorithms
* **AI Contribution:** Assisted in generating date-differential logic for computing dormancy intervals based on last billing dates.
* **Human Verification & Refinement:** Established the **45-day Quiet Churn threshold** and added automatic sorting to push inactive counters ahead of billing accounts on the BDM beat sheet.

### 3. Frontend Component Scaffolding
* **AI Contribution:** Generated baseline React component skeletons for the Territory Selector, Metric Cards, Run-Rate SVG Sparklines, and 5-Point Checklists.
* **Human Verification & Refinement:** Integrated instant client-side multi-attribute filtering (Shop Name, Owner Name, Outlet Code), wired state transitions for audit receipt verification tokens (`V-XXXXXX`), and enforced dark-mode UI styling using Tailwind CSS.

### 4. Dockerization & Pytest Suite
* **AI Contribution:** Outlined the two-stage `Dockerfile` (Node.js React build + Python 3.11 FastAPI static host) and basic Pytest integration checks.
* **Human Verification & Refinement:** Verified containerized multi-port mapping (`8000:8000`), confirmed database auto-seeding on container launch, and validated test assertions for beat retrieval and visit logging.

---

##  Prompt Engineering & Interaction Patterns

Sample prompts used during development iterations:
* *"Design a FastAPI endpoint with SQLAlchemy that fetches stores for a specific territory code and places dormant accounts at the top."*
* *"Create a dynamic 5-point checklist in React that switches questions depending on whether a store is General Trade, Mobile Specialist, or APR."*
* *"Write a multi-stage Dockerfile that builds a Vite frontend and serves both API routes and static UI assets via FastAPI."*

---

##  Code Integrity & Attribution Statement

All AI-generated code snippets were reviewed, tested, modified, and validated against the functional requirements of the Tamil Nadu retail territory workflow. Core business logic, domain modeling, and test suites were verified through live execution in local environments and Docker containers.