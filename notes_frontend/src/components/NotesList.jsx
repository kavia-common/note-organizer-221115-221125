import React from 'react';

// PUBLIC_INTERFACE
export default function NotesList({ notes, activeId, onSelect, onDelete, loading, busy }) {
  /** Displays list of notes with selection and delete actions */
  return (
    <section className="card" aria-label="Notes list">
      <div className="list">
        {loading && <div className="helper">Loading notes…</div>}
        {!loading && (!notes || notes.length === 0) && (
          <div className="helper">No notes found. Create a new one.</div>
        )}
        {(notes || []).map((n) => (
          <div
            key={n.id}
            className={`note-item ${activeId === n.id ? 'active' : ''}`}
            onClick={() => onSelect(n.id)}
            role="button"
            tabIndex={0}
            aria-pressed={activeId === n.id}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(n.id);
            }}
          >
            <div>
              <div className="note-title">{n.title || 'Untitled'}</div>
              <div className="note-tags">
                {(n.tags || []).map((t, i) => (
                  <span className="tag" key={`${n.id}-t-${i}`}>#{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn secondary"
                onClick={(e) => { e.stopPropagation(); onSelect(n.id); }}
                aria-label={`Edit ${n.title || 'note'}`}
              >
                Edit
              </button>
              <button
                className="btn ghost"
                onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                disabled={busy}
                aria-label={`Delete ${n.title || 'note'}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
