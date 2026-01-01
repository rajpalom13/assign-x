"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  PasswordCard,
  TwoFactorCard,
  ActiveSessionsCard,
  PasswordChangeDialog,
  RevokeAllDialog,
} from "./security";
import type {
  SecuritySettings,
  PasswordChangeData,
  FormErrors,
} from "@/types/profile";

/**
 * Props for SecuritySection component
 * @property security - Current security settings
 * @property onPasswordChange - Callback for password change
 * @property onToggle2FA - Callback for 2FA toggle
 * @property onRevokeSession - Callback to revoke single session
 * @property onRevokeAllSessions - Callback to revoke all sessions
 */
interface SecuritySectionProps {
  security: SecuritySettings;
  onPasswordChange: (data: PasswordChangeData) => Promise<void>;
  onToggle2FA: (enabled: boolean) => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllSessions: () => Promise<void>;
}

/**
 * Security settings section component
 * Manages password, 2FA, and active sessions
 */
export function SecuritySection({
  security,
  onPasswordChange,
  onToggle2FA,
  onRevokeSession,
  onRevokeAllSessions,
}: SecuritySectionProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  /** Validates password form fields */
  const validatePassword = (): boolean => {
    const errors: FormErrors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Handles password change submission */
  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    setIsChangingPassword(true);
    try {
      await onPasswordChange(passwordForm);
      toast.success("Password changed successfully");
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  /** Handles 2FA toggle */
  const handleToggle2FA = async (enabled: boolean) => {
    setIsToggling2FA(true);
    try {
      await onToggle2FA(enabled);
      toast.success(enabled ? "2FA enabled" : "2FA disabled");
    } catch {
      toast.error("Failed to update 2FA settings");
    } finally {
      setIsToggling2FA(false);
    }
  };

  /** Handles single session revocation */
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await onRevokeSession(sessionId);
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingSessionId(null);
    }
  };

  /** Handles all sessions revocation */
  const handleRevokeAllSessions = async () => {
    setIsRevokingAll(true);
    try {
      await onRevokeAllSessions();
      toast.success("All other sessions revoked");
      setRevokeAllDialogOpen(false);
    } catch {
      toast.error("Failed to revoke sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  /** Updates password form field */
  const handleFormChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PasswordCard
        passwordLastChanged={security.passwordLastChanged}
        onChangeClick={() => setPasswordDialogOpen(true)}
      />
      <TwoFactorCard
        twoFactorAuth={security.twoFactorAuth}
        isToggling={isToggling2FA}
        onToggle={handleToggle2FA}
      />
      <ActiveSessionsCard
        sessions={security.activeSessions}
        revokingSessionId={revokingSessionId}
        onRevokeSession={handleRevokeSession}
        onRevokeAllClick={() => setRevokeAllDialogOpen(true)}
      />
      <PasswordChangeDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        form={passwordForm}
        errors={passwordErrors}
        isLoading={isChangingPassword}
        onFormChange={handleFormChange}
        onSubmit={handlePasswordChange}
      />
      <RevokeAllDialog
        open={revokeAllDialogOpen}
        onOpenChange={setRevokeAllDialogOpen}
        isLoading={isRevokingAll}
        onConfirm={handleRevokeAllSessions}
      />
    </div>
  );
}
