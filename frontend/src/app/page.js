"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Fingerprint, Lock, Zap, ArrowRight, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { account, connectWallet, connectDemoWallet, loading } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push("/dashboard");
    }
  }, [account, router]);

  const features = [
    {
      title: "Self-Sovereign Identity",
      desc: "Create and own your Decentralized Identity (DID) profile permanently, anchored on blockchain without third-party silos.",
      icon: Fingerprint,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Immutable Document Storage",
      desc: "Upload Aadhaar, Passport, or credentials to IPFS. Save decentralized proofs on the Polygon blockchain.",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Dynamic Permissions Management",
      desc: "Grant temporary access to verified auditors or revoke permissions dynamically. Your identity, your terms.",
      icon: Lock,
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Instant Verification QR",
      desc: "Generate custom, verified identity QR codes. Anyone can scan and verify your authentic credentials within seconds.",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-black text-xl text-white">ID</span>
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              IDChain
            </h1>
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest block">
              Identity Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={connectDemoWallet}
            disabled={loading}
            className="px-5 py-2.5 rounded-full border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Demo Login
          </button>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Connect Wallet"}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center gap-16 z-10 flex-grow">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-400 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Polygon Amoy Testnet Live
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
            Take Back Control of{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Your Digital Identity
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Create decentralized identities (DIDs), securely upload and hash identity documents, and
            manage verification permissions seamlessly using cryptography and blockchain technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={connectWallet}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Get Started with Wallet
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={connectDemoWallet}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/50 hover:text-white font-bold text-slate-350 transition-all duration-300 cursor-pointer"
            >
              Demo Sign In (No Wallet)
            </button>
          </div>

          {/* Verification Platform Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 max-w-md mx-auto lg:mx-0 border-t border-slate-900">
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                Decentralized
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">0%</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                Third-Party Custody
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">Fast</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                Polygon Proofs
              </p>
            </div>
          </div>
        </div>

        {/* Hero Interactive visual element */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-[450px] bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Ambient inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>

            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Securing Credentials
                </span>
              </div>
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="space-y-6 py-8 z-10">
              {/* Fake visual profile card */}
              <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white uppercase">
                  U
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Decentralized Profile</h4>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">did:idchain:0x8f...2e7</p>
                </div>
              </div>

              {/* Fake visual log file */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                  <span className="text-slate-400">DID Anchor</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Successful
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                  <span className="text-slate-400">Pinata IPFS Upload</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Secure Hash
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 flex justify-between items-center z-10">
              <span className="text-xs font-medium text-slate-400">Click to connect and unlock</span>
              <button
                onClick={connectDemoWallet}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group cursor-pointer"
              >
                Enter Demo Mode
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-slate-900/20 border-t border-slate-900 py-24 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Platform Features Overview
            </h3>
            <p className="text-slate-400 text-sm">
              Discover how IDChain leverage modern decentralization protocols to safeguard your personal credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-slate-800 transition-all duration-300"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.color} flex items-center justify-center mb-6 shadow-md`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} IDChain Decentralized Identity. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
