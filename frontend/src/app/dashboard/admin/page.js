"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert, Users, Layers, Award, Sliders } from "lucide-react";

export default function AdminPage() {
  const { token, backendUrl, user } = useWeb3();
  const [stats, setStats] = useState({ totalUsers: 0, verifiedDids: 0, documents: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAdminStats() {
    try {
      const res = await axios.get(`${backendUrl}/verify/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setStats(res.data.stats);
        setLogs(res.data.logs);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchAdminStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  if (user?.role !== "admin") {
    return (
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 max-w-xl mx-auto text-xs text-center flex flex-col items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-rose-400" />
        <h4 className="font-bold text-slate-200">Access Restricted</h4>
        <p className="text-slate-400">
          Only users possessing the explicit Platform Admin role are authorized to view these settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-black text-white">Platform Owner Cockpit</h2>
        <p className="text-xs text-slate-400 mt-1">Supervise and manage digital credentials activities</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
          <p className="text-xs font-mono text-cyan-400">Computing analytics...</p>
        </div>
      ) : (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block">
                  Total Registrants
                </span>
                <span className="text-3xl font-black text-white mt-1 block">{stats.totalUsers}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-2xl">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block">
                  Verified Identities
                </span>
                <span className="text-3xl font-black text-white mt-1 block">{stats.verifiedDids}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-2xl">
                <Award className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block">
                  Secure Documents
                </span>
                <span className="text-3xl font-black text-white mt-1 block">{stats.documents}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-2xl">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Master logs table */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Platform Master Activity Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-4 px-2">Initiator</th>
                    <th className="py-4 px-2">Action</th>
                    <th className="py-4 px-2">Details</th>
                    <th className="py-4 px-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <tr key={log._id || idx} className="hover:bg-slate-900/20 transition-all">
                        <td className="py-4 px-2 font-mono text-slate-300">
                          {log.verifier?.walletAddress || log.verifier || "Platform System"}
                        </td>
                        <td className="py-4 px-2">
                          <span className="font-bold text-cyan-400 capitalize">
                            {(log.action || "activity").replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-slate-400 max-w-xs truncate">
                          {log.details || "—"}
                        </td>
                        <td className="py-4 px-2 text-slate-500 font-mono text-right">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        No activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
