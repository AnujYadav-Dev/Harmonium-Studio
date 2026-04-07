"use client";

import { useCallback, useEffect, useRef } from "react";

import type { AudioVisualizerProps } from "@/features/harmonium/types";

const BAR_COUNT = 64;
const BAR_GAP = 2;
const CANVAS_HEIGHT = 80;
const CANVAS_HEIGHT_SM = 120;

/**
 * Real-time frequency spectrum visualizer using the Web Audio AnalyserNode.
 */
export const AudioVisualizer = ({ analyserNode }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserNode;

    if (!canvas || !analyser) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    if (!dataArrayRef.current) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    analyser.getByteFrequencyData(dataArrayRef.current);

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = width / dpr;
    const logicalHeight = height / dpr;

    ctx.clearRect(0, 0, width, height);

    const barWidth = (logicalWidth - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT;
    const dataLength = dataArrayRef.current.length;

    for (let i = 0; i < BAR_COUNT; i++) {
      // Map bar index to frequency bin with slight logarithmic scaling.
      const binIndex = Math.floor(
        (Math.pow(i / BAR_COUNT, 1.4) * dataLength * 0.85) + 1,
      );
      const rawValue = dataArrayRef.current[Math.min(binIndex, dataLength - 1)];
      const normalizedValue = rawValue / 255;
      const barHeight = Math.max(2 * dpr, normalizedValue * logicalHeight * 0.9);

      const x = (i * (barWidth + BAR_GAP)) * dpr;
      const y = (logicalHeight - barHeight / dpr) * dpr;
      const bw = barWidth * dpr;
      const bh = barHeight;

      // Gradient from sage to bronze based on amplitude.
      const hue = 90 + normalizedValue * 30;
      const saturation = 30 + normalizedValue * 25;
      const lightness = 35 + normalizedValue * 30;

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, ${normalizedValue * 0.6})`;
      ctx.shadowBlur = normalizedValue * 12 * dpr;

      // Rounded bar top.
      const radius = Math.min(bw / 2, 4 * dpr);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + bw - radius, y);
      ctx.quadraticCurveTo(x + bw, y, x + bw, y + radius);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [analyserNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) {
      return;
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const targetHeight = isMobile ? CANVAS_HEIGHT : CANVAS_HEIGHT_SM;
      canvas.width = rect.width * dpr;
      canvas.height = targetHeight * dpr;
      canvas.style.height = `${targetHeight}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [analyserNode, draw]);

  return (
    <div className="rounded-2xl border border-paper-200/10 bg-gradient-to-b from-ink-900/80 to-ink-950 p-3 shadow-panel backdrop-blur sm:rounded-[2rem] sm:p-6">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div>
          <p className="font-body text-[0.6rem] uppercase tracking-[0.28em] text-sage-400 sm:text-xs sm:tracking-[0.32em]">
            Live Spectrum
          </p>
          <p className="mt-1 font-body text-[0.68rem] uppercase tracking-[0.2em] text-paper-300">
            {analyserNode
              ? "Frequency spectrum reacts to your playing"
              : "Play a note to activate the visualizer"}
          </p>
        </div>
        <div
          className={[
            "h-2 w-2 rounded-full transition-colors duration-500",
            analyserNode ? "bg-sage-400 shadow-[0_0_8px_rgba(151,175,134,0.6)]" : "bg-ink-500",
          ].join(" ")}
        />
      </div>
      <canvas
        className="w-full rounded-2xl"
        ref={canvasRef}
        style={{ height: `${CANVAS_HEIGHT}px` }}
      />
    </div>
  );
};
