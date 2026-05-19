"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

const Web3Context = createContext(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api";

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [backendUrl, setBackendUrl] = useState(BACKEND_URL);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("account");
    setToken(null);
    setAccount(null);
    setUser(null);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        setBackendUrl(`http://${hostname}:5001/api`);
      }
    }
  }, []);

  async function fetchProfile(jwtToken) {
    try {
      const response = await axios.get(`${backendUrl}/auth/profile`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedAccount = localStorage.getItem("account");
    if (savedToken && savedAccount) {
      setToken(savedToken);
      setAccount(savedAccount);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this platform!");
        return;
      }

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];

      // 1. Get nonce from backend
      const nonceRes = await axios.get(`${backendUrl}/auth/nonce/${walletAddress}`);
      const nonce = nonceRes.data.nonce;

      // 2. Sign message
      const signer = await provider.getSigner();
      const message = `Welcome to IDChain! Sign this message to authenticate your wallet. Nonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 3. Verify signature at backend and get JWT
      const verifyRes = await axios.post(`${backendUrl}/auth/verify`, {
        walletAddress,
        signature,
      });

      if (verifyRes.data.success) {
        const { token: jwtToken, user: userData } = verifyRes.data;
        
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("account", walletAddress);
        
        setToken(jwtToken);
        setAccount(walletAddress);
        setUser(userData);
      }
    } catch (error) {
      console.error("Wallet connection/authentication failed:", error);
      alert("Authentication failed. Please check MetaMask and try again.");
    } finally {
      setLoading(false);
    }
  };

  const connectDemoWallet = async () => {
    try {
      setLoading(true);
      const walletAddress = "0x4e53c03d73c16edb78c1987159704f15e4eaebd9"; // Atharva's demo wallet address

      // 1. Fetch nonce (registers user if new)
      await axios.get(`${backendUrl}/auth/nonce/${walletAddress}`);

      // 2. Authenticate using developer mock signature bypass
      const verifyRes = await axios.post(`${backendUrl}/auth/verify`, {
        walletAddress,
        signature: "mock_demo_signature",
      });

      if (verifyRes.data.success) {
        const { token: jwtToken, user: userData } = verifyRes.data;
        
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("account", walletAddress);
        
        setToken(jwtToken);
        setAccount(walletAddress);
        setUser(userData);
      }
    } catch (error) {
      console.error("Demo login failed:", error);
      alert("Demo login failed. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Web3Context.Provider
      value={{
        account,
        user,
        loading,
        token,
        connectWallet,
        connectDemoWallet,
        logout,
        backendUrl,
        fetchProfile,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
