import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function MemeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);
  const router = useRouter();

  async function handleSearch(value) {
    setQuery(value);
    if (!value.trim()) { setResults([]); setOpen(false); return; }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setOpen(true);
    try {
      // Backend hook: GET /api/memes/search?q=
      const res = await fetch(`/api/memes/search?q=${encodeURIComponent(value)}`, { signal: controller.signal });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(meme) {
    setOpen(false);
    setQuery('');
    router.push(`/explore/${meme.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) {
      if (results.length > 0) {
        handleSelect(results[0]);
      }
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/3 focus-within:border-purple-500/50 focus-within:bg-white/5 transition-colors">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type a meme name"
          className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
        />
        {loading && <Spinner />}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full mt-1 w-full bg-[#1a1528] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
          {results.map((meme) => (
            <li
              key={meme.id}
              onClick={() => handleSelect(meme)}
              className="px-4 py-3 text-sm text-white/70 hover:bg-white/5 cursor-pointer flex items-center gap-3"
            >
              <span>{meme.flag}</span>
              <span>{meme.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 shrink-0">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="w-3 h-3 border border-purple-400/50 border-t-purple-400 rounded-full animate-spin shrink-0" />
  );
}
