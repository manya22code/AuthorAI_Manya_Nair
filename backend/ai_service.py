import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv() # Load API key from .env

# Ensure you set GOOGLE_API_KEY in your environment or .env file
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# UPDATED TO YOUR AVAILABLE MODEL
MODEL_NAME = 'gemini-2.0-flash'

def generate_section_content(topic: str, section_title: str, doc_type: str):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        format_instruction = "Write a few paragraphs" if doc_type == "word" else "Write 3-4 bullet points"
        
        prompt = (
            f"You are writing a {doc_type} document about '{topic}'. "
            f"Write the content for a section titled '{section_title}'. "
            f"{format_instruction}. Do not include the title in the output."
        )
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"AI Error: {e}")
        return "Error generating content. Please check backend console."

def refine_content(content: str, instruction: str):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"Original text: \n{content}\n\nInstruction: {instruction}\n\nRewrite the text:"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"AI Error: {e}")
        return content

def suggest_outline(topic: str, doc_type: str):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = (
            f"Create a structured outline for a {doc_type} document about '{topic}'. "
            "Return ONLY a comma-separated list of 5 section titles. No numbering."
        )
        response = model.generate_content(prompt)
        # Simple cleaning to get a list
        return [t.strip() for t in response.text.split(',')]
    except Exception as e:
        print(f"AI Error: {e}")
        return ["Introduction", "Key Point 1", "Key Point 2", "Conclusion"]