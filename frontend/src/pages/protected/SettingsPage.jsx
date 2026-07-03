import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Lock,
  Save
} from "lucide-react";
import { updateProfile, updatePassword } from "../../services/auth.service";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, token, login } = useAuthContext();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) return toast.error("Full name is required");

    setIsSavingProfile(true);
    try {
      const res = await updateProfile({
        name: profileData.name,
      });

      if (res && res.status === "success") {
        const currentRole = user?.role?.name || user?.role || "user";
        
        // Re-normalize user state object to ensure frontend sidebar and context compatibility
        const updatedUser = {
          ...res.data.user,
          role: {
            ...(typeof user.role === "object" ? user.role : {}),
            name: currentRole
          }
        };

        login(updatedUser, token);
        toast.success("Profile details updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword) return toast.error("Current password is required");
    if (!passwordData.newPassword) return toast.error("New password is required");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setIsSavingPassword(true);
    try {
      const res = await updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res && res.status === "success") {
        toast.success("Password updated successfully!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Maintain your personal display settings, secure email, and password configurations.
        </p>
      </div>

      <Separator className="bg-border/60" />

      {/* Profile Details section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-sm font-semibold">User Details</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Update your public display identity parameters. Your email address is a permanent account identifier and cannot be modified.
          </p>
        </div>

        <Card className="md:col-span-2 border border-border/80 bg-card/45 backdrop-blur-xs">
          <form onSubmit={saveProfile}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Profile Settings</CardTitle>
              <CardDescription className="text-xs">Your core profile identifier fields.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold flex items-center gap-1.5">
                    <User size={13} className="text-muted-foreground" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                    <Mail size={13} className="text-muted-foreground" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    placeholder="Enter email address"
                    disabled
                    className="cursor-not-allowed bg-muted/30"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/40 bg-muted/20 px-6 py-4 rounded-b-lg">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Save size={13} /> {isSavingProfile ? "Saving..." : "Save Details"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Separator className="bg-border/60" />

      {/* Password Change section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-sm font-semibold">Change Password</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Update your account password key to ensure the security of your test attempts.
          </p>
        </div>

        <Card className="md:col-span-2 border border-border/80 bg-card/45 backdrop-blur-xs">
          <form onSubmit={savePassword}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Security Settings</CardTitle>
              <CardDescription className="text-xs">Update your security passkeys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-xs font-semibold flex items-center gap-1.5">
                  <Lock size={13} className="text-muted-foreground" /> Current Password
                </Label>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-semibold flex items-center gap-1.5">
                    <Lock size={13} className="text-muted-foreground" /> New Password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold flex items-center gap-1.5">
                    <Lock size={13} className="text-muted-foreground" /> Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/40 bg-muted/20 px-6 py-4 rounded-b-lg">
              <Button
                type="submit"
                disabled={isSavingPassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Lock size={13} /> {isSavingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}