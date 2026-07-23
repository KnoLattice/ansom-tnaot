"use client";

import { LearningPreferencesEditor } from "@/components/settings/LearningPreferencesEditor";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-text-primary">
          Settings
        </h1>
        <p className="text-sm text-text-secondary">
          Manage your profile and learning preferences.
        </p>
      </div>
      <LearningPreferencesEditor />
    </div>
  );
}
