# app/main.py
from fastapi import FastAPI
from app.services import workflow
from fastapi.middleware.cors import CORSMiddleware
from app.routers import document_router
from app.routers import workflow_execution_router
from app.routers.workflow_router import router as workflow_router

app = FastAPI()

# Optional CORS if using frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # specify frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document_router.router, prefix="/api")
app.include_router(workflow_execution_router.router, prefix="/api")
app.include_router(workflow_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Backend is running"}