"use client";

import { useEffect, useMemo, useState } from "react";

import Card from "@/components/oee/ui/Card";
import Badge from "@/components/oee/ui/Badge";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS, ROLE_COLOR, USERS } from "@/lib/oee/constants";

const STORAGE_KEY = "oee:users";

function readUsers() {
  if (typeof window === "undefined") return USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return USERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return USERS;
    return parsed;
  } catch {
    return USERS;
  }
}

function writeUsers(next) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function nextId(list) {
  const maxId = list.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0);
  return maxId + 1;
}

export default function UserManagementPage() {
  const { user } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const [users, setUsers] = useState(() => readUsers());
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setUsers(readUsers());
  }, []);

  const roles = useMemo(() => Object.keys(ROLE_ACCESS), []);

  const selected = useMemo(() => {
    const hit = users.find((u) => String(u.id) === String(selectedId));
    return hit || null;
  }, [selectedId, users]);

  const [form, setForm] = useState({
    id: null,
    username: "",
    password: "",
    role: "viewer",
    name: "",
    avatar: "A",
  });

  useEffect(() => {
    if (!selected) return;
    setForm({
      id: selected.id,
      username: selected.username || "",
      password: selected.password || "",
      role: selected.role || "viewer",
      name: selected.name || "",
      avatar: selected.avatar || "A",
    });
  }, [selected]);

  const canAccess = allowed.includes("user-management");

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
        <div className="text-xs mt-1">Role: {user?.role}</div>
      </div>
    );
  }

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const resetNew = () => {
    setSelectedId(null);
    setForm({
      id: null,
      username: "",
      password: "",
      role: "viewer",
      name: "",
      avatar: "A",
    });
  };

  const save = () => {
    const username = form.username.trim();
    const password = form.password;
    const name = form.name.trim();
    const role = form.role;
    const avatar = (form.avatar || "A").slice(0, 1).toUpperCase();

    if (!username || !password || !name || !role) return;

    const dup = users.find((u) => u.username === username && String(u.id) !== String(form.id));
    if (dup) return;

    const next = form.id
      ? users.map((u) =>
          String(u.id) === String(form.id)
            ? { ...u, username, password, name, role, avatar }
            : u
        )
      : [
          ...users,
          {
            id: nextId(users),
            username,
            password,
            name,
            role,
            avatar,
          },
        ];

    setUsers(next);
    writeUsers(next);

    if (!form.id) {
      const created = next.find((u) => u.username === username);
      setSelectedId(created?.id ?? null);
    }
  };

  const del = (id) => {
    if (String(user?.id) === String(id)) return;
    const next = users.filter((u) => String(u.id) !== String(id));
    setUsers(next);
    writeUsers(next);
    if (String(selectedId) === String(id)) resetNew();
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500";

  return (
    <div className="space-y-3">
      <Card title="👥 User Management" right={<Badge color="#3b82f6">{users.length}</Badge>}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="mb-2 flex gap-2">
              <button
                onClick={resetNew}
                className="flex-1 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 px-3 py-2 text-xs font-bold text-slate-300 hover:text-slate-100"
              >
                + New User
              </button>
            </div>

            <div className="space-y-2">
              {users.map((u) => {
                const active = String(u.id) === String(selectedId);
                const col = ROLE_COLOR[u.role] || "#64748b";
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={
                      "w-full rounded-xl border p-3 text-left transition " +
                      (active
                        ? "border-sky-500/30 bg-[var(--oee-surface-2)]/70"
                        : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 hover:bg-[var(--oee-surface-2)]/60")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-black"
                        style={{ borderColor: `${col}55`, background: `${col}25`, color: col }}
                      >
                        {u.avatar || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-slate-100">{u.name}</div>
                        <div className="truncate font-mono text-[10px] text-slate-500">{u.username}</div>
                      </div>
                      <div className="text-[10px] font-bold uppercase" style={{ color: col }}>
                        {u.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {form.id ? "Edit User" : "Create User"}
                </div>
                {form.id && (
                  <button
                    onClick={() => del(form.id)}
                    disabled={String(user?.id) === String(form.id)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition " +
                      (String(user?.id) === String(form.id)
                        ? "cursor-not-allowed border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 text-slate-500"
                        : "border border-red-500/20 bg-red-950/20 text-red-300 hover:bg-red-950/30")
                    }
                    title={String(user?.id) === String(form.id) ? "Cannot delete current user" : "Delete user"}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Name</div>
                  <input value={form.name} onChange={(e) => upd("name", e.target.value)} className={inputClass} />
                </div>

                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Avatar</div>
                  <input
                    value={form.avatar}
                    onChange={(e) => upd("avatar", e.target.value.slice(0, 1).toUpperCase())}
                    className={inputClass + " text-center font-black"}
                    maxLength={1}
                  />
                </div>

                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Username</div>
                  <input
                    value={form.username}
                    onChange={(e) => upd("username", e.target.value)}
                    className={inputClass + " font-mono"}
                    placeholder="username"
                  />
                </div>

                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Password</div>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => upd("password", e.target.value)}
                    className={inputClass + " font-mono"}
                    placeholder="password"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Role</div>
                  <select value={form.role} onChange={(e) => upd("role", e.target.value)} className={inputClass}>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Access:
                    <span className="ml-2 font-mono text-slate-300">
                      {(ROLE_ACCESS[form.role] || []).join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={resetNew}
                  className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20 hover:brightness-110 transition-all"
                >
                  Save
                </button>
              </div>

              <div className="mt-3 text-[10px] text-slate-500">
                - Username must be unique.
                <br />- Cannot delete the currently logged-in user.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
