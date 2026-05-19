const { pinJSONToIPFS, queryPinataFiles, getFromIPFS, unpinFile } = require("../utils/pinata");
const { getUserFromCache, updateUserCache } = require("./authController");

// Verifier requests document access
exports.requestAccess = async (req, res) => {
  try {
    const { userId, documentIds } = req.body;
    if (!userId || !documentIds || documentIds.length === 0) {
      return res.status(400).json({ success: false, error: "User ID and Document IDs are required" });
    }

    const permission = {
      id: `perm_${Date.now()}`,
      owner: userId,
      verifier: req.user.id,
      allowedDocuments: documentIds,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    await pinJSONToIPFS(permission, `perm_${req.user.id}_${userId}`, { type: "permission", owner: userId, verifier: req.user.id, status: "pending" });

    const logEntry = {
      verifier: req.user.id,
      subject: userId,
      action: "access_request",
      details: "Requested permission to view documents",
      createdAt: new Date().toISOString()
    };
    await pinJSONToIPFS(logEntry, `log_${Date.now()}`, { type: "log", subject: userId, verifier: req.user.id });

    return res.status(201).json({ success: true, permission });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// User grants/approves access request
exports.grantAccess = async (req, res) => {
  try {
    const { permissionId, expiryHours } = req.body; // Using the Pinata CID as permissionId here
    if (!permissionId) {
      return res.status(400).json({ success: false, error: "Permission ID (CID) is required" });
    }

    const permission = await getFromIPFS(permissionId);
    permission.status = "granted";
    permission.expiresAt = expiryHours ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString() : null;

    await unpinFile(permissionId);
    const newCid = await pinJSONToIPFS(permission, `perm_${permission.owner}_${permission.verifier}`, { type: "permission", owner: permission.owner, verifier: permission.verifier, status: "granted" });

    const logEntry = {
      verifier: permission.verifier,
      subject: req.user.id,
      action: "grant_access",
      details: `Granted document access. Expires in: ${expiryHours || "Never"}`,
      createdAt: new Date().toISOString()
    };
    await pinJSONToIPFS(logEntry, `log_${Date.now()}`, { type: "log", subject: req.user.id, verifier: permission.verifier });

    return res.status(200).json({ success: true, permission: { ...permission, _id: newCid } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// User revokes document access
exports.revokeAccess = async (req, res) => {
  try {
    const { permissionId } = req.body; // Using the Pinata CID as permissionId
    if (!permissionId) {
      return res.status(400).json({ success: false, error: "Permission ID (CID) is required" });
    }

    const permission = await getFromIPFS(permissionId);
    permission.status = "revoked";

    await unpinFile(permissionId);
    const newCid = await pinJSONToIPFS(permission, `perm_${permission.owner}_${permission.verifier}`, { type: "permission", owner: permission.owner, verifier: permission.verifier, status: "revoked" });

    const logEntry = {
      verifier: permission.verifier,
      subject: req.user.id,
      action: "revoke_access",
      details: "Revoked document access",
      createdAt: new Date().toISOString()
    };
    await pinJSONToIPFS(logEntry, `log_${Date.now()}`, { type: "log", subject: req.user.id, verifier: permission.verifier });

    return res.status(200).json({ success: true, permission: { ...permission, _id: newCid } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get pending and active permission requests for the logged in user
exports.getUserPermissions = async (req, res) => {
  try {
    const files = await queryPinataFiles({ type: "permission", owner: req.user.id });
    const permissions = await Promise.all(
      files.map(async (file) => {
        const perm = await getFromIPFS(file.ipfs_pin_hash);
        perm._id = file.ipfs_pin_hash; // Attach CID to be used as ID
        return perm;
      })
    );
    return res.status(200).json({ success: true, permissions });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get verifier dashboard permissions (requests they sent)
exports.getVerifierAccesses = async (req, res) => {
  try {
    const files = await queryPinataFiles({ type: "permission", verifier: req.user.id, status: "granted" });
    const accesses = await Promise.all(
      files.map(async (file) => {
        const access = await getFromIPFS(file.ipfs_pin_hash);
        access._id = file.ipfs_pin_hash;
        return access;
      })
    );
    return res.status(200).json({ success: true, accesses });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// QR Verification: Verifier verifies scanned QR profile
exports.verifyIdentityByQR = async (req, res) => {
  try {
    const did = req.params.did || req.body.did;
    if (!did) {
      return res.status(400).json({ success: false, error: "DID is required" });
    }

    // Extract wallet from DID: did:idchain:<wallet>
    const wallet = did.split(":").pop().toLowerCase();
    
    // Check local cache first to avoid index delays
    let user = getUserFromCache(wallet);
    
    if (!user) {
      const userFiles = await queryPinataFiles({ type: "user", walletAddress: wallet });
      if (userFiles.length === 0) {
        return res.status(404).json({ success: false, error: "User identity with this DID not found" });
      }
      user = await getFromIPFS(userFiles[0].ipfs_pin_hash);
      user.cid = userFiles[0].ipfs_pin_hash;
      updateUserCache(wallet, user);
    }

    // Check if identity is cached directly inside the user object
    let identity = user.identity;
    
    if (!identity) {
      const identityFiles = await queryPinataFiles({ type: "identity", owner: user.id });
      identity = identityFiles.length > 0 ? await getFromIPFS(identityFiles[0].ipfs_pin_hash) : null;
      if (identity) {
        user.identity = identity;
        updateUserCache(wallet, user);
      }
    }
    
    const docFiles = await queryPinataFiles({ type: "document", owner: user.id });
    // In IPFS we might not easily filter by isVerified, so we just return count of all uploaded for now
    
    const verifierId = req.user ? req.user.id : "public_scan";
    const logEntry = {
      verifier: verifierId,
      subject: user.id,
      action: "qr_verification",
      details: `Scanned and verified DID: ${did}`,
      createdAt: new Date().toISOString()
    };
    await pinJSONToIPFS(logEntry, `log_${Date.now()}`, { type: "log", subject: user.id, verifier: verifierId });

    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        did: user.did,
      },
      identity,
      verifiedDocumentsCount: docFiles.length, // approximation without smart contract state
    });
  } catch (error) {
    console.error("verifyIdentityByQR error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Admin panel: Approve Verifier application
exports.approveVerifier = async (req, res) => {
  try {
    const { userId } = req.body;
    // Assuming userId is the wallet address or user ID in IPFS
    const files = await queryPinataFiles({ type: "user", walletAddress: userId });
    if (files.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    const fileCID = files[0].ipfs_pin_hash;
    const user = await getFromIPFS(fileCID);
    user.role = "verifier";
    
    await unpinFile(fileCID);
    await pinJSONToIPFS(user, `user_${userId}`, { type: "user", walletAddress: userId });
    
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Admin panel: Get users and logs
exports.getAdminOverview = async (req, res) => {
  try {
    const userFiles = await queryPinataFiles({ type: "user" });
    const identityFiles = await queryPinataFiles({ type: "identity" });
    const docFiles = await queryPinataFiles({ type: "document" });
    const logFiles = await queryPinataFiles({ type: "log" });
    
    const logs = await Promise.all(
      logFiles.slice(0, 50).map(file => getFromIPFS(file.ipfs_pin_hash))
    );

    return res.status(200).json({
      success: true,
      stats: { 
        totalUsers: userFiles.length, 
        verifiedDids: identityFiles.length, 
        documents: docFiles.length 
      },
      logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Fetch verification logs for current user (activity logs)
exports.getActivityLogs = async (req, res) => {
  try {
    // We fetch logs where user is either verifier or subject
    const subjectLogsFiles = await queryPinataFiles({ type: "log", subject: req.user.id });
    const verifierLogsFiles = await queryPinataFiles({ type: "log", verifier: req.user.id });
    
    // Combine and remove duplicates
    const allCids = new Set([...subjectLogsFiles, ...verifierLogsFiles].map(f => f.ipfs_pin_hash));
    
    const logs = await Promise.all(
      Array.from(allCids).map(cid => getFromIPFS(cid))
    );
    
    // Sort descending by date
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
