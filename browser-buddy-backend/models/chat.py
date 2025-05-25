from pydantic import BaseModel

class ChatResponse(BaseModel):
    content: str
    role: str

class ChatRequest(BaseModel):
    api_key: str
    content: str
    question: str
    history: list[ChatResponse] = []  # Optional history of previous messages
    url: str

class ApiKeyRequest(BaseModel):
    api_key: str

class YouTubeSetupRequest(BaseModel):
    api_key: str
    url: str
    language: str 