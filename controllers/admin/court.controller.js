const CourtService = require("../../services/admin/court.service");
const {
  successResponse,
  errorResponse,
} = require("../../util/responses/apiResponse");

/*
 * Create a new court.
 * Expected payload in req.body:
 *   - name: The court name (required).
 *   - status: The court status (optional, defaults to 'available').
 */

exports.createCourt = async (req, res) => {
  const { name, status } = req.body;
  if (!name) {
    return errorResponse(res, "Court name is required", 400);
  }
  try {
    const court = await CourtService.createCourt({ name, status });
    return successResponse(res, "Court created successfully", { court });
  } catch (err) {
    return errorResponse(res, "Error creating court", 500, err.message);
  }
};

/*
 * Update an existing court.
 * Route parameter: courtId
 * Expected payload in req.body: Fields to update (e.g., name, status).
 */
exports.updateCourt = async (req, res) => {
  try {
    const court = await CourtService.updateCourt(req.params.courtId, req.body);
    if (!court) return errorResponse(res, `Court ID: ${req.params.courtId} not found`, 404);
    return successResponse(res, "Court updated successfully", { court });
  } catch (err) {
    return errorResponse(res, "Error updating court", 500, err.message);
  }
};

/*
 * Retrieve all courts.
 */
exports.getAllCourts = async (req, res) => {
  try {
    const courts = await CourtService.getAllCourts();
    return successResponse(res, "Fetched courts", { courts });
  } catch (err) {
    return errorResponse(res, "Error retrieving courts", 500, err.message);
  }
};

/*
 * Delete a court.
 * Route parameter: courtId
 */
exports.deleteCourt = async (req, res) => {
  try {
    const court = await CourtService.deleteCourt(req.params.courtId);
    if (!court) return errorResponse(res, "Court not found", 404);
    return successResponse(res, "Court deleted successfully", { court });
  } catch (err) {
    return errorResponse(res, "Error deleting court", 500, err.message);
  }
};
