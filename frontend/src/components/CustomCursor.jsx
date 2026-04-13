import { useEffect, useRef, useCallback } from "react";

/**
 * SparkleTrail Cursor
 * Replaces default cursor with:
 * - A small glowing dot that follows instantly
 * - A trail of fading sparkle particles left behind as you move
 * - Interactive "burst" on click
 */

const COLORS = ["#818cf8", "#38bdf8", "#fb7185", "#34d399", "#fbbf24"];

const SparkleTrail = () => {
  const dotsRef = useRef([]);
  const cursorRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const sparklesRef = useRef([]);
  const frameRef = useRef(null);
  const lastPos = useRef({ x: -100, y: -100 });

  const spawnSparkle = useCallback((x, y) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.5;
    sparklesRef.current.push({
      x,
      y,
      vx: Math.cos(angle) * speed * 0.6,
      vy: Math.sin(angle) * speed * 0.6 - 0.8,
      life: 1,
      decay: Math.random() * 0.025 + 0.02,
      size: Math.random() * 3 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }, []);

  useEffect(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const { clientX: x, clientY: y } = e;
      posRef.current = { x, y };

      // Move main cursor dot
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x - 5}px, ${y - 5}px)`;
      }

      // Spawn sparkles based on distance moved
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        for (let i = 0; i < 2; i++) {
          spawnSparkle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8);
        }
        lastPos.current = { x, y };
      }
    };

    const onClick = (e) => {
      for (let i = 0; i < 12; i++) spawnSparkle(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    // ─── Render loop ───
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current = sparklesRef.current.filter(s => s.life > 0);

      for (const s of sparklesRef.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.03; // gravity
        s.life -= s.decay;

        const alpha = Math.max(0, s.life);

        // Glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;

        // Draw star shape
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.life * 2);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;

        // 4-point star
        const r = s.size;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          ctx.lineTo(Math.cos(angle + Math.PI / 4) * (r * 0.4), Math.sin(angle + Math.PI / 4) * (r * 0.4));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.shadowBlur = 0;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, [spawnSparkle]);

  return (
    <>
      {/* Canvas for sparkle trail */}
      <canvas
        ref={trailCanvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[10px] h-[10px] rounded-full pointer-events-none z-[9999] transition-none"
        style={{
          background: "radial-gradient(circle, #fff 30%, #818cf8 100%)",
          boxShadow: "0 0 8px 2px rgba(129,140,248,0.8), 0 0 20px 4px rgba(129,140,248,0.3)",
          transform: "translate(-100px, -100px)",
        }}
      />
    </>
  );
};

export default SparkleTrail;
