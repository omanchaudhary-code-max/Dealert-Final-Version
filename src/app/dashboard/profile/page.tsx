"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { UserService } from "@/services/user.service";
import { User, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      await updateProfile({ fullName, phoneNumber });
      setProfileMsg("Profile details saved successfully.");
    } catch {
      setProfileMsg("Failed to update details.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);
    setPassErr(null);

    if (newPass !== confirmPass) {
      setPassErr("New passwords do not match.");
      setPassLoading(false);
      return;
    }

    try {
      const res = await UserService.changePassword({ oldPass, newPass });
      setPassMsg(res.message);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch {
      setPassErr("Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage personal details and password credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Info */}
        <Card className="lg:col-span-6 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>

          {profileMsg && (
            <Alert variant="success">
              <AlertDescription>{profileMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
            <div className="space-y-1.5 opacity-70">
              <label className="text-xs font-semibold">Email Address (Immutable)</label>
              <Input
                type="email"
                disabled
                className="font-mono text-xs"
                value={user?.email}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Full Name</label>
              <Input
                type="text"
                required
                className="text-xs"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Phone Number</label>
              <Input
                type="text"
                required
                className="text-xs"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              disabled={profileLoading}
            >
              {profileLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              <span>Save Details</span>
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="lg:col-span-6 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle>Security Credentials</CardTitle>
          </div>

          {passMsg && (
            <Alert variant="success">
              <AlertDescription>{passMsg}</AlertDescription>
            </Alert>
          )}

          {passErr && (
            <Alert variant="destructive">
              <AlertDescription>{passErr}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Current Password</label>
              <Input
                type="password"
                required
                className="text-xs"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">New Password</label>
              <Input
                type="password"
                required
                className="text-xs"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Confirm New Password</label>
              <Input
                type="password"
                required
                className="text-xs"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              disabled={passLoading}
            >
              {passLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              <span>Update Password</span>
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
