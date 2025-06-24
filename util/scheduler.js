const cron = require("node-cron");
const clearStaleLocks = require("../jobs/clear-locked-slots");
const cancelStaleBookings = require("../jobs/cancelStaleBookings");
const { generateDailySlots } = require("../services/cron/slotGenerator");

// Run every 1 minutes
cron.schedule("*/1 * * * *", () => {
  console.log("Running stale lock cleanup...");
  clearStaleLocks();
});

// Cancel unpaid bookings every 2 minutes
cron.schedule("*/1 * * * *", () => {
  console.log("Running stale booking cancellation...");
  cancelStaleBookings();
});

// 🔄 Schedule the cron job to run daily at 12:05 AM
console.log("📅 Scheduling slot generation cron: Runs daily at 12:05 AM...");
cron.schedule("5 0 * * *", async () => {
  console.log("🕛 Running daily slot generation...");
  await generateDailySlots();
});
