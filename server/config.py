import os

ALLOWED_ORIGINS = [os.getenv("FRONTEND_URL")] + [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

TEMPORAL_SERVER = os.getenv("TEMPORAL_SERVER", "localhost:7233")

SLACK_CLIENT_ID = os.getenv("SLACK_CLIENT_ID")
