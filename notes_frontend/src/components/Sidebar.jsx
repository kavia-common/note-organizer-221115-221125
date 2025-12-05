import React from 'react';

// PUBLIC_INTERFACE
export default function Sidebar({ query, onQuery, tagFilter, onTagFilter, apiBase }) {
  /** Sidebar for searching and filtering notes */
  return (
    <aside className="card sidebar" role="complementary" aria-label="Sidebar">
      <div className="section-title">Search</div>
      <input
        className="input"
        placeholder="Search title or content..."
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        aria-label="Search notes"
      />
      <div className="section-title">Filter by tag</div>
      <input
        className="input"
        placeholder="Tag contains..."
        value={tagFilter}
        onChange={(e) => onTagFilter(e.target.value)}
        aria-label="Filter notes by tag"
      />
      <div className="helper">API: {apiBase}</div>
    </aside>
  );
}
