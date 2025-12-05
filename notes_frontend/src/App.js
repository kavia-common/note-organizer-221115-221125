import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { api, getApiBase } from './api';

// PUBLIC_INTERFACE
function App() {
  /** Top-level application: state management, data fetching, and composition */
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

  // Apply theme attribute (for future theming support)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load notes on mount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        (n.title || '').toLowerCase().includes(q) ||
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
    // optimistic update
    const prevNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      const rest = notes.filter((n) => n.id !== id);
      setActiveId(rest.length ? rest[0].id : null);
    }
    try {
      await api.remove(id);
      setInfo('Note deleted');
    } catch (e) {
      // rollback
      setNotes(prevNotes);
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleUpdate = async (patch) => {
    if (!active) return;
    setBusy(true); setError(''); setInfo('');
    // optimistic update
    const before = notes;
    const draft = { ...active, ...patch };
    setNotes((prev) => prev.map((n) => (n.id === active.id ? draft : n)));
    try {
      const updated = await api.update(active.id, patch);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setInfo('Changes saved');
    } catch (e) {
      // rollback
      setNotes(before);
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

  return (
    <div className="app-shell" data-theme={theme}>
      <TopBar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onNew={handleCreate}
        busy={busy}
      />
      <div className="content">
        <Sidebar
          query={query}
          onQuery={setQuery}
          tagFilter={tagFilter}
          onTagFilter={setTagFilter}
          apiBase={getApiBase()}
        />
        <NotesList
          notes={filtered}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={handleDelete}
          loading={loading}
          busy={busy}
        />
        <NoteEditor
          note={active}
          busy={busy}
          info={info}
          error={error}
          onFieldChange={handleFieldChange}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default App;
