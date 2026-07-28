"use client";

import { LearningPreferencesEditor } from "@/components/settings/LearningPreferencesEditor";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-2">
        <p className="kl-data-label">System</p>
        <h1 className="text-sm font-bold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Manage your profile and learning preferences.
        </p>
      </div>
      <LearningPreferencesEditor />
    </div>
  );
}
