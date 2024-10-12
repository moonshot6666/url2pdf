import os
import time
import base64
import shutil
import zipfile
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from starlette.staticfiles import StaticFiles  # Add this import

# Ensure the 'static' directory exists to store PDFs and assets
static_dir = "static"
os.makedirs(static_dir, exist_ok=True)

# Initialize FastAPI
app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS configuration to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URL and response model
class URLTest(BaseModel):
    url: HttpUrl
    response: str = ""

# In-memory storage (replace with a database in production)
url_tests: List[URLTest] = []

# Function to wait for all images to load and trigger lazy-loaded content
def wait_for_full_page_load(driver):
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollBy(0, 1000);")
        time.sleep(0.5)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

    image_load_script = '''
    return Array.from(document.images).every(function(img) {
        return img.complete && (typeof img.naturalWidth == 'undefined' || img.naturalWidth > 0);
    });
    '''
    try:
        WebDriverWait(driver, 15).until(lambda d: d.execute_script(image_load_script))
    except TimeoutException:
        print("Some images may not have loaded, but proceeding...")

# Function to convert webpage to PDF
def save_webpage_as_pdf(url: str, output_pdf_path: str):
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--kiosk-printing')

    driver_path = "/usr/local/bin/chromedriver"  # Path to your ChromeDriver
    service = Service(executable_path=driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        driver.get(url)  # Now using the URL as a string
        wait_for_full_page_load(driver)
        pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {})
        pdf_base64 = pdf_data['data']
        pdf_bytes = base64.b64decode(pdf_base64)
        with open(output_pdf_path, 'wb') as pdf_file:
            pdf_file.write(pdf_bytes)
        print(f"PDF saved successfully at {output_pdf_path}")
    except Exception as e:
        print(f"Error processing {url}: {str(e)}")
    finally:
        driver.quit()

# Endpoint to add URL and generate PDF
@app.post("/add_url_and_generate_pdf")
async def add_url_and_generate_pdf(url_test: URLTest):
    # Convert the URL to a string before processing
    url_str = str(url_test.url)

    # Generate a unique filename for the PDF
    pdf_filename = f"{uuid.uuid4()}.pdf"
    pdf_filepath = os.path.join(static_dir, pdf_filename)

    # Call the save_webpage_as_pdf function to convert URL to PDF
    try:
        save_webpage_as_pdf(url_str, pdf_filepath)  # Pass the URL as a string
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

    # Return the path to the PDF file for the frontend to access
    return {"message": "PDF generated successfully", "pdf_url": f"/static/{pdf_filename}"}

# Endpoint to download the zip file
@app.get("/download_zip")
async def download_zip():
    zip_filename = "pdfs.zip"
    zip_filepath = os.path.join(static_dir, zip_filename)

    # Create a zip file
    try:
        with zipfile.ZipFile(zip_filepath, "w") as zipf:
            for root, dirs, files in os.walk(static_dir):
                for file in files:
                    if file.endswith(".pdf"):
                        pdf_path = os.path.join(root, file)
                        zipf.write(pdf_path, arcname=file)
                        
                        # After adding to zip, delete the PDF file
                        os.remove(pdf_path)  # Delete the PDF file
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create zip file: {str(e)}")

    # Return the zip file for download
    return FileResponse(zip_filepath, media_type="application/zip", filename=zip_filename)

# Endpoint to retrieve all stored URLs
@app.get("/get_urls")
async def get_urls():
    return [str(url_test.url) for url_test in url_tests]  # Convert the URLs to strings before returning

# Endpoint to delete a specific URL
@app.delete("/delete_url/{index}")
async def delete_url(index: int):
    if index < 0 or index >= len(url_tests):
        raise HTTPException(status_code=404, detail="URL not found")
    
    del url_tests[index]
    return {"message": "URL deleted successfully"}

# Main function to run FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)