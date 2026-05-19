"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  const { account, loading } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !account) {
      router.push("/");
    }
  }, [account, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-cyan-500/10 animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-mono text-cyan-400 animate-pulse tracking-widest uppercase">
          Verifying Session...
        </p>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 pl-20 flex flex-col min-h-screen">
        {/* Navigation bar */}
        <Header />

        {/* Dynamic content view */}
        <main className="flex-grow pt-20 p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
