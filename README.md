# 🧠 AI Workflow Builder

A full-stack intelligent **no-code/low-code workflow builder**. Create, simulate, and run AI-powered workflows visually via a drag-and-drop interface. Powered by **React + React Flow** on the frontend and **FastAPI + PostgreSQL** on the backend.

---

## 📌 Features

- 🧩 Drag-and-drop workflow creation
- 💾 Save workflows to database
- 📥 Load & edit saved workflows
- ▶️ Simulate workflow execution
- 📄 Download as JSON
- 🔁 Fast integration via REST APIs

---

## 🧑‍💻 Tech Stack

| Layer      | Tech Used                      |
|------------|--------------------------------|
| Frontend   | React + Vite + React Flow      |
| Backend    | FastAPI + SQLAlchemy + Pydantic |
| Database   | PostgreSQL                     |
| Communication | REST API + Axios           |

---

## 📁 Project Structure

```

ai-workflow-builder/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers
│   │   ├── db/               # Database config + models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper utils
│   │   └── main.py           # FastAPI app entry point
│   └── create\_tables.py      # DB initialization
├── frontend/
│   ├── components/           # React components
│   ├── api/                  # Axios API wrapper
│   ├── utils/                # Data transforms
│   └── main.jsx              # React entry point
├── README.md                 # ← you're here
└── requirements.txt          # Python deps (backend)

````

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v18+)
- Python (3.11+)
- PostgreSQL (local or remote)
- `pip` and `npm`

---

### 🔧 1. Backend Setup (FastAPI)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up PostgreSQL database
# Update DATABASE_URL in app/db/database.py or use .env

# Initialize tables
python create_tables.py

# Run FastAPI server
uvicorn app.main:app --reload
````

📍 Server will run at: `http://127.0.0.1:8000`
📄 Swagger UI: `http://127.0.0.1:8000/docs`

---

### 💻 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: [http://localhost:5173](http://localhost:5173)

> 🔗 Make sure the backend server is running to test API integration.

---

## 🔌 API Overview

| Endpoint                      | Method | Purpose                 |
| ----------------------------- | ------ | ----------------------- |
| `/api/create_workflow`        | POST   | Save a workflow         |
| `/api/workflows`              | GET    | List all workflows      |
| `/api/workflows/{id}`         | GET    | Fetch specific workflow |
| `/api/execute_workflows/{id}` | POST   | Simulate workflow logic |

---

## 🧠 Node Format (Backend)

Each node looks like:

```json
{
  "id": "node_1",
  "type": "Initial",
  "config": {},
  "next": ["node_2", "node_3"]
}
```

---

## 🧩 Supported Node Types

* `Initial`
* `Action`
* `Decision`
* `Merge`
* `Final`

Can be extended via UI and backend logic.

---

## 🐛 Common Issues & Fixes

| Problem                      | Solution                                    |
| ---------------------------- | ------------------------------------------- |
| CORS error in frontend       | Ensure CORS middleware in FastAPI is setup  |
| `workflow_id` is `undefined` | Use `workflow_id` from backend, not `id`    |
| `forEach` error on `next`    | Ensure all nodes include `next: []` on save |
| UUID not found on execute    | Save response must return `workflow_id`     |

---

## 🎯 Future Enhancements

* 🧠 LLM integration (GPT/Gemini agents)
* 🧰 Node-level config editors
* 🧪 Unit tests & Cypress E2E
* 🌐 Deploy to Render + Vercel
* 🗃️ Reorder / group workflows

---

## 📄 License

MIT License — free to use and modify for educational or MVP/demo use.

---

## 🙌 Acknowledgements

* [React Flow](https://reactflow.dev/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [PostgreSQL](https://www.postgresql.org/)

```
