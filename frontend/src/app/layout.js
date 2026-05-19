import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IDChain – Decentralized Digital Identity Platform",
  description: "Secure, blockchain-based, self-sovereign identity verification platform using MetaMask authentication.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen antialiased`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
