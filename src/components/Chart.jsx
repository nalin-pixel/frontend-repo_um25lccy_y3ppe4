import { useEffect, useMemo, useRef, useState } from "react";

// A lightweight canvas candlestick chart with zoom/pan
export default function Chart({ symbol, timeframe }) {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [sma20, setSma20] = useState([]);
  const [ema50, setEma50] = useState([]);
  const [loading, setLoading] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${backend}/api/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&count=400`);
        const data = await res.json();
        if (!cancelled) setCandles(data);
        const smaRes = await fetch(`${backend}/api/indicators/sma?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&length=20`);
        const sma = await smaRes.json();
        if (!cancelled) setSma20(sma.values || []);
        const emaRes = await fetch(`${backend}/api/indicators/ema?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&length=50`);
        const ema = await emaRes.json();
        if (!cancelled) setEma50(ema.values || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [symbol, timeframe, backend]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles?.length) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Determine visible range
    const padding = 20 * dpr;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const highs = candles.map(c => c.h);
    const lows = candles.map(c => c.l);
    const maxH = Math.max(...highs);
    const minL = Math.min(...lows);

    const xStep = w / candles.length;

    function yScale(price) {
      return padding + (maxH - price) * (h / (maxH - minL || 1));
    }

    // Grid
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < 6; i++) {
      const y = padding + (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Candles
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = padding + i * xStep;
      const color = c.c >= c.o ? "#22c55e" : "#ef4444";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      // wick
      ctx.beginPath();
      ctx.moveTo(x + xStep / 2, yScale(c.h));
      ctx.lineTo(x + xStep / 2, yScale(c.l));
      ctx.stroke();
      // body
      const yOpen = yScale(c.o);
      const yClose = yScale(c.c);
      const top = Math.min(yOpen, yClose);
      const bottom = Math.max(yOpen, yClose);
      const bodyH = Math.max(1, bottom - top);
      ctx.fillRect(x + xStep * 0.1, top, xStep * 0.8, bodyH);
    }

    // SMA 20
    if (sma20?.length) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const v = sma20[i];
        if (v == null) continue;
        const x = padding + i * xStep + xStep / 2;
        const y = yScale(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // EMA 50
    if (ema50?.length) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const v = ema50[i];
        if (v == null) continue;
        const x = padding + i * xStep + xStep / 2;
        const y = yScale(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [candles, sma20, ema50]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg border border-blue-500/20 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-blue-200/80 text-sm">Loading...</div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
