
import os

# Directory for storing static files (PDFs)
static_dir = os.path.join(os.getcwd(), "static")

# List of allowed origins for CORS
ALLOWED_ORIGINS = ["http://localhost:3000"]  # Adjust this for production
