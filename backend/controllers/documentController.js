const { uploadToIPFS, pinJSONToIPFS, queryPinataFiles, getFromIPFS } = require("../utils/pinata");
const crypto = require("crypto");
const fs = require("fs");

// Upload document controller
exports.uploadDocument = async (req, res) => {
  try {
    const { docType } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Please upload a file" });
    }
    if (!docType) {
      // Remove temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: "Document type is required" });
    }

    // Generate SHA-256 hash of the document for blockchain proof
    const fileBuffer = fs.readFileSync(req.file.path);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    const docHash = hashSum.digest("hex");

    // Upload to Pinata IPFS
    let ipfsHash;
    try {
      ipfsHash = await uploadToIPFS(req.file.path, `${docType}_${Date.now()}`);
    } catch (uploadError) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ success: false, error: "Failed to upload file to IPFS" });
    }

    // Clean up temporary local file
    fs.unlinkSync(req.file.path);

    // Save metadata in Pinata JSON
    const document = {
      owner: req.user.id,
      docType,
      ipfsHash,
      docHash,
      createdAt: new Date().toISOString()
    };
    
    await pinJSONToIPFS(document, `doc_${req.user.id}_${Date.now()}`, { type: "document", owner: req.user.id });

    // Create log
    const logEntry = {
      verifier: req.user.id,
      subject: req.user.id,
      action: "document_upload",
      details: `Document uploaded: ${docType}. IPFS Hash: ${ipfsHash}`,
      createdAt: new Date().toISOString()
    };
    await pinJSONToIPFS(logEntry, `log_${Date.now()}`, { type: "log", subject: req.user.id, verifier: req.user.id });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get current user documents
exports.getMyDocuments = async (req, res) => {
  try {
    const files = await queryPinataFiles({ type: "document", owner: req.user.id });
    const documentPromises = files.map(async (file) => {
      try {
        const doc = await getFromIPFS(file.ipfs_pin_hash);
        return {
          ...doc,
          _id: file.ipfs_pin_hash || file.id,
        };
      } catch (err) {
        console.error(`Failed to fetch document content for CID ${file.ipfs_pin_hash}:`, err.message);
        return null;
      }
    });

    const documents = (await Promise.all(documentPromises)).filter(doc => doc !== null);
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("Error in getMyDocuments:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
