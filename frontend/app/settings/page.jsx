'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContexts';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-[rgb(var(--text-primary))]">
      <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Settings</h1>
      
      {/* Theme Settings */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[rgb(var(--text-secondary))]">Dark Mode</p>
            <p className="text-sm text-[rgb(var(--text-tertiary))]">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-md hover:bg-[rgb(var(--primary-hover))] transition-colors"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[rgb(var(--text-secondary))]">Email Notifications</p>
              <p className="text-sm text-[rgb(var(--text-tertiary))]">Receive updates about your documents</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--text-tertiary))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[rgb(var(--text-secondary))]">Auto-save</p>
              <p className="text-sm text-[rgb(var(--text-tertiary))]">Automatically save changes</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSave ? 'bg-[rgb(var(--primary))]' : 'bg-[rgb(var(--text-tertiary))]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Account</h2>
        
        <div className="space-y-2">
          <p className="text-[rgb(var(--text-secondary))]">
            <span className="font-medium text-[rgb(var(--text-primary))]">Email:</span> {user?.email}
          </p>
          <p className="text-[rgb(var(--text-secondary))]">
            <span className="font-medium text-[rgb(var(--text-primary))]">Role:</span> {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
}