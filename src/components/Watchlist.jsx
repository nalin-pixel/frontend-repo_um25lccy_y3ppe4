import { useEffect, useState } from "react";

export default function Watchlist({ onPick }) {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");

  async function load() {
    const res = await fetch(`${backend}/api/watchlist`);
    const data = await res.json();
    setItems(data);
  }

  async function add(symbol) {
    if (!symbol) return;
    await fetch(`${backend}/api/watchlist`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ symbol }) });
    setInput("");
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="text-blue-100 mb-2 font-semibold">Watchlist</div>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Add symbol" className="flex-1 bg-slate-900/80 text-white px-3 py-2 rounded-md border border-blue-500/20" />
        <button onClick={()=>add(input)} className="px-3 py-2 rounded-md bg-blue-600 text-white">Add</button>
      </div>
      <div className="flex-1 overflow-auto divide-y divide-blue-500/10">
        {items.map((it)=> (
          <div key={it._id} className="py-2 text-blue-100 flex justify-between items-center">
            <button onClick={()=>onPick(it.symbol)} className="hover:underline">{it.symbol}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
