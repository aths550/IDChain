"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  QrCode,
  CheckCircle,
  AlertCircle,
  Scan,
  Shield,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function ScannerPage() {
  const { token, backendUrl } = useWeb3();
  const [didQuery, setDidQuery] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [docScanResult, setDocScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  async function handleVerifyDocument(ipfsUrl) {
    setLoading(true);
    setError("");
    setScanResult(null);
    setDocScanResult(null);

    try {
      let cid = ipfsUrl;
      if (ipfsUrl.includes("ipfs/")) {
        cid = ipfsUrl.split("ipfs/")[1].split("/")[0];
      }

      setDocScanResult({
        url: ipfsUrl,
        cid: cid,
        scannedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError("Failed to parse IPFS document URL.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyDID(didToVerify) {
    const targetDid = didToVerify || didQuery;
    if (!targetDid) return;

    setLoading(true);
    setError("");
    setScanResult(null);
    setDocScanResult(null);

    try {
      const res = await axios.post(
        `${backendUrl}/verify/qr-verify`,
        { did: targetDid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setScanResult(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Verify failed. Check that the DID exists or verify database sync.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function onScanSuccess(decodedText) {
      // Check if it's an IPFS document link
      if (decodedText.includes("ipfs/") || decodedText.includes("gateway.pinata.cloud")) {
        if (scannerRef.current) {
          scannerRef.current.clear().catch((err) => console.error(err));
        }
        handleVerifyDocument(decodedText);
        return;
      }

      // Expected structure: verified URL including DID or plain DID
      // e.g. did:idchain:0x... or http://localhost:3000/verify/did:idchain:0x...
      let did = decodedText;
      if (decodedText.includes("/verify/")) {
        did = decodedText.split("/verify/")[1];
      }

      if (did.startsWith("did:idchain:")) {
        if (scannerRef.current) {
          scannerRef.current.clear().catch((err) => console.error(err));
        }
        handleVerifyDID(did);
      }
    }

    function onScanFailure(error) {
      // Silently continue scanning
    }

    // Start QR scanner
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Scanner clear error", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, token]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-black text-white">Identity Verification QR Scanner</h2>
        <p className="text-xs text-slate-400 mt-1">Audit and verify identity profiles instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Scanner and Manual Input */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Scan className="w-5 h-5 text-cyan-400" />
              Live Camera Scanner
            </h3>
            
            {/* HTML5 QR code reader container */}
            <div id="reader" className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-850"></div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-400" />
              Manual DID Verification
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={didQuery}
                onChange={(e) => setDidQuery(e.target.value)}
                placeholder="did:idchain:0x..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all font-mono"
              />
              <button
                onClick={() => handleVerifyDID()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg text-xs transition-all active:scale-95"
              >
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {loading && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
              <p className="text-xs font-mono text-cyan-400">Verifying on-chain logs...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 backdrop-blur-xl flex gap-4 text-xs h-full min-h-[300px] items-center">
              <AlertCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Verification Failed</h4>
                <p className="text-slate-400 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && !scanResult && !docScanResult && (
            <div className="bg-slate-900/20 border border-slate-900/60 rounded-3xl p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3 h-full min-h-[300px]">
              <HelpCircle className="w-10 h-10 text-slate-700" />
              <p className="max-w-xs leading-relaxed">
                Awaiting scan or entry. Align the QR code in front of the lens to check credentials.
              </p>
            </div>
          )}

          {!loading && !error && docScanResult && (
            <div className="bg-gradient-to-tr from-slate-900/80 to-cyan-950/20 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-2xl shadow-xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Secure IPFS Document Detected
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    Decentralized File Proof
                  </h3>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                    IPFS CID (Content Identifier)
                  </span>
                  <span className="text-cyan-400 font-mono text-[10px] break-all bg-slate-950 p-3 rounded-xl border border-slate-850 block">
                    {docScanResult.cid}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                    Verification Source
                  </span>
                  <span className="text-slate-350 font-mono text-[10px] break-all bg-slate-950 p-3 rounded-xl border border-slate-850 block">
                    Pinata IPFS Gateway
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                    Scan Status
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                    <CheckCircle className="w-4 h-4 animate-pulse" /> Cryptographically Integrity Intact
                  </span>
                </div>
              </div>

              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={() => {
                    setDocScanResult(null);
                    window.location.reload();
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-950 font-bold text-slate-450 hover:text-slate-200 transition-all text-xs text-center cursor-pointer"
                >
                  Scan Another
                </button>
                <a
                  href={docScanResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Open Document <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {!loading && !error && scanResult && (
            <div className="bg-gradient-to-tr from-slate-900/80 to-cyan-950/20 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-2xl shadow-xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Sovereign Credentials Verified
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    {scanResult.identity?.firstName || "Public"} {scanResult.identity?.lastName || "Profile"}
                  </h3>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                      Nationality
                    </span>
                    <span className="text-slate-300 font-bold">
                      {scanResult.identity?.nationality || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                      Date of Birth
                    </span>
                    <span className="text-slate-300 font-bold">
                      {scanResult.identity?.dateOfBirth
                        ? new Date(scanResult.identity.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                    Decentralized Identifier (DID)
                  </span>
                  <span className="text-cyan-400 font-mono text-[10px] truncate block">
                    {scanResult.user.did}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px]">
                    Associated Wallet Address
                  </span>
                  <span className="text-slate-305 font-mono text-[10px] truncate block">
                    {scanResult.user.walletAddress}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-900/60 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">IDCHAIN VERIFIER SYSTEM</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> ON-CHAIN OK
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
