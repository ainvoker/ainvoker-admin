import React, { useState } from 'react';
import {
  Home,
  Users,
  Cpu,
  Activity,
  Key,
  Server,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { TabType } from '../../types';
import { AInvokerLogo } from '../common/AInvokerLogo';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userEmail?: string;
  userName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userEmail = 'patrickblando28@gmail.com',
  userName = 'Eazy James',
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const mainNav = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home },
  ];

  const adminNav = [
    { id: 'users' as TabType, label: 'Users & Tenants', icon: Users, badge: 'Admin' },
    { id: 'models' as TabType, label: 'Models & Routing', icon: Cpu },
    { id: 'logs' as TabType, label: 'Inference Logs', icon: Activity },
    { id: 'apikeys' as TabType, label: 'API Keys & Quotas', icon: Key },
    { id: 'health' as TabType, label: 'System Health', icon: Server },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="admin-sidebar"
      className="w-60 min-h-screen bg-[#09090b] border-r border-[#27272a] flex flex-col justify-between select-none relative z-30 flex-shrink-0"
    >
      {/* Top Section */}
      <div className="p-3.5 flex flex-col gap-5">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <AInvokerLogo size={24} />
          <span className="text-[15px] font-bold tracking-tight text-[#fafafa] flex items-center gap-1.5">
            AInvoker
            <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">
              Admin
            </span>
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-4">
          {/* Main Navigation */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
              Overview
            </div>
            <nav className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#27272a] text-[#fafafa] font-semibold'
                        : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]'
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isActive ? 'text-[#fafafa]' : 'text-[#71717a]'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Control Plane Section */}
          <div>
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Admin & Control
              </span>
              <Shield size={11} className="text-[#71717a]" />
            </div>
            <nav className="space-y-0.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#27272a] text-[#fafafa] font-semibold'
                        : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={14}
                        className={isActive ? 'text-[#fafafa]' : 'text-[#71717a]'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-2.5 border-t border-[#27272a] bg-[#09090b]">
        <div className="relative">
          <button
            id="user-profile-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#18181b] transition-colors text-left border border-transparent hover:border-[#27272a] group"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#3f3f46] bg-[#27272a] flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt={userName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#fafafa] truncate group-hover:text-white">
                {userName}
              </p>
              <p className="text-[10px] text-[#71717a] truncate">
                {userEmail}
              </p>
            </div>
          </button>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div
              id="user-popover-menu"
              className="absolute bottom-full left-0 mb-1 w-full bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-100"
            >
              <div className="px-2 py-1.5 border-b border-[#27272a] mb-1">
                <p className="text-xs font-semibold text-[#fafafa]">{userName}</p>
                <span className="text-[10px] text-emerald-400 font-mono">System SuperAdmin</span>
              </div>
              <button
                onClick={() => {
                  onSelectTab('settings');
                  setUserMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-md text-xs text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] flex items-center gap-2"
              >
                <Settings size={12} />
                <span>Account Settings</span>
              </button>
              <a
                href="https://ainvoker.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-2 py-1.5 rounded-md text-xs text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={12} />
                  <span>Client App</span>
                </div>
                <span className="text-[9px] text-[#71717a]">Live</span>
              </a>
              <div className="my-1 border-t border-[#27272a]" />
              <button
                onClick={() => alert('Logged out safely (Simulated)')}
                className="w-full text-left px-2 py-1.5 rounded-md text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
