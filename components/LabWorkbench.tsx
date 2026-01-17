"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/lib/simulationStore";

interface LabWorkbenchProps {
  // Add any props if needed
}

export function LabWorkbench({}: LabWorkbenchProps) {
  const { isRunning, showGrid, voltage, frequency, mass, particleCount } = useSimulationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match its display size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw simulation elements based on state
    if (isRunning) {
      // Draw particles with properties based on simulation parameters
      const particleCountValue = Math.min(particleCount, 100); // Cap at 100 for performance

      for (let i = 0; i < particleCountValue; i++) {
        // Calculate position based on parameters
        const x = (Math.random() * canvas.width) * (voltage / 10);
        const y = (Math.random() * canvas.height) * (frequency / 500);
        const radius = 2 + (mass * 2);

        // Set color based on voltage
        const hue = 240 + (voltage * 5); // Blue to indigo range
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Draw placeholder content when not simulating
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Simulation Canvas', canvas.width / 2, canvas.height / 2);
      ctx.font = '12px sans-serif';
      ctx.fillText('Click "Run" to start simulation', canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [isRunning, showGrid, voltage, frequency, mass, particleCount]);

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Simulation Canvas</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-56px)]">
        <div className="w-full h-full bg-white border border-slate-200 rounded-lg overflow-hidden relative">
          <motion.canvas
            ref={canvasRef}
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Overlay controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-2 shadow-sm hover:bg-white"
            >
              <span className="sr-only">Zoom In</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-2 shadow-sm hover:bg-white"
            >
              <span className="sr-only">Zoom Out</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </motion.button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}