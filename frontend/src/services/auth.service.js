import { axiosClient } from "../lib/apiConfig";

// REGISTER
export const signUpUser = async (userData) => {
  const response = await axiosClient.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// VERIFY EMAIL OTP
export const verifyEmail = async (email, otp) => {
  const response = await axiosClient.post(
    "/auth/verify-email",
    {
      email,
      otp,
    }
  );

  return response.data;
};

// LOGIN
export const loginUser = async (loginData) => {
  const response = await axiosClient.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

// RESEND OTP
export const resendOTP = async (email) => {
  const response = await axiosClient.post(
    "/auth/resend-otp",
    { email }
  );

  return response.data;
};

// UPDATE PROFILE
export const updateProfile = async (profileData) => {
  const response = await axiosClient.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

// UPDATE PASSWORD
export const updatePassword = async (passwordData) => {
  const response = await axiosClient.put(
    "/users/password",
    passwordData
  );

  return response.data;
};

// CHANGE ROLE
export const changeUserRole = async (userId, roleName) => {
  const response = await axiosClient.patch(
    "/auth/change-role",
    {
      userId,
      role: roleName,
    }
  );

  return response.data;
};