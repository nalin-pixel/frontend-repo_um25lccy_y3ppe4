import { useEffect, useState } from "react";

export default function TopBar({ symbol, setSymbol, timeframe, setTimeframe }) {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [market, setMarket] = useState("all"); // stock | forex | all

  useEffect(() => {
    let active = true;
    async function search() {
      if (!q) { setResults([]); return; }
      try {
        const url = `${backend}/api/symbols?q=${encodeURIComponent(q)}&market=${market}&limit=200`;
        const res = await fetch(url);
        const data = await res.json();
        if (active) setResults(data);
      } catch (e) {
        console.error(e);
        if (active) setResults([]);
      }
    }
    const id = setTimeout(search, 300);
    return () => { active = false; clearTimeout(id); };
  }, [q, backend, market]);

  const timeframes = ["1m","5m","15m","1h","1d"];

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/70 border-b border-blue-500/20">
      <div className="relative flex items-center gap-2">
        <select
          value={market}
          onChange={(e)=>setMarket(e.target.value)}
          className="bg-slate-900/80 text-white px-2 py-2 rounded-md border border-blue-500/20"
          title="Market"
        >
          <option value="all">All</option>
          <option value="stock">Stocks</option>
          <option value="forex">Forex</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search symbol (e.g., AAPL or OANDA:EUR_USD)..."
          className="bg-slate-900/80 text-white px-3 py-2 rounded-md border border-blue-500/20 w-80"
        />
        {results.length > 0 && (
          <div className="absolute top-full left-0 z-10 mt-1 max-h-80 overflow-auto bg-slate-900 border border-blue-500/20 rounded-md w-[36rem] shadow-xl">
            {results.map((r) => (
              <div
                key={`${r.symbol}`}
                onClick={() => { setSymbol(r.symbol); setQ(""); setResults([]); }}
                className="px-3 py-2 text-sm text-blue-100 hover:bg-slate-800 cursor-pointer grid grid-cols-12 gap-2"
              >
                <span className="col-span-3 font-mono">{r.symbol}</span>
                <span className="col-span-7 text-blue-400/80 truncate">{r.description}</span>
                <span className="col-span-2 text-blue-300/70 text-right uppercase">{r.market}</span>
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
