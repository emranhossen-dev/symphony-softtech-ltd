"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Mail,
  Bell,
  Database,
  Globe,
  CreditCard,
  FileText,
  Palette,
  Lock,
  Key,
  Smartphone,
  Monitor,
  Wifi
} from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  defaultCurrency: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  backupFrequency: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  security: {
    passwordMinLength: number;
    requireEmailVerification: boolean;
    twoFactorAuth: boolean;
    sessionTimeoutMinutes: number;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Symphony Training Centre',
    siteDescription: 'Professional training and education platform',
    siteUrl: 'https://symphony-training.com',
    adminEmail: 'admin@symphony-training.com',
    supportEmail: 'support@symphony-training.com',
    defaultCurrency: 'BDT',
    timezone: 'UTC',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: 10485760, // 10MB
    sessionTimeout: 3600, // 1 hour
    backupFrequency: 'daily',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#f97316',
      accentColor: '#ef4444'
    },
    security: {
      passwordMinLength: 8,
      requireEmailVerification: true,
      twoFactorAuth: false,
      sessionTimeoutMinutes: 60
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => {
      if (section === '') {
        return {
          ...prev,
          [field]: value
        };
      }
      
      // Create a new object to avoid TypeScript spread issues
      const newSettings = { ...prev };
      if (section === 'theme') {
        newSettings.theme = {
          ...prev.theme,
          [field]: value
        };
      } else if (section === 'security') {
        newSettings.security = {
          ...prev.security,
          [field]: value
        };
      }
      
      return newSettings;
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'theme', label: 'Theme', icon: <Palette className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">System Settings</h1>
              <p className="text-sm text-gray-300 mt-1">Configure system-wide settings and preferences</p>
            </div>
            <Button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Site Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => handleInputChange('', 'siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Site URL</label>
                      <input
                        type="url"
                        value={settings.siteUrl}
                        onChange={(e) => handleInputChange('', 'siteUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                      <textarea
                        value={settings.siteDescription}
                        onChange={(e) => handleInputChange('', 'siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                      <input
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) => handleInputChange('', 'adminEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => handleInputChange('', 'supportEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                      <select
                        value={settings.defaultCurrency}
                        onChange={(e) => handleInputChange('', 'defaultCurrency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="BDT">BDT</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleInputChange('', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Asia/Dhaka">Asia/Dhaka</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Maintenance Mode</div>
                        <div className="text-sm text-gray-500">Temporarily disable the site for maintenance</div>
                      </div>
                      <button
                        onClick={() => handleInputChange('', 'maintenanceMode', !settings.maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.maintenanceMode ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Allow Registrations</div>
                        <div className="text-sm text-gray-500">Enable new user registrations</div>
                      </div>
                      <button
                        onClick={() => handleInputChange('', 'allowRegistrations', !settings.allowRegistrations)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.allowRegistrations ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.allowRegistrations ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Email Notifications</div>
                        <div className="text-sm text-gray-500">Send notifications via email</div>
                      </div>
                      <button
                        onClick={() => handleInputChange('', 'emailNotifications', !settings.emailNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">SMS Notifications</div>
                        <div className="text-sm text-gray-500">Send notifications via SMS</div>
                      </div>
                      <button
                        onClick={() => handleInputChange('', 'smsNotifications', !settings.smsNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.smsNotifications ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeoutMinutes}
                        onChange={(e) => handleInputChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Require Email Verification</div>
                        <div className="text-sm text-gray-500">Users must verify their email address</div>
                      </div>
                      <button
                        onClick={() => handleInputChange('security', 'requireEmailVerification', !settings.security.requireEmailVerification)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.requireEmailVerification ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Require 2FA for admin accounts</div>
                      </div>
                      <button
                        onClick={() => handleInputChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.theme.primaryColor}
                          onChange={(e) => handleInputChange('theme', 'primaryColor', e.target.value)}
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.theme.primaryColor}
                          onChange={(e) => handleInputChange('theme', 'primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.theme.secondaryColor}
                          onChange={(e) => handleInputChange('theme', 'secondaryColor', e.target.value)}
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.theme.secondaryColor}
                          onChange={(e) => handleInputChange('theme', 'secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.theme.accentColor}
                          onChange={(e) => handleInputChange('theme', 'accentColor', e.target.value)}
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.theme.accentColor}
                          onChange={(e) => handleInputChange('theme', 'accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => handleInputChange('', 'backupFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                      <input
                        type="number"
                        value={settings.maxFileSize / 1048576}
                        onChange={(e) => handleInputChange('', 'maxFileSize', parseInt(e.target.value) * 1048576)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">Backup Information</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Automatic backups are created based on your selected frequency. 
                        Backups include database, files, and system configurations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
