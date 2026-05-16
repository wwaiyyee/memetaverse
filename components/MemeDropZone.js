import { useState, useRef, useCallback, useEffect } from 'react';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Angola','Argentina','Australia','Austria','Bangladesh',
  'Belgium','Bolivia','Bosnia','Brazil','Cambodia','Cameroon','Canada','Chile','China',
  'Colombia','Congo','Croatia','Cuba','Czech Republic','Denmark','Ecuador','Egypt',
  'Ethiopia','Finland','France','Germany','Ghana','Greece','Guatemala','Honduras',
  'Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast',
  'Japan','Jordan','Kazakhstan','Kenya','Malaysia','Mexico','Morocco','Mozambique',
  'Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Nigeria','North Korea',
  'Norway','Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal',
  'Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore','Somalia','South Africa',
  'South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan',
  'Tanzania','Thailand','Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen',
  'Zimbabwe',
];

export default function MemeDropZone() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'image' | 'video'

  // Metadata fields
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); };
  }, []);

  const handleFile = useCallback((incoming) => {
    if (!incoming) return;
    const isImage = incoming.type.startsWith('image/');
    const isVideo = incoming.type.startsWith('video/');
    if (!isImage && !isVideo) { setError('Only images and videos are supported.'); return; }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(incoming);
    previewUrlRef.current = url;

    setFile(incoming);
    setPreview(url);
    setPreviewType(isImage ? 'image' : 'video');
    setError(null);
    setUploadStatus(null);
    setDescription('');
    setCountry('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!file) return;
    if (!description.trim()) { setError('Please enter a description.'); return; }
    if (!country) { setError('Please select a country.'); return; }

    setError(null);
    setLoading(true);

    try {
      const timestamp = new Date().toISOString();
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('description', description.trim());
      formData.append('country', country);
      formData.append('timestamp', timestamp);

      const res = await fetch('/api/pinata/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadStatus({
        cid: data.cid,
        name: data.name,
        size: data.size,
        description: data.description,
        country: data.country,
        timestamp: data.timestamp,
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [file, description, country]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const copy = (text) => navigator.clipboard.writeText(text).catch(() => {});

  const resetAll = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    setFile(null); setPreview(null); setPreviewType(null);
    setDescription(''); setCountry('');
    setUploadStatus(null); setError(null);
  };

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Drop Zone ── */}
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative w-full rounded-xl border-2 border-dashed transition-colors
          flex flex-col items-center justify-center gap-2 min-h-[140px]
          ${file ? 'cursor-default' : 'cursor-pointer'}
          ${dragging
            ? 'border-purple-400 bg-purple-900/10'
            : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="relative w-full flex flex-col items-center gap-2 p-3">
            {/* Change file button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="absolute top-2 right-2 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              change
            </button>
            {previewType === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="max-h-28 rounded-lg object-contain opacity-90" />
            ) : (
              <video src={preview} className="max-h-28 rounded-lg object-contain opacity-90"
                muted playsInline autoPlay loop />
            )}
            <span className="text-xs text-white/30 truncate max-w-full px-4">{file?.name}</span>
          </div>
        ) : (
          <>
            <UploadIcon />
            <span className="text-sm text-white/40">drop image or video here</span>
            <span className="text-xs text-white/25">click to browse</span>
          </>
        )}
      </div>

      {/* ── Metadata Form (shown after file selected) ── */}
      {file && !uploadStatus && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this meme about?"
              rows={2}
              className="
                w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2
                text-sm text-white/80 placeholder-white/20 resize-none
                focus:outline-none focus:border-purple-500/50 focus:bg-white/7
                transition-colors
              "
            />
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 uppercase tracking-wide">Country of Origin</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="
                w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2
                text-sm text-white/80 appearance-none
                focus:outline-none focus:border-purple-500/50 focus:bg-white/7
                transition-colors
              "
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <option value="" disabled style={{ background: '#1a1a2e' }}>Select country…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Timestamp (read-only display) */}
          <div className="flex items-center justify-between text-xs text-white/25 px-0.5">
            <span>Timestamp</span>
            <span className="font-mono">{new Date().toLocaleString()}</span>
          </div>

          {/* Upload Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-lg py-2.5 px-4 text-sm font-medium
              bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/40
              text-white disabled:text-white/30
              transition-colors flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <><SpinnerIcon /> uploading to IPFS…</>
            ) : (
              <><ArrowUpIcon /> Upload to IPFS</>
            )}
          </button>
        </form>
      )}

      {/* ── CID Result Card ── */}
      {uploadStatus && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col gap-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wide">IPFS CID</span>
            <span className="text-xs text-green-400/80">✓ stored on IPFS</span>
          </div>

          {/* CID */}
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-purple-300 break-all font-mono">
              {uploadStatus.cid}
            </code>
            <button onClick={() => copy(uploadStatus.cid)} title="Copy CID"
              className="shrink-0 text-white/30 hover:text-white/70 transition-colors">
              <CopyIcon />
            </button>
          </div>

          {/* Metadata */}
          <div className="border-t border-white/8 pt-2 flex flex-col gap-1.5">
            {uploadStatus.description && (
              <MetaRow label="Description" value={uploadStatus.description} />
            )}
            {uploadStatus.country && (
              <MetaRow label="Country" value={uploadStatus.country} />
            )}
            {uploadStatus.timestamp && (
              <MetaRow label="Uploaded" value={new Date(uploadStatus.timestamp).toLocaleString()} />
            )}
            {uploadStatus.size && (
              <MetaRow label="Size" value={formatBytes(uploadStatus.size)} />
            )}
          </div>

          {/* Upload another */}
          <button
            onClick={resetAll}
            className="text-xs text-white/30 hover:text-white/60 transition-colors text-left mt-1"
          >
            + upload another
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {error && <span className="text-sm text-red-400/70">{error}</span>}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-white/30 w-20 shrink-0">{label}</span>
      <span className="text-white/60 break-words">{value}</span>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" className="text-white/30">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <polyline points="9 5 12 2 15 5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
