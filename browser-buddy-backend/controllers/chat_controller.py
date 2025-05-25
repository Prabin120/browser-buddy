from utils.langchain_setup import GeminiAssistant
from models.chat import ChatResponse
from utils.youtube import extract_video_id
from youtube_transcript_api import YouTubeTranscriptApi
from db.chroma_db import store_transcript, check_video_in_db, get_relavent_chunks

def check_api_key(api_key: str) -> bool:
    """
    Check if the provided API key is valid.
    This is a placeholder function; actual implementation may vary.
    """
    gemini = GeminiAssistant(api_key=api_key)
    return gemini.check_api_key()

def chat_with_content_controller(api_key: str, content: str, question: str, history: list[ChatResponse], url: str) -> str:
    """
    Controller function to handle chat requests with content.
    It initializes the GeminiAssistant with the provided API key and uses it to get an answer.
    """
    gemini = GeminiAssistant(api_key=api_key)
    history_str = [f"{msg.role}: {msg.content}" for msg in history]
    history_str = "\n".join(history_str) if history_str else ""
    return gemini.webpage_chat(page_content=content, question=question, history=history_str, url=url)

def youtube_setup_controller(api_key: str, url: str, language: str) -> str:
    """
    Controller function to handle YouTube setup requests.
    This is a placeholder function; actual implementation may vary.
    """
    # Here you would typically set up the YouTube API client
    # For now, we just return a success message
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL provided.")
    is_video_exists = check_video_in_db(video_id)
    if not is_video_exists: 
        try:
            # Fetch transcript (try selected language, fallback to English)
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            try:
                transcript = transcript_list.find_transcript([language])
            except Exception:
                transcript = transcript_list.find_transcript(['en'])
            transcript_text = " ".join([entry['text'] for entry in transcript.fetch()])
            store_transcript(api_key, video_id, transcript_text)
        except Exception as e:
            return f"Could not fetch transcript: {e}"
    return f"YouTube setup successful with API key: {api_key}, URL: {url}, Language: {language}"

def get_relevant_chunks_controller(video_id: str, query: str, history: str, api_key: str) -> list:
    """
    Controller function to retrieve relevant chunks for a given query from the Chroma DB.
    """
    if not check_video_in_db(video_id):
        raise ValueError("Video ID does not exist in the database.")
    relavant_chunks = get_relavent_chunks(video_id, query, api_key)
    if not relavant_chunks:
        raise ValueError("No relevant chunks found for the given query.")
    gemini = GeminiAssistant(api_key=api_key)
    res = gemini.webpage_chat(
        page_content=" ".join([chunk.page_content for chunk in relavant_chunks]),
        question=query,
        history=history
    )
    return res