import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/initialData';

export const LoginView: React.FC = () => {
  const { login, isDarkMode, toggleDarkMode } = useApp();
  const [email, setEmail] = useState('operator@stocksense.internal');
  const [password, setPassword] = useState('dock-pass-77402');
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-surface text-on-surface transition-colors relative">
      {/* Top right theme toggle on login screen */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 border border-outline-variant hover:bg-surface-container rounded-[2px] text-on-surface transition-colors"
          title="Toggle Dark Mode"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      <div className="flex flex-col w-full items-center justify-center py-8">
        {/* Archival Terminal Container */}
        <div className="w-full max-w-[420px] bg-surface-low border border-rule rounded-[4px] p-6 sm:p-10 flex flex-col relative shadow-sm">
          {/* Top System Stamp & Ledger Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 mb-3 flex items-center justify-center">
              <img
                alt="StockSense Manifest Mark"
                className="w-12 h-12 object-contain rounded-[2px]"
                src={ASSET_IMAGES.brandLogo}
                onError={(e) => {
                  // Fallback to text badge if image fails
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary tracking-widest uppercase mb-1 select-none">
              <span className="inline-block w-[3px] h-[10px] bg-primary-container" />
              <span>Terminal Auth // Dock 04</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1 mb-2 font-medium">
              {isRegisterMode ? 'Register Terminal Account' : 'Log in to StockSense'}
            </h1>
            <p className="font-body-sm text-body-sm text-secondary">
              Central freight manifest and inventory ledger entry.
            </p>
          </div>

          {/* Structural Hairline Rule */}
          <div className="w-full h-[1px] bg-rule my-5" />

          {/* Form Section */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Operator / Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md uppercase text-secondary tracking-wider flex items-center justify-between"
                htmlFor="terminal-email"
              >
                <span>Operator ID / Email</span>
                <span className="text-[10px] text-tertiary font-label-sm tracking-normal">
                  REQ // 01
                </span>
              </label>
              <div className="relative">
                <input
                  id="terminal-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@stocksense.internal"
                  className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                />
              </div>
            </div>

            {/* Access Key / Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="font-label-md text-label-md uppercase text-secondary tracking-wider flex items-center gap-1.5"
                  htmlFor="terminal-key"
                >
                  <span>Access Key</span>
                  <span className="text-[10px] text-tertiary font-label-sm tracking-normal">
                    REQ // 02
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Access key reset authorization requested. Contact Dock Master OP-774-K.')}
                  className="font-body-sm text-body-sm text-secondary hover:text-on-surface hover:underline transition-colors focus:outline-none"
                >
                  Forgot key?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  id="terminal-key"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 pl-3 pr-10 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                />
                <button
                  type="button"
                  id="toggle-password"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-secondary hover:text-on-surface focus:outline-none transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Ledger Keep-alive Option */}
            <div className="flex items-center justify-between mt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="persist-session"
                  type="checkbox"
                  checked={keepActive}
                  onChange={(e) => setKeepActive(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="w-[14px] h-[14px] border border-secondary rounded-[2px] bg-surface-lowest peer-checked:bg-on-surface peer-checked:border-on-surface flex items-center justify-center transition-colors group-hover:border-on-surface">
                  <svg
                    className="w-2.5 h-2.5 text-surface opacity-0 peer-checked:opacity-100 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                </span>
                <span className="font-body-sm text-body-sm text-secondary group-hover:text-on-surface transition-colors">
                  Keep ledger session active
                </span>
              </label>
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
                SH-048
              </span>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full mt-2 h-10 bg-primary-container hover:bg-[#8E4217] active:bg-[#783612] text-white font-label-lg text-label-lg tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-on-surface cursor-pointer"
            >
              <span>{isRegisterMode ? 'Create Station ID' : 'Log In'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>

          {/* Lower Ledger Routing & Footnote */}
          <div className="mt-6 pt-4 border-t border-rule flex flex-col items-center gap-1.5 text-center">
            <div className="font-body-sm text-body-sm text-secondary">
              {isRegisterMode ? 'Existing station operator?' : 'Unregistered station terminal?'}{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-on-surface hover:underline font-medium ml-1 transition-colors"
              >
                {isRegisterMode ? 'Log in here' : 'Create an account'}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1 font-label-sm text-label-sm text-tertiary">
              <span>STOCKSENSE v4.12</span>
              <span>·</span>
              <span>STATION REV 2024.11</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
