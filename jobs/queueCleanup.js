const cron = require("node-cron");
const Token = require("../models/Token");

const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const startQueueCleanup = () => {
  
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const result = await Token.updateMany(
          { queueDate: { $lt: today() }, status: { $in: ["waiting", "claimed"] } },
          { $set: { status: "cancelled" } }
        );
        console.log(`Cron: ${result.modifiedCount} old tokens cancelled`);
      } catch (err) {
        console.error("Cron failed:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
  console.log("Queue cleanup cron scheduled");
};

module.exports = startQueueCleanup;