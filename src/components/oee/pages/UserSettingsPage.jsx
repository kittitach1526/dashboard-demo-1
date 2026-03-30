"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useOEE } from "@/components/oee/OEEContext";
import Card from "@/components/oee/ui/Card";
import { ROLE_COLOR } from "@/lib/oee/constants";

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, setUser } = useOEE();

  const roleColor = ROLE_COLOR[user?.role] || "#3b82f6";

  const initial = useMemo(() => {
    const u = user || {};
    return {
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      position: u.position || "",
      email: u.email || "",
      address: u.address || "",
      avatar: u.avatar || "A",
      profileImage: u.profileImage || "",
    };
  }, [user]);

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [position, setPosition] = useState(initial.position);
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState(initial.address);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [profileImage, setProfileImage] = useState(initial.profileImage);

  const displayName = `${firstName} ${lastName}`.trim() || user?.name || "";

  const handleSave = () => {
    const nextUser = {
      ...user,
      name: displayName,
      firstName,
      lastName,
      phone,
      position,
      email,
      address,
      avatar,
      profileImage,
    };
    setUser(nextUser);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-start justify-center py-6">
      <div className="w-full max-w-5xl">
        <Card title="⚙️ User Settings">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-4 text-center">
              <div className="flex justify-center">
                <div
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2"
                  style={{ borderColor: roleColor, background: `${roleColor}20` }}
                >
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImage} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-4xl font-black" style={{ color: roleColor }}>
                      {avatar}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 text-base font-bold text-slate-200">{displayName || "-"}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: roleColor }}>
                {user.role}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Profile</div>

              <div className="mt-3">
                <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Profile Image URL</label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                  placeholder="https://..."
                />
              </div>

              <div className="mt-3">
                <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Avatar (1 character)</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value.slice(0, 1).toUpperCase())}
                  maxLength={1}
                  className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-center text-2xl font-black text-slate-200 outline-none focus:border-sky-500/40"
                  placeholder="A"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">User Information</div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Position</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                    placeholder="Position"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="min-h-[92px] w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
                    placeholder="Address"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20 hover:brightness-110 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
