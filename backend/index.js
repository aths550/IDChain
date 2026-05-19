const express = require("express");

const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const identityRoutes = require("./routes/identityRoutes");
const verifyRoutes = require("./routes/verifyRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/identity", identityRoutes);
app.use("/api/verify", verifyRoutes);

app.get("/", (req, res) => {
  res.send("IDChain Backend API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
