import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import {
  generateToken,
  registerUserService,
} from "../services/auth.service.js";
//function register
export const registerUser = async (req, res) => {
  //logic to register user
  const result = await registerUserService(req.body);

  return res.status(201).json({
    message: "User created successfully",
    data: result,
  });
};

//login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //validations
  if (!email) {
    throw new Error("email is required");
  }

  const user = await User.findOne({ email }).populate("role");

  if (!user) {
    return res.status(404).json({
      message: "Invalid Email or Password !!",
    });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({
      message: "Invalid Email or Password !!",
    });
  }

  const accessToken = await generateToken(user._id);
  console.log(accessToken);

  return res.status(200).json({
    message: "Login successful !!",
    accessToken,
    user: user,
  });
};

//delete user

export const deleteUser = async (req, resp) => {
  return resp.json({
    message: "user deleted successfully",
  });
};

// change user role
export const changeUserRole = async (req, resp) => {
  const { userId, role } = req.body;
  //userid=asdgasgasg
  //role=admin
  let user = null;
  try {
    user = await User.findOne({ _id: userId }).populate("role");
  } catch (error) {
    console.log(error);
    return resp.status(401).json({
      message: "User id is invalid",
    });
  }

  if (!user) {
    return resp.status(404).json({
      message: "User not found",
    });
  }

  if (user.role.name == role) {
    return resp.status(400).json({
      message: "User already has this role",
    });
  }

  const roleOb = await Role.findOne({ name: role });
  user.role = roleOb;
  const result = await user.save();
  return resp.json({
    message: "user role changed successfully",
    user: result,
  });
};