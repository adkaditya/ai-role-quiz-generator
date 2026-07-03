import { axiosClient } from "../lib/apiConfig";

export const getDashboardStats = async () => {
  const response = await axiosClient.get("/attempts/dashboard");
  return response.data;
};

export const getUserHistory = async () => {
  const response = await axiosClient.get("/attempts/history");
  return response.data;
};

export const getGlobalLeaderboard = async () => {
  const response = await axiosClient.get("/leaderboard/global");
  return response.data;
};