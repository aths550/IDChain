const express = require("express");
const router = express.Router();
const {
  requestAccess,
  grantAccess,
  revokeAccess,
  getUserPermissions,
  getVerifierAccesses,
  verifyIdentityByQR,
  approveVerifier,
  getAdminOverview,
  getActivityLogs,
} = require("../controllers/verifyController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/request", protect, requestAccess);
router.post("/grant", protect, grantAccess);
router.post("/revoke", protect, revokeAccess);
router.get("/permissions", protect, getUserPermissions);
router.get("/verifier-access", protect, getVerifierAccesses);
router.post("/qr-verify", protect, verifyIdentityByQR);
router.get("/public-verify/:did", verifyIdentityByQR);
router.get("/logs", protect, getActivityLogs);

// Admin-only routes
router.post("/admin/approve", protect, authorize("admin"), approveVerifier);
router.get("/admin/overview", protect, authorize("admin"), getAdminOverview);

module.exports = router;
