"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Wallet, 
  Trophy, 
  CheckCircle, 
  Edit3, 
  Copy, 
  Check, 
  ArrowLeft,
  X,
  FileBadge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, token, backendUrl } = useWeb3();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [copiedField, setCopiedField] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put(`${backendUrl}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setShowSuccessModal(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 relative">
      <div>
        <h2 className="text-2xl font-black text-white">Sovereign Holder Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Configure profile details and review NFT rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl space-y-8"
              >
                {/* Header & Avatar */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800/60">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-cyan-500/10">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                      {formData.name || "Sovereign User"}
                      {user?.did && (
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{formData.email || "No email linked"}</p>
                    <span className="inline-block text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Holder ID
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Wallet Address</label>
                    <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-850">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-350 font-mono break-all">{user?.walletAddress || "Not connected"}</span>
                      </div>
                      {user?.walletAddress && (
                        <button
                          onClick={() => copyToClipboard(user.walletAddress, "wallet")}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copiedField === "wallet" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Decentralized Identifier (DID)</label>
                    <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-850">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-cyan-400 font-mono break-all">{user?.did || "No DID generated yet"}</span>
                      </div>
                      {user?.did && (
                        <button
                          onClick={() => copyToClipboard(user.did, "did")}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copiedField === "did" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Toggle Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile Settings
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="profile-edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/60">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-slate-950 rounded-xl border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-white">General Settings</h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">Edit your sovereign identity details</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350">Name / Nickname</label>
                    <input
                      type="text"
                      value={formData.name}
                      required
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                      placeholder="Holder Nickname"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-350">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      required
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
                      placeholder="holder@domain.com"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3.5 rounded-xl border border-slate-800 hover:bg-slate-950 font-bold text-slate-450 hover:text-slate-200 transition-all duration-300 active:scale-95 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/10 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Updating..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NFT badge card */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              Sovereign Identity Badge
            </h3>

            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 aspect-square rounded-2xl flex flex-col justify-between p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-transparent animate-pulse pointer-events-none"></div>

              <div className="flex justify-between items-center z-10">
                <span className="text-[8px] tracking-widest font-black uppercase text-indigo-400">
                  ERC-721 Badge
                </span>
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>

              <div className="flex flex-col items-center justify-center py-6 z-10">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-400 flex items-center justify-center animate-bounce shadow-xl shadow-indigo-500/10">
                  <span className="text-2xl font-black text-indigo-400">ID</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mt-4">Bronze Sovereign</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Token ID: #10842</p>
              </div>

              <div className="border-t border-indigo-950/60 pt-3 flex justify-between items-center z-10 text-[9px]">
                <span className="text-slate-500">IDCHAIN AWARDS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <CheckCircle className="w-3.5 h-3.5" /> MINTED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GORGEOUS POPUP MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            ></motion.div>

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              {/* Outer decorative gradient glow */}
              <div className="absolute top-0 w-full h-[150px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-950 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated Success Icon container */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                  <CheckCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 animate-ping opacity-35"></div>
              </div>

              {/* Content */}
              <h4 className="text-lg font-black text-white mb-2">Profile Updated!</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Your sovereign profile settings have been successfully updated and securely synchronized on-chain.
              </p>

              {/* OK Button */}
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
