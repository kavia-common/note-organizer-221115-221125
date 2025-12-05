# note-organizer-221115-221125

A simple notes application with a React frontend (port 3000) and a FastAPI backend (port 3001).

## Run

- Backend (from note-organizer-221115-221124/backend):
  ```bash
  pip install -r requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 3001 --reload
  ```
- Frontend (from note-organizer-221115-221125/notes_frontend):
  ```bash
  npm install
  npm start
  ```

Frontend will call backend at:
- REACT_APP_API_BASE or REACT_APP_BACKEND_URL (defaults to http://localhost:3001)

## UI Layout

- Top app bar with theme toggle and "New Note"
- Sidebar with search and tag filter
- Main content with notes list and editor

Ocean Professional styling with blue primary (#2563EB) and amber secondary (#F59E0B).