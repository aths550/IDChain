"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Ban,
  UserCheck,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// MOCK ABI for granting/revoking access on Blockchain
const CONTRACT_ABI = [
  "function grantAccess(address _verifier) external",
  "function revokeAccess(address _verifier) external"
];
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT || "0xB1C37825dD78864aA762a4CbcB04663cEfeC0370";

export default function PermissionsPage() {
  const { token, backendUrl } = useWeb3();
  const [permissions, setPermissions] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function fetchPermissions(isInitial = false) {
    if (isInitial) setLoadingList(true);
    try {
      const res = await axios.get(`${backendUrl}/verify/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPermissions(res.data.permissions);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      if (isInitial) setLoadingList(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchPermissions(true);
    } else {
      setLoadingList(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleGrantAccess = async (permissionId, verifierWallet) => {
    setLoadingId(permissionId);
    try {
      // 1. Authorize verifier on Polygon Blockchain Identity Contract
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          const tx = await contract.grantAccess(verifierWallet);
          await tx.wait();
          console.log("On-chain authorization success: ", tx.hash);
        } catch (contractError) {
          console.warn("Blockchain transaction declined or failed. Proceeding with local state updates.", contractError);
        }
      }

      // 2. Approve and save on MongoDB via backend API
      const res = await axios.post(
        `${backendUrl}/verify/grant`,
        { permissionId, expiryHours: 24 }, // Granting access for 24 hours
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Optimistically update frontend state immediately
        setPermissions((prev) =>
          prev.map((p) =>
            p._id === permissionId
              ? {
                  ...p,
                  status: "granted",
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }
              : p
          )
        );
        setSuccessMessage("Access granted successfully for 24 hours!");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevokeAccess = async (permissionId, verifierWallet) => {
    setLoadingId(permissionId);
    try {
      // 1. Revoke verifier authorization on Polygon Blockchain Identity Contract
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          const tx = await contract.revokeAccess(verifierWallet);
          await tx.wait();
          console.log("On-chain revocation success: ", tx.hash);
        } catch (contractError) {
          console.warn("Blockchain transaction declined. Proceeding with local state updates.", contractError);
        }
      }

      // 2. Revoke on MongoDB via backend API
      const res = await axios.post(
        `${backendUrl}/verify/revoke`,
        { permissionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Optimistically update frontend state immediately
        setPermissions((prev) =>
          prev.map((p) => (p._id === permissionId ? { ...p, status: "revoked" } : p))
        );
        setSuccessMessage("Access revoked successfully!");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 relative">
      <div>
        <h2 className="text-2xl font-black text-white">Auditor Permissions Cockpit</h2>
        <p className="text-xs text-slate-400 mt-1">Manage, approve, or revoke digital document access</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          Access Authorization Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="py-4 px-2">Auditor Wallet Address</th>
                <th className="py-4 px-2">Credentials Requested</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2">Expirations</th>
                <th className="py-4 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {loadingList ? (
                // Loading Skeleton Rows
                [1, 2].map((i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-4 px-2">
                      <div className="w-40 h-4 bg-slate-800 rounded"></div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="w-24 h-4 bg-slate-800 rounded"></div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="w-16 h-5 bg-slate-800 rounded-full"></div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="w-20 h-4 bg-slate-800 rounded"></div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="w-16 h-8 bg-slate-800 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : permissions.length > 0 ? (
                permissions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-2 font-mono text-slate-300">
                      {p.verifier.walletAddress}
                    </td>
                    <td className="py-4 px-2 text-slate-300">
                      {p.allowedDocuments.map((doc) => doc.docType).join(", ")}
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-bold ${
                          p.status === "granted"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : p.status === "revoked"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-400 font-mono">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleTimeString() : "Permanent"}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {p.status === "pending" && (
                        <button
                          onClick={() => handleGrantAccess(p._id, p.verifier.walletAddress)}
                          disabled={loadingId === p._id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold transition-all cursor-pointer"
                        >
                          {loadingId === p._id ? "Processing..." : "Approve"}
                        </button>
                      )}
                      {p.status === "granted" && (
                        <button
                          onClick={() => handleRevokeAccess(p._id, p.verifier.walletAddress)}
                          disabled={loadingId === p._id}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold transition-all cursor-pointer"
                        >
                          {loadingId === p._id ? "Processing..." : "Revoke"}
                        </button>
                      )}
                      {p.status === "revoked" && (
                        <span className="text-slate-500 font-mono italic select-none">Access Terminated</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No active/pending verification permissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANIMATED SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 w-full h-[150px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-950 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                  <CheckCircle className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 animate-ping opacity-35"></div>
              </div>

              <h4 className="text-lg font-black text-white mb-2">Success!</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {successMessage}
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/10 transition-all duration-300 active:scale-95 cursor-pointer text-xs"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
