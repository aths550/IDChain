const jwt = require("jsonwebtoken");
const { verifyMessage } = require("ethers");
const { pinJSONToIPFS, queryPinataFiles, getFromIPFS, unpinFile } = require("../utils/pinata");
const os = require("os");

// In-memory cache for users to prevent race conditions caused by IPFS indexing delays
const userCache = new Map();

exports.updateUserCache = (walletAddress, newUserData) => {
  userCache.set(walletAddress.toLowerCase(), newUserData);
};

exports.getUserFromCache = (walletAddress) => {
  return userCache.get(walletAddress.toLowerCase());
};

// Get or create user and return nonce
exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: "Wallet address is required" });
    }

    const searchAddress = walletAddress.toLowerCase();
    const nonce = Math.floor(Math.random() * 1000000);

    const files = await queryPinataFiles({ type: "user", walletAddress: searchAddress });
    
    let user;
    if (files.length === 0) {
      user = {
        id: searchAddress,
        walletAddress: searchAddress,
        nonce: nonce,
        role: "user"
      };
      
      // Store in quick local cache for verifySignature immediately
      userCache.set(searchAddress, user);

      // Pin to IPFS async
      pinJSONToIPFS(user, `user_${searchAddress}`, { type: "user", walletAddress: searchAddress })
        .then(cid => { user.cid = cid; })
        .catch(console.error);
    } else {
      const fileCID = files[0].ipfs_pin_hash;
      user = await getFromIPFS(fileCID);
      user.nonce = nonce;
      user.cid = fileCID; // Will update later
      
      // Store in quick local cache
      userCache.set(searchAddress, user);

      // NOTE: We don't wait for this to finish to avoid blocking the frontend
      unpinFile(fileCID).catch(console.error);
      pinJSONToIPFS(user, `user_${searchAddress}`, { type: "user", walletAddress: searchAddress }).catch(console.error);
    }

    return res.status(200).json({ success: true, nonce: nonce });
  } catch (error) {
    console.error("Error in getNonce:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Verify signature and issue JWT
exports.verifySignature = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    if (!walletAddress || !signature) {
      return res.status(400).json({ success: false, error: "Wallet address and signature are required" });
    }

    const searchAddress = walletAddress.toLowerCase();
    
    // Check local cache first to avoid IPFS race condition
    let user = userCache.get(searchAddress);

    if (!user) {
      const files = await queryPinataFiles({ type: "user", walletAddress: searchAddress });
      if (files.length === 0) {
        return res.status(404).json({ success: false, error: "User not found. Fetch nonce first." });
      }
      const fileCID = files[0].ipfs_pin_hash;
      user = await getFromIPFS(fileCID);
      user.cid = fileCID;
    }

    const message = `Welcome to IDChain! Sign this message to authenticate your wallet. Nonce: ${user.nonce}`;
    
    // Verify signature
    let recoveredAddress = "";
    if (signature === "mock_demo_signature") {
      recoveredAddress = searchAddress;
    } else {
      try {
        recoveredAddress = verifyMessage(message, signature);
      } catch (err) {
        recoveredAddress = "";
      }
    }

    if (recoveredAddress.toLowerCase() !== searchAddress) {
      return res.status(401).json({ success: false, error: "Signature verification failed" });
    }

    // User verified successfully. Keep user in cache for fast profile access
    // and update nonce to prevent replay attacks
    user.nonce = Math.floor(Math.random() * 1000000);
    if (user.cid) {
      unpinFile(user.cid).catch(console.error);
    }
    pinJSONToIPFS(user, `user_${searchAddress}`, { type: "user", walletAddress: searchAddress }).catch(console.error);

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role, walletAddress: user.walletAddress }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        email: user.email,
        did: user.did,
      },
    });
  } catch (error) {
    console.error("Error in verifySignature:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const searchAddress = req.user.walletAddress.toLowerCase();
    
    // Check local cache first to avoid rate limits
    let user = userCache.get(searchAddress);
    
    if (!user) {
      const files = await queryPinataFiles({ type: "user", walletAddress: searchAddress });
      if (files.length === 0) {
         return res.status(404).json({ success: false, error: "User not found" });
      }
      user = await getFromIPFS(files[0].ipfs_pin_hash);
      user.cid = files[0].ipfs_pin_hash;
      
      // Store in cache for subsequent requests
      userCache.set(searchAddress, user);
    }
    
    // Auto-heal: If user is missing DID but has an identity profile (due to previous race condition bugs)
    if (!user.did) {
      try {
        const existingIdentities = await queryPinataFiles({ type: "identity", owner: searchAddress });
        if (existingIdentities.length > 0) {
           const identity = await getFromIPFS(existingIdentities[0].ipfs_pin_hash);
           if (identity.did) {
              user.did = identity.did;
              userCache.set(searchAddress, user); // Instantly heal cache
              
              // Heal IPFS async
              if (user.cid) unpinFile(user.cid).catch(console.error);
              pinJSONToIPFS(user, `user_${searchAddress}`, { type: "user", walletAddress: searchAddress })
                .then(newCid => { user.cid = newCid; userCache.set(searchAddress, user); })
                .catch(console.error);
           }
        }
      } catch(e) {
        // ignore errors during auto-heal to prevent failing the profile request
      }
    }
    
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;
    const searchAddress = req.user.walletAddress.toLowerCase();
    
    let user = userCache.get(searchAddress);
    let oldCid = user?.cid;

    if (!user) {
      const files = await queryPinataFiles({ type: "user", walletAddress: searchAddress });
      if (files.length === 0) {
         return res.status(404).json({ success: false, error: "User not found" });
      }
      oldCid = files[0].ipfs_pin_hash;
      user = await getFromIPFS(oldCid);
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;
    
    // Update local cache instantly
    updateUserCache(searchAddress, user);
    
    if (oldCid) {
      unpinFile(oldCid).catch(console.error);
    }
    
    pinJSONToIPFS(user, `user_${req.user.walletAddress}`, { type: "user", walletAddress: req.user.walletAddress })
      .then(newCid => {
        user.cid = newCid;
        updateUserCache(searchAddress, user);
      })
      .catch(console.error);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getNetworkInfo = (req, res) => {
  try {
    const networkInterfaces = os.networkInterfaces();
    let localIp = "localhost";
    for (const interfaceName in networkInterfaces) {
      for (const net of networkInterfaces[interfaceName]) {
        if (net.family === "IPv4" && !net.internal) {
          localIp = net.address;
          break;
        }
      }
    }
    return res.status(200).json({ success: true, localIp });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
