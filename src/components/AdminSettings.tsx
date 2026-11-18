"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, KeyRound, Building2, Phone, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [settings, setSettings] = useState({
    bankName: "",
    branchName: "",
    accountName: "",
    accountNumber: "",
    mobileNumber: "",
    email: "",
    smsNumber: "",
    smsEnabled: true,
  });
  const [testing, setTesting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          bankName: data.bankName || "",
          branchName: data.branchName || "",
          accountName: data.accountName || "",
          accountNumber: data.accountNumber || "",
          mobileNumber: data.mobileNumber || "",
          email: data.email || "",
          smsNumber: data.smsNumber || "",
          smsEnabled: data.smsEnabled !== false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const sendTestSms = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: settings.smsNumber || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) toast.success("පරීක්ෂණ SMS එක යැවුවා! ඔබගේ දුරකථනය බලන්න.");
      else toast.error(data.message || "SMS යැවීම අසාර්ථකයි");
    } catch {
      toast.error("SMS යැවීම අසාර්ථකයි");
    } finally {
      setTesting(false);
    }
  };

  const handlePasswordChange =(e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to update settings.");
      }
    } catch (error) {
      console.error("Save settings error", error);
      toast.error("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change password error", error);
      toast.error("Error changing password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>;
  }

  return (
    <div>

      <div className="space-y-8">
        {/* Bank & Contact Details Form */}
        <div className="bg-space-900/40 p-6 rounded-2xl border border-space-700">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-400" /> ගෙවීම් විස්තර සහ සම්බන්ධතා (Bank & Contact Info)
          </h4>
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">බැංකුවේ නම (Bank Name)</label>
                <input
                  type="text"
                  name="bankName"
                  value={settings.bankName}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. Bank of Ceylon"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">ශාඛාව (Branch)</label>
                <input
                  type="text"
                  name="branchName"
                  value={settings.branchName}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. Kandy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">ගිණුම් නාමය (Account Name)</label>
                <input
                  type="text"
                  name="accountName"
                  value={settings.accountName}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. S. Arathnayaka"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">ගිණුම් අංකය (Account Number)</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={settings.accountNumber}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. 1234567890"
                  required
                />
              </div>
            </div>

            <h4 className="text-lg font-bold text-white mt-6 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gold-400" /> සම්බන්ධතා විස්තර (Contact Info)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">දුරකථන අංකය (Mobile Number)</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={settings.mobileNumber}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. 0712345678"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">විද්‍යුත් තැපෑල (Email)</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. info@horoscope.com"
                />
              </div>
            </div>

            <h4 className="text-lg font-bold text-white mt-6 mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-400" /> SMS දැනුම්දීම් (SMS Alerts)
            </h4>
            <p className="text-sm text-gray-400 mb-3">අලුත් ඉල්ලීමක් හෝ ගෙවීමක් ලැබුණු විට මෙම අංකයට SMS එකක් එවයි.</p>
            <label className="flex items-center gap-3 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.smsEnabled}
                onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#e7c65a]"
              />
              <span className="text-sm text-gray-200">SMS දැනුම්දීම් සක්‍රීයයි</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">SMS ලැබිය යුතු අංකය (Alert Number)</label>
                <input
                  type="tel"
                  inputMode="tel"
                  name="smsNumber"
                  value={settings.smsNumber}
                  onChange={handleSettingsChange}
                  className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="e.g. 0771234567"
                />
              </div>
              <button
                type="button"
                onClick={sendTestSms}
                disabled={testing || !settings.smsEnabled}
                className="bg-space-700 hover:bg-space-600 disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                පරීක්ෂණ SMS
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">හිස් නම් ඉහත &quot;දුරකථන අංකය&quot; භාවිතා වේ. පරීක්ෂණ SMS එක යවන්නේ ඉහත ඇති අංකයටයි.</p>

            <button
              type="submit"
              disabled={savingSettings}
              className="mt-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-space-900 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              සුරකින්න (Save Settings)
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-space-900/40 p-6 rounded-2xl border border-space-700">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gold-400" /> මුරපදය වෙනස් කරන්න (Change Password)
          </h4>
          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">වත්මන් මුරපදය (Current Password)</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">නව මුරපදය (New Password)</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">මුරපදය තහවුරු කරන්න (Confirm Password)</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="bg-space-700 hover:bg-space-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {savingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              මුරපදය යාවත්කාලීන කරන්න (Update Password)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
