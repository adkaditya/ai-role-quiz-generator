import { axiosClient } from "../lib/apiConfig"

export const signUpUser=async(userData)=>{
    //signup logic
    const response=await axiosClient.post('/auth/register',userData)
    return response.data
}

export const loginUser=async(loginData)=>{
    //login logic
    const response=await axiosClient.post('/auth/login',loginData)
    return response.data
}

export const updateProfile = async (profileData) => {
  const response = await axiosClient.put("/users/profile", profileData);
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axiosClient.put("/users/password", passwordData);
  return response.data;
};

export const changeUserRole = async (userId, roleName) => {
  const response = await axiosClient.post("/auth/change-user-role", { userId, role: roleName });
  return response.data;
};