require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({ email: "doctor@clinic.com" });
    if (exists) {
      console.log("Doctor already exists:", exists._id.toString());
    } else {
      const doctor = await User.create({
        name: "Dr. Test",
        email: "doctor@clinic.com",
        password: "doctor123",
        role: "doctor",
      });
      console.log("Doctor created:", doctor._id.toString());
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
})();