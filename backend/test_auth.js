const { ethers } = require("ethers");
const axios = require("axios");

async function test() {
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  console.log("Wallet:", address);

  // 1. Get nonce
  console.log("Fetching nonce...");
  const nonceRes = await axios.get(`http://localhost:5001/api/auth/nonce/${address}`);
  const nonce = nonceRes.data.nonce;
  console.log("Nonce:", nonce);

  // 2. Sign message
  const message = `Welcome to IDChain! Sign this message to authenticate your wallet. Nonce: ${nonce}`;
  const signature = await wallet.signMessage(message);
  console.log("Signature:", signature);

  // Wait a bit to simulate user interaction
  await new Promise(r => setTimeout(r, 2000));

  // 3. Verify
  console.log("Verifying...");
  try {
    const verifyRes = await axios.post(`http://localhost:5001/api/auth/verify`, {
      walletAddress: address,
      signature
    });
    console.log("Verify Success:", verifyRes.data.success);
  } catch (err) {
    console.error("Verify Failed:", err.response ? err.response.data : err.message);
  }
}

test();
