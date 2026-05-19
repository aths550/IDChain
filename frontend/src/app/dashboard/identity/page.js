"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode";
import { ethers } from "ethers";
import {
  Fingerprint,
  CheckCircle,
  FileBadge,
  Sparkles,
  QrCode,
  ShieldCheck,
  Download,
} from "lucide-react";

// MOCK ABI for Identity registration on Blockchain
const CONTRACT_ABI = [
  "function registerUser(string memory _did) external",
  "function users(address) view returns (string memory did, bool isRegistered, address wallet)"
];
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT || "0xB1C37825dD78864aA762a4CbcB04663cEfeC0370";

export default function IdentityPage() {
  const { user, token, backendUrl, fetchProfile } = useWeb3();
  const [identity, setIdentity] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [localIp, setLocalIp] = useState("localhost");
  
  // Form input states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("checking"); // checking, form, ready
  const [aiAnalysis, setAiAnalysis] = useState(null);

  async function fetchNetworkInfo() {
    try {
      const res = await axios.get(`${backendUrl}/auth/network-info`);
      if (res.data.success) {
        setLocalIp(res.data.localIp);
      }
    } catch (err) {
      console.error("Failed to fetch network info:", err);
    }
  }

  async function fetchIdentity() {
    try {
      const res = await axios.get(`${backendUrl}/identity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.identity) {
        setIdentity(res.data.identity);
        setStep("ready");
      } else {
        setStep("form");
      }
    } catch (error) {
      setStep("form");
    }
  }

  async function generateQrCode(did) {
    try {
      const origin = "https://only-haiku-donated.ngrok-free.dev";
      const verifyUrl = `${origin}/verify/${did}`;
      const qrData = await QRCode.toDataURL(verifyUrl, {
        width: 250,
        margin: 4, // Standard quiet zone for perfect scanning
        color: {
          dark: "#000000", // Pure black for maximum contrast
          light: "#ffffff", // Pure white background
        },
      });
      setQrUrl(qrData);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (token) {
      fetchIdentity();
      fetchNetworkInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  useEffect(() => {
    if (identity?.did && localIp) {
      generateQrCode(identity.did);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, localIp]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDID = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Trigger AI Pre-check verification logic placeholder
      const aiRes = await axios.post(
        `${backendUrl}/identity/fraud-check`,
        { docType: "Profile" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiAnalysis(aiRes.data);

      if (aiRes.data.status === "FLAGGED") {
        alert("AI Fraud precheck flagged. Please input authentic fields.");
        setLoading(false);
        return;
      }

      // 2. Write Metadata into MongoDB Atlas
      const dbRes = await axios.post(`${backendUrl}/identity`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (dbRes.data.success) {
        const did = dbRes.data.identity.did;

        // 3. Anchoring DID onto Blockchain Contract
        if (window.ethereum) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.registerUser(did);
            await tx.wait();
            console.log("Blockchain confirmation success: ", tx.hash);
          } catch (contractError) {
            console.warn("Blockchain transaction declined or failed. Preserving local record.", contractError);
          }
        }

        // Complete creation
        setIdentity(dbRes.data.identity);
        setStep("ready");
        // Refresh global user profile so Dashboard knows about the new DID immediately
        if (fetchProfile) fetchProfile(token);
      }
    } catch (error) {
      console.error("Identity generation error:", error);
      alert("Error generating identity profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-black text-white">Sovereign Identity Registration</h2>
        <p className="text-xs text-slate-400 mt-1">Anchor your Decentralized Identity profile securely</p>
      </div>

      {step === "checking" && (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
          <p className="text-xs font-mono text-cyan-400">Inspecting credential logs...</p>
        </div>
      )}

      {step === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration form */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl">
            <form onSubmit={handleCreateDID} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    required
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                    placeholder="e.g. Indian"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/10 transition-all duration-300 active:scale-95 disabled:opacity-50"
              >
                <Fingerprint className="w-5 h-5 animate-pulse" />
                {loading ? "Registering on Blockchain..." : "Generate DID and Verify"}
              </button>
            </form>
          </div>

          {/* AI Pre-check and guidelines card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Fraud Precheck
              </h3>
              <p className="text-slate-400 text-xs mt-1">Real-time model checking metrics</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 text-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Precheck Integrity:</span>
                <span className="text-emerald-400 font-bold">100% Cleared</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Layout Matcher:</span>
                <span className="text-cyan-400 font-bold">Active</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                IDChain applies active fraud detection frameworks before anchoring transactions on Polygon Amoy.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === "ready" && identity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Sovereign Identity Card */}
          <div className="bg-gradient-to-tr from-slate-900/80 to-cyan-950/20 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between aspect-video relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[40%] h-[100%] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Decentralized Identity
                </span>
                <h3 className="text-xl font-black text-white mt-3">
                  {identity.firstName} {identity.lastName}
                </h3>
              </div>
              <FileBadge className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                    Nationality
                  </span>
                  <span className="text-slate-300 font-bold">{identity.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                    Date of Birth
                  </span>
                  <span className="text-slate-300 font-bold">
                    {new Date(identity.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                  Decentralized Identifier (DID)
                </span>
                <span className="text-cyan-400 font-mono text-[10px] truncate block">
                  {identity.did}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-900/60 pt-4 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">IDCHAIN PLATFORM</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> SECURED ON POLYGON
              </span>
            </div>
          </div>

          {/* QR Verification display */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between items-center text-center">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center">
                <QrCode className="w-5 h-5 text-cyan-400" />
                QR Verification System
              </h3>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Scan this QR code using the verifier cockpit to instantly pull verification metrics.
              </p>
            </div>

            {qrUrl && (
              <div className="my-6 p-4 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Identity QR Code" className="w-[180px] h-[180px]" />
              </div>
            )}

            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = qrUrl;
                link.download = `did_identity_qr.png`;
                link.click();
              }}
              className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <Download className="w-4 h-4" />
              Download Identity QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
