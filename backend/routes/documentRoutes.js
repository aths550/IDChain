const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadDocument, getMyDocuments } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");
const path = require("path");

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png) and PDF documents are allowed"));
    }
  },
});

router.post("/upload", protect, upload.single("document"), uploadDocument);
router.get("/my-documents", protect, getMyDocuments);

module.exports = router;
