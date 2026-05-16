import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

export default function MemeDropZone() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      // Backend hook: POST /api/memes/identify
      const res = await fetch('/api/memes/identify', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.id) router.push(`/meme/${data.id}`);
    } catch (err) {
      console.error('Identify error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        relative w-full rounded-xl border-2 border-dashed cursor-pointer
        flex flex-col items-center justify-center gap-2 min-h-[120px] transition-colors
        ${dragging
          ? 'border-purple-400 bg-purple-900/10'
          : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" className="max-h-24 rounded-lg object-contain opacity-80" />
      ) : (
        <>
          <UploadIcon />
          <span className="text-sm text-white/40">
            {loading ? 'identifying...' : 'drop image or sticker here'}
          </span>
        </>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <polyline points="9 5 12 2 15 5" />
    </svg>
  );
}
