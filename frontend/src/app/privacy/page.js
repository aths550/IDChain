"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white">Privacy Policy</h2>
              <p className="text-xs text-slate-400 mt-1">Last updated: May 19, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            {/* Section 1 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">1. Introduction</h3>
              <p>
                IDChain (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a decentralized digital identity platform built on blockchain technology.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                platform. We are committed to protecting your privacy and ensuring you have full control over your personal data
                through self-sovereign identity principles.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">2. Information We Collect</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">2.1 Wallet Information</h4>
                  <p>
                    When you connect your Ethereum-compatible wallet (e.g., MetaMask), we collect your public wallet address.
                    This address serves as your unique identifier on our platform. We never access or store your private keys.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">2.2 Identity Information</h4>
                  <p>
                    When you create a Decentralized Identity (DID) profile, you voluntarily provide personal information such as
                    your first name, last name, date of birth, and nationality. This data is stored on IPFS (InterPlanetary File System)
                    via Pinata, not on our centralized servers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">2.3 Uploaded Documents</h4>
                  <p>
                    Documents you upload (such as Aadhaar, Passport, PAN Card, or other credentials) are stored on IPFS.
                    Cryptographic hashes (SHA-256) of these documents are recorded on the blockchain for tamper-proof verification.
                    The actual document content is only accessible through IPFS pinning.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-1">2.4 Activity Logs</h4>
                  <p>
                    We record verification events, permission changes, and document uploads as immutable audit trail entries on IPFS.
                    These logs include timestamps, action types, and the wallet addresses involved.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">3. How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>To create and manage your Decentralized Identity (DID) on the blockchain</li>
                <li>To facilitate secure document storage and verification through IPFS</li>
                <li>To enable permission-based access control for third-party verifiers</li>
                <li>To generate QR codes for instant identity verification</li>
                <li>To maintain an immutable audit trail of all identity-related activities</li>
                <li>To perform AI-powered fraud detection on submitted documents</li>
                <li>To improve our platform functionality and user experience</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">4. Decentralized Data Storage</h3>
              <p>
                IDChain leverages decentralized storage through IPFS (via Pinata) and blockchain technology. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>Your identity data is not stored on traditional centralized servers</li>
                <li>Data pinned to IPFS is content-addressed and cryptographically verifiable</li>
                <li>Blockchain records are immutable and cannot be altered or deleted by any single entity</li>
                <li>You maintain ownership and control over your identity data at all times</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">5. Data Sharing and Permissions</h3>
              <p>
                We do not sell, trade, or rent your personal information to third parties. Your document access is governed
                entirely by the permission system you control:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>You explicitly grant or revoke access to specific documents for specific verifiers</li>
                <li>Permission grants can include time-based expiration for temporary access</li>
                <li>All permission changes are recorded on the immutable audit trail</li>
                <li>Verifiers can only access documents you have explicitly authorized</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">6. Security Measures</h3>
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li>Cryptographic wallet-based authentication (no passwords stored)</li>
                <li>JWT (JSON Web Token) session management with 24-hour expiration</li>
                <li>SHA-256 document hashing for tamper detection</li>
                <li>HTTPS encryption for all API communications</li>
                <li>Zero-Knowledge Proof (ZKP) verification capabilities for privacy-preserving authentication</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">7. Your Rights</h3>
              <p>
                As a user of IDChain, you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
                <li><strong className="text-slate-200">Right to Access:</strong> View all your stored identity data and documents at any time</li>
                <li><strong className="text-slate-200">Right to Control:</strong> Manage who can access your documents through the permissions system</li>
                <li><strong className="text-slate-200">Right to Portability:</strong> Export your DID and associated credentials</li>
                <li><strong className="text-slate-200">Right to Transparency:</strong> View the complete audit trail of all actions performed on your identity</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">8. Cookies and Local Storage</h3>
              <p>
                IDChain uses browser local storage to maintain your session (JWT token and wallet address).
                We do not use tracking cookies or third-party analytics. Your session data is stored locally
                on your device and is cleared when you log out.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">9. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy
                periodically for any changes.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3">10. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our platform dashboard
                or reach out to the IDChain development team. As a decentralized platform, we prioritize transparency
                and are committed to addressing any privacy concerns promptly.
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
            <span className="text-cyan-400 font-semibold">Privacy Policy</span>
            <Link href="/terms" className="hover:text-slate-300">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
