import { Fingerprint, CheckCircle, FileBadge, AlertCircle, XCircle } from "lucide-react";

async function getVerificationData(did) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api";
  try {
    const res = await fetch(`${backendUrl}/verify/public-verify/${did}`, {
      cache: "no-store", // SSR
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching public verification:", error);
    return null;
  }
}

export default async function PublicVerifyPage({ params }) {
  const { did } = await params;
  const data = await getVerificationData(did);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 tracking-wide uppercase mb-4">
            <Fingerprint className="w-3.5 h-3.5 animate-pulse" />
            IDChain Public Registry
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Credential Verification</h1>
          <p className="text-xs text-slate-400 mt-2">Sovereign identity lookup verified by cryptography</p>
        </div>

        {data && data.success ? (
          <div className="space-y-6">
            {/* Success card */}
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                    <CheckCircle className="w-3.5 h-3.5" /> Identity Verified
                  </span>
                  <h2 className="text-2xl font-black text-white mt-3.5">
                    {data.identity ? `${data.identity.firstName} ${data.identity.lastName}` : "Registered User"}
                  </h2>
                </div>
                <FileBadge className="w-10 h-10 text-cyan-400" />
              </div>

              {data.identity ? (
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                      Nationality
                    </span>
                    <span className="text-slate-200 font-bold text-sm">{data.identity.nationality}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                      Date of Birth
                    </span>
                    <span className="text-slate-200 font-bold text-sm">
                      {new Date(data.identity.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-slate-400">
                  User is registered but has not generated a detailed identity profile yet.
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                    Decentralized Identifier (DID)
                  </span>
                  <span className="text-cyan-400 font-mono text-xs break-all bg-slate-950 p-3 rounded-xl border border-slate-850 block">
                    {data.user.did}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-1">
                    Wallet Address
                  </span>
                  <span className="text-slate-300 font-mono text-xs break-all bg-slate-950 p-3 rounded-xl border border-slate-850 block">
                    {data.user.walletAddress}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/60 pt-5 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[10px]">IDCHAIN VERIFIED PROOF</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> SECURED ON POLYGON
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-rose-500/20 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-2">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid or Unregistered DID</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                This DID could not be verified on the IDChain Registry. Please ensure the QR code was scanned correctly or the profile is anchored.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
