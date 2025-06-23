const Court = require("../../models/court.model");
const CourtStatus = require("../../enums/courtStatus");

class CourtService {
  static async createCourt({ name, status }) {
    const court = new Court({
      name,
      status: status || CourtStatus.AVAILABLE,
    });
    return await court.save();
  }

  static async updateCourt(courtId, updateData) {
    // {new: true} returns the updated object
    return await Court.findByIdAndUpdate(courtId, updateData, { new: true });
  }

  static async getAllCourts() {
    return await Court.find();
  }

  static async deleteCourt(courtId) {
    return await Court.findByIdAndDelete(courtId);
  }
}

module.exports = CourtService;
