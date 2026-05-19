"use client";

import { useWeb3 } from "@/context/Web3Context";
import { Wallet, ShieldCheck, HelpCircle } from "lucide-react";

export default function Header() {
  const { account, user, connectWallet } = useWeb3();

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="h-20 bg-slate-950/40 backdrop-blur-md border-b border-slate-900 px-8 flex justify-between items-center fixed top-0 right-0 left-20 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Polygon Amoy Connected
        </div>
      </div>

      <div className="flex items-center gap-6">
        <a
          href="/docs"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          Docs
        </a>

        {account ? (
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 p-2 pl-4 pr-3 rounded-full shadow-lg shadow-black/30">
            <span className="text-xs font-mono font-bold text-slate-300">
              {truncateAddress(account)}
            </span>
            <div className="flex items-center justify-center bg-cyan-500/15 border border-cyan-400/20 p-2 rounded-full shadow-inner">
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-300"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
