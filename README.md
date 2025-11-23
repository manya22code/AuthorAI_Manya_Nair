

# AuthorAI - AI-Assisted Document Authoring Platform

AuthorAI is a full-stack web application that helps users generate, refine, and export structured business documents (Word & PowerPoint) using Google's Gemini AI.

## 🚀 Features
- **Project Management:** Create and manage multiple document projects.
- **AI Scaffolding:** Automatically suggest outlines based on a topic.
- **AI Content Generation:** Generate detailed text for document sections or slides.
- **Iterative Refinement:** Refine content using AI prompts (e.g., "Make it shorter").
- **Document Export:** Download the final result as `.docx` or `.pptx`.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite.
- **Backend:** FastAPI (Python), Uvicorn.
- **Database:** SQLite (SQLAlchemy).
- **AI Engine:** Google Gemini API (Flash 2.0).

## ⚙️ Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.8+
- A Google Gemini API Key

### 1. Backend Setup
Navigate to the backend folder:
bash
cd backend

# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

### Install Dependencies

pip install -r requirements.txt

GOOGLE_API_KEY=your_actual_api_key_here

# Start the server
uvicorn main:app --reload


### 1. Frontend setup

npm install

npm run rev


### Demo video

https://drive.google.com/file/d/1rc-nAJjCYtCBhxKGTeLw6qFG7uTEzLm7/view?usp=drivesdk
