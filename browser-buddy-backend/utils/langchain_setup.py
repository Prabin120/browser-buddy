from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

StrParser = StrOutputParser()

class GeminiAssistant:
    """
    Class to interact with the Gemini model for question answering.
    """
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash"):
        self.api_key = api_key
        self.model = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)

    def check_api_key(self) -> bool:
        """
        Check if the provided API key is valid.
        This is a placeholder function; actual implementation may vary.
        """
        # Here you would typically make a request to the API to validate the key
        try:
            res = self.model.invoke("Hi there!")
            if not res:
                print("API key validation failed: No response received.")
                return False
        except Exception as e:
            print(f"Error validating API key: {e}")
            return False
        return True
    
    def webpage_chat(self, page_content: str, question: str, history: str, url: str) -> str:
        """
        Method to chat with a page content using.
        """
        full_chat_history = f"{page_content}\n\n" + "\n".join(history) if history else page_content
        prompt = PromptTemplate(
            template=(
                "You are a helpful assistant. Use the provided content and chat history to answer the user's question.\n\n"
                "Content:\n{content}\n\n"
                "Chat history:\n{full_chat_history}\n"
                "Current Page URL: {url}\n\n"
                "User: {question}\n"
                "Assistant:"
            ),            
            input_variables=['content', 'full_chat_history', 'url', 'question']
        )
        chain = prompt | self.model | StrParser
        response = chain.invoke({'content': page_content, 'full_chat_history': full_chat_history, 'url': url, 'question': question})
        return response

