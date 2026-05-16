'use client';
import { useEffect, useRef, useState } from 'react';
import { MEMES } from '@/data/memes';

// Equirectangular projection
function project(lat, lon, W, H) {
  const PX = W * 0.04, PY = H * 0.08;
  return {
    x: PX + ((lon + 180) / 360) * (W - PX * 2),
    y: PY + ((90 - lat) / 180) * (H - PY * 2),
  };
}

// Compute normalised heat (0–1) for a land dot based on proximity to ALL memes
function computeHeat(lat, lon) {
  const RADIUS = 28; // degrees of influence
  let heat = 0;
  for (const m of MEMES) {
    const dist = Math.sqrt((lat - m.lat) ** 2 + (lon - m.lon) ** 2);
    if (dist < RADIUS) heat += (1 - dist / RADIUS) ** 1.6;
  }
  return Math.min(heat, 6) / 6; // clamp & normalise
}

// Interpolate between two RGB colours
function lerpRGB(r1,g1,b1, r2,g2,b2, t) {
  return [
    Math.round(r1 + (r2-r1)*t),
    Math.round(g1 + (g2-g1)*t),
    Math.round(b1 + (b2-b1)*t),
  ];
}

export default function MemeFlatMap({ results }) {
  const canvasRef  = useRef(null);
  const offRef     = useRef(null);
  const dotsRef    = useRef(null);   // [{ lat, lon, heat }]
  const hoveredRef = useRef(null);
  const [dims, setDims]   = useState({ w: 800, h: 600 });
  const [popup, setPopup] = useState(null);

  /* ── Load texture, compute heat per dot ── */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width = 720; off.height = 360;
      const c = off.getContext('2d');
      c.drawImage(img, 0, 0, 720, 360);
      const data = c.getImageData(0, 0, 720, 360).data;
      const pts  = [];
      const step = 1.0;
      for (let lat = -70; lat <= 80; lat += step) {
        for (let lon = -180; lon <= 180; lon += step) {
          const u  = 1 - (lon + 180) / 360;
          const v  = (90 - lat) / 180;
          const ix = Math.min(719, Math.floor(u * 720));
          const iy = Math.min(359, Math.floor(v * 360));
          const idx = (iy * 720 + ix) * 4;
          if ((data[idx] + data[idx+1] + data[idx+2]) / 3 < 128)
            pts.push({ lat, lon, heat: computeHeat(lat, lon) });
        }
      }
      dotsRef.current = pts;
      offRef.current  = null; // invalidate cache
    };
    img.src = 'https://unpkg.com/three-globe@2.34.0/example/img/earth-water.png';
  }, []);

  /* ── Responsive ── */
  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Build cached land canvas ── */
  function buildLandCanvas(W, H) {
    if (!dotsRef.current) return null;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(0,47,167,0.05)';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 80; lat += 30) {
      const { y } = project(lat, 0, W, H);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let lon = -150; lon <= 180; lon += 30) {
      const { x } = project(0, lon, W, H);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // Klein Blue heatmap dots
    // Low heat  → light periwinkle  rgb(179, 200, 240) ≈ #B3C8F0
    // High heat → deep Klein Blue   rgb(0,   47,  167) = #002FA7
    for (const { lat, lon, heat } of dotsRef.current) {
      const { x, y } = project(lat, lon, W, H);
      const [r, g, b] = lerpRGB(200, 215, 245,  0, 47, 167,  heat);
      const size = 2.0 + heat * 2.2;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    return cv;
  }

  /* ── Render loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let animId, time = 0;

    function draw() {
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      if (!offRef.current && dotsRef.current) offRef.current = buildLandCanvas(W, H);
      if (offRef.current) ctx.drawImage(offRef.current, 0, 0);

      // Pins
      for (const meme of results) {
        const { x, y } = project(meme.lat, meme.lon, W, H);
        const isHov = hoveredRef.current === meme.id;
        const r = isHov ? 9 : 6;

        // Pulse rings
        if (isHov) {
          for (let p = 0; p < 3; p++) {
            const phase = ((time * 1.6 + p / 3) % 1);
            ctx.beginPath();
            ctx.arc(x, y, r + phase * 22, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,47,167,${(1-phase)*0.22})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Stem
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x, y + r + 6);
        ctx.strokeStyle = '#002FA7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head shadow
        ctx.beginPath();
        ctx.arc(x, y, r + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,47,167,0.15)';
        ctx.fill();

        // Head fill
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? '#002FA7' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#002FA7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? '#ffffff' : '#002FA7';
        ctx.fill();

        // Emoji
        ctx.font = `${isHov ? 18 : 14}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(meme.flag, x, y - r - 3);
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    function getHit(cx, cy) {
      const rect = canvas.getBoundingClientRect();
      const mx = cx - rect.left, my = cy - rect.top;
      for (let i = results.length - 1; i >= 0; i--) {
        const m = results[i];
        const { x, y } = project(m.lat, m.lon, W, H);
        if (Math.sqrt((mx-x)**2 + (my-y)**2) < 20) return { meme: m, sx: cx, sy: cy };
      }
      return null;
    }

    function onMouseMove(e) {
      const hit = getHit(e.clientX, e.clientY);
      hoveredRef.current = hit ? hit.meme.id : null;
      canvas.style.cursor = hit ? 'pointer' : 'default';
    }
    function onClick(e) {
      const hit = getHit(e.clientX, e.clientY);
      setPopup(hit || null);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [dims, results]);

  useEffect(() => { offRef.current = null; }, [dims]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} width={dims.w} height={dims.h} style={{ display: 'block' }} />

      {/* Heatmap legend */}
      <div style={{
        position: 'absolute', bottom: 28, right: 48,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Inter', sans-serif", fontSize: 10,
        color: 'rgba(26,26,46,0.4)',
      }}>
        <span>fewer</span>
        <div style={{
          width: 80, height: 8, borderRadius: 4,
          background: 'linear-gradient(to right, #B3C8F0, #002FA7)',
          border: '1px solid rgba(0,47,167,0.15)',
        }} />
        <span>more memes</span>
      </div>

      {popup && (
        <PinPopup meme={popup.meme} sx={popup.sx} sy={popup.sy} onClose={() => setPopup(null)} />
      )}
    </div>
  );
}

