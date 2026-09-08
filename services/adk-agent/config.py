import os
from dotenv import load_dotenv

# Load .env file from core backend if available, else load locally
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', 'fintop-backend', '.env'))
load_dotenv()

PORT = int(os.environ.get("AGENT_PORT", "8000"))
HOST = os.environ.get("AGENT_HOST", "127.0.0.1")
AGENT_IPC_SECRET = os.environ.get("AGENT_IPC_SECRET", "fintop_agent_secure_secret_token_2026")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:123@localhost:5432/fintop")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:3000")
SQLITE_DB_PATH = os.environ.get("AGENT_SQLITE_PATH", os.path.join(os.path.dirname(__file__), "data", "agent_state.db"))
