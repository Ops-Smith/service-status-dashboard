const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const serviceRoutes = require("./routes/services");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "service-status-dashboard-api",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service Status Dashboard API",
    endpoints: {
      health: "GET /health",
      services: "GET /api/services",
      createService: "POST /api/services",
      getService: "GET /api/services/:id",
      updateService: "PUT /api/services/:id",
      deleteService: "DELETE /api/services/:id"
    }
  });
});

app.use("/api/services", serviceRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
