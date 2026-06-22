import { useState } from "react";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardHeader, Button, Input } from "../../components/ui";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Change password"
      subtitle="Update the password for your account"
    >
      <Card className="max-w-md">
        <CardHeader title="Set a new password" />
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" disabled={saving} className="w-full">
            <KeyRound size={16} /> {saving ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
