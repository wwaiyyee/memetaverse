import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Explore() {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/memes/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setResults(d.results || []))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-[#0d0b14] text-white">
      <Navbar />
      <main className="px-8 py-12 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">explore</h1>
        <p className="text-white/40 text-sm mb-8">browse the meme archive</p>

        {loading && <p className="text-white/30 text-sm">searching...</p>}
        {results.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map(m => (
              <li key={m.id} className="px-5 py-4 rounded-xl border border-white/8 bg-white/2 flex items-center gap-3 hover:bg-white/5 cursor-pointer">
                <span className="text-xl">{m.flag}</span>
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-white/35">{m.origin} · {m.year}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && !results.length && (
          <p className="text-white/25 text-sm">
            {q ? `no results for "${q}"` : 'start typing to explore the archive'}
          </p>
        )}
      </main>
    </div>
  );
}
