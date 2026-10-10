require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const BASE = "http://localhost:3000";

const getCookie = (res) => res.headers.getSetCookie()[0].split(";")[0];

const form = (path, data) =>
  fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data),
    redirect: "manual",
  });

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const doctor = await User.findOne({ email: "doctor@clinic.com" });
  await mongoose.disconnect();

  const email = `patient${Date.now()}@test.com`;
  const patientCookie = getCookie(
    await form("/register", { name: "Test Patient", email, password: "123456" })
  );
  const doctorCookie = getCookie(
    await form("/login", { email: "doctor@clinic.com", password: "doctor123" })
  );

  // 1. Token book
  const bookRes = await fetch(BASE + "/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: patientCookie },
    body: JSON.stringify({ doctorId: doctor._id }),
    redirect: "manual",
  });
  const token = await bookRes.json();
  console.log("1. Token booked: number", token.number, "| status", token.status);

  // 2. 10 claim requests quickly (only one should succeed, rest should get 409)
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      fetch(`${BASE}/tokens/${token._id}/claim`, {
        method: "PATCH",
        headers: { Cookie: doctorCookie },
        redirect: "manual",
      })
    )
  );
  const codes = results.map((r) => r.status);
  console.log("2. Claim responses:", codes.join(", "));
  console.log("   Success (200):", codes.filter((c) => c === 200).length);
  console.log("   Rejected (409):", codes.filter((c) => c === 409).length);

  // 3. Treated
  const treatedRes = await fetch(`${BASE}/tokens/${token._id}/treated`, {
    method: "PATCH",
    headers: { Cookie: doctorCookie },
    redirect: "manual",
  });
  const treated = await treatedRes.json();
  console.log("3. Final status:", treated.status);
})();