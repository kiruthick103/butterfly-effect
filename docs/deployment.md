# Deployment & Operations Guide
**AI Butterfly Effect Lab**

---

## 1. Quickstart: Local Development

### 1.1 Backend Service
```bash
# 1. Activate Python virtual environment
.\venv\Scripts\activate

# 2. Start FastAPI with Uvicorn
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
```

### 1.2 Frontend Service
```bash
# In frontend/ directory:
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:5173`.

---

## 2. Containerized Deployment (Docker Compose)

The multi-container deployment builds both the frontend static asset server and the FastAPI backend:

```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

Services:
- **`backend`**: FastAPI application running on port 8000.
- **`frontend`**: High-performance Nginx web server serving compiled React SPA on port 80.
- **`db`** *(Optional for PostgreSQL)*: PostgreSQL 16 database.

---

## 3. Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./butterfly_effect.db` | Database connection URI |
| `JWT_SECRET` | *(Random string)* | Cryptographic key for JWT bearer tokens |
| `AI_PROVIDER` | `mock` | `openai` or `mock` |
| `AI_API_KEY` | `""` | OpenAI API key (optional) |
| `AI_MODEL` | `gpt-4o-mini` | LLM model identifier |
| `MAX_SIMULATION_STEPS` | `100000` | Hard cap on Runge-Kutta steps |
| `MAX_SIMULATION_DURATION` | `100.0` | Maximum allowable simulation duration |
