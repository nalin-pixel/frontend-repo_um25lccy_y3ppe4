import { useEffect, useState } from "react";

export default function TopBar({ symbol, setSymbol, timeframe, setTimeframe }) {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    let active = true;
    async function search() {
      if (!q) { setResults([]); return; }
      const res = await fetch(`${backend}/api/symbols?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (active) setResults(data);
    }
    const id = setTimeout(search, 300);
    return () => { active = false; clearTimeout(id); };
  }, [q, backend]);

  const timeframes = ["1m","5m","15m","1h","1d"];

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/70 border-b border-blue-500/20">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search symbol..."
          className="bg-slate-900/80 text-white px-3 py-2 rounded-md border border-blue-500/20 w-64"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-64 overflow-auto bg-slate-900 border border-blue-500/20 rounded-md w-[28rem]">
            {results.map((r) => (
              <div
                key={r.symbol}
                onClick={() => { setSymbol(r.symbol); setQ(""); setResults([]); }}
                className="px-3 py-2 text-sm text-blue-100 hover:bg-slate-800 cursor-pointer flex justify-between"
              >
                <span>{r.symbol}</span>
                <span className="text-blue-400/70">{r.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-blue-100/90 font-semibold">{symbol}</div>

      <div className="flex items-center gap-1 ml-auto">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-1 rounded-md border ${timeframe===tf?"bg-blue-600 text-white border-blue-400":"bg-slate-900/70 text-blue-100 border-blue-500/20"}`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}
