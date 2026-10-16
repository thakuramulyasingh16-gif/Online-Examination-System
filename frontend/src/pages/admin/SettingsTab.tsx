import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building,
  Lock,
  Camera,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';

interface SettingsTabProps {
  onSettingsUpdated?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onSettingsUpdated }) => {
  const { toast } = useToast();

  // General Settings State
  const [collegeName, setCollegeName] = useState('City College');
  const [collegeLogo, setCollegeLogo] = useState('/logo.jpg');
  const [contactEmail, setContactEmail] = useState('admin@citycollege.edu');
  const [passingCriteria, setPassingCriteria] = useState('40');
  const [warningLimit, setWarningLimit] = useState('10');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) {
          setCollegeName(data.collegeName || 'City College');
          setCollegeLogo(data.collegeLogo || '/logo.jpg');
          setContactEmail(data.contactEmail || 'admin@citycollege.edu');
          setPassingCriteria(String(data.passingCriteria || 40));
          setWarningLimit(String(data.warningLimit || 10));
          if (data.collegeLogo) {
            setLogoPreview(data.collegeLogo.startsWith('http') || data.collegeLogo.startsWith('/') ? data.collegeLogo : `${API_BASE_URL}${data.collegeLogo}`);
          }
        }
      } catch {
        // Fallback defaults
      }
    };
    fetchSettings();
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      const formData = new FormData();
      formData.append('collegeName', collegeName.trim());
      formData.append('contactEmail', contactEmail.trim());
      formData.append('passingCriteria', passingCriteria);
      formData.append('warningLimit', warningLimit);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const { data } = await api.put('/settings', formData);
      toast.success('College & Examination settings saved successfully!');
      if (data.collegeLogo) {
        setCollegeLogo(data.collegeLogo);
      }
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.put('/settings/change-password', {
        oldPassword,
        newPassword,
      });
      toast.success('Admin password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* 1. College Identity & Logo Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-primary-orange">
            <Building size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              College &amp; Institution Profile
            </h2>
            <p className="text-xs text-slate-400">
              Update college name, official emblem and contact details displayed across certificates &amp; reports
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
          {/* Logo Upload Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={logoPreview || collegeLogo || '/logo.jpg'}
                alt="Logo preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Official College Logo
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Appears on student dashboards, exam headers and generated result PDFs (Square, max 2MB)
              </p>
              <label className="inline-block mt-2 text-xs font-bold text-primary-orange hover:underline cursor-pointer">
                Change Logo Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. City College"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Administration Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. admin@citycollege.edu"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
              />
            </div>
          </div>

          {/* 2. Passing Criteria & Proctoring Limits */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Examination Criteria &amp; Integrity Policy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Passing Benchmark (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingCriteria}
                    onChange={(e) => setPassingCriteria(e.target.value)}
                    placeholder="40"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Minimum score percentage required to award a pass</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Proctoring Warning Limit (Auto-terminate threshold)
                </label>
                <input
                  type="number"
                  min="3"
                  max="50"
                  value={warningLimit}
                  onChange={(e) => setWarningLimit(e.target.value)}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
                <p className="text-[11px] text-slate-400 mt-1">Exam terminates automatically when warning count reaches this limit</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingGeneral}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-primary-orange hover:bg-orange-600 active:scale-95 text-white shadow-md shadow-orange-950/20 disabled:opacity-50 transition-all"
            >
              {isSavingGeneral ? 'Saving Settings...' : 'Save College & Exam Criteria'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Security & Admin Password Change Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Administrator Security &amp; Credentials
            </h2>
            <p className="text-xs text-slate-400">
              Change administrator password to secure access to the management console
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Admin Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password (Min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white shadow-xs disabled:opacity-50 transition-all"
            >
              {isSavingPassword ? 'Updating Password...' : 'Update Admin Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
