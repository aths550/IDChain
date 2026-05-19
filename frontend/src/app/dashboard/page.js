"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Fingerprint,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, token, backendUrl, logout } = useWeb3();
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    activePermissions: 0,
    hasDid: false,
  });
  const [recentLogs, setRecentLogs] = useState([]);

  async function fetchDashboardDetails() {
    try {
      // Get documents
      const docsRes = await axios.get(`${backendUrl}/documents/my-documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Get permissions
      const permRes = await axios.get(`${backendUrl}/verify/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Get logs
      const logsRes = await axios.get(`${backendUrl}/verify/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const docsCount = docsRes.data.documents ? docsRes.data.documents.length : 0;
      const activePermsCount = permRes.data.permissions
        ? permRes.data.permissions.filter((p) => p.status === "granted").length
        : 0;

      setStats({
        documentsUploaded: docsCount,
        activePermissions: activePermsCount,
        hasDid: !!user?.did,
      });

      if (logsRes.data.logs) {
        setRecentLogs(logsRes.data.logs.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard details:", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const dashboardCards = [
    {
      title: "Decentralized DID",
      value: user?.did ? "Created" : "Not Created",
      description: user?.did ? user.did : "Generate your sovereign on-chain identity records.",
      icon: Fingerprint,
      actionText: user?.did ? "View Profile" : "Create DID",
      actionLink: "/dashboard/identity",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400",
    },
    {
      title: "Secure Documents",
      value: stats.documentsUploaded,
      description: "Immutable digital proof files uploaded to IPFS.",
      icon: FileCheck,
      actionText: "Manage Files",
      actionLink: "/dashboard/documents",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400",
    },
    {
      title: "Access Permissions",
      value: stats.activePermissions,
      description: "Active access requests granted to verified verifiers.",
      icon: ShieldCheck,
      actionText: "Manage Access",
      actionLink: "/dashboard/permissions",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/20 text-purple-400",
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 border border-slate-900 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[100%] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none"></div>

        <div className="max-w-2xl space-y-3 z-10 relative">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-400/5 border border-cyan-400/10 px-3 py-1 rounded-full">
            Decentralized Credentials
          </span>
          <h2 className="text-3xl font-black text-white">
            Welcome Back, {user?.name || "Sovereign Holder"}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Manage your credentials, audit access history, and control third-party access permissions
            securely on-chain from one central identity cockpit.
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-slate-800 transition-all duration-300`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-3xl font-black text-white">{card.value}</span>
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-1">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono truncate max-w-[250px]">
                  {card.description}
                </p>
              </div>

              <Link
                href={card.actionLink}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/40 text-xs font-bold text-slate-200 border border-slate-800 transition-all"
              >
                {card.actionText}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Activity Logs Panel */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Verification Logs</h3>
            <p className="text-xs text-slate-400 mt-1">Audit logs of all credential events</p>
          </div>
          <Link
            href="/dashboard/logs"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Full Audit Trail
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-900">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, idx) => (
              <div key={log._id || idx} className="py-4 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 capitalize">
                    {(log.action || "activity").replace("_", " ")}
                  </span>
                  <p className="text-slate-400 text-[11px]">{log.details || "—"}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-500 block">
                    {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "—"}
                  </span>
                  <span className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest">
                    Verified
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent logs found. Start creating your identity or uploading documents to generate activity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
