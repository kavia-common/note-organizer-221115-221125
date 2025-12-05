import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Resolve backend API base url from environment variables.
 * Uses REACT_APP_API_BASE or REACT_APP_BACKEND_URL, defaults to http://localhost:3001
 */
function getApiBase() {
  const envA = process.env.REACT_APP_API_BASE;
  const envB = process.env.REACT_APP_BACKEND_URL;
  const fallback = 'http://localhost:3001';
  const base = (envA && envA.trim()) || (envB && envB.trim()) || fallback;
  return base.replace(/\/+$/, '');
}

// Simple API client
const api = {
  async list() {
    const res = await fetch(`${getApiBase()}/notes`);
    if (!res.ok) throw new Error(`Failed to load notes (${res.status})`);
    return res.json();
  },
  async create(payload) {
    const res = await fetch(`${getApiBase()}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create note (${res.status})`);
    return res.json();
  },
  async update(id, payload) {
    const res = await fetch(`${getApiBase()}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update note (${res.status})`);
    return res.json();
  },
  async remove(id) {
    const res = await fetch(`${getApiBase()}/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete note (${res.status})`);
    return res.json();
  },
};

// PUBLIC_INTERFACE
function App() {
  /** Theme toggle (light/dark) retained to provide a better UX */
  const [theme, setTheme] = useState('light');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load notes initially
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.list()
      .then((data) => {
        if (cancelled) return;
        setNotes(data || []);
        if ((data || []).length && !activeId) {
          setActiveId(data[0].id);
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  const active = useMemo(
    () => notes.find((n) => n.id === activeId) || null,
    [notes, activeId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const t = tagFilter.trim().toLowerCase();
    return notes.filter((n) => {
      const matchesQ =
        !q ||
        n.title.toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q);
      const matchesT =
        !t ||
        (Array.isArray(n.tags) && n.tags.some((tag) => (tag || '').toLowerCase().includes(t)));
      return matchesQ && matchesT;
    });
  }, [notes, query, tagFilter]);

  // PUBLIC_INTERFACE
  const handleCreate = async () => {
    setBusy(true); setError(''); setInfo('');
    try {
      const created = await api.create({ title: 'Untitled', content: '', tags: [] });
      setNotes((prev) => [created, ...prev]);
      setActiveId(created.id);
      setInfo('New note created');
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleDelete = async (id) => {
    if (!id) return;
    setBusy(true); setError(''); setInfo('');
    try {
      await api.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeId === id) {
        setActiveId((prev) => {
          const rest = notes.filter((n) => n.id !== id);
          return rest.length ? rest[0].id : null;
        });
      }
      setInfo('Note deleted');
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleUpdate = async (patch) => {
    if (!active) return;
    setBusy(true); setError(''); setInfo('');
    try {
      const updated = await api.update(active.id, patch);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setInfo('Changes saved');
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleFieldChange = (field, value) => {
    if (!active) return;
    const draft = { ...active, [field]: value };
    setNotes((prev) => prev.map((n) => (n.id === active.id ? draft : n)));
  };

  const tagsString = (active?.tags || []).join(', ');
  const setTagsFromString = (s) => {
    const list = s.split(',').map((x) => x.trim()).filter(Boolean);
    handleFieldChange('tags', list);
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="topbar">
        <div className="brand">
          <span className="dot" />
          Notes Organizer
        </div>
        <div className="actions">
          <button className="btn ghost" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button className="btn" onClick={handleCreate} disabled={busy}>New Note</button>
        </div>
      </div>

      <div className="content">
        <aside className="card sidebar">
          <div className="section-title">Search</div>
          <input
            className="input"
            placeholder="Search title or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="section-title">Filter by tag</div>
          <input
            className="input"
            placeholder="Tag contains..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
          <div className="helper">API: {getApiBase()}</div>
        </aside>

        <section className="card">
          <div className="list">
            {loading && <div className="helper">Loading notes…</div>}
            {!loading && filtered.length === 0 && (
              <div className="helper">No notes found. Create a new one.</div>
            )}
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`note-item ${activeId === n.id ? 'active' : ''}`}
                onClick={() => setActiveId(n.id)}
                role="button"
                tabIndex={0}
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
                  <button className="btn secondary" onClick={(e) => { e.stopPropagation(); setActiveId(n.id); }}>Edit</button>
                  <button className="btn ghost" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} disabled={busy}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card editor">
          <div className="toolbar">
            <div className="section-title">Editor</div>
            <div className="helper">{busy ? 'Saving…' : info}</div>
          </div>
          {error && <div className="status error">{error}</div>}
          {!active && <div className="helper">Select a note or create a new one.</div>}
          {active && (
            <>
              <label className="section-title" htmlFor="title">Title</label>
              <input
                id="title"
                className="input"
                value={active.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={() => handleUpdate({ title: active.title })}
                placeholder="Note title"
              />
              <label className="section-title" htmlFor="tags">Tags (comma separated)</label>
              <input
                id="tags"
                className="input"
                value={tagsString}
                onChange={(e) => setTagsFromString(e.target.value)}
                onBlur={() => handleUpdate({ tags: active.tags })}
                placeholder="e.g. work, ideas, backlog"
              />
              <label className="section-title" htmlFor="content">Content</label>
              <textarea
                id="content"
                className="textarea"
                value={active.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                onBlur={() => handleUpdate({ content: active.content })}
                placeholder="Write your note here..."
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => handleUpdate({ title: active.title, content: active.content, tags: active.tags })} disabled={busy}>
                  Save
                </button>
                <button className="btn ghost" onClick={() => handleDelete(active.id)} disabled={busy}>
                  Delete
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
