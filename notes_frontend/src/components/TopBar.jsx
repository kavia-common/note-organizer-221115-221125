import React from 'react';

// PUBLIC_INTERFACE
export default function TopBar({ theme, onToggleTheme, onNew, busy }) {
  /** Top application bar with title, theme toggle and New Note button */
  return (
    <div className="topbar" role="banner" aria-label="Top bar">
      <div className="brand" aria-label="Application title">
        <span className="dot" />
        Notes Organizer
      </div>
      <div className="actions">
        <button
          className="btn ghost"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button className="btn" onClick={onNew} disabled={busy} aria-label="Create new note">
          New Note
        </button>
      </div>
    </div>
  );
}
