"use client";

import { useState } from "react";
import ModalShell from "@/components/oee/modals/ModalShell";

export default function UserSettingsModal({ user, onUpdate, onClose }) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "A");

  const handleSave = () => {
    onUpdate({ ...user, name, avatar });
    onClose();
  };

  return (
    <ModalShell title="⚙️ User Settings" onClose={onClose} widthClass="w-[400px]">
      <div className="space-y-5">
        
        {/* User Info Display */}
        <div className="rounded-xl bg-slate-900/60 border border-white/5 p-4 text-center">
          <div className="flex justify-center mb-3">
            <div 
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 text-2xl font-bold"
              style={{
                background: `${user.roleColor || '#3b82f6'}25`,
                borderColor: user.roleColor || '#3b82f6',
                color: user.roleColor || '#3b82f6',
              }}
            >
              {avatar}
            </div>
          </div>
          <div className="text-sm font-bold text-slate-300">{name}</div>
          <div className="text-[10px] uppercase text-slate-500 mt-1" style={{ color: user.roleColor || '#3b82f6' }}>
            {user.role}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Avatar Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
            Avatar (1 character)
          </label>
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value.slice(0, 1).toUpperCase())}
            maxLength={1}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500 text-center text-2xl font-bold"
            placeholder="A"
          />
          <div className="mt-1 text-[9px] text-slate-500">
            Enter a single letter or emoji
          </div>
        </div>

        {/* Role Info (Read-only) */}
        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
          <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
            Role & Permissions
          </div>
          <div className="text-sm text-slate-300">
            <span className="font-bold" style={{ color: user.roleColor || '#3b82f6' }}>
              {user.role.toUpperCase()}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Contact administrator to change role
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors text-sm font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-900/20 hover:brightness-110 transition-all text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
