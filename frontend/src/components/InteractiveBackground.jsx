import { useEffect, useRef } from "react";

/**
 * Cinematic Floating Dust / Ambient Stars Background
 * Gives a premium, subtle, Netflix-like deep background with soft organic floating particles
 * rather than hard lines or overwhelming colors.
 */
const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let animationFrameId;

    // Create dust particles
    const particles = [];
    const numParticles = Math.floor((w * h) / 15000); // Responsive amount of dust

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2, // Drift sideways
        vy: (Math.random() - 1) * 0.3,   // Drift upwards mainly
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        blinkSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");

      // Set base background depending on theme
      ctx.fillStyle = isDark ? "#070709" : "#f9fafb"; // dark mode hex or gray-50
      ctx.fillRect(0, 0, w, h);

      // Add a very subtle, soft radial glow matching the mouse position
      // This gives an incredibly premium interactive feel without being distracting
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 600);
      gradient.addColorStop(0, isDark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.03)"); // Extremely faint indigo
      gradient.addColorStop(1, isDark ? "rgba(7, 7, 9, 0)" : "rgba(249, 250, 251, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Draw and update dust particles
      for (let i = 0; i < numParticles; i++) {
        let p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        
        // Twinkling effect
        p.alpha += p.blinkSpeed;
        if (p.alpha >= 0.8 || p.alpha <= 0.1) {
          p.blinkSpeed = -p.blinkSpeed;
        }

        // Wrap around screen
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${p.alpha})` : `rgba(0, 0, 0, ${p.alpha * 0.5})`;
        
        // Add a tiny bit of blur/glow to particles
        ctx.shadowBlur = p.radius * 3;
        ctx.shadowColor = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.2)";
        
        ctx.fill();
        
        // Reset shadow so it doesn't affect the background fill in the next loop
        ctx.shadowBlur = 0;
      }

      // Add subtle vignetting (dark corners) to focus the center
      const vignette = ctx.createRadialGradient(w/2, h/2, h*0.4, w/2, h/2, h*0.9);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.05)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0,0,w,h);

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      {/* Super subtle screen noise (grain) on top of the canvas for cinematic texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
};

export default InteractiveBackground;
