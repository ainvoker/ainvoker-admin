import React, { useEffect, useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBars3,
  HiOutlineXMark,
} from 'react-icons/hi2';
import Mark from '../../assets/mark.svg';
import { ThemeToggle } from '../common/ThemeToggle';
import { CLIENT_URL } from '../../utils/auth';
import { sectionGroups } from '../../config/sections';

interface SidebarProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  onSignOut: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600',
    isActive
      ? 'bg-neutral-100 text-accent dark:bg-neutral-800'
      : 'text-neutral-500 hover:bg-neutral-50 hover:text-accent dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100',
  ].join(' ');

const menuItemClass =
  'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800';

const Wordmark = () => (
  <span className="flex items-center gap-2">
    <img src={Mark} alt="" className="h-5 invert dark:invert-0" />
    <span className="text-sm font-semibold tracking-tight text-accent">AInvoker</span>
    <span className="text-sm text-neutral-400">Admin</span>
  </span>
);

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onOpen,
  onClose,
  userEmail,
  userName,
  userAvatar,
  onSignOut,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/90">
        <button
          type="button"
          onClick={onOpen}
          className="grid size-9 place-content-center rounded-md text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open navigation"
        >
          <HiOutlineBars3 className="size-5" />
        </button>
        <Wordmark />
        <div className="size-9" aria-hidden />
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-neutral-200/80 bg-white text-accent transition-transform duration-300 ease-out md:static md:h-full md:shrink-0 md:translate-x-0 dark:border-neutral-800 dark:bg-neutral-950',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-12 items-center justify-between px-3 md:h-14">
          <NavLink to="/" onClick={onClose} className="rounded-md">
            <Wordmark />
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-content-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-accent md:hidden dark:hover:bg-neutral-800"
            aria-label="Close navigation"
          >
            <HiOutlineXMark className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-2 pt-2">
          {sectionGroups.map((group) => (
            <nav key={group.label} className="flex flex-col gap-0.5" aria-label={group.label}>
              <p className="px-2 pb-1 text-[11px] font-medium text-neutral-400">{group.label}</p>
              {group.sections.map(({ path, label, icon: Icon, live }) => (
                <NavLink key={path} to={path} onClick={onClose} className={linkClass}>
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  <span className="flex-1 truncate">{label}</span>
                  {!live && (
                    <span className="rounded-full border border-neutral-200 px-1.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-700">
                      Soon
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-auto border-t border-neutral-200/80 p-3 dark:border-neutral-800">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((value) => !value)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <span className="grid size-8 shrink-0 place-content-center overflow-hidden rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                {userAvatar && !avatarFailed ? (
                  <img
                    src={userAvatar}
                    alt=""
                    className="size-8 object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-accent">{userName}</span>
                <span className="block truncate text-[12px] text-neutral-400">{userEmail}</span>
              </span>
            </button>

            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                aria-label="Account menu"
                className="absolute bottom-full left-0 z-50 mb-2 w-full min-w-[15rem] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="border-b border-neutral-100 px-3 py-3 dark:border-neutral-800">
                  <p className="truncate px-1 text-[12px] text-neutral-500 dark:text-neutral-400">
                    Signed in as platform admin
                  </p>
                  <ThemeToggle className="mt-2.5" />
                </div>
                <div className="border-b border-neutral-100 p-1.5 dark:border-neutral-800">
                  <a href={CLIENT_URL} target="_blank" rel="noreferrer" role="menuitem" className={menuItemClass}>
                    <HiOutlineArrowTopRightOnSquare className="size-4 shrink-0 opacity-70" aria-hidden />
                    Open AInvoker dashboard
                  </a>
                </div>
                <div className="p-1.5">
                  <button type="button" role="menuitem" onClick={onSignOut} className={menuItemClass}>
                    <HiOutlineArrowRightOnRectangle className="size-4 shrink-0 opacity-70" aria-hidden />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
