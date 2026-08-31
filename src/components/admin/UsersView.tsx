import React, { useState } from 'react';
import { Search, Plus, Shield, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { UserAccount } from '../../types';

interface UsersViewProps {
  users: UserAccount[];
  onAddUser: (user: Partial<UserAccount>) => void;
  onUpdateRole: (userId: string, newRole: UserAccount['role']) => void;
  onToggleStatus: (userId: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onAddUser,
  onUpdateRole,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserAccount['role']>('Developer');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    onAddUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      plan: 'Pro',
      status: 'Invited',
      requestsMonth: 0,
      joinedDate: 'Just now',
    });
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]"
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46] transition-colors"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Developer">Developer</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={13} /> Invite User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121215] border-b border-[#27272a] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Plan</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Requests (Mo)</th>
                <th className="px-4 py-2.5">Joined</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#27272a]/40 transition-colors"
                >
                  {/* User info */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#27272a] border border-[#3f3f46] flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#fafafa]">{user.name}</p>
                        <p className="text-[10px] text-[#71717a] font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                        user.role === 'Super Admin'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                          : user.role === 'Admin'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                          : user.role === 'Developer'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                          : 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46]'
                      }`}
                    >
                      <Shield size={10} />
                      {user.role}
                    </span>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[#a1a1aa] text-xs">{user.plan}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        user.status === 'Active'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          : user.status === 'Invited'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {user.status === 'Active' ? (
                        <CheckCircle2 size={10} />
                      ) : user.status === 'Invited' ? (
                        <Clock size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {user.status}
                    </span>
                  </td>

                  {/* Requests */}
                  <td className="px-4 py-2.5 font-mono text-[#fafafa]">
                    {user.requestsMonth.toLocaleString()}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-2.5 text-[#71717a] text-[11px]">
                    {user.joinedDate}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleStatus(user.id)}
                        className="px-2 py-1 rounded text-[11px] font-medium bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46] transition-colors"
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-[#fafafa]">Invite Team Member</h3>
            <p className="text-xs text-[#a1a1aa]">
              Grant admin or developer access to manage models, API keys, and platform routing.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#fafafa] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#fafafa] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#fafafa] mb-1">
                  System Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserAccount['role'])}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
                >
                  <option value="Admin">Admin (Full system access)</option>
                  <option value="Developer">Developer (API keys & routing tools)</option>
                  <option value="Viewer">Viewer (Read-only telemetry)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-3.5 py-1.5 rounded-md transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
