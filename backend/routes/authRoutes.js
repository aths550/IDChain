const express = require("express");
const router = express.Router();
const { getNonce, verifySignature, getProfile, updateProfile, getNetworkInfo } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.get("/nonce/:walletAddress", getNonce);
router.post("/verify", verifySignature);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/network-info", getNetworkInfo);

module.exports = router;
