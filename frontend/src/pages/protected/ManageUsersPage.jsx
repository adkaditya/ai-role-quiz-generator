import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  getAllUsers,
  updateUserByAdmin,
  updateUserStatus,
} from "../../services/user.service";
import { changeUserRole } from "../../services/auth.service";
import {
  Search,
  Edit2,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  Shield,
  Info,
  Calendar,
  Mail,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageUsersPage() {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load all users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllUsers();
      if (res && res.data && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const userRole = user.role?.name || user.role || "user";
    const matchesRole = roleFilter === "all" || userRole === roleFilter;

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Initials helper
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Open edit modal
  const handleEditClick = (user) => {
    setSelectedUser(user);
    const userRole = user.role?.name || user.role || "user";
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: userRole,
      status: user.status || "active",
    });
    setIsEditOpen(true);
  };

  // Open details modal
  const handleDetailsClick = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  // Form submit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.error("Full name is required");
    if (!editForm.email.trim()) return toast.error("Email address is required");

    setIsSaving(true);
    try {
      const isSelf = selectedUser._id === currentUser._id;
      const initialRole = selectedUser.role?.name || selectedUser.role || "user";

      // 1. Update basic details (name, email)
      if (editForm.name !== selectedUser.name || editForm.email !== selectedUser.email) {
        await updateUserByAdmin(selectedUser._id, {
          name: editForm.name,
          email: editForm.email,
        });
      }

      // 2. Change role (only if changed and not self)
      if (editForm.role !== initialRole) {
        if (isSelf) {
          toast.error("You cannot change your own admin role privileges");
        } else {
          await changeUserRole(selectedUser._id, editForm.role);
        }
      }

      // 3. Change status (only if changed and not self)
      if (editForm.status !== selectedUser.status) {
        if (isSelf) {
          toast.error("You cannot change your own account status");
        } else {
          await updateUserStatus(selectedUser._id, editForm.status);
        }
      }

      toast.success("User account updated successfully");
      setIsEditOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user account");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View details, modify settings, change roles, and moderate all system users.
          </p>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Filters Card */}
      <Card className="border border-border/80 bg-card/45 backdrop-blur-xs">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card dark:bg-input/20 h-10 border-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <div className="w-full sm:w-40 space-y-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full h-10 bg-card dark:bg-input/20">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40 space-y-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-10 bg-card dark:bg-input/20">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List Container */}
      <Card className="border border-border/80 bg-card/30 backdrop-blur-xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading users database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="p-4 bg-muted/40 rounded-full text-muted-foreground border border-border/50 mb-4">
                <UserIcon size={32} />
              </div>
              <h3 className="font-semibold text-lg">No users found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                We couldn't find any users matching your criteria. Try adjusting your filters or search term.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-4 px-6">User Details</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredUsers.map((user) => {
                      const userRole = user.role?.name || user.role || "user";
                      const isSelf = user._id === currentUser._id;
                      return (
                        <tr
                          key={user._id}
                          className="hover:bg-muted/15 transition-colors duration-150"
                        >
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="relative">
                              {user.profilePhoto ? (
                                <img
                                  src={user.profilePhoto}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                  {getInitials(user.name)}
                                </div>
                              )}
                              {isSelf && (
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white ring-2 ring-background">
                                  Me
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-foreground text-sm truncate flex items-center gap-1.5">
                                {user.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                userRole === "admin"
                                  ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                                  : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                              }`}
                            >
                              {userRole === "admin" ? (
                                <ShieldCheck size={10} />
                              ) : (
                                <UserIcon size={10} />
                              )}
                              {userRole}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                                user.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : user.status === "suspended"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {user.status || "active"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-xs">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDetailsClick(user)}
                                className="h-8 text-xs hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <Info size={14} className="mr-1" /> Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(user)}
                                className="h-8 text-xs border-border/80 hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                <Edit2 size={13} className="mr-1" /> Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid gap-4 p-4 md:hidden">
                {filteredUsers.map((user) => {
                  const userRole = user.role?.name || user.role || "user";
                  const isSelf = user._id === currentUser._id;
                  return (
                    <div
                      key={user._id}
                      className="p-4 rounded-xl border border-border/60 bg-card/65 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.profilePhoto ? (
                              <img
                                src={user.profilePhoto}
                                  alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                {getInitials(user.name)}
                              </div>
                            )}
                            {isSelf && (
                              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white ring-2 ring-background">
                                Me
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${
                            user.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : user.status === "suspended"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}
                        >
                          {user.status || "active"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/20">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          Role:
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                              userRole === "admin"
                                ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            }`}
                          >
                            {userRole}
                          </span>
                        </span>

                        <span className="text-muted-foreground">
                          Joined:{" "}
                          <span className="text-foreground">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </span>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDetailsClick(user)}
                          className="h-8 text-xs flex-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Info size={14} className="mr-1" /> View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          className="h-8 text-xs flex-1 border-border/80 hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                          <Edit2 size={13} className="mr-1" /> Edit Profile
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] border border-border/80 bg-card p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit User Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Adjust account specifications and permission clearance levels for the selected user.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && selectedUser._id === currentUser._id && (
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex gap-2 items-start mt-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Self Account Editing Protection</p>
                <p className="mt-0.5 leading-relaxed">
                  You are editing your own administrator account. Changing roles or account status is disabled to prevent accidental lockouts.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
                className="bg-card dark:bg-input/20 h-10 border-input"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email Address"
                className="bg-card dark:bg-input/20 h-10 border-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-xs font-semibold">
                  Role Privilege
                </Label>
                <Select
                  value={editForm.role}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, role: val }))}
                  disabled={selectedUser && selectedUser._id === currentUser._id}
                >
                  <SelectTrigger className="w-full h-10 bg-card dark:bg-input/20">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs font-semibold">
                  Account Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, status: val }))}
                  disabled={selectedUser && selectedUser._id === currentUser._id}
                >
                  <SelectTrigger className="w-full h-10 bg-card dark:bg-input/20">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="h-10 text-xs border-border/80 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-10 text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-4 flex items-center justify-center gap-1.5"
              >
                {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[450px] border border-border/80 bg-card p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">User Account Summary</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 py-4">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                {selectedUser.profilePhoto ? (
                  <img
                    src={selectedUser.profilePhoto}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-border shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-bold shadow-inner">
                    {getInitials(selectedUser.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-sm truncate">
                    {selectedUser.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <Mail size={12} /> {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Specifications List */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Shield size={13} /> Permission Role
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      (selectedUser.role?.name || selectedUser.role || "user") === "admin"
                        ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    }`}
                  >
                    {selectedUser.role?.name || selectedUser.role || "user"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <UserCheck size={13} /> Account Status
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                      selectedUser.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : selectedUser.status === "suspended"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {selectedUser.status || "active"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar size={13} /> Date Registered
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Info size={13} /> System User ID
                  </span>
                  <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border/40 select-all">
                    {selectedUser._id}
                  </span>
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="flex justify-end pt-1">
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="h-10 text-xs w-full bg-muted hover:bg-muted/80 text-foreground border border-border/80 cursor-pointer"
                >
                  Dismiss Summary
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}