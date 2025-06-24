const Court = require("../../models/court.model");

// Function to generate daily slots
async function generateDailySlots() {
  try {
    console.log("⏳ Fetching courts...");
    const courts = await Court.find();
    console.log(`📌 Found ${courts.length} courts.`);

    const today = new Date();
    for (let court of courts) {
      await generateSlotsForDay(court._id, today);
    }

    console.log("✅ Daily slot generation completed.");
  } catch (err) {
    console.error("❌ Error during daily slot generation:", err);
  }
}

module.exports = generateDailySlots;
