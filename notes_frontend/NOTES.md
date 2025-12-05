# Notes Frontend Usage

- The app expects a backend at REACT_APP_API_BASE or REACT_APP_BACKEND_URL, defaulting to http://localhost:3001
- Start with:
  - Backend: uvicorn main:app --host 0.0.0.0 --port 3001 --reload (from note-organizer-221115-221124/backend)
  - Frontend: npm start (from notes_frontend)
- UI:
  - Top bar with theme toggle and "New Note"
  - Sidebar with search and tag filter
  - Main list of notes
  - Editor with title, tags, content and Save/Delete
