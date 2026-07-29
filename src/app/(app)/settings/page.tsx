"use client";

import { LearningPreferencesEditor } from "@/components/settings/LearningPreferencesEditor";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-2">
        <p className="kl-data-label">System</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Manage your profile and learning preferences.
        </p>
      </div>
      <LearningPreferencesEditor />
    </div>
  );
}
