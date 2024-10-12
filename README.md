# URL to PDF Project

## Overview
This project allows users to convert URLs to PDFs through a FastAPI backend and a Next.js frontend. The backend handles the generation of PDFs using Selenium, while the frontend provides the user interface.

---

## Requirements

### Backend:
- Python 3.x
- Selenium
- ChromeDriver (ensure it's installed and added to your system's PATH)
- FastAPI
- Uvicorn (for serving FastAPI)
- Docker (optional, for containerization)

### Frontend:
- Node.js (for Next.js frontend)
- npm or yarn (for managing dependencies)

---

## Setup Instructions

### Backend (FastAPI)

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3. Run the FastAPI server:
    ```bash
    ./run_app
    ```

4. Selenium and ChromeDriver Setup:
    - Ensure that you have ChromeDriver installed and accessible in your system’s PATH.

5. Access the API:
    - After running the server, you can access the FastAPI backend at:
    ```
    http://localhost:8000
    ```

---

### Frontend Setup (Next.js)

1. Navigate to the `frontend/url2pdf` directory:
    ```bash
    cd frontend/url2pdf
    ```

2. Install dependencies:
    - Refer to v0 setup for frontend project:
    https://v0.dev/docs

3. Run the development server:
    - Start the Next.js development server:
    ```bash
    npm run build
    npm run start
    ```

4. Access the Frontend:
    - After running the server, the frontend will be available at:
    ```
    http://localhost:3000
    ```

---

## Docker Setup (Optional)

1. To run the project using Docker, navigate to the root of the project directory:
    ```bash
    cd url2pdf_final
    ```

2. Build and run the Docker containers:
    ```bash
    docker-compose up --build
    ```

3. The services will be available at:
    - Backend: `http://localhost:8000`
    - Frontend: `http://localhost:3000`

---

## Notes

- Make sure the ChromeDriver version matches your installed Chrome browser.
- Adjust the paths and permissions as necessary when deploying to a production environment.
- For development purposes, you may need to adjust the CORS settings in the FastAPI app if you're accessing it from a different origin.
