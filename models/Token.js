const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["waiting", "claimed", "treated", "cancelled"],
      default: "waiting",
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    queueDate: { type: String, required: true },
  },
  { timestamps: true }
);

tokenSchema.index({ queueDate: 1, doctor: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Token", tokenSchema);
