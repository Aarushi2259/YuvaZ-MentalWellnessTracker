import os
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="YuvaZ Groq Proxy",
    description="Secure backend proxy for YuvaZ to communicate with Groq API without exposing keys.",
    version="1.0.0"
)

# Secure CORS: In production, change "*" to the specific frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.post("/api/chat")
async def chat_proxy(request: Request):
    """
    Proxies the chat request to Groq API securely attaching the API key.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server misconfiguration: Missing GROQ_API_KEY")
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GROQ_API_URL,
                json=body,
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return JSONResponse(content=response.json(), status_code=response.status_code)
        except httpx.HTTPStatusError as e:
            error_data = e.response.json() if e.response.content else {"error": "Groq API error"}
            return JSONResponse(content=error_data, status_code=e.response.status_code)
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Failed to communicate with Groq API: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8001
    uvicorn.run(app, host="127.0.0.1", port=8001)
