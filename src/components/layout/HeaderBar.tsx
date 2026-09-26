import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/initialData';

interface HeaderBarProps {
  onToggleMobileMenu?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleMobileMenu }) => {
  const { isDarkMode, toggleDarkMode, userProfile, logout } = useApp();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        profileOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileOpen]);

  return (
    <header className="fixed top-0 left-0 md:left-14 right-0 h-14 bg-surface-low border-b border-rule z-40 flex items-center justify-between px-4 sm:px-6 select-none transition-colors">
      {/* Left: Mobile hamburger & Station protocol brow */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-on-surface hover:bg-surface-container rounded-[2px]"
          aria-label="Toggle mobile menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="font-label-md text-label-md text-tertiary tracking-widest uppercase font-medium truncate">
            // DEPOT-402 · MANIFEST REVISION PROTOCOL
          </span>
          <span className="hidden sm:inline h-3 w-px bg-outline-variant" />
          <span className="hidden sm:inline font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            LIVE TALLY SYSTEM
          </span>
        </div>
      </div>

      {/* Right: Live Telemetry, Dark Mode, Operator Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* System Connected Pulse Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-outline-variant text-tertiary font-label-sm text-label-sm rounded-[2px]">
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" />
          <span className="tracking-wider uppercase font-semibold">SYS CONNECTED</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 bg-surface border border-outline-variant hover:bg-surface-container text-on-surface rounded-[2px] transition-colors flex items-center justify-center cursor-pointer"
          title={isDarkMode ? 'Switch to Warm Archival Paper (Light)' : 'Switch to Archival Darkroom Mode'}
          aria-label="Toggle theme mode"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Operator Profile Trigger & Dropdown */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 bg-surface hover:bg-surface-container border border-outline-variant rounded-[2px] transition-colors cursor-pointer"
          >
            <img
              alt="Operator Avatar"
              className="w-7 h-7 rounded-full object-cover border border-outline-variant"
              src={userProfile?.avatarUrl || ASSET_IMAGES.avatar}
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-label-md text-label-md font-semibold text-on-surface leading-tight tracking-wider">
                {userProfile?.name || 'User'}
              </span>
              <span className="font-label-sm text-label-sm text-secondary leading-none">
                {userProfile?.email || ''}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[16px] text-tertiary transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Operator Profile Dropdown Panel (Exact Match to Screenshot 19/21) */}
          {profileOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full right-0 mt-2 w-72 bg-surface-lowest border border-rule rounded-[3px] shadow-lg z-50 flex flex-col overflow-hidden text-on-surface"
            >
              {/* Operator Details Header Block */}
              <div className="p-3 bg-surface-low border-b border-rule flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface tracking-wider">
                    {userProfile?.name || 'User'}
                  </span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-primary-fixed text-primary-container font-bold rounded-[2px] uppercase">
                    ACTIVE
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary truncate">
                  {userProfile?.email || ''}
                </span>
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mt-1">
                  {userProfile?.role || 'warehouse_staff'}
                </span>
              </div>

              {/* Action Rows */}
              <div className="flex flex-col py-1">
                <button
                  onClick={() => {
                    navigate('/profile-station');
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-surface-container transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">
                    badge
                  </span>
                  <span className="font-label-md text-label-md tracking-wider uppercase font-medium">
                    View Profile
                  </span>
                </button>

                <div className="h-[1px] w-full bg-rule my-1" />

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-error hover:bg-error-container/20 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="font-label-md text-label-md tracking-wider uppercase font-semibold">
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
