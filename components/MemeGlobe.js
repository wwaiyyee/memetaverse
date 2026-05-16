import { useEffect, useRef, useState } from 'react';

const MEMES = [
  { name: 'uk sigma edits', flag: '🇬🇧', lat: 15, lon: -40, color: '#60a5fa' },
  { name: 'distracted boyfriend', flag: '🇬🇧', lat: 38, lon: 20, color: '#a78bfa' },
  { name: 'anime react', flag: '🇯🇵', lat: -12, lon: 42, color: '#f472b6' },
  { name: 'ah beng memes', flag: '🇸🇬', lat: -32, lon: 8, color: '#34d399' },
  { name: 'npc meme', flag: '🇺🇸', lat: 50, lon: -20, color: '#60a5fa' },
  { name: 'gigachad', flag: '🇷🇺', lat: -5, lon: -60, color: '#a78bfa' },
];

function latLonToVec(lat, lon) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lon * (Math.PI / 180);
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function MemeGlobe() {
  const canvasRef = useRef(null);
  const rotRef = useRef(0);
  const dragRef = useRef({ dragging: false, lastX: 0 });
  const velRef = useRef(0.003);
  const [size, setSize] = useState(480);

  useEffect(() => {
    function onResize() {
      const vw = window.innerWidth;
      setSize(Math.min(520, Math.max(300, vw * 0.42)));
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.42;
    let animId;

    // Stars — generated once
    const stars = Array.from({ length: 180 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.6) * R * 0.98;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: Math.random() * 1.1 + 0.2,
        op: Math.random() * 0.45 + 0.1,
      };
    });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Outer ambient glow
      const ambient = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.3);
      ambient.addColorStop(0, 'rgba(80,40,160,0.06)');
      ambient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, W, H);

      // Globe fill
      const globeGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.2, R * 0.05, cx, cy, R);
      globeGrad.addColorStop(0, '#2e1f5e');
      globeGrad.addColorStop(0.45, '#170f36');
      globeGrad.addColorStop(1, '#0b0820');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();

      // Stars clipped inside globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,190,255,${s.op})`;
        ctx.fill();
      });
      ctx.restore();

      // Edge glow ring
      const ring = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R);
      ring.addColorStop(0, 'rgba(90,50,180,0)');
      ring.addColorStop(1, 'rgba(90,50,180,0.18)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = ring;
      ctx.fill();

      // Globe border
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100,60,200,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Project and draw meme dots
      const rot = rotRef.current;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      const projected = MEMES.map(meme => {
        const v = latLonToVec(meme.lat, meme.lon);
        const rx = v.x * cosR + v.z * sinR;
        const rz = -v.x * sinR + v.z * cosR;
        const ry = v.y;
        const alpha = Math.max(0, (rz + 0.15) / 1.15);
        return { ...meme, sx: cx + rx * R, sy: cy - ry * R, rz, alpha };
      }).sort((a, b) => a.rz - b.rz); // back to front

      projected.forEach(({ name, flag, color, sx, sy, alpha }) => {
        if (alpha <= 0) return;

        const dotR = 5.5;

        // Dot glow
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, dotR * 4);
        glow.addColorStop(0, hexToRgba(color, alpha * 0.25));
        glow.addColorStop(1, hexToRgba(color, 0));
        ctx.beginPath();
        ctx.arc(sx, sy, dotR * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(color, alpha);
        ctx.fill();

        // Label — only when clearly on front
        if (alpha > 0.45) {
          const label = `${flag} ${name}`;
          const fontSize = 11;
          ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          const tw = ctx.measureText(label).width;
          const padX = 9;
          const padY = 5;
          const lx = sx + dotR + 7;
          const ly = sy - (fontSize / 2 + padY);
          const lw = tw + padX * 2;
          const lh = fontSize + padY * 2;

          // Pill bg
          roundRect(ctx, lx, ly, lw, lh, 5);
          ctx.fillStyle = `rgba(18,12,38,${alpha * 0.88})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(90,60,160,${alpha * 0.45})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();

          ctx.fillStyle = `rgba(225,215,255,${alpha})`;
          ctx.fillText(label, lx + padX, ly + padY + fontSize - 2);
        }
      });

      // Slow auto-rotation, drift toward auto if not dragging
      if (!dragRef.current.dragging) {
        velRef.current += (0.003 - velRef.current) * 0.02;
        rotRef.current += velRef.current;
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    // Drag to spin
    function onMouseDown(e) {
      dragRef.current = { dragging: true, lastX: e.clientX };
    }
    function onMouseMove(e) {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      velRef.current = dx * 0.005;
      rotRef.current += velRef.current;
      dragRef.current.lastX = e.clientX;
    }
    function onMouseUp() {
      dragRef.current.dragging = false;
    }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="cursor-grab active:cursor-grabbing select-none"
      style={{ display: 'block' }}
    />
  );
}
