import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PenSquare,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-sky-100 text-sky-700'
      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
  }`;

const getUserInitials = (currentUser) => {
  const source = currentUser?.name?.trim() || currentUser?.username?.trim() || 'User';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const userInitials = getUserInitials(currentUser);

  const links = useMemo(() => {
    if (!currentUser) {
      return [
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }

    const items = [{ to: '/create-blog', label: 'Write', icon: PenSquare }];

    if (currentUser.role === 'ROLE_ADMIN') {
      items.push({ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    }

    return items;
  }, [currentUser]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
      <nav className="glass-panel mx-auto max-w-7xl rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="group inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-xs font-bold text-white shadow-md">
              BL
            </span>
            <div>
              <p className="text-sm font-semibold leading-none text-slate-900">Blooms</p>
              <p className="text-[11px] leading-none text-slate-500">Stories that move</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

            {currentUser ? (
              <div className="ml-2 flex items-center gap-3">
                <div className="group relative">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/78 px-2.5 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-sky-200 hover:bg-white"
                  >
                    {currentUser.profileUrl ? (
                      <img
                        src={currentUser.profileUrl}
                        alt={currentUser.name || 'User'}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/90"
                      />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-xs font-bold text-white ring-2 ring-white/90">
                        {userInitials}
                      </span>
                    )}

                    <div className="hidden min-w-0 lg:block">
                      <p className="max-w-[132px] truncate text-sm font-semibold text-slate-800">
                        {currentUser.name || currentUser.username || 'User'}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Account</p>
                    </div>

                    <ChevronDown
                      size={15}
                      className="hidden text-slate-400 transition group-hover:text-slate-600 lg:block"
                    />
                  </Link>

                  <div className="pointer-events-none absolute right-0 top-full z-20 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="w-64 translate-y-2 rounded-[1.5rem] border border-white/70 bg-white/92 p-2 shadow-[0_24px_64px_rgba(15,23,42,0.16)] backdrop-blur-xl transition duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
                      <div className="flex items-center gap-3 rounded-[1.15rem] bg-slate-50/80 px-3 py-3">
                        {currentUser.profileUrl ? (
                          <img
                            src={currentUser.profileUrl}
                            alt={currentUser.name || 'User'}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-bold text-white">
                            {userInitials}
                          </span>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {currentUser.name || currentUser.username || 'User'}
                          </p>
                          <p className="truncate text-xs text-slate-500">@{currentUser.username || 'writer'}</p>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Settings size={15} />
                            Settings
                          </span>
                          <ChevronDown size={14} className="-rotate-90" />
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <LogOut size={15} />
                            Logout
                          </span>
                          <ChevronDown size={14} className="-rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !isAuthPage ? (
              <Link
                to="/register"
                className="button-primary ml-2 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                Get started
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/80 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-1 border-t border-slate-200/75 pt-3 md:hidden"
            >
              {currentUser ? (
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-200/75 bg-white/80 px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                >
                  {currentUser.profileUrl ? (
                    <img
                      src={currentUser.profileUrl}
                      alt={currentUser.name || 'User'}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-bold text-white">
                      {userInitials}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {currentUser.name || currentUser.username || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">Open account settings</p>
                  </div>
                </Link>
              ) : null}

              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-100 text-sky-700'
                        : 'text-slate-700 hover:bg-white/70'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <Settings size={15} />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-2 text-left text-sm font-medium text-rose-700"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="button-primary mt-1 block rounded-lg px-3 py-2 text-center text-sm font-semibold"
                >
                  Get started
                </Link>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
