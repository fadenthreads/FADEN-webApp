"use client";

import { useState, useTransition } from "react";
import type { Profile, UserRole } from "@faden/types";
import { updateUserRole } from "@/actions/admin";

interface UsersTableProps {
  users: Profile[];
}

const ROLES: UserRole[] = ["customer", "boutique_owner", "admin"];

export function UsersTable({ users }: UsersTableProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRoleChange(userId: string, role: UserRole) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateUserRole({ userId, role });
      setMessage(result.ok ? "Role updated." : (result.error ?? "Update failed"));
    });
  }

  return (
    <div>
      {message && (
        <p className="mb-4 rounded-lg border border-gold/30 bg-accent-50 px-3 py-2 text-sm text-gold-light">
          {message}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-background-soft text-left text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3">{user.full_name || "—"}</td>
                <td className="px-4 py-3 text-foreground-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={pending}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <p className="px-4 py-8 text-center text-foreground-muted">No users found.</p>
        )}
      </div>
    </div>
  );
}
