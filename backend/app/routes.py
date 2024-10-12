
from fastapi import APIRouter, HTTPException
from typing import List
import os
import uuid
from .models import URLTest
from .utils import save_webpage_as_pdf
from .config import static_dir

router = APIRouter()

# In-memory storage for URLs and their associated PDFs
url_tests: List[str] = []

# Add URL and generate PDF
@router.post("/add_url_and_generate_pdf")
async def add_url_and_generate_pdf(url_test: URLTest):
    pdf_filename = f"{uuid.uuid4()}.pdf"
    pdf_filepath = os.path.join(static_dir, pdf_filename)
    
    try:
        save_webpage_as_pdf(str(url_test.url), pdf_filepath)
        url_tests.append(pdf_filepath)  # Store the PDF file path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
    
    return {"message": "PDF generated", "pdf_url": f"/static/{pdf_filename}"}

# Optional endpoint to clear all PDFs
@router.post("/clear_pdfs")
async def clear_pdfs():
    global url_tests
    for pdf_file in url_tests:
        try:
            os.remove(pdf_file)  # Remove each PDF file
        except FileNotFoundError:
            continue
    url_tests.clear()
    return {"message": "All PDFs cleared"}
