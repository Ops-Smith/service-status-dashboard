const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: 100
    },
    environment: {
      type: String,
      required: [true, "Environment is required"],
      trim: true,
      maxlength: 50
    },
    url: {
      type: String,
      required: [true, "Service URL is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["healthy", "degraded", "down"],
      default: "healthy"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
