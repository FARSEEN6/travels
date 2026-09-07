import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const { user, isRegistered, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (authDropdownOpen && !e.target.closest('.auth-dropdown-wrapper')) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [authDropdownOpen]);

  const handleSignOut = async () => {
    setAuthDropdownOpen(false);
    await signOut();
    navigate('/register');
  };

  return (
    <nav className="bg-white border-b border-outline-variant/40 shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 py-0.5">
          <img
            src="/logo-real.png"
            alt="Aashmi Tours & Travels"
            className="h-12 sm:h-14 w-auto object-contain transition-transform hover:scale-105"
          />
        </Link>

        {/* Action Cluster */}
        <div className="flex items-center space-x-4">
          {/* Auth Area */}
          <div className="relative auth-dropdown-wrapper">
            {isRegistered && user ? (
              <button
                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-4 py-2 rounded-full font-semibold text-sm shadow-sm transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user.full_name ? user.full_name[0] : 'U'}
                </div>
                <div className="flex flex-col text-left leading-tight hidden sm:block">
                  <span className="text-xs font-bold text-slate-800">
                    {user.full_name?.split(' ')[0] || 'Member'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    Verified ✓
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <Link
                to="/register"
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Register / Sign In</span>
              </Link>
            )}

            {/* Auth Dropdown */}
            {authDropdownOpen && isRegistered && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 flex flex-col animate-fadeIn">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Verified Traveler Account
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                    {user?.full_name || 'Traveler'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {user?.phone || user?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span>✓</span> {user?.id_type || 'PAN/Aadhaar'} & OTP Verified
                    </span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        👑 Admin
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to="/airline"
                  onClick={() => setAuthDropdownOpen(false)}
                  className="px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full flex items-center gap-2.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400">flight</span>
                  My Trips & Flights
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setAuthDropdownOpen(false)}
                    className="px-4 py-2.5 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50/60 transition-colors w-full flex items-center gap-2.5"
                  >
                    <span className="material-symbols-outlined text-[18px] text-amber-600">admin_panel_settings</span>
                    Admin Panel
                  </Link>
                )}

                <hr className="border-slate-100 my-1" />

                <button
                  onClick={handleSignOut}
                  className="px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
