# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import document_router
from app.routers import workflow_execution_router
from app.routers.workflow_router import router as workflow_router
from app.routers import debug

import os
print(">>> Using DB:", os.getenv("DATABASE_URL"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # ✅ Your local dev frontend
        "https://workflow-builder.vercel.app",  # ✅ Optional: your deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document_router.router, prefix="/api")
app.include_router(workflow_execution_router.router, prefix="/api")
app.include_router(workflow_router, prefix="/api")
app.include_router(debug.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}