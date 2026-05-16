'use client';
import { useEffect, useRef, useState } from 'react';

export const MEMES = [
  { id: 1,  name: 'Doge',                   flag: '🐕', lat: 35.68,  lon: 139.65,  country: 'Japan',  year: '2013' },
  { id: 2,  name: 'Rickroll',               flag: '🎤', lat: 51.51,  lon: -0.13,   country: 'UK',     year: '2007' },
  { id: 3,  name: 'Distracted Boyfriend',   flag: '👀', lat: 41.39,  lon: 2.17,    country: 'Spain',  year: '2017' },
  { id: 4,  name: 'This Is Fine',           flag: '🔥', lat: 38.91,  lon: -77.04,  country: 'USA',    year: '2013' },
  { id: 5,  name: 'Pepe the Frog',          flag: '🐸', lat: 34.05,  lon: -118.24, country: 'USA',    year: '2005' },
  { id: 6,  name: 'Trollface',              flag: '😏', lat: 37.77,  lon: -122.42, country: 'USA',    year: '2008' },
  { id: 7,  name: 'Nyan Cat',               flag: '🌈', lat: 35.01,  lon: 135.77,  country: 'Japan',  year: '2011' },
  { id: 8,  name: 'Stonks',                 flag: '📈', lat: 40.71,  lon: -74.01,  country: 'USA',    year: '2017' },
  { id: 9,  name: 'Surprised Pikachu',      flag: '⚡', lat: 35.69,  lon: 139.69,  country: 'Japan',  year: '2018' },
  { id: 10, name: 'Woman Yelling at Cat',   flag: '🐱', lat: 34.02,  lon: -118.49, country: 'USA',    year: '2019' },
  { id: 11, name: 'Coffin Dance',           flag: '💃', lat: 5.60,   lon: -0.19,   country: 'Ghana',  year: '2020' },
  { id: 12, name: 'Hide the Pain Harold',   flag: '😬', lat: 47.50,  lon: 19.04,   country: 'Hungary',year: '2011' },
  { id: 13, name: 'Drakeposting',           flag: '🎵', lat: 43.65,  lon: -79.38,  country: 'Canada', year: '2015' },
  { id: 14, name: 'Disaster Girl',          flag: '😈', lat: 35.23,  lon: -80.84,  country: 'USA',    year: '2005' },
  { id: 15, name: 'Wojak',                  flag: '😢', lat: 52.23,  lon: 21.01,   country: 'Poland', year: '2010' },
  { id: 16, name: 'Bernie Sanders Mittens', flag: '🧤', lat: 38.91,  lon: -77.05,  country: 'USA',    year: '2021' },
  { id: 17, name: 'Cheems',                 flag: '🐶', lat: 22.30,  lon: 114.18,  country: 'HK',     year: '2017' },
];

function latLonToVec(lat, lon) {
  const phi   = (90 - lat)   * (Math.PI / 180);
  const theta = (lon + 180)  * (Math.PI / 180);
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y:  Math.cos(phi),
    z:  Math.sin(phi) * Math.sin(theta),
  };
}

// Klein Blue
const KB = { r: 0, g: 47, b: 167 };          // #002FA7

