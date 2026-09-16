const express = require("express");
const Service = require("../models/Service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, environment, url, status } = req.body;

    if (!name || !environment || !url) {
      return res.status(400).json({
        success: false,
        message: "Name, environment and URL are required"
      });
    }

    const service = await Service.create({
      name,
      environment,
      url,
      status
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
