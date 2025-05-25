from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

def store_transcript(api_key, video_id, transcript_text):
    # Split transcript into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_text(transcript_text)

    # Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(google_api_key=api_key)

    # Create or load a Chroma collection for this video
    vectordb = Chroma(
        collection_name=video_id,
        embedding_function=embeddings,
        persist_directory="chromadb_data"  # Directory to store DB files
    )

    # Add chunks to the collection
    vectordb.add_texts(chunks)
    vectordb.persist()  # Save to disk

def check_video_in_db(video_id):
    """
    Check if the video ID already exists in the Chroma DB.
    Returns True if it exists, False otherwise.
    """
    vectordb = Chroma(
        collection_name=video_id,
        persist_directory="chromadb_data"
    )
    return vectordb.get_texts() is not None  # If texts are None, the collection does not exist

def get_relavent_chunks(video_id, query, api_key):
    """
    Retrieve relevant chunks for a given query from the Chroma DB.
    """
    embeddings = GoogleGenerativeAIEmbeddings(google_api_key=api_key)
    vectordb = Chroma(
        collection_name=video_id,
        embedding_function=embeddings,
        persist_directory="chromadb_data"
    )
    # Perform similarity search
    results = vectordb.similarity_search(query, k=5)  # Adjust k as needed
    return results