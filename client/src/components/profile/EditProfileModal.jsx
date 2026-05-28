import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { X, Camera, Loader2, CheckCircle2, AlertCircle, User, AtSign, MapPin, FileText } from 'lucide-react';

// ─── field component ──────────────────────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div className='space-y-1.5'>
    <label className='flex items-center gap-2 text-sm font-medium text-slate-300'>
      {Icon && <Icon size={14} className='text-slate-500' />}
      {label}
    </label>
    {children}
    {error && (
      <p className='flex items-center gap-1.5 text-xs text-red-400'>
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputCls = hasError =>
  `w-full rounded-xl border ${hasError ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/8 focus:border-red-500/40'} bg-[#141414] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-1 focus:ring-red-500/10`;

// ─── EditProfileModal ─────────────────────────────────────────
const EditProfileModal = ({ user, onClose, onSave }) => {
  const { getToken } = useAuth();

  const fileRef = useRef(null);

  // form state — pre-filled from the current user object
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
  const [avatarFile, setAvatarFile] = useState(null); // File object for upload later
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? '');
  const [location, setLocation] = useState(user.location ?? '');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  // ── avatar pick ──
  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image must be under 5 MB' }));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, avatar: undefined }));
  };

  // ── validation ──
  const validate = () => {
    const e = {};
    if (!displayName.trim()) e.displayName = 'Display name is required';
    if (displayName.length > 50) e.displayName = 'Max 50 characters';
    if (!username.trim()) e.username = 'Username is required';
    if (!/^[a-z0-9_.]{3,30}$/.test(username)) e.username = 'Lowercase letters, numbers, _ and . only (3–30 chars)';
    if (bio.length > 200) e.bio = 'Max 200 characters';
    if (location.length > 60) e.location = 'Max 60 characters';
    return e;
  };

  // ── save ──
  const handleSave = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          username,
          bio,
          location,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSaved(true);
        onSave(data.user);

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const bioLeft = 200 - bio.length;

  return (
    // backdrop
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d0d] shadow-2xl shadow-black/80'>
        {/* ── header ── */}
        <div className='flex items-center justify-between border-b border-white/6 px-6 py-4'>
          <h2 className='text-base font-semibold text-white'>Edit Profile</h2>
          <button onClick={onClose} className='rounded-lg p-1.5 text-slate-500 cursor-pointer transition hover:bg-white/6 hover:text-white'>
            <X size={18} />
          </button>
        </div>

        {/* ── scrollable body ── */}
        <div className='max-h-[75vh] overflow-y-auto px-6 py-6 scrollbar-none'>
          <div className='space-y-5'>
            {/* ── AVATAR ── */}
            <div className='flex flex-col items-center gap-3'>
              <div className='relative'>
                <img src={avatarPreview} alt='avatar' className='h-24 w-24 rounded-full border-2 border-white/10 object-cover' />
                <button
                  onClick={() => fileRef.current?.click()}
                  className='absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a] text-slate-300 shadow-lg cursor-pointer transition hover:bg-red-500/80 hover:text-red-300'
                >
                  <Camera size={14} />
                </button>
                <input ref={fileRef} type='file' accept='image/png,image/jpeg,image/webp' className='hidden' onChange={handleAvatarChange} />
              </div>
              {errors.avatar && <p className='text-xs text-red-400'>{errors.avatar}</p>}
              <p className='text-xs text-slate-600'>PNG, JPG or WebP · max 5 MB</p>
            </div>

            {/* ── DISPLAY NAME ── */}
            <Field label='Display name' icon={User} error={errors.displayName}>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder='Your full name or alias'
                className={inputCls(errors.displayName)}
              />
            </Field>

            {/* ── USERNAME ── */}
            <Field label='Username' icon={AtSign} error={errors.username}>
              <div className='relative'>
                <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-600'>@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  maxLength={30}
                  placeholder='your_handle'
                  className={`${inputCls(errors.username)} pl-8`}
                />
              </div>
              <p className='text-xs text-slate-600'>Lowercase, numbers, underscores and dots only</p>
            </Field>

            {/* ── BIO ── */}
            <Field label='Bio' icon={FileText} error={errors.bio}>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder='A short description about yourself…'
                className={`${inputCls(errors.bio)} resize-none`}
              />
              <p className={`text-right text-xs ${bioLeft < 20 ? 'text-amber-400' : 'text-slate-600'}`}>{bioLeft} left</p>
            </Field>

            {/* ── LOCATION ── */}
            <Field label='Location' icon={MapPin} error={errors.location}>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                maxLength={60}
                placeholder='City, Country'
                className={inputCls(errors.location)}
              />
            </Field>

            {/* ── CLERK NOTE ── */}
            <div className='rounded-xl border border-white/5 bg-white/3 px-4 py-3'>
              <p className='text-xs text-slate-500'>
                To update your <span className='text-slate-300'>email or password</span>, go to{' '}
                <button
                  className='text-red-400 underline underline-offset-2 hover:text-red-500 cursor-pointer transition-colors'
                  onClick={() => {
                    onClose();
                    // openUserProfile() from useClerk() — call this in Profile.jsx
                    window.dispatchEvent(new CustomEvent('open-clerk-profile'));
                  }}
                >
                  Account Security
                </button>
                .
              </p>
            </div>
          </div>
        </div>

        {/* ── footer ── */}
        <div className='flex items-center justify-end gap-3 border-t border-white/6 px-6 py-4'>
          <button
            onClick={onClose}
            className='rounded-xl border border-white/8 px-5 py-2.5 text-sm text-slate-400 cursor-pointer transition hover:border-white/20 hover:text-white'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className='flex min-w-28 items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white cursor-pointer transition hover:bg-red-600 disabled:opacity-70'
          >
            {saved ? (
              <>
                <CheckCircle2 size={15} className='text-emerald-300' /> Saved
              </>
            ) : saving ? (
              <>
                <Loader2 size={15} className='animate-spin' /> Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
