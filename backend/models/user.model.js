import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // User Name
    // ==========================================
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: [50, "Name should be less than 50 characters"],
      trim: true,
    },

    // ==========================================
    // User Email
    // ==========================================
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
      index: true,
    },

    // ==========================================
    // User Password
    // ==========================================
    // Password database mein hashed form mein save hoga
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },

    // ==========================================
    // Profile Photo
    // ==========================================
    profilePhoto: {
      type: String,
      default: "",
    },

    // ==========================================
    // User Status
    // ==========================================
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // ==========================================
    // Email Verification
    // ==========================================

    // false = email verify nahi hua
    // true = email verify ho chuka hai
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // User ke email par bheja gaya OTP
    verificationOTP: {
      type: String,
      default: null,
    },

    // OTP ki expiry date/time
    // Example: OTP 10 minutes ke baad expire ho jayega
    verificationOTPExpires: {
      type: Date,
      default: null,
    },

    // ==========================================
    // User Role
    // ==========================================
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },
  },
  {
    // createdAt aur updatedAt automatically create honge
    timestamps: true,
  }
);

// ==========================================
// Hash Password Before Saving
// ==========================================

userSchema.pre("save", async function () {
  // Agar password change nahi hua,
  // to dobara hash karne ki zarurat nahi hai
  if (!this.isModified("password")) {
    return;
  }

  try {
    // Salt generate karo
    const salt = await bcrypt.genSalt(10);

    // Password ko hash karo
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("PASSWORD HASHING ERROR:", error);

    // Error ko controller tak bhejo
    throw new Error("Failed to hash password");
  }
});

// ==========================================
// Compare Password
// ==========================================

// Login ke time entered password ko
// database wale hashed password se compare karega
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ==========================================
// Create User Model
// ==========================================

const User = mongoose.model("User", userSchema);

export default User;