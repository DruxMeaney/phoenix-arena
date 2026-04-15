"use client";

import { useEffect, useRef } from "react";

/**
 * EmberEffect — Full-page cinematic background effect.
 *
 * Features:
 * - Glowing embers rising from the bottom with Brownian motion
 * - Red-hot gradient glow from below (like the page is burning)
 * - Logo 3 (silhouette) in bottom-left with radiating concentric energy waves
 * - Sparks that float, jitter, and fade over their lifetime
 */
export function EmberEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas!.getContext("2d")!;

    let animId: number;
    let particles: Particle[] = [];
    let waves: Wave[] = [];
    let time = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      hue: number; // 0-30 range (red to orange)
      brightness: number;
    }

    interface Wave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    const resize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas!.width;
    const h = () => canvas!.height;

    // Logo position (bottom-left)
    const logoX = () => w() * 0.12;
    const logoY = () => h() - h() * 0.15;

    function spawnParticle() {
      const fromLogo = Math.random() < 0.3;
      const x = fromLogo
        ? logoX() + (Math.random() - 0.5) * 60
        : Math.random() * w();
      const y = fromLogo
        ? logoY() + (Math.random() - 0.5) * 30
        : h() + 10;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.5 + Math.random() * 2),
        size: 1 + Math.random() * 3,
        life: 0,
        maxLife: 120 + Math.random() * 180,
        hue: Math.random() * 30, // red to orange
        brightness: 0.5 + Math.random() * 0.5,
      });
    }

    function spawnWave() {
      waves.push({
        x: logoX(),
        y: logoY(),
        radius: 10,
        maxRadius: 150 + Math.random() * 100,
        opacity: 0.4,
      });
    }

    function draw() {
      time++;
      ctx.clearRect(0, 0, w(), h());

      // ── Bottom glow (burning effect) — covers 70% of viewport ──
      const glowHeight = h() * 0.7;
      const gradient = ctx.createLinearGradient(0, h(), 0, h() - glowHeight);
      gradient.addColorStop(0, "rgba(220, 38, 38, 0.18)");
      gradient.addColorStop(0.15, "rgba(239, 68, 68, 0.12)");
      gradient.addColorStop(0.3, "rgba(249, 115, 22, 0.07)");
      gradient.addColorStop(0.5, "rgba(249, 115, 22, 0.03)");
      gradient.addColorStop(0.7, "rgba(180, 60, 20, 0.01)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h() - glowHeight, w(), glowHeight);

      // Secondary warm glow layer
      const warmGlow = ctx.createLinearGradient(0, h(), 0, h() - h() * 0.35);
      warmGlow.addColorStop(0, "rgba(255, 100, 30, 0.10)");
      warmGlow.addColorStop(0.5, "rgba(200, 50, 20, 0.04)");
      warmGlow.addColorStop(1, "transparent");
      ctx.fillStyle = warmGlow;
      ctx.fillRect(0, h() - h() * 0.35, w(), h() * 0.35);

      // Pulsing glow around logo — larger radius
      const pulse = Math.sin(time * 0.02) * 0.3 + 0.7;
      const logoGlow = ctx.createRadialGradient(
        logoX(), logoY(), 0,
        logoX(), logoY(), 350 * pulse
      );
      logoGlow.addColorStop(0, `rgba(220, 38, 38, ${0.20 * pulse})`);
      logoGlow.addColorStop(0.3, `rgba(239, 68, 68, ${0.10 * pulse})`);
      logoGlow.addColorStop(0.6, `rgba(249, 115, 22, ${0.04 * pulse})`);
      logoGlow.addColorStop(1, "transparent");
      ctx.fillStyle = logoGlow;
      ctx.fillRect(0, h() - 600, 700, 600);

      // ── Concentric energy waves from logo ──
      if (time % 90 === 0) spawnWave();

      waves = waves.filter((w) => w.opacity > 0.01);
      for (const w of waves) {
        w.radius += 1.5;
        w.opacity *= 0.985;

        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 38, 38, ${w.opacity * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Secondary ring
        if (w.radius > 30) {
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(59, 130, 246, ${w.opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // ── Ember particles with Brownian motion ──
      if (time % 3 === 0) spawnParticle();
      if (time % 5 === 0 && particles.length < 100) spawnParticle();

      particles = particles.filter((p) => p.life < p.maxLife);

      for (const p of particles) {
        p.life++;

        // Brownian motion (random jitter)
        p.vx += (Math.random() - 0.5) * 0.15;
        p.vy += (Math.random() - 0.5) * 0.05;

        // Slight upward drift
        p.vy -= 0.01;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.995;

        p.x += p.vx;
        p.y += p.vy;

        const lifeRatio = p.life / p.maxLife;
        const fadeIn = Math.min(p.life / 20, 1);
        const fadeOut = 1 - Math.pow(lifeRatio, 2);
        const alpha = fadeIn * fadeOut * p.brightness;

        if (alpha <= 0) continue;

        // Glow
        const glowSize = p.size * 4;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        glow.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${alpha * 0.6})`);
        glow.addColorStop(0.5, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.2})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: "screen" }}
      />
      {/* Logo 3 silhouette in bottom-left */}
      <div className="fixed bottom-4 left-4 z-0 pointer-events-none opacity-20 sm:opacity-25">
        <img
          src="/logo-silhouette.png"
          alt=""
          className="w-32 sm:w-48 lg:w-56"
          style={{ filter: "brightness(0.6) saturate(1.5)" }}
        />
      </div>
    </>
  );
}
