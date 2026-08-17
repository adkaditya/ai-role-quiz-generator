import { axiosClient } from "../lib/apiConfig";

// ======================================================
// REGISTER USER
// ======================================================

export const signUpUser = async (userData) => {
  // Backend:
  // POST /api/v1/auth/register

  const response = await axiosClient.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async (loginData) => {
  // Backend:
  // POST /api/v1/auth/login

  const response = await axiosClient.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

// ======================================================
// UPDATE PROFILE
// ======================================================

export const updateProfile = async (profileData) => {
  // Backend:
  // PUT /api/v1/users/profile

  const response = await axiosClient.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

// ======================================================
// UPDATE PASSWORD
// ======================================================

export const updatePassword = async (passwordData) => {
  // Backend:
  // PUT /api/v1/users/password

  const response = await axiosClient.put(
    "/users/password",
    passwordData
  );

  return response.data;
};

// ======================================================
// CHANGE USER ROLE
// ======================================================

export const changeUserRole = async (userId, roleName) => {
  // Backend route:
  // PATCH /api/v1/auth/change-role

  const response = await axiosClient.patch(
    "/auth/change-role",
    {
      userId,
      role: roleName,
    }
  );

  return response.data;
};