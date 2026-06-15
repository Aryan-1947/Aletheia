import os
from dotenv import load_dotenv

load_dotenv()

print("Checking setup...")

# Check keys
groq_key = os.getenv("GROQ_API_KEY")
google_key = os.getenv("GOOGLE_API_KEY")
print(f"✅ Groq key loaded: {bool(groq_key and groq_key != 'your_groq_key_here')}")
print(f"✅ Google key loaded: {bool(google_key and google_key != 'your_google_key_here')}")

# Check imports
try:
    import chromadb
    print("✅ ChromaDB imported")
except: print("❌ ChromaDB failed")

try:
    from rank_bm25 import BM25Okapi
    print("✅ BM25 imported")
except: print("❌ BM25 failed")

try:
    import groq
    print("✅ Groq imported")
except: print("❌ Groq failed")

try:
    import google.generativeai as genai
    print("✅ Google AI imported")
except: print("❌ Google AI failed")

try:
    import fastapi
    print("✅ FastAPI imported")
except: print("❌ FastAPI failed")

try:
    import streamlit
    print("✅ Streamlit imported")
except: print("❌ Streamlit failed")

print("\n🎉 Setup complete! Ready to build.")