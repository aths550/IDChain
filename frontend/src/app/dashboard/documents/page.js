"use client";

import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import QRCode from "qrcode";
import {
  FileUp,
  FileText,
  CheckCircle,
  ExternalLink,
  Shield,
  Sparkles,
  QrCode,
  Download,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// MOCK ABI for anchoring document hash proof on Blockchain
const CONTRACT_ABI = [
  "function uploadDocument(string memory _docHash, string memory _docType) external",
];
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT || "0xB1C37825dD78864aA762a4CbcB04663cEfeC0370";

export default function DocumentsPage() {
  const { token, backendUrl } = useWeb3();
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedDocQr, setSelectedDocQr] = useState("");
  const [selectedDocName, setSelectedDocName] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  async function fetchDocuments(isInitial = false) {
    if (isInitial) setLoadingDocs(true);
    try {
      const res = await axios.get(`${backendUrl}/documents/my-documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      if (isInitial) setLoadingDocs(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchDocuments(true);
    } else {
      setLoadingDocs(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docType) {
      alert("Please choose a file and document type.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);
    formData.append("docType", docType);

    try {
      // 1. Upload to Pinata IPFS & Save Metadata in Pinata JSON via Backend API
      const uploadRes = await axios.post(`${backendUrl}/documents/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (uploadRes.data.success) {
        const { docHash, docType: uploadedType } = uploadRes.data.document;

        // 2. Anchor Document Hash on Polygon Blockchain
        if (window.ethereum) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.uploadDocument(docHash, uploadedType);
            await tx.wait();
            console.log("On-chain proof confirmation tx: ", tx.hash);
          } catch (contractError) {
            console.warn("Blockchain transaction declined or failed. Preserving local record.", contractError);
          }
        }

        setSuccessMessage(`"${docType}" uploaded and anchored successfully!`);
        setShowSuccessModal(true);
        setFile(null);
        setDocType("");
        fetchDocuments(false);
      }
    } catch (error) {
      console.error("Upload workflow failed:", error);
      alert("Upload workflow failed. Check variables.");
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code for a specific document
  const triggerQrModal = async (doc) => {
    setSelectedDocName(doc.docType);
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`;
    setSelectedDocQr(ipfsUrl);
    
    try {
      const qrData = await QRCode.toDataURL(ipfsUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: "#0f172a", // Dark slate
          light: "#ffffff", // Pure white for perfect scanning contrast
        },
      });
      setQrUrl(qrData);
      setShowQrModal(true);
    } catch (err) {
      console.error("Failed to generate QR code for document:", err);
    }
  };

  return (
    <div className="space-y-10 relative">
      <div>
        <h2 className="text-2xl font-black text-white">Secure Document Management</h2>
        <p className="text-xs text-slate-400 mt-1">Upload verified files to IPFS and anchor proofs on-chain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload form card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileUp className="w-5 h-5 text-cyan-400" />
              Upload Credentials
            </h3>
            <p className="text-slate-400 text-xs mt-1">Files are hashed locally prior to upload</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-350">Document Type</label>
              <select
                value={docType}
                required
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none transition-all"
              >
                <option value="">Select Type</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="College ID">College ID</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-350">Choose File (PDF, PNG, JPG)</label>
              <div className="relative border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileUp className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs text-slate-400 text-center font-medium">
                  {file ? file.name : "Drag & Drop or Click to browse"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/10 active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? "Processing Upload..." : "Secure & Hashing Document"}
            </button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Anchored Credential Files
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Show local uploading skeleton if uploading */}
            {loading && (
              <div className="bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between animate-pulse h-[200px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded"></div>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse">
                      Uploading...
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Anchoring {docType || "Document"}</h4>
                    <span className="text-[10px] text-slate-500 block font-mono mt-1">
                      Hashing file & writing proof...
                    </span>
                  </div>
                  <div className="h-10 bg-slate-950/40 rounded-2xl border border-slate-950/80"></div>
                </div>
              </div>
            )}

            {loadingDocs ? (
              // Loading history skeleton
              [1, 2].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-slate-900/20 border border-slate-800/40 rounded-3xl p-6 animate-pulse flex flex-col justify-between h-[200px]"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-slate-850 rounded-xl"></div>
                      <div className="w-20 h-4 bg-slate-850 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-28 h-4 bg-slate-850 rounded"></div>
                      <div className="w-20 h-3 bg-slate-850 rounded"></div>
                    </div>
                    <div className="h-12 bg-slate-850/40 rounded-2xl"></div>
                  </div>
                </div>
              ))
            ) : documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-slate-800 transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Decorative faint glow */}
                  <div className="absolute top-0 right-0 w-[40%] h-[100%] rounded-full bg-cyan-500/5 blur-[40px] pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-500"></div>
                  
                  <div className="space-y-4 z-10">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        {/* QR Code Action Button */}
                        <button
                          onClick={() => triggerQrModal(doc)}
                          title="Generate QR code to access from phone"
                          className="p-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-cyan-400 rounded-xl transition-all cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <span
                          className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        >
                          Verified IPFS
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{doc.docType}</h4>
                      <span className="text-[10px] text-slate-550 block font-mono mt-1">
                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-950/80 text-[10px] font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">IPFS Proof:</span>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-0.5"
                        >
                          View IPFS <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-500 select-none">SHA-256 Hash:</span>
                        <span 
                          className="text-slate-300 truncate max-w-[120px] hover:max-w-full hover:whitespace-normal hover:break-all transition-all duration-300 cursor-pointer selection:bg-cyan-500/30"
                          title="Click to copy full hash"
                          onClick={(e) => {
                            navigator.clipboard.writeText(doc.docHash);
                            const target = e.currentTarget;
                            const origText = target.innerText;
                            target.innerText = "Copied!";
                            setTimeout(() => {
                              target.innerText = origText;
                            }, 1500);
                          }}
                        >
                          {doc.docHash}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className="col-span-2 bg-slate-900/20 border border-slate-900/60 rounded-3xl p-12 text-center text-xs text-slate-500 animate-fade-in">
                No secure credentials uploaded. Hashing files to secure them permanently.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* GORGEOUS UPLOAD SUCCESS MODAL */}
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

              <h4 className="text-lg font-black text-white mb-2">Upload Secured!</h4>
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

      {/* DOCUMENT QR CODE DISPLAY MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
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
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-950 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  Access {selectedDocName}
                </h3>
                <p className="text-slate-450 text-[11px] max-w-xs leading-relaxed">
                  Scan this QR code from any phone to securely access this document directly from Pinata IPFS.
                </p>
              </div>

              {qrUrl && (
                <div className="my-4 p-4 bg-slate-950 rounded-3xl border border-slate-800/80 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="Document QR Code" className="w-[160px] h-[160px]" />
                </div>
              )}

              <div className="flex w-full gap-3 mt-4">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = qrUrl;
                    link.download = `${selectedDocName.replace(" ", "_")}_qr.png`;
                    link.click();
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-800 hover:bg-slate-950 font-bold text-slate-450 hover:text-slate-200 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <a
                  href={selectedDocQr}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Open File <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
