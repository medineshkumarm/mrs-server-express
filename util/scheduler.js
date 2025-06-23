// scheduler.js
const cron = require("node-cron");
const clearStaleLocks = require("../jobs/clear-locked-slots");
const cancelStaleBookings = require("../jobs/cancelStaleBookings");
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