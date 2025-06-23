const SlotService = require("../../services/admin/slot.service");

const {
  successResponse,
  errorResponse,
} = require("../../util/responses/apiResponse");

/*
 * Get all slots (Admin view)
    Get all slots:
    GET /api/slots

    Filter by date:
    GET /api/slots?date=2025-06-08

    Filter by courtId:
    GET /api/slots?courtId=64f9a1e8abc12345

    Filter by date and courtId:
    GET /api/slots?date=2025-06-08&courtId=64f9a1e8abc12345
 */
exports.getSlots = async (req, res) => {
  try {
    const { date, courtId } = req.query;
    const slots = await SlotService.getSlots({ date, courtId });
    if (!slots) return errorResponse(res, "No slots found", 404);
    return successResponse(res, "Slots retrieved successfully", { slots });
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

/*
 * Update a slot (change availability, etc.)
 * Route Parameter: slotId
 */
exports.updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const updateData = req.body;
    const updatedSlot = await SlotService.updateSlot(slotId, updateData);
    if (!updatedSlot)
      return errorResponse(res, `Slot ID: ${slotId} not found`, 404);
    return successResponse(res, "Slot updated successfully", {
      slot: updatedSlot,
    });
  } catch (err) {
    return errorResponse(res, "Error updating slot", 500, err.message);
  }
};

/*
 * Delete a slot
 * Route Parameter: slotId
 */
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const deletedSlot = await SlotService.deleteSlot(slotId);
    if (!deletedSlot)
      return errorResponse(res, `Slot ID: ${slotId} not found`, 404);
    return successResponse(res, "Slot deleted successfully", { deletedSlot });
  } catch (err) {
    return errorResponse(res, "Error deleting slot", 500, err.message);
  }
};

/*
 * Create slots for a court (e.g., 30-minute slots from 6 AM - 10 PM)
 * Route Parameter: courtId
 */
// exports.createSlotsForCourt = async (req, res) => {
//   try {
//     const { courtId } = req.params;
//     const { date, startTime, endTime, interval } = req.body;
//     const slots = await SlotService.createSlotsForCourt({
//       courtId,
//       date,
//       startTime,
//       endTime,
//       interval,
//     });
//     return successResponse(res, "Slots created successfully", { slots });
//   } catch (err) {
//     return errorResponse(res, err.message, 400);
//   }
// };
