const Court = require("../../models/court.model");

/*
 * Create a new court.
 * Expected payload in req.body:
 *   - name: The court name (required).
 *   - status: The court status (optional, defaults to 'available').
 */
exports.createCourt = async (req, res) => {
  const { name, status } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Court name is required" });
  }
  try {
    const newCourt = new Court({
      name,
      status: status || "available", // Default status if not provided.
    });
    await newCourt.save();
    res
      .status(201)
      .json({ message: "Court created successfully", court: newCourt });
  } catch (err) {
    res.status(500).json({ message: "Error creating court", error: err });
  }
};

/*
 * Update an existing court.
 * Route parameter: courtId
 * Expected payload in req.body: Fields to update (e.g., name, status).
 */
exports.updateCourt = async (req, res) => {
  const { courtId } = req.params;
  const updateData = req.body;
  try {
    const updatedCourt = await Court.findByIdAndUpdate(courtId, updateData, {
      new: true,
    });
    if (!updatedCourt) {
      return res.status(404).json({ message: "Court not found" });
    }
    res
      .status(200)
      .json({ message: "Court updated successfully", court: updatedCourt });
  } catch (err) {
    res.status(500).json({ message: "Error updating court", error: err });
  }
};

/*
 * Retrieve all courts.
 */
exports.getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find();
    res.status(200).json(courts);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving courts", error: err });
  }
};

/*
 * Delete a court.
 * Route parameter: courtId
 */
exports.deleteCourt = async (req, res) => {
  const { courtId } = req.params;
  try {
    const deletedCourt = await Court.findByIdAndDelete(courtId);
    if (!deletedCourt) {
      return res.status(404).json({ message: "Court not found" });
    }
    res
      .status(200)
      .json({ message: "Court deleted successfully", deletedCourt });
  } catch (err) {
    res.status(500).json({ message: "Error deleting court", error: err });
  }
};
