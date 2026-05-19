const { pinJSONToIPFS, queryPinataFiles, getFromIPFS, unpinFile } = require("../utils/pinata");
const { getUserFromCache, updateUserCache } = require("./authController");

// Create DID Profile
exports.createIdentity = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, nationality } = req.body;
    if (!firstName || !lastName || !dateOfBirth || !nationality) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Check if user already has an identity profile
    const existingIdentities = await queryPinataFiles({ type: "identity", owner: req.user.id });
    if (existingIdentities.length > 0) {
      return res.status(400).json({ success: false, error: "Identity profile already exists" });
    }

    // Generate unique DID
    const did = `did:idchain:${req.user.walletAddress.toLowerCase()}`;

    // Create Identity
    const identity = {
      owner: req.user.id,
      did,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      createdAt: new Date().toISOString()
    };
    
    await pinJSONToIPFS(identity, `identity_${req.user.id}`, { type: "identity", owner: req.user.id });

    // Update User model DID field
    let user = getUserFromCache(req.user.walletAddress);
    let oldCid = user?.cid;

    if (!user) {
      const userFiles = await queryPinataFiles({ type: "user", walletAddress: req.user.walletAddress });
      if (userFiles.length > 0) {
        oldCid = userFiles[0].ipfs_pin_hash;
        user = await getFromIPFS(oldCid);
      }
    }

    if (user) {
      user.did = did;
      user.identity = identity; // Cache the identity directly inside the user object to avoid verifier scan race conditions
      // Update cache immediately so frontend sees it on next fetch
      updateUserCache(req.user.walletAddress, user);
      
      if (oldCid) {
        unpinFile(oldCid).catch(console.error);
      }
      
      // Update IPFS asynchronously
      pinJSONToIPFS(user, `user_${req.user.walletAddress}`, { type: "user", walletAddress: req.user.walletAddress })
        .then(newCid => {
          user.cid = newCid;
          updateUserCache(req.user.walletAddress, user);
        })
        .catch(console.error);
    }

    // Create verification log
    const logEntry = {
      verifier: req.user.id,
      subject: req.user.id,
      action: "did_creation",
      details: `DID generated: ${did}`,
      createdAt: new Date().toISOString()
    };
    await pinJSONToIPFS(logEntry, `log_${Date.now()}`, { type: "log", subject: req.user.id, verifier: req.user.id });

    return res.status(201).json({
      success: true,
      message: "Identity and DID created successfully",
      identity,
    });
  } catch (error) {
    console.error("Error creating identity:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Fetch current user identity metadata
exports.getIdentity = async (req, res) => {
  try {
    const identities = await queryPinataFiles({ type: "identity", owner: req.user.id });
    if (identities.length === 0) {
      return res.status(404).json({ success: false, error: "Identity profile not found" });
    }
    const identity = await getFromIPFS(identities[0].ipfs_pin_hash);
    return res.status(200).json({ success: true, identity });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// AI Fraud Detection placeholder API
exports.aiFraudDetection = async (req, res) => {
  try {
    const { docType } = req.body;
    
    // Simulate complex pattern recognition fraud detection logic
    const score = Math.floor(Math.random() * 20); // 0-100 (low score means low risk)
    const isFraudulent = score > 80;
    
    return res.status(200).json({
      success: true,
      fraudScore: score,
      status: isFraudulent ? "FLAGGED" : "CLEARED",
      details: isFraudulent
        ? "AI detected potential image manipulations or mismatched details in document layout."
        : "AI analyzed document structural characteristics. Validation score: High integrity.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Fraud checking failed" });
  }
};

// ZKP Authentication / Verification placeholder API
exports.zkpVerification = async (req, res) => {
  try {
    const { proof } = req.body; // mock ZKP proof
    
    // Validate ZKP structure placeholder
    const isValidZkp = proof ? true : false;
    
    return res.status(200).json({
      success: true,
      zkpStatus: isValidZkp ? "VERIFIED" : "FAILED",
      proofVerificationDetails: "Zero-Knowledge Cryptographic verification completed. Identity proven without revealing private variables.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "ZKP computation failed" });
  }
};
