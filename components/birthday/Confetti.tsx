"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

export type ConfettiHandle = {
  /** Burst from a point (viewport px). Defaults to the top-centre. */
  burst: (opts?: { x?: number; y?: number; count?: number; spread?: number; power?: number }) => void;
  /** Gentle confetti falling from the top edge for `ms`. */
  rain: (ms?: number) => void;
};

type Piece = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; w: number; h: number;
  color: string; shape: 0 | 1 | 2; life: number; wobble: number;
};

/** Full-screen canvas confetti — no dependencies, pointer-events: none. */
export default function Confetti({ colors, ref }: { colors: string[]; ref?: Ref<ConfettiHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pieces = useRef<Piece[]>([]);
  const frame = useRef<number | null>(null);
  const rainUntil = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  function make(x: number, y: number, angle: number, speed: number): Piece {
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      life: 1,
      wobble: Math.random() * 10,
    };
  }

  function loop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext("2d")!;
    const W = window.innerWidth;
    const H = window.innerHeight;
    g.clearRect(0, 0, W, H);

    if (performance.now() < rainUntil.current && pieces.current.length < 260) {
      for (let i = 0; i < 3; i++) {
        pieces.current.push(make(Math.random() * W, -20, Math.PI / 2, 1 + Math.random() * 2));
      }
    }

    pieces.current = pieces.current.filter((p) => p.y < H + 40 && p.life > 0);
    for (const p of pieces.current) {
      p.vy += 0.12;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.wobble += 0.1;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.vy > 0) p.life -= 0.002;

      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
      g.fillStyle = p.color;
      if (p.shape === 0) {
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.wobble)) + 1);
      } else if (p.shape === 1) {
        g.beginPath();
        g.arc(0, 0, p.w / 2.4, 0, Math.PI * 2);
        g.fill();
      } else {
        // curly ribbon
        g.strokeStyle = p.color;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(-p.h / 2, 0);
        g.bezierCurveTo(-p.h / 4, -5, p.h / 4, 5, p.h / 2, 0);
        g.stroke();
      }
      g.restore();
    }

    if (pieces.current.length || performance.now() < rainUntil.current) {
      frame.current = requestAnimationFrame(loop);
    } else {
      frame.current = null;
    }
  }

  function kick() {
    if (!frame.current) frame.current = requestAnimationFrame(loop);
  }

  useImperativeHandle(ref, () => ({
    burst({ x, y, count = 140, spread = 70, power = 13 } = {}) {
      const ox = x ?? window.innerWidth / 2;
      const oy = y ?? window.innerHeight * 0.35;
      const n = reduced.current ? Math.round(count / 4) : count;
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + ((Math.random() - 0.5) * spread * Math.PI) / 90;
        pieces.current.push(make(ox, oy, angle, power * (0.45 + Math.random() * 0.75)));
      }
      kick();
    },
    rain(ms = 3500) {
      if (reduced.current) return;
      rainUntil.current = performance.now() + ms;
      kick();
    },
  }));

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 w-full h-full pointer-events-none z-[60]" />;
}