function PinPopup({ meme, sx, sy, onClose }) {
  const W = typeof window !== 'undefined' ? window.innerWidth  : 1200;
  const cardW = 240;
  let left = sx - cardW / 2;
  let top  = sy - 190;
  let arrowBottom = true;
  if (top < 70)  { top = sy + 28; arrowBottom = false; }
  if (left < 10) left = 10;
  if (left + cardW > W - 10) left = W - cardW - 10;
  const arrowLeft = Math.max(12, Math.min(sx - left - 9, cardW - 30));

  return (
    <div style={{
      position: 'fixed', left, top, width: cardW,
      background: '#ffffff',
      borderRadius: 14,
      padding: '18px 18px 14px',
      boxShadow: '0 8px 40px rgba(0,47,167,0.14), 0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,47,167,0.14)',
      zIndex: 300,
      fontFamily: "'Inter', sans-serif",
      animation: 'popIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* Accent bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'#002FA7', borderRadius:'14px 14px 0 0' }} />

      <button onClick={onClose} style={{
        position:'absolute', top:12, right:12,
        background:'none', border:'none', cursor:'pointer',
        color:'rgba(26,26,46,0.35)', padding:3, display:'flex',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>

      <div style={{ fontSize:30, marginBottom:10, lineHeight:1 }}>{meme.flag}</div>
      <div style={{ fontWeight:700, fontSize:15, color:'#0a0a1a', marginBottom:3, paddingRight:18 }}>{meme.name}</div>
      <div style={{ fontSize:11, color:'#002FA7', fontWeight:600, marginBottom:9, letterSpacing:'0.04em' }}>
        {meme.country} · {meme.year}
      </div>
      <div style={{ fontSize:11, color:'rgba(26,26,46,0.5)', lineHeight:1.65 }}>{meme.desc}</div>

      {arrowBottom && (
        <div style={{
          position:'absolute', bottom:-9, left:arrowLeft, width:0, height:0,
          borderLeft:'9px solid transparent', borderRight:'9px solid transparent',
          borderTop:'9px solid white',
          filter:'drop-shadow(0 2px 2px rgba(0,0,0,0.06))',
        }} />
      )}
      {!arrowBottom && (
        <div style={{
          position:'absolute', top:-9, left:arrowLeft, width:0, height:0,
          borderLeft:'9px solid transparent', borderRight:'9px solid transparent',
          borderBottom:'9px solid white',
        }} />
      )}
    </div>
  );
}
