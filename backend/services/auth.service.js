import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const registerUserService = async (data) => {
  //register logic....

  const { name, email, password } = data;

  // is user exists

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  //role

  const userCount = await User.countDocuments();

  const roleName = userCount == 0 ? "admin" : "user";

  //TODO:
  const role = await getOrCreateRole(roleName);

  //create user in database

  const createdUser = await User.create({
    name,
    email,
    password,
    role: role._id,
  });

  return createdUser;
};

//function will get or create role
const getOrCreateRole = async (roleName) => {
  const role = await Role.findOne({ name: roleName });
  if (role) {
    return role;
  } else {
    const newRole = await Role.create({ name: roleName });
    return newRole;
  }
};

//function to generate token

export async function generateToken(userId) {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}