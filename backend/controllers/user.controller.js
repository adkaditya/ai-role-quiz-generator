import User from "../models/user.model.js";

// Update profile details (Name/Email)
export const updateProfile = async (req, resp) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return resp.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return resp.status(409).json({ message: "Email is already in use by another account" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    return resp.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: req.user.role.name,
          profilePhoto: user.profilePhoto,
          avatar: user.profilePhoto, // for frontend compatibility
        },
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Update profile avatar image
export const updateAvatar = async (req, resp) => {
  try {
    if (!req.file) {
      return resp.status(400).json({ message: "Please upload a file" });
    }

    const userId = req.user._id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: avatarUrl },
      { new: true, runValidators: true }
    );

    return resp.status(200).json({
      status: "success",
      message: "Avatar uploaded successfully",
      data: {
        profilePhoto: user.profilePhoto,
        avatar: user.profilePhoto, // for frontend compatibility
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Update password
export const updatePassword = async (req, resp) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return resp.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return resp.status(401).json({ message: "Invalid old password" });
    }

    // Hash and save new password
    user.password = newPassword;
    await user.save();

    return resp.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ADMIN: Get all users with roles
export const getAllUsers = async (req, resp) => {
  try {
    const users = await User.find().populate("role");
    return resp.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ADMIN: Update user status
export const updateUserStatus = async (req, resp) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return resp.status(400).json({ message: "Invalid status value" });
    }

    if (userId === req.user._id.toString()) {
      return resp.status(400).json({ message: "You cannot change your own account status" });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true });
    if (!user) {
      return resp.status(404).json({ message: "User not found" });
    }

    return resp.status(200).json({
      status: "success",
      message: `User status changed to ${status}`,
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};