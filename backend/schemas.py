from pydantic import BaseModel
from typing import List, Optional, Any

# User Schemas
class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

# Project Schemas
class Section(BaseModel):
    id: str
    title: str
    content: str = ""
    refinements: List[Any] = []
    feedback: dict = {}
    status: str = "pending"

class ProjectCreate(BaseModel):
    title: str
    main_topic: str
    doc_type: str
    structure: List[Section]

class ProjectOut(ProjectCreate):
    id: int
    owner_id: int
    class Config:
        orm_mode = True

# AI Request Schemas
class AIRequest(BaseModel):
    topic: str
    section_title: str
    doc_type: str

class RefineRequest(BaseModel):
    content: str
    instruction: str