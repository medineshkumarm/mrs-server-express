require("dotenv").config();

const mongoose = require("mongoose");
const cron = require("node-cron");
const Court = require("../models/court.model");
const { generateSlotsForDay } = require("../helper/generateSlotsForDay ");
const connectDB = require("../config/db");

// Function to generate daily slots
async function generateDailySlots() {
  try {
    await connectDB();

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
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
}

  console.log(" Running  slot generation...");
  generateDailySlots();


// 🔄 **Schedule the cron job to run daily at 12:05 AM**
cron.schedule("5 0 * * *", async () => {
  console.log("🕛 Running daily slot generation...");
  await generateDailySlots();
});

// Keep the process running
console.log("✅ Cron job scheduled: Daily at 12:05 AM.");

