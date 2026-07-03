import { axiosClient } from "../lib/apiConfig";

export const getAllUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};

export const updateUserByAdmin = async (userId, data) => {
  const response = await axiosClient.put(`/users/${userId}`, data);
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await axiosClient.patch(`/users/${userId}/status`, { status });
  return response.data;
};