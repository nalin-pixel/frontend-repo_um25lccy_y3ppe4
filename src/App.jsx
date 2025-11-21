import { useState } from "react";
import TopBar from "./components/TopBar";
import Chart from "./components/Chart";
import Watchlist from "./components/Watchlist";

function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1m");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <TopBar symbol={symbol} setSymbol={setSymbol} timeframe={timeframe} setTimeframe={setTimeframe} />
      <div className="grid grid-cols-12 gap-3 p-3">
        <div className="col-span-2 bg-slate-800/40 border border-blue-500/20 rounded-lg h-[80vh]">
          <Watchlist onPick={setSymbol} />
        </div>
        <div className="col-span-10 h-[80vh]">
          <Chart symbol={symbol} timeframe={timeframe} />
        </div>
      </div>
    </div>
  );
}

export default App;
