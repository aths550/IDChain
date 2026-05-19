const express = require("express");
const router = express.Router();
const { createIdentity, getIdentity, aiFraudDetection, zkpVerification } = require("../controllers/identityController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createIdentity);
router.get("/", protect, getIdentity);
router.post("/fraud-check", protect, aiFraudDetection);
router.post("/zkp-verify", protect, zkpVerification);

module.exports = router;
