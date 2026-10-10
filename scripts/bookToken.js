require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const BASE = "http://localhost:3000";

const getCookie = (res) => res.headers.getSetCookie()[0].split(";")[0];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const doctor = await User.findOne({ email: "doctor@clinic.com" });
  await mongoose.disconnect();

  // new patient register
  const email = `patient${Date.now()}@test.com`;
  const regRes = await fetch(BASE + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: "Test Patient", email, password: "123456" }),
    redirect: "manual",
  });
  const patientCookie = getCookie(regRes);

  // Token book 
  const bookRes = await fetch(BASE + "/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: patientCookie },
    body: JSON.stringify({ doctorId: doctor._id }),
    redirect: "manual",
  });
  const token = await bookRes.json();
  console.log("Token booked: number", token.number, "| status", token.status);
  console.log("Doctor id:", doctor._id.toString());
})();