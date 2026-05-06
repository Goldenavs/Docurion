import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth cursor tracking for the glow aura
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 300, mass: 0.05 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 300, mass: 0.05 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000, radius: 150 };
    const spacing = 40; // Distance between grid points

    const handleMouseMove = (e: MouseEvent) => {
      // Offset for the Framer Motion radial gradient (800x800)
      mouseX.set(e.clientX - 400);
      mouseY.set(e.clientY - 400);
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // The Grid Point Class
    class GridPoint {
      x: number;
      y: number;
      baseSize: number;
      angle: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseSize = 2;
        this.angle = 0;
      }

      draw() {
        if (!ctx) return;
        
        // Calculate distance from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let size = this.baseSize;
        let opacity = 0.15; // Base opacity (subtle)
        let color = '100, 116, 139'; // Slate 500 (light mode friendly, adapts well)
        
        // Check if dark mode is active to swap base grid color
        const isDark = document.documentElement.classList.contains('dark');
        if (!isDark) color = '203, 213, 225'; // Slate 300 for light mode

        // Reactive effect when mouse is near
        if (distance < mouse.radius) {
          const intensity = 1 - distance / mouse.radius;
          size = this.baseSize + (intensity * 4); // Scale up
          opacity = 0.15 + (intensity * 0.85); // Light up
          this.angle += intensity * 0.1; // Rotate
          color = '249, 115, 22'; // Brand Orange
        } else {
          // Slowly reset rotation
          this.angle *= 0.95;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw a + symbol
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = 1.5;
        
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        
        ctx.stroke();
        ctx.restore();
      }
    }

    let grid: GridPoint[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      grid = [];
      
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          grid.push(new GridPoint(x, y));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      grid.forEach(point => point.draw());
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-500 bg-[var(--bg-base)]">
      {/* Interactive Grid */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Noise Texture for that premium grainy look */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
      />
      
      {/* GPU Accelerated Spotlight Aura */}
      <motion.div
        style={{ 
          x: smoothX, 
          y: smoothY,
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 40%, rgba(0,0,0,0) 70%)'
        }}
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full will-change-transform"
      />
    </div>
  );
}