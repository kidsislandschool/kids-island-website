"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { AdminField, adminInput } from "./ui";

function Alert({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "success"
          ? "rounded-xl border border-[#CBE7D7] bg-[#EFFAF3] px-4 py-3 text-[12px] font-bold text-[#167A4A]"
          : "rounded-xl border border-[#F3C6D1] bg-[#FFF1F4] px-4 py-3 text-[12px] font-bold text-[#A32D4B]"
      }
    >
      {children}
    </div>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setDone(false);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update your profile.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 p-5">
      {error && <Alert tone="error">{error}</Alert>}
      {done && <Alert tone="success">Profile updated. Use your new email next time you sign in.</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Display name" htmlFor="account-name" required>
          <input id="account-name" name="name" defaultValue={name} required className={adminInput} />
        </AdminField>
        <AdminField label="Email address" htmlFor="account-email" required help="Used to sign in to the admin.">
          <input id="account-email" name="email" type="email" defaultValue={email} required className={adminInput} />
        </AdminField>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-50"
        >
          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const currentPassword = String(fd.get("currentPassword") ?? "");
    const newPassword = String(fd.get("newPassword") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");
    setError("");
    setDone(false);

    if (newPassword !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setError("Use at least 12 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not change your password.");
        return;
      }
      setDone(true);
      form.reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 p-5">
      {error && <Alert tone="error">{error}</Alert>}
      {done && <Alert tone="success">Password changed. Other admin sessions have been signed out.</Alert>}
      <AdminField label="Current password" htmlFor="current-password" required>
        <input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={adminInput}
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="New password" htmlFor="new-password" required help="At least 12 characters.">
          <input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            className={adminInput}
          />
        </AdminField>
        <AdminField label="Confirm new password" htmlFor="confirm-password" required>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            className={adminInput}
          />
        </AdminField>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] font-semibold text-muted">
          Changing your password signs out every other device.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-navy px-4 text-[11.5px] font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-50"
        >
          <Icon name="lock" className="h-3.5 w-3.5" />
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