export default function MemeGlobe({ onMarkerClick, highlightId }) {
  const canvasRef      = useRef(null);
  const rotRef         = useRef(0.4);          // Y-axis (longitude)
  const tiltRef        = useRef(0.0);          // X-axis tilt — unlimited, full 360°
  const dragRef        = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const velRef         = useRef(0.002);        // Y-axis velocity
  const dotsRef        = useRef(null);
  const zoomRef        = useRef(1.0);
  const zoomTargetRef  = useRef(1.0);
  const pinchRef       = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  /* ── Load land-mask texture once ── */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width = 512; off.height = 256;
      const c2  = off.getContext('2d');
      c2.drawImage(img, 0, 0, 512, 256);
      const data = c2.getImageData(0, 0, 512, 256);
      const pts  = [];
      const density = 240;

      for (let lat = -90; lat <= 90; lat += 180 / density) {
        const latRad = lat * Math.PI / 180;
        const circ   = Math.cos(latRad);
        const nDots  = Math.max(1, Math.floor(density * 2 * circ));
        for (let j = 0; j < nDots; j++) {
          const lon = (j / nDots) * 360 - 180;
          const u   = 1 - (lon + 180) / 360;
          const v   = (90 - lat) / 180;
          const px  = Math.floor(u * 511);
          const py  = Math.floor(v * 255);
          const idx = (py * 512 + px) * 4;
          const br  = (data.data[idx] + data.data[idx+1] + data.data[idx+2]) / 3;
          if (br < 128) pts.push({ lat, lon, isLand: true });
        }
      }
      dotsRef.current = pts;
    };
    img.src = 'https://unpkg.com/three-globe@2.34.0/example/img/earth-water.png';
  }, []);

  /* ── Track full viewport size ── */
  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Main render loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const BASE_R = Math.min(W, H) * 0.44;
    let animId, time = 0, hoveredId = null;

    function draw() {
      time += 0.016;

      // Smooth zoom
      zoomRef.current += (zoomTargetRef.current - zoomRef.current) * 0.12;
      const R = BASE_R * zoomRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── Globe sphere ──
      const sphereGrad = ctx.createRadialGradient(
        cx - R * 0.22, cy - R * 0.18, R * 0.02,
        cx + R * 0.08, cy + R * 0.08, R
      );
      sphereGrad.addColorStop(0,   '#e8ecf8');
      sphereGrad.addColorStop(0.3, '#d8deF0');
      sphereGrad.addColorStop(0.7, '#c4cae6');
      sphereGrad.addColorStop(1,   '#adb5de');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // ── Land dots — two-axis rotation ──
      const rot   = rotRef.current;           // Y-axis
      const tilt  = tiltRef.current;          // X-axis
      const cosY  = Math.cos(rot),  sinY = Math.sin(rot);
      const cosX  = Math.cos(tilt), sinX = Math.sin(tilt);

      if (dotsRef.current) {
        for (const { lat, lon } of dotsRef.current) {
          const v   = latLonToVec(lat, lon);
          // Step 1: Y-axis rotation (longitude)
          const rx1 = v.x * cosY + v.z * sinY;
          const rz1 = -v.x * sinY + v.z * cosY;
          const ry1 = v.y;
          // Step 2: X-axis tilt (latitude)
          const rx  = rx1;
          const ry  = ry1 * cosX - rz1 * sinX;
          const rz  = ry1 * sinX + rz1 * cosX;

          if (rz < -0.08) continue;                         // back-face cull
          const alpha = Math.max(0, (rz + 0.08) / 1.08);
          const sx    = cx + rx * R;
          const sy    = cy - ry * R;

          // Dot size varies with depth for 3-D feel
          const dotR = 1.35 * (0.65 + 0.35 * alpha);

          // Klein Blue, darkest at front, lighter near limb
          const a = (0.45 + 0.55 * alpha).toFixed(2);
          ctx.beginPath();
          ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${KB.r},${KB.g},${KB.b},${a})`;
          ctx.fill();
        }
      }

      // ── Edge shading (depth rim) ──
      const rim = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R);
      rim.addColorStop(0,   'rgba(0,0,0,0)');
      rim.addColorStop(0.6, 'rgba(30,40,100,0.04)');
      rim.addColorStop(1,   'rgba(0,20,80,0.18)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      // ── Specular highlight (top-left) ──
      const spec = ctx.createRadialGradient(
        cx - R * 0.3, cy - R * 0.26, 0,
        cx - R * 0.18, cy - R * 0.18, R * 0.5
      );
      spec.addColorStop(0,   'rgba(255,255,255,0.38)');
      spec.addColorStop(0.5, 'rgba(255,255,255,0.06)');
      spec.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();


      // ── Meme markers ──
      hoveredId = null;
      const projected = MEMES.map(meme => {
        const v   = latLonToVec(meme.lat, meme.lon);
        // Y-axis then X-axis
        const rx1 = v.x * cosY + v.z * sinY;
        const rz1 = -v.x * sinY + v.z * cosY;
        const rx  = rx1;
        const ry  = v.y * cosX - rz1 * sinX;
        const rz  = v.y * sinX + rz1 * cosX;
        const alpha = Math.max(0, (rz + 0.1) / 1.1);
        return { ...meme, sx: cx + rx * R, sy: cy - ry * R, rz, alpha };
      }).sort((a, b) => a.rz - b.rz);

      // Hover check
      const mPos = canvas._mousePos;
      if (mPos) {
        for (let i = projected.length - 1; i >= 0; i--) {
          const m = projected[i];
          if (m.alpha <= 0) continue;
          const dx = mPos.x - m.sx, dy = mPos.y - m.sy;
          if (Math.sqrt(dx*dx + dy*dy) < 20) { hoveredId = m.id; break; }
        }
      }

      projected.forEach(m => {
        if (m.alpha <= 0.01) return;
        const isHl  = highlightId != null && highlightId === m.id;
        const isHov = hoveredId === m.id;
        const active = isHl || isHov;

        const dotR = active ? 8 : 5.5;

        // Pulse rings
        if (active) {
          for (let p = 0; p < 3; p++) {
            const phase = ((time * 1.6 + p * 0.33) % 1);
            const pr    = dotR + phase * 24;
            const po    = (1 - phase) * 0.35 * m.alpha;
            ctx.beginPath();
            ctx.arc(m.sx, m.sy, pr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,47,167,${po})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Glow halo
        const glowR = dotR * (active ? 4.5 : 3);
        const glow  = ctx.createRadialGradient(m.sx, m.sy, 0, m.sx, m.sy, glowR);
        glow.addColorStop(0,   `rgba(0,47,167,${m.alpha * (active ? 0.25 : 0.12)})`);
        glow.addColorStop(1,   'rgba(0,47,167,0)');
        ctx.beginPath();
        ctx.arc(m.sx, m.sy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot fill
        ctx.beginPath();
        ctx.arc(m.sx, m.sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,47,167,${m.alpha * (active ? 1 : 0.9)})`;
        ctx.fill();

        // White center
        ctx.beginPath();
        ctx.arc(m.sx, m.sy, dotR * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${m.alpha * (active ? 1 : 0.8)})`;
        ctx.fill();

        // Label on hover
        if (isHov && m.alpha > 0.3) {
          const label = `${m.flag} ${m.name}`;
          const fs    = 12;
          ctx.font    = `500 ${fs}px -apple-system, 'Inter', sans-serif`;
          const tw    = ctx.measureText(label).width;
          const px2   = 10, py2 = 5;
          const lx    = m.sx + dotR + 10;
          const ly    = m.sy - (fs / 2 + py2);
          const lw    = tw + px2 * 2;
          const lh    = fs + py2 * 2;

          ctx.beginPath();
          ctx.roundRect(lx, ly, lw, lh, 6);
          ctx.fillStyle   = 'rgba(255,255,255,0.95)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,47,167,0.25)';
          ctx.lineWidth   = 1;
          ctx.stroke();

          ctx.fillStyle = 'rgba(0,47,167,1)';
          ctx.fillText(label, lx + px2, ly + py2 + fs - 1);
        }
      });

      canvas.style.cursor = hoveredId ? 'pointer' : 'grab';

      // Auto-rotate (Y-axis only; tilt holds its position)
      if (!dragRef.current.dragging) {
        velRef.current += (0.0018 - velRef.current) * 0.018;
        rotRef.current += velRef.current;
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    /* ── Events ── */
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      canvas._mousePos = {
        x: (e.clientX - rect.left) * (canvas.width  / rect.width),
        y: (e.clientY - rect.top)  * (canvas.height / rect.height),
      };
      if (dragRef.current.dragging) {
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        velRef.current   = dx * 0.004;
        rotRef.current  += velRef.current;
        // Vertical drag → tilt, clamped to ±75°
        tiltRef.current += dy * 0.004;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
      }
    }
    function onMouseDown(e) { dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }; }
    function onMouseUp()    { dragRef.current.dragging = false; }
    function onMouseLeave() { canvas._mousePos = null; dragRef.current.dragging = false; }

    function onWheel(e) {
      e.preventDefault();
      zoomTargetRef.current = Math.min(2.4, Math.max(0.55, zoomTargetRef.current + (e.deltaY > 0 ? -0.08 : 0.08)));
    }

    function getTouchDist(t) {
      const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx*dx + dy*dy);
    }
    function onTouchStart(e) {
      if (e.touches.length === 2) pinchRef.current = { dist: getTouchDist(e.touches), zoom: zoomTargetRef.current };
      else dragRef.current = { dragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
    }
    function onTouchMove(e) {
      e.preventDefault();
      if (e.touches.length === 2 && pinchRef.current) {
        zoomTargetRef.current = Math.min(2.4, Math.max(0.55, pinchRef.current.zoom * (getTouchDist(e.touches) / pinchRef.current.dist)));
      } else if (e.touches.length === 1 && dragRef.current.dragging) {
        const dx = e.touches[0].clientX - dragRef.current.lastX;
        const dy = e.touches[0].clientY - dragRef.current.lastY;
        velRef.current  = dx * 0.004;
        rotRef.current += velRef.current;
        tiltRef.current += dy * 0.004;
        dragRef.current.lastX = e.touches[0].clientX;
        dragRef.current.lastY = e.touches[0].clientY;
      }
    }
    function onTouchEnd() { pinchRef.current = null; dragRef.current.dragging = false; }

    function onClick(e) {
      if (!onMarkerClick) return;
      const rect  = canvas.getBoundingClientRect();
      const mx    = (e.clientX - rect.left) * (canvas.width  / rect.width);
      const my    = (e.clientY - rect.top)  * (canvas.height / rect.height);
      const cr    = BASE_R * zoomRef.current;
      const cosY2 = Math.cos(rotRef.current),  sinY2 = Math.sin(rotRef.current);
      const cosX2 = Math.cos(tiltRef.current), sinX2 = Math.sin(tiltRef.current);
      for (let i = MEMES.length - 1; i >= 0; i--) {
        const m   = MEMES[i];
        const v   = latLonToVec(m.lat, m.lon);
        const rx1 = v.x * cosY2 + v.z * sinY2;
        const rz1 = -v.x * sinY2 + v.z * cosY2;
        const rx2 = rx1;
        const ry2 = v.y * cosX2 - rz1 * sinX2;
        const rz2 = v.y * sinX2 + rz1 * cosX2;
        if (rz2 < -0.1) continue;
        const sx2 = cx + rx2 * cr, sy2 = cy - ry2 * cr;
        const dx  = mx - sx2, dy = my - sy2;
        if (Math.sqrt(dx*dx + dy*dy) < 20) { onMarkerClick(m); return; }
      }
    }

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('click',      onClick);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('wheel',      onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);
    window.addEventListener('mouseup',    onMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('click',      onClick);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('wheel',      onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
      window.removeEventListener('mouseup',    onMouseUp);
    };
  }, [dims, highlightId, onMarkerClick]);

  return (
    <canvas
      ref={canvasRef}
      width={dims.w}
      height={dims.h}
      style={{ display: 'block', position: 'absolute', inset: 0 }}
    />
  );
}
