// jobs/clearStaleLocks.js
const Slot = require("../models/slot.model");

const clearStaleLocks = async () => {
  try {
    const timeoutMinutes = 1; //minutes
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const result = await Slot.updateMany(
      {
        isLocked: true,
        lockedAt: { $lt: cutoffTime },
      },
      {
        $set: {
          isLocked: false,
          lockedAt: null,
        },
      }
    );

    console.log(
      `[${new Date().toISOString()}] Cleared ${result.modifiedCount} stale slot locks`
    );
  } catch (err) {
    console.error("Error clearing stale locks:", err);
  }
};

module.exports = clearStaleLocks;
