from fastapi import APIRouter, HTTPException
from models.chat import ApiKeyRequest, ChatRequest, YouTubeSetupRequest
from controllers.chat_controller import chat_with_content_controller, check_api_key
router = APIRouter()

@router.post("/chat")
async def chat_with_content(req: ChatRequest):
    if not req.api_key or len(req.api_key) < 32:
        raise HTTPException(status_code=400, detail="Invalid API key")
    answer = chat_with_content_controller(req.api_key, req.content, req.question, req.history, req.url)
    return {"answer": answer}

@router.post('/test-api-key')
async def test_api_key(req: ApiKeyRequest):
    if not req.api_key or len(req.api_key) < 32:
        raise HTTPException(status_code=400, detail="Invalid API key")
    # Here you would normally validate the API key with the service
    is_valid = check_api_key(req.api_key)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return {"message": "API key is valid"}

# @router.post('/youtube-setup')
# async def youtube_setup(req: YouTubeSetupRequest):
#     if not req.api_key or len(req.api_key) < 32:
#         raise HTTPException(status_code=400, detail="Invalid API key")
#     if not req.url:
#         raise HTTPException(status_code=400, detail="YouTube URL is required")
#     # Placeholder for YouTube setup logic
#     # This would typically involve setting up the YouTube API client
#     return {"message": "YouTube setup successful"}