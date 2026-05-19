"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import axios from "axios";
import { History, Search, Filter } from "lucide-react";

export default function LogsPage() {
  const { token, backendUrl } = useWeb3();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchLogs() {
    try {
      const res = await axios.get(`${backendUrl}/verify/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredLogs = logs.filter((log) => {
    const details = (log.details || "").toLowerCase();
    const action = (log.action || "").toLowerCase();
    const matchesSearch = details.includes(search.toLowerCase()) || 
                          action.includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "uploads") return matchesSearch && log.action === "document_upload";
    if (filter === "permissions") return matchesSearch && (log.action === "grant_access" || log.action === "revoke_access");
    if (filter === "verification") return matchesSearch && log.action === "qr_verification";
    
    return matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-black text-white">Cryptographic Audit Trail</h2>
        <p className="text-xs text-slate-400 mt-1">Immutable session, upload, and verification logs</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl space-y-6">
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail logs..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 focus:outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {["all", "uploads", "permissions", "verification"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  filter === t
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="py-4 px-2">Action</th>
                <th className="py-4 px-2">Details</th>
                <th className="py-4 px-2">Performed By</th>
                <th className="py-4 px-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-2">
                      <span className="font-bold text-slate-200 capitalize">
                        {(log.action || "activity").replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-400 max-w-sm truncate">
                      {log.details || "—"}
                    </td>
                    <td className="py-4 px-2 font-mono text-slate-500">
                      {log.verifier?.walletAddress || log.verifier || "Self"}
                    </td>
                    <td className="py-4 px-2 text-slate-500 font-mono text-right">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No matching activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
