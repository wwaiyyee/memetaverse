// GET /api/memes/search?q=<query>
// Returns a list of memes matching the query.
// Replace the stub data below with a real DB/index query (e.g. Postgres full-text, Algolia, etc.)

const STUB_MEMES = [
  { id: 'uk-sigma-edits', name: 'uk sigma edits', flag: '🇬🇧', origin: 'UK', year: 2023 },
  { id: 'distracted-boyfriend', name: 'distracted boyfriend', flag: '🇺🇸', origin: 'US', year: 2017 },
  { id: 'anime-react', name: 'anime react', flag: '🇯🇵', origin: 'JP', year: 2022 },
  { id: 'ah-beng-memes', name: 'ah beng memes', flag: '🇸🇬', origin: 'SG', year: 2020 },
  { id: 'npc-meme', name: 'npc meme', flag: '🇺🇸', origin: 'US', year: 2023 },
  { id: 'gigachad', name: 'gigachad', flag: '🇷🇺', origin: 'RU', year: 2017 },
];

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q = '' } = req.query;
  const query = q.toLowerCase().trim();

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  const results = STUB_MEMES.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.origin.toLowerCase().includes(query)
  );

  res.status(200).json({ results, total: results.length });
}
