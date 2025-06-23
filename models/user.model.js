const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserRole = require("../enums/useRole");
// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "User Email is required"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
      minLength: 3, //later change it to 6
    },
    mobile_number: {
      type: String,
      unique: [true, "Mobile number must be unique"],
      sparse: true, //allow multiple null values
      match: /^[0-9]{10}$/,
      default: "",
    },
    membership_status: {
      type: String,
      enum: ["active", "expired", "none"],
      default: "none",
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    profileImageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// //pre save hook to generate name if not provided
userSchema.pre("validate", function (next) {
  if (!this.name && this.email) {
    this.name = this.email.split("@")[0];
  }
  next();
});

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

//compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
