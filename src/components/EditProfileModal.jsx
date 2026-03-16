'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { FaTimes, FaCamera, FaUserCircle } from 'react-icons/fa';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const avatarWidgetRef = useRef();
  const bannerWidgetRef = useRef();

  useEffect(() => {
    if (window.cloudinary) {
      avatarWidgetRef.current = window.cloudinary.createUploadWidget({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'kentar_avatars',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        showSkipCropButton: false,
        folder: 'kentar_avatars',
      }, (err, result) => {
        if (!err && result?.event === 'success') {
          setAvatarUrl(result.info.secure_url);
        }
      });

      bannerWidgetRef.current = window.cloudinary.createUploadWidget({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'kentar_avatars',
        sources: ['local', 'url'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 16 / 5,
        showSkipCropButton: false,
        folder: 'kentar_banners',
      }, (err, result) => {
        if (!err && result?.event === 'success') {
          setBannerUrl(result.info.secure_url);
        }
      });
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const updateData = {};
      if (bio !== (profile.bio || '')) updateData.bio = bio;
      if (avatarUrl !== (profile.avatarUrl || '')) updateData.avatarUrl = avatarUrl;
      if (bannerUrl !== (profile.bannerUrl || '')) updateData.bannerUrl = bannerUrl;

      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary">
          <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Banner upload */}
        <div className="relative">
          <div
            className="relative w-full h-36 bg-gradient-to-r from-stone-900 via-stone-800 to-primary/30 cursor-pointer group overflow-hidden"
            onClick={() => bannerWidgetRef.current?.open()}
          >
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt="Banner"
                layout="fill"
                objectFit="cover"
                className="opacity-70 group-hover:opacity-50 transition-opacity"
                loader={cloudinaryLoader}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/60 rounded-full p-3">
                <FaCamera className="text-white text-xl" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 bg-black/50 text-white/80 text-xs px-2 py-1 rounded">
              Change Banner
            </span>
          </div>

          {/* Avatar upload – overlapping the banner */}
          <div className="absolute -bottom-10 left-5">
            <div
              className="w-20 h-20 rounded-full border-4 border-surface bg-primary flex items-center justify-center overflow-hidden relative cursor-pointer group shadow-lg"
              onClick={() => avatarWidgetRef.current?.open()}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" layout="fill" objectFit="cover" loader={cloudinaryLoader} />
              ) : (
                <FaUserCircle className="text-4xl text-white" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <FaCamera className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-5 pt-14 pb-5 space-y-5">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={160}
              className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 border border-secondary focus:border-primary transition-colors"
            />
            <p className="text-xs text-foreground/40 mt-1 text-right">{bio.length}/160</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-secondary">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-opacity-80 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
