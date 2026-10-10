const User = require("../models/User");
const { sendBookingMail } = require("../utils/mailer");
const Token = require("../models/Token");
const { redisClient } = require("../config/redis");

// Aajchi date (India time), format: 2026-10-05
const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const fetchQueue = (doctorId) =>
  Token.find({
    doctor: doctorId,
    queueDate: today(),
    status: { $in: ["waiting", "claimed"] },
  })
    .populate("patient", "name")
    .sort({ number: 1 });

const broadcastQueue = async (req, doctorId) => {
  const io = req.app.get("io");
  const queue = await fetchQueue(doctorId);
  io.to(`doctor:${doctorId}`).emit("queue:update", queue);
};

// Patient: token book kara
exports.bookToken = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const queueDate = today();

    // Redis INCR atomic aahe: don patients la same number milnar nahi
    const key = `token:${doctorId}:${queueDate}`;
    const number = await redisClient.incr(key);
    if (number === 1) await redisClient.expire(key, 60 * 60 * 48);

    const token = await Token.create({
      number,
      patient: req.user._id,
      doctor: doctorId,
      queueDate,
    });

    await broadcastQueue(req, doctorId);
        // Mail pathav (await nahi: mail la vel lagla tari response thambat nahi)
    const doctor = await User.findById(doctorId).select("name");
    sendBookingMail({
      to: req.user.email,
      name: req.user.name,
      number: token.number,
      doctorName: doctor ? doctor.name : "Doctor",
    });
    
    res.status(201).json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
     
// Doctor cha aajcha queue
exports.getQueue = async (req, res) => {
  try {
    const tokens = await Token.find({
      doctor: req.params.doctorId,
      queueDate: today(),
      status: { $in: ["waiting", "claimed"] },
    })
      .populate("patient", "name")
      .sort({ number: 1 });

    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor: token claim kara (atomic)
exports.claimToken = async (req, res) => {
  try {
    const token = await Token.findOneAndUpdate(
      { _id: req.params.id, status: "waiting" }, // condition
      { $set: { status: "claimed", claimedBy: req.user._id } },
      { new: true }
    );

    if (!token) {
      return res.status(409).json({ error: "Token already claimed or not found" });
    }
    await broadcastQueue(req, token.doctor);
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor: treated mark kara (fakt tyani claim kelela token)
exports.markTreated = async (req, res) => {
  try {
    const token = await Token.findOneAndUpdate(
      { _id: req.params.id, status: "claimed", claimedBy: req.user._id },
      { $set: { status: "treated" } },
      { new: true }
    );

    if (!token) {
      return res.status(409).json({ error: "Token not in claimed state" });
    }
    await broadcastQueue(req, token.doctor);
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};