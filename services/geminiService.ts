import { DocumentType } from '../types';

// This points to your running FastAPI server
const API_URL = "http://127.0.0.1:8000";

export const suggestOutline = async (topic: string, docType: DocumentType): Promise<string[]> => {
    try {
        // Convert the enum (0 or 1) or string to a string the backend expects
        const typeStr = docType === DocumentType.WORD ? "word" : "powerpoint";
        
        const response = await fetch(`${API_URL}/ai/outline?topic=${encodeURIComponent(topic)}&doc_type=${typeStr}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.outline; // Matches python: return {"outline": [...]}
    } catch (error) {
        console.error("Failed to fetch outline from backend:", error);
        // Fallback in case backend is offline
        return ["Error connecting to server", "Please check backend console"]; 
    }
};

export const generateContentForSection = async (mainTopic: string, sectionTitle: string, docType: DocumentType): Promise<string> => {
    try {
        const typeStr = docType === DocumentType.WORD ? "word" : "powerpoint";

        const response = await fetch(`${API_URL}/ai/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                topic: mainTopic,
                section_title: sectionTitle,
                doc_type: typeStr
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content; // Matches python: return {"content": "..."}
    } catch (error) {
        console.error("Failed to generate content:", error);
        return "Error: Could not connect to the AI Backend. Make sure 'uvicorn main:app --reload' is running.";
    }
};

export const refineContent = async (originalContent: string, refinementPrompt: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/ai/refine`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: originalContent,
                instruction: refinementPrompt
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content; // Matches python: return {"content": "..."}
    } catch (error) {
        console.error("Failed to refine content:", error);
        return originalContent; // Return original if backend fails
    }
};