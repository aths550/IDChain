"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWeb3 } from "@/context/Web3Context";
import {
  LayoutDashboard,
  FileUp,
  Fingerprint,
  QrCode,
  ShieldCheck,
  User,
  History,
  LogOut,
  Sliders,
} from "lucide-react";

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useWeb3();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create Identity", href: "/dashboard/identity", icon: Fingerprint },
    { name: "Upload Documents", href: "/dashboard/documents", icon: FileUp },
    { name: "Scan QR Verification", href: "/dashboard/scanner", icon: QrCode },
    { name: "Permissions", href: "/dashboard/permissions", icon: ShieldCheck },
    { name: "Activity Logs", href: "/dashboard/logs", icon: History },
    { name: "Profile Settings", href: "/dashboard/profile", icon: User },
  ];

  // If user is admin, add Admin panel link
  if (user?.role === "admin") {
    menuItems.push({ name: "Admin Panel", href: "/dashboard/admin", icon: Sliders });
  }

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between fixed h-screen z-20 transition-all duration-300 ease-in-out ${
        isHovered 
          ? "w-64 p-6 shadow-[10px_0_30px_rgba(0,0,0,0.5)] border-slate-700/50" 
          : "w-20 px-3 py-6 shadow-none"
      }`}
    >
      <div>
        <div className={`flex items-center mb-8 transition-all duration-300 ${isHovered ? "gap-3" : "gap-0 justify-center"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <span className="font-black text-xl text-white">ID</span>
          </div>
          <div className={`transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 translate-x-0 w-auto ml-2" : "opacity-0 -translate-x-4 w-0 h-0 overflow-hidden pointer-events-none"}`}>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              IDChain
            </h1>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
              Web3 Identity
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-xl transition-all duration-300 font-medium text-sm ${
                  isHovered ? "px-4 py-3 gap-4" : "p-3 justify-center gap-0"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 " + (isHovered ? "border-l-4 border-cyan-400 pl-3" : "") + " shadow-inner shadow-cyan-400/5"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 translate-x-0 max-w-[150px]" : "opacity-0 -translate-x-2 max-w-0 pointer-events-none overflow-hidden"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800/80 pt-6">
        {user && (
          <div className={`flex items-center transition-all duration-300 mb-6 bg-slate-800/30 rounded-xl border border-slate-800/50 ${isHovered ? "p-3 gap-3" : "p-2 justify-center gap-0 border-transparent bg-transparent"}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white uppercase shadow-md shadow-cyan-500/10 shrink-0">
              {user.name ? user.name[0] : "U"}
            </div>
            <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isHovered ? "opacity-100 max-w-[150px] ml-2" : "opacity-0 max-w-0 pointer-events-none"}`}>
              <p className="text-xs font-bold text-slate-200 truncate">
                {user.name || "IDChain User"}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono truncate">
                {user.walletAddress}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 ${
            isHovered ? "px-4 py-3 gap-4" : "p-3 justify-center gap-0"
          }`}
        >
          <LogOut className="w-5 h-5 text-rose-400 shrink-0" />
          <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 translate-x-0 max-w-[150px]" : "opacity-0 -translate-x-2 max-w-0 pointer-events-none overflow-hidden"}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
