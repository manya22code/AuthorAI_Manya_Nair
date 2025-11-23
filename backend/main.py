from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
import doc_service
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database, ai_service
from database import engine

# Create Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow Frontend to talk to Backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Routes (Simplified for brevity) ---
# In a real app, use JWT tokens here. 
# For this assignment step, we will just store users plain text 
# (add hashing using passlib for full marks).

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user exists first to avoid errors
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        return existing_user
        
    db_user = models.User(username=user.username, hashed_password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Simple check
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id}

# --- Project Routes ---

@app.get("/projects/{user_id}", response_model=List[schemas.ProjectOut])
def get_projects(user_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Project).filter(models.Project.owner_id == user_id).all()

@app.post("/projects/{user_id}", response_model=schemas.ProjectOut)
def create_project(user_id: int, project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    db_project = models.Project(**project.dict(), owner_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/projects/{project_id}")
def update_project(project_id: int, project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields
    db_project.title = project.title
    db_project.main_topic = project.main_topic
    db_project.doc_type = project.doc_type
    
    # FIX: Convert the list of Section objects to a list of simple Dictionaries
    db_project.structure = jsonable_encoder(project.structure)
    
    db.commit()
    return {"message": "Updated"}

# --- AI Routes ---

@app.post("/ai/generate")
def generate_content(request: schemas.AIRequest):
    return {"content": ai_service.generate_section_content(request.topic, request.section_title, request.doc_type)}

@app.post("/ai/refine")
def refine_content(request: schemas.RefineRequest):
    return {"content": ai_service.refine_content(request.content, request.instruction)}

@app.get("/ai/outline")
def get_outline(topic: str, doc_type: str):
    return {"outline": ai_service.suggest_outline(topic, doc_type)}


@app.post("/export/{project_id}")
def export_project(project_id: int, db: Session = Depends(database.get_db)):
    # 1. Fetch project from DB
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # 2. Generate File based on type
    if project.doc_type == "word" or project.doc_type == "docx":
        file_stream = doc_service.create_word_doc(project.title, project.structure)
        filename = f"{project.title}.docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        file_stream = doc_service.create_ppt_doc(project.title, project.structure)
        filename = f"{project.title}.pptx"
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    # 3. Return as a downloadable file
    return StreamingResponse(
        file_stream, 
        media_type=media_type, 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )