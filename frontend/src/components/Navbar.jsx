import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Menu, PenSquare, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-sky-100 text-sky-700'
      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
  }`;

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const links = useMemo(() => {
    if (!currentUser) {
      return [
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }

    const items = [
      { to: '/create-blog', label: 'Write', icon: PenSquare },
      { to: '/profile', label: 'Profile', icon: UserRound },
    ];

    if (currentUser.role === 'ROLE_ADMIN') {
      items.splice(1, 0, { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    }

    return items;
  }, [currentUser]);

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
              <>
                <div className="ml-2 hidden items-center gap-2 rounded-xl border border-slate-200/75 bg-white/75 px-2 py-1.5 lg:flex">
                  {currentUser.profileUrl ? (
                    <img
                      src={currentUser.profileUrl}
                      alt={currentUser.name || 'User'}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                      {(currentUser.name || 'U').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[120px] truncate text-xs font-medium text-slate-700">
                    {currentUser.name || 'User'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="ml-2 rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  Logout
                </button>
              </>
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
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
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
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="mt-1 w-full rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-2 text-left text-sm font-medium text-rose-700"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
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
