const jwt = require("jsonwebtoken");
const { queryPinataFiles, getFromIPFS } = require("../utils/pinata");
const { getUserFromCache, updateUserCache } = require("../controllers/authController");

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check fast local cache first
    let user = getUserFromCache(decoded.walletAddress);
    
    if (!user) {
      const files = await queryPinataFiles({ type: "user", walletAddress: decoded.id });
      if (files.length === 0) {
        return res.status(404).json({ success: false, error: "No user found with this id" });
      }
      user = await getFromIPFS(files[0].ipfs_pin_hash);
      user.cid = files[0].ipfs_pin_hash;
      updateUserCache(decoded.walletAddress, user);
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("AuthMiddleware Error:", err);
    return res.status(401).json({ success: false, error: "Not authorized to access this route" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};
