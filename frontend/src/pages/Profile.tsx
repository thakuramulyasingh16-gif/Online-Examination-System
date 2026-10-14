import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';
import {
  User,
  Camera,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [loginId, setLoginId] = useState(user?.loginId || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile image preview & file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // Handle Photo Selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB', 'File Too Large');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.info('New photo selected. Click "Save Profile" to apply changes.', 'Photo Selected');
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty', 'Validation Error');
      return;
    }
    if (!loginId.trim()) {
      toast.error('Login ID cannot be empty', 'Validation Error');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters', 'Weak Password');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match', 'Password Mismatch');
        return;
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('loginId', loginId);

      if (newPassword) {
        formData.append('password', newPassword);
      }
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.user) {
        updateUser(data.user);
      }

      setNewPassword('');
      setConfirmPassword('');
      setSelectedFile(null);
      toast.success('Your profile has been updated successfully!', 'Changes Saved');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(message, 'Update Failed');
    } finally {
      setSaving(false);
    }
  };

  const currentPhotoSrc = previewUrl
    ? previewUrl
    : user?.profileImage
    ? `${API_BASE_URL}${user.profileImage}`
    : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-primary-orange rounded-full text-xs font-bold mb-2">
          <User size={14} /> Student Account Management
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Settings & Profile
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update your student identification, institutional photo, and portal password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card Header */}
        <Card className="p-6 md:p-8 shadow-card hover:shadow-elevated transition-shadow relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-orange-100 dark:border-orange-950/60 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {currentPhotoSrc ? (
                  <img
                    src={currentPhotoSrc}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-primary-orange">
                    {user?.name?.charAt(0) || 'S'}
                  </span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-primary-orange hover:bg-orange-600 text-white rounded-xl shadow-md transition-transform hover:scale-110 active:scale-95"
                title="Change Photo"
              >
                <Camera size={16} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* User Meta */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {user?.name}
                </h2>
                <Badge variant="primary" size="sm" dot>
                  Verified {user?.role}
                </Badge>
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <GraduationCap size={14} className="text-primary-orange" />
                City College • Department of Computer Science
              </p>

              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <Mail size={13} /> {user?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* 2-Column Grid: Personal Details & Password Change */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Personal Details */}
          <Card className="p-6 space-y-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-primary-orange rounded-xl">
                <User size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Personal Identification
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Login ID / Roll Number
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter login ID"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used as your credential to log into the examination portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Email (Registered)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-xs font-medium cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Contact college administration to modify your registered email address.
                </p>
              </div>
            </div>
          </Card>

          {/* Column 2: Security & Password Change */}
          <Card className="p-6 space-y-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                <KeyRound size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Change Portal Password
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Password Guidelines:
                </span>
                Must contain at least 6 characters. Avoid common dictionary words or predictable sequences.
              </div>
            </div>
          </Card>
        </div>

        {/* Action Save Bar */}
        <div className="flex justify-end items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-primary-orange hover:from-orange-600 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Updates...
              </>
            ) : (
              <>
                <Save size={16} /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
