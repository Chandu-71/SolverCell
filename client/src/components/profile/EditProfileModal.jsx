import React, { useState, useRef } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { X, Camera, Loader2, AlertCircle, User, AtSign, MapPin, FileText } from 'lucide-react';

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
  `w-full rounded-xl border ${
    hasError ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/8 focus:border-red-500/40'
  } bg-[#141414] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-1 focus:ring-red-500/10`;

const EditProfileModal = ({ user, onClose, onSave }) => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser(); // Clerk user — has setProfileImage()

  const fileRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '/default-avatar.png');
  const [avatarFile, setAvatarFile] = useState(null);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? '');
  const [location, setLocation] = useState(user.location ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // preview only — upload happens on save
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

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const token = await getToken();
      let newAvatarUrl = user.avatarUrl;

      // ── 1. Upload avatar to Clerk's CDN ───────────────────
      // Clerk handles storage, resizing and returns the hosted URL.
      if (avatarFile) {
        try {
          await clerkUser.setProfileImage({ file: avatarFile });
          await clerkUser.reload();
          newAvatarUrl = clerkUser.imageUrl;
        } catch (avatarErr) {
          console.error('Avatar upload failed:', avatarErr);
          setErrors({ avatar: 'Upload failed — try a smaller or different image.' });
          setSaving(false);
          return;
        }
      }

      // ── 2. Persist everything to DB ──────────────────
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          bio: bio.trim(),
          location: location.trim(),
          avatarUrl: newAvatarUrl,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSave(data.user);

        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        if (data.message?.toLowerCase().includes('username')) {
          setErrors({ username: data.message });
        } else {
          setErrors({ general: data.message });
        }
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const bioLeft = 200 - bio.length;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d0d] shadow-2xl shadow-black/80'>
        {/* header */}
        <div className='flex items-center justify-between border-b border-white/6 px-6 py-4'>
          <h2 className='text-base font-semibold text-white'>Edit Profile</h2>
          <button onClick={onClose} className='cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-white/6 hover:text-white'>
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className='max-h-[75vh] overflow-y-auto px-6 py-6 scrollbar-none'>
          <div className='space-y-5'>
            {/* AVATAR */}
            <div className='flex flex-col items-center gap-3'>
              <div className='relative'>
                <img src={avatarPreview} alt='avatar' className='h-24 w-24 rounded-full border-2 border-white/10 object-cover' />
                <button
                  onClick={() => fileRef.current?.click()}
                  className='absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a] text-slate-300 shadow-lg transition hover:bg-red-500 hover:text-white'
                >
                  <Camera size={14} />
                </button>
                <input ref={fileRef} type='file' accept='image/png,image/jpeg,image/webp' className='hidden' onChange={handleAvatarChange} />
              </div>
              {avatarFile && <p className='text-xs text-slate-500'>New photo selected — save to apply</p>}
              {errors.avatar && <p className='text-xs text-red-400'>{errors.avatar}</p>}
              {!avatarFile && !errors.avatar && <p className='text-xs text-slate-600'>PNG, JPG or WebP · max 5 MB</p>}
            </div>

            {errors.general && (
              <div className='rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400'>{errors.general}</div>
            )}

            <Field label='Display name' icon={User} error={errors.displayName}>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder='Your full name or alias'
                className={inputCls(errors.displayName)}
              />
            </Field>

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

            <Field label='Location' icon={MapPin} error={errors.location}>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                maxLength={60}
                placeholder='City, Country'
                className={inputCls(errors.location)}
              />
            </Field>

            <div className='rounded-xl border border-white/5 bg-white/3 px-4 py-3'>
              <p className='text-xs text-slate-500'>
                To update your <span className='text-slate-300'>email or password</span>, go to{' '}
                <button
                  className='cursor-pointer text-red-400 underline underline-offset-2 transition-colors hover:text-red-300'
                  onClick={() => {
                    onClose();
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

        {/* footer */}
        <div className='flex items-center justify-end gap-3 border-t border-white/6 px-6 py-4'>
          <button
            onClick={onClose}
            className='cursor-pointer rounded-xl border border-white/8 px-5 py-2.5 text-sm text-slate-400 transition hover:border-white/20 hover:text-white'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className='flex min-w-28 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70'
          >
            {saving ? (
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
