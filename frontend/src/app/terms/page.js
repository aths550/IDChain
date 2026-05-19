"use client";

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="max-w-5xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10 relative">
        <Link href="/" className="flex items-center gap-3 group">
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
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 z-10 relative">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-10 md:p-14 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white">Terms of Use</h2>
              <p className="text-xs text-slate-400 mt-1">Last updated: May 19, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h3>
              <p>
                By accessing or using the IDChain Decentralized Digital Identity Platform (&quot;Platform&quot;), you agree to be bound
                by these Terms of Use (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Platform.
                These Terms constitute a legally binding agreement between you and IDChain regarding your use of the Platform.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">2. Platform Description</h3>
              <p>
                IDChain is a blockchain-based decentralized identity management platform that enables users to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>Create self-sovereign Decentralized Identities (DIDs) anchored on the Polygon blockchain</li>
                <li>Upload and store identity documents securely on IPFS via Pinata</li>
                <li>Generate cryptographic document hashes (SHA-256) for tamper-proof verification</li>
                <li>Manage granular access permissions for document sharing with third-party verifiers</li>
                <li>Generate and share verified identity QR codes for instant credential verification</li>
                <li>Maintain an immutable audit trail of all identity-related activities</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">3. Account and Wallet Requirements</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">3.1 Wallet Connection</h4>
                  <p>
                    To use IDChain, you must connect an Ethereum-compatible wallet (such as MetaMask) or use the demo
                    login feature. You are solely responsible for maintaining the security of your wallet, private keys,
                    and seed phrases. IDChain will never request your private keys.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">3.2 Account Responsibility</h4>
                  <p>
                    You are responsible for all activities that occur under your wallet address. You agree to immediately
                    notify us of any unauthorized use of your account. IDChain is not liable for any loss arising from
                    unauthorized access to your wallet.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">4. User Obligations</h3>
              <p>By using IDChain, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>Provide accurate and truthful information when creating your identity profile</li>
                <li>Upload only genuine, unaltered identity documents that belong to you</li>
                <li>Not use the Platform for fraudulent, illegal, or malicious purposes</li>
                <li>Not attempt to impersonate another person or misrepresent your identity</li>
                <li>Not interfere with or disrupt the Platform&apos;s infrastructure or services</li>
                <li>Not attempt to reverse-engineer, decompile, or tamper with the Platform&apos;s smart contracts</li>
                <li>Comply with all applicable local, state, national, and international laws and regulations</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">5. Document Upload and Verification</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">5.1 Document Authenticity</h4>
                  <p>
                    You represent and warrant that all documents uploaded to the Platform are authentic, unaltered,
                    and legally obtained. Uploading forged, manipulated, or stolen documents is strictly prohibited
                    and may result in account suspension and legal action.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">5.2 AI Fraud Detection</h4>
                  <p>
                    IDChain employs AI-powered fraud detection to analyze uploaded documents. By using the Platform,
                    you consent to automated analysis of your documents for integrity verification. Documents flagged
                    by the AI system may require additional manual verification.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">5.3 Immutability of Records</h4>
                  <p>
                    Once a document hash is recorded on the blockchain, it cannot be altered or deleted. You acknowledge
                    and accept the permanent nature of blockchain records. Exercise caution when uploading documents,
                    as the cryptographic proof of their existence will persist indefinitely.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">6. Permissions and Access Control</h3>
              <p>
                The Platform provides a granular permissions system that allows you to control access to your documents:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>You have full control over granting and revoking document access to third-party verifiers</li>
                <li>Access grants may include time-based expiration periods set by you</li>
                <li>All permission changes are permanently recorded on the audit trail</li>
                <li>IDChain is not responsible for actions taken by verifiers after access is granted</li>
                <li>You should carefully review and manage your permissions regularly</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">7. Intellectual Property</h3>
              <p>
                The IDChain platform, including its design, code, smart contracts, user interface, and branding,
                is the intellectual property of the IDChain development team. You retain ownership of all personal
                data and documents you upload to the Platform. By using the Platform, you grant IDChain a limited
                license to store and process your data solely for the purpose of providing the services described herein.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">8. Blockchain and IPFS Disclaimers</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">8.1 Blockchain Transactions</h4>
                  <p>
                    Blockchain transactions are irreversible. IDChain cannot reverse, cancel, or modify any
                    transactions once they are confirmed on the blockchain. You are solely responsible for
                    verifying the accuracy of all actions before confirming them.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">8.2 IPFS Availability</h4>
                  <p>
                    While IPFS provides decentralized storage, availability of pinned content depends on the
                    pinning service (Pinata) and the IPFS network. IDChain makes reasonable efforts to ensure
                    data availability but cannot guarantee 100% uptime of IPFS gateways.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">8.3 Gas Fees</h4>
                  <p>
                    Certain operations on the Platform may require blockchain gas fees (paid in cryptocurrency).
                    These fees are determined by the network and are not controlled by IDChain. You are responsible
                    for ensuring sufficient funds in your wallet to cover any applicable gas fees.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">9. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by applicable law, IDChain and its developers shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of data, profits, or business opportunities arising from use of the Platform</li>
                <li>Unauthorized access to your wallet or identity data due to your own negligence</li>
                <li>Disruptions caused by blockchain network congestion or IPFS gateway downtime</li>
                <li>Actions taken by third-party verifiers after being granted access to your documents</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">10. Termination</h3>
              <p>
                IDChain reserves the right to suspend or terminate access to the Platform for any user who
                violates these Terms. Due to the decentralized nature of blockchain, certain data (such as
                on-chain records and IPFS-pinned content) may persist even after account termination.
                You may stop using the Platform at any time by disconnecting your wallet.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">11. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India,
                without regard to its conflict of law provisions. Any disputes arising from these Terms
                shall be resolved through binding arbitration or in the courts of competent jurisdiction
                in Maharashtra, India.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">12. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately
                upon posting to the Platform. Your continued use of the Platform after any modifications
                constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">13. Contact Information</h3>
              <p>
                For questions, concerns, or feedback about these Terms of Use, please contact the IDChain
                development team through the platform dashboard. We are committed to transparency and will
                respond to all inquiries in a timely manner.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-8 z-10 relative">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} IDChain Decentralized Identity. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <span className="text-cyan-400 font-semibold">Terms of Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
