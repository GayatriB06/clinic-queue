const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["patient", "admin","doctor"],
    default: "patient",
  },
},{timestamps: true}
);


//hashing the password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
  });

  //comparing the password during login
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};


module.exports = mongoose.model("User", userSchema);