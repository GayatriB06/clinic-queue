require("dotenv").config();
const mongoose = require("mongoose");
const Token = require("../models/Token");
const User = require("../models/User");

const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database:", mongoose.connection.name, "| today:", today());

  const doctor = await User.findOne({ email: "doctor@clinic.com" });

  
  const old = await Token.create({
    number: 999,
    patient: doctor._id,
    doctor: doctor._id,
    queueDate: "2020-01-01",
    status: "waiting",
  });
  console.log("Test token created:", old._id.toString(), "| status:", old.status);

  // Same query that previously used in the cron job
  const result = await Token.updateMany(
    { queueDate: { $lt: today() }, status: { $in: ["waiting", "claimed"] } },
    { $set: { status: "cancelled" } }
  );
  console.log("modifiedCount:", result.modifiedCount);

  const after = await Token.findById(old._id);
  console.log("Test token status after cron:", after.status);

  await Token.deleteOne({ _id: old._id });
  console.log("Test token deleted");

  await mongoose.disconnect();
})();