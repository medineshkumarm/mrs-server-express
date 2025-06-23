const mongoose = require("mongoose");
const CourtStatus= require("../enums/courtStatus");
const courtSchema = new mongoose.Schema({
  name: {
    type: String, // eg; Court 1 , Court 2 etc...
    required: [true, "Provide Court Name"],
    unique: [true, "Court Name must be unique"],
  },
  // imageUrl: String,
  // hourlyRate: { type: Number, required: true }
  status: {
    type: String,
    enum: Object.values(CourtStatus),
    default: CourtStatus.AVAILABLE,
  },
});

const Court = mongoose.model("Court", courtSchema);
module.exports = Court;
