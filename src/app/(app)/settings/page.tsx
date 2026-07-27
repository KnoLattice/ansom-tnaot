"use client";

import { LearningPreferencesEditor } from "@/components/settings/LearningPreferencesEditor";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-2">
        <p className="kl-data-label">System</p>
        <h1 className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
          Manage your profile and learning preferences.
        </p>
      </div>
      <LearningPreferencesEditor />
    </div>
  );
}
