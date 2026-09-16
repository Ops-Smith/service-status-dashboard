const mongoose = require("mongoose");

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID"
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(error => error.message);

    return res.status(400).json({
      success: false,
      message: messages.join(", ")
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}

module.exports = errorHandler;
