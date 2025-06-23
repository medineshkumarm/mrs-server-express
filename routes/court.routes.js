// const express = require("express");
// const router = express.Router();
// const { authorize } = require("../middlewares/auth.middleware");
// const courtController = require("../controllers/admin/court.controller");
// const Court = require("../models/court.model");
// const Slot = require("../models/slot.model");

// // Get all available courts (public route)
// router.get("/courts", courtController.getAllCourts);

// // Get court details by ID (public route)
// router.get("/courts/:courtId", async (req, res) => {
//   try {
//     const court = await Court.findById(req.params.courtId);
//     if (!court) {
//       return res.status(404).json({ message: "Court not found" });
//     }
//     res.status(200).json(court);
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving court", error });
//   }
// });

// // Search courts by location or name (public route)
// router.get("/courts/search", async (req, res) => {
//   try {
//     const { query } = req.query;
//     const courts = await Court.find({
//       $or: [
//         { name: { $regex: query, $options: "i" } },
//         { location: { $regex: query, $options: "i" } }
//       ]
//     });
//     res.status(200).json(courts);
//   } catch (error) {
//     res.status(500).json({ message: "Error searching courts", error });
//   }
// });

// // Get court availability for a specific date
// router.get("/courts/:courtId/availability", authorize, async (req, res) => {
//   try {
//     const { date } = req.query;
//     const slots = await Slot.find({
//       courtId: req.params.courtId,
//       date: new Date(date),
//       status: "available"
//     }).sort({ startTime: 1 });
//     res.status(200).json(slots);
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving availability", error });
//   }
// });

// module.exports = router;