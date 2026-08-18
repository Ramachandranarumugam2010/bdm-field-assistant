# FieldBeat TN — BDM Field Assistant & Territory Network Audit Engine

FieldBeat TN is a full-stack field intelligence platform designed for Apple Business Development Managers (BDMs) and regional sales leads across Tamil Nadu's retail territories. It converts fragmented retail distribution data into prioritized daily beat flows, dynamic run-rate analytics, tier-adaptive store audits, and automated visit verification receipts.

---

## Key Features

* **Prioritized BDM Beat Engine:** Automatically surfaces retail counters by dormancy risk, pushing Quiet Churn accounts (>45 days without billing) to the top of the route.
* **Tier-Adaptive 5-Point Action Checklists:** Dynamically serves tailored operational audits based on store classification:
  * **General Trade:** Inspect shelf visibility, collect overdue COD/credit clearances, resolve margin/scheme disputes, check fast-moving SKU stockouts, and book replenishment orders.
  * **Mobile Specialist:** Evaluate Apple accessory attach rates, verify consumer financing/EMI schemes, review buyback aging, audit rep commissions, and place replenishment orders.
  * **Apple Premium Reseller (APR):** Apple Experience Table compliance, Hero demo loops, POS visual merchandising, staff certification uniform adherence, and unauthorized stock checks.
* **Agreed Retailer Action & Order Commitment:** Logs proprietor commitments and confirmed re-order quantities directly to the database with cryptographic verification tokens (`V-XXXXXX`).
* **Dynamic Time-Series Run-Rate Charts:** Interactive 6-month historical Apple unit movement graphs rendered per outlet dossier.
* **Real-Time Client-Side Filtering:** Zero-latency search across shop names, proprietor contacts, and outlet codes (`OAXXXX`).
* **Executive Territory Audit Dashboard:** Aggregated visibility into statewide BDM visit adherence, run-rate recovery, and territory dormancy density.
* **Offline Beat Export:** Instant CSV route generation for field navigation.

---

###  Tech Stack & Architecture

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
* **Backend:** FastAPI (Python 3.11), Pydantic v2
* **Database & ORM:** SQLite (`field_ops.db`), SQLAlchemy ORM
* **Containerization:** Docker (Multi-stage build)
* **Testing:** Pytest, HTTPX TestClient

---

###  Project Directory Structure

bdm-field-assistant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # SQLite connection & get_db session dependency
│   │   ├── models.py         # SQLAlchemy models (BDM, Outlet, VisitLog)
│   │   ├── schemas.py        # Pydantic request/response validation schemas
│   │   ├── seed.py           # Automated database seeding routine
│   │   └── main.py           # FastAPI app & REST route controllers
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py       # Integration tests (Beat query, visit submission)
│   ├── field_ops.db          # SQLite database file
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React SPA component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind directives
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Dockerfile
├── README.md
└── AI-USAGE.md

---

###  System Evolution

* **Phase 1: Database Architecture & Seeding Foundation**
  * Modeled relational schemas for retail outlets, BDMs, and visit logs using SQLAlchemy ORM.
  * Implemented `app/seed.py` to populate initial territory counter data directly into SQLite (`field_ops.db`).
* **Phase 2: Core REST API & Prioritization Engine**
  * Built FastAPI endpoints to compute dormancy intervals on the fly.
  * Created the prioritized beat routing API (`GET /api/bdm/beat/{bdm_code}`) sorting quiet accounts ahead of active counters.
* **Phase 3: Interactive UI & Channel-Specific Workflows**
  * Built the React interface with territory selection and live metric cards.
  * Implemented the **Counter Dossier** view with dynamic checklist switching depending on the outlet channel tier.
* **Phase 4: Visit Persistence & Receipt Generation**
  * Created `POST /api/bdm/visit/submit` with transaction rollback safety.
  * Implemented client-side receipt swapping upon audit submission, replacing checklist inputs with a timestamped verification token (`V-XXXXXX`).
* **Phase 5: Dynamic Visuals & Real-Time Filtering**
  * Integrated dynamic 6-month unit volume bar charts for store run-rates.
  * Added zero-latency client-side search across shop codes, names, and owner contacts.
  * Packaged into a single-command Docker deployment with passing pytest coverage.

---

##  Assumptions Made

* **Dormancy Threshold (45 Days):** An outlet is flagged as a **Quiet Churn Account** if no billing activity has occurred in the past 45 calendar days.
* **Channel Tier Differentiation:** Assumed distinct operational goals across retail channels: General Trade focuses on credit clearances and shelf share, whereas Specialists and APRs prioritize customer experience and Apple ecosystem attach rates.
* **Receipt Generation:** Generated verification tokens (`V-XXXXXX`) serve as offline-verifiable audit signatures between the retailer and the field rep.
* **Single BDM Territory Ownership:** Each retail outlet maps exclusively to one primary BDM territory code (e.g., `BDM002` for Madurai).

---

##  What Was Left Out (Omissions)

* **Hardware GPS Geofencing:** Device-level geolocation coordinate locking (to verify physical presence within 50 meters of the counter) was simulated via route listings rather than native mobile GPS APIs.
* **Direct Distributor ERP Webhooks:** Instant purchase orders generate database logs and CSV records rather than posting directly into SAP/Tally distributor endpoints.
* **Live Offline PWA Sync:** Relies on standard HTTP requests rather than a full IndexedDB/Service Worker background sync for zero-connectivity zones.
* **Authentication & RBAC:** Simplified multi-user role switching via dropdown for evaluation purposes rather than an OAuth2/JWT login gateway.

---

##  What to Do Next (Future Roadmap)

* **Mobile PWA & Offline-First Mode:** Integrate Service Workers and IndexedDB so BDMs can conduct audits in basements or low-reception retail markets, syncing automatically when connectivity returns.
* **GPS Route Optimization:** Integrate Google Maps API / Mapbox to calculate the shortest travel path across the day's prioritized quiet stores.
* **Automated WhatsApp / SMS Order Confirmations:** Send instant visit receipts and committed stock dispatch dates directly to the proprietor's phone upon audit completion.
* **Distributor ERP Integrations:** Pipe purchase order commitments directly into regional distributor inventory management systems for instant fulfillment dispatch.



##  Quick-Start Instructions

### Option 1: Docker (Single-Command)

docker build -t bdm-field-assistant . && docker run -d -p 8000:8000 --name bdm-app bdm-field-assistant


### Option 2: Local Development
# Terminal 1: Backend
cd backend
source venv/Scripts/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev