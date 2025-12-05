import React, { useMemo } from 'react';

// PUBLIC_INTERFACE
export default function NoteEditor({
  note,
  busy,
  info,
  error,
  onFieldChange,
  onSave,
  onDelete,
}) {
  /** Editor panel for the active note */
  const tagsString = useMemo(() => (note?.tags || []).join(', '), [note]);
  const setTagsFromString = (s) => {
    const list = s.split(',').map((x) => x.trim()).filter(Boolean);
    onFieldChange('tags', list);
  };

  return (
    <section className="card editor" aria-label="Note editor">
      <div className="toolbar">
        <div className="section-title">Editor</div>
        <div className="helper">{busy ? 'Saving…' : info}</div>
      </div>
      {error && <div className="status error">{error}</div>}
      {!note && <div className="helper">Select a note or create a new one.</div>}
      {note && (
        <>
          <label className="section-title" htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            value={note.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            onBlur={() => onSave({ title: note.title })}
            placeholder="Note title"
          />
          <label className="section-title" htmlFor="tags">Tags (comma separated)</label>
          <input
            id="tags"
            className="input"
            value={tagsString}
            onChange={(e) => setTagsFromString(e.target.value)}
            onBlur={() => onSave({ tags: note.tags })}
            placeholder="e.g. work, ideas, backlog"
          />
          <label className="section-title" htmlFor="content">Content</label>
          <textarea
            id="content"
            className="textarea"
            value={note.content}
            onChange={(e) => onFieldChange('content', e.target.value)}
            onBlur={() => onSave({ content: note.content })}
            placeholder="Write your note here..."
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={() => onSave({ title: note.title, content: note.content, tags: note.tags })}
              disabled={busy}
            >
              Save
            </button>
            <button className="btn ghost" onClick={() => onDelete(note.id)} disabled={busy}>
              Delete
            </button>
          </div>
        </>
      )}
    </section>
  );
}
