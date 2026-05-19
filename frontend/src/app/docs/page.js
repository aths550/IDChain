"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Code, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Zap,
  ArrowLeft,
  ChevronRight,
  Database,
  Network
} from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarLinks = [
    { id: "overview", label: "Overview & Introduction", icon: BookOpen },
    { id: "architecture", label: "System Architecture", icon: Cpu },
    { id: "auth", label: "Web3 Authentication", icon: ShieldCheck },
    { id: "smart-contracts", label: "Smart Contracts", icon: Code },
    { id: "ipfs", label: "Pinata IPFS Storage", icon: Database },
    { id: "api", label: "API Reference", icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-800/80 bg-[#050B14]/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-1.5 rounded-lg text-white group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              ID<span className="text-cyan-400">Chain</span>
            </span>
          </Link>
          <span className="text-slate-600 font-mono text-sm ml-4 hidden md:block">v1.0.0 Documentation</span>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </nav>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-72 border-r border-slate-800/60 bg-[#070E1A] overflow-y-auto hidden lg:block">
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Documentation</h3>
            <div className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                      {link.label}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-12 pb-24 max-w-5xl">
          {activeTab === "overview" && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Introduction to IDChain</h1>
                <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
                  IDChain is a decentralized identity and document verification platform built to bridge the gap between Web3 sovereignty and real-world institutional compliance. By leveraging the Polygon Amoy Testnet and Pinata IPFS, IDChain guarantees immutable audit trails and decentralized storage.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Self-Sovereign Identity</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Users generate Decentralized Identifiers (DIDs) mapped to their wallet addresses. They alone control access to their data via cryptographic signatures.
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <Database className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Decentralized Storage</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    All identity profiles, sensitive documents, and granular audit logs are encrypted and stored perpetually on IPFS utilizing Pinata.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="animate-fade-in space-y-8">
              <h1 className="text-4xl font-black text-white tracking-tight">System Architecture</h1>
              <p className="text-slate-400 leading-relaxed">
                IDChain employs a modern three-tier architecture ensuring zero single points of failure.
              </p>
              
              <div className="space-y-6 mt-8">
                <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Network className="w-5 h-5 text-indigo-400" /> Frontend (Next.js & Turbopack)
                  </h3>
                  <p className="text-sm text-slate-400">
                    A highly responsive React interface utilizing Ethers.js to interact directly with user wallets. It handles cryptographic signing, file buffering for IPFS, and dynamic QR generation.
                  </p>
                </div>
                
                <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" /> Backend (Node.js & Express)
                  </h3>
                  <p className="text-sm text-slate-400">
                    A stateless REST API proxy. It acts as a secure bridge for IPFS pinning, AI fraud detection pre-checks, and JWT issuance. It features an ultra-fast in-memory cache to prevent race conditions during IPFS indexing.
                  </p>
                </div>

                <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" /> Blockchain (Polygon Amoy)
                  </h3>
                  <p className="text-sm text-slate-400">
                    EVM-compatible smart contracts mapped in Solidity. DIDs are permanently anchored on-chain ensuring global resolution and immutability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "auth" && (
            <div className="animate-fade-in space-y-8">
              <h1 className="text-4xl font-black text-white tracking-tight">Web3 Authentication</h1>
              <p className="text-slate-400 leading-relaxed">
                IDChain does not use passwords. Instead, it relies on Cryptographic Nonce Signing via ECDSA (Elliptic Curve Digital Signature Algorithm).
              </p>
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-xs font-mono text-slate-500">auth-flow.js</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono text-cyan-300">
                    <code>{`// 1. Frontend requests Nonce
const { nonce } = await axios.get('/api/auth/nonce/\${walletAddress}');

// 2. User signs the exact string via MetaMask
const message = \`Welcome to IDChain! Sign this message to authenticate your wallet. Nonce: \${nonce}\`;
const signature = await wallet.signMessage(message);

// 3. Backend utilizes ethers.verifyMessage() to recover public address
const recoveredAddress = verifyMessage(message, signature);

// 4. If recoveredAddress === walletAddress, issue JWT Token.`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ipfs" && (
            <div className="animate-fade-in space-y-8">
              <h1 className="text-4xl font-black text-white tracking-tight">Pinata IPFS Integration</h1>
              <p className="text-slate-400 leading-relaxed">
                To guarantee maximum decentralization, IDChain stores zero user data in a centralized database (like MongoDB). All state is pinned directly to the InterPlanetary File System using the Pinata SDK.
              </p>
              
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold text-white">Robust 3-Tier Retrieval Engine</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400 shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-slate-200">Local Disk Caching</h4>
                      <p className="text-sm text-slate-400">Nodes immediately write fetched CIDs to a local <code className="text-cyan-400">/cache</code> directory to prevent hitting API rate limits on hot files.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-slate-200">Gateway Failover</h4>
                      <p className="text-sm text-slate-400">If the primary Pinata gateway fails or 403s, requests dynamically fallback to the public <code className="text-cyan-400">ipfs.io</code> gateway.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400 shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-slate-200">Metadata Reconstruction</h4>
                      <p className="text-sm text-slate-400">As a last resort, if IPFS is entirely unreachable, the backend reconstructs valid user objects strictly from Pinata's indexing metadata to prevent application crashing.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="animate-fade-in space-y-8">
              <h1 className="text-4xl font-black text-white tracking-tight">API Reference</h1>
              <p className="text-slate-400 leading-relaxed mb-8">
                Core REST endpoints utilized by the frontend to interact with the decentralized network.
              </p>

              <div className="space-y-6">
                {/* Endpoint */}
                <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded">GET</span>
                    <code className="text-slate-300 font-mono">/api/auth/profile</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Fetches the active user profile. Utilizes an ultra-fast in-memory cache with an auto-heal mechanism for corrupted IPFS records.</p>
                  <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-500">
                    Authorization: Bearer &lt;JWT_TOKEN&gt;
                  </div>
                </div>

                {/* Endpoint */}
                <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded">POST</span>
                    <code className="text-slate-300 font-mono">/api/identity</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Generates a Decentralized Identifier (DID) mapped to the user's wallet address and anchors metadata to Pinata IPFS.</p>
                </div>

                {/* Endpoint */}
                <div className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded">POST</span>
                    <code className="text-slate-300 font-mono">/api/documents/upload</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Accepts Multipart form data. Encrypts files buffer locally and pins directly to IPFS, ensuring complete file immutability.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "smart-contracts" && (
            <div className="animate-fade-in space-y-8">
              <h1 className="text-4xl font-black text-white tracking-tight">Smart Contracts</h1>
              <p className="text-slate-400 leading-relaxed mb-8">
                The smart contracts serve as the immutable anchor for all DIDs. Deployed on Polygon Amoy.
              </p>
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-2">IdentityRegistry.sol</h3>
                <p className="text-sm text-slate-400 mb-4">A mapping registry to ensure that wallet addresses correspond globally to specific generated DIDs.</p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-emerald-400">
                    <code>{`contract IdentityRegistry {
    struct User {
        string did;
        bool isRegistered;
        address walletAddress;
    }
    
    mapping(address => User) public users;
    
    function registerUser(string memory _did) external {
        require(!users[msg.sender].isRegistered, "Already registered");
        users[msg.sender] = User(_did, true, msg.sender);
    }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
