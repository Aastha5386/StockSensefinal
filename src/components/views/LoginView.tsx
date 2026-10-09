import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Check,
  UserCheck,
} from 'lucide-react';

import { getDefaultRouteForRole, isRouteAllowedForRole } from '../../lib/roleRoutes';
import { UserRole } from '../../types';

interface LoginViewProps {
  initialMode?: 'signin' | 'signup';
}

export const LoginView: React.FC<LoginViewProps> = ({ initialMode }) => {
  const { login, register, isDarkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode: prop takes priority, then URL path, default signin
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(() => {
    if (initialMode === 'signup') return true;
    if (initialMode === 'signin') return false;
    return location.pathname === '/signup';
  });

  // Company Form states
  const [companyName, setCompanyName] = useState('');
  const [companyEmailOrId, setCompanyEmailOrId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dynamic Password Security Rules Evaluation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const allPasswordRulesMet = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const passwordRules = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'One uppercase letter (A-Z)', met: hasUpper },
    { label: 'One lowercase letter (a-z)', met: hasLower },
    { label: 'One number (0-9)', met: hasNumber },
    { label: 'One special character (@, #, $, %, etc.)', met: hasSpecial },
  ];

  // Sync mode with route changes & read flash messages
  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsRegisterMode(true);
      setErrorMessage(null);
    } else if (location.pathname === '/signin' || location.pathname === '/login') {
      setIsRegisterMode(false);
    }

    const stateObj = location.state as any;
    if (stateObj?.successMessage) {
      setSuccessMessage(stateObj.successMessage);
    }
    if (stateObj?.registeredEmail) {
      setCompanyEmailOrId(stateObj.registeredEmail);
    }
  }, [location.pathname, location.state]);

  const switchMode = (toRegister: boolean) => {
    setIsRegisterMode(toRegister);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
    if (toRegister) {
      navigate('/signup', { replace: true });
    } else {
      navigate('/signin', { replace: true });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = companyEmailOrId.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your Company Email or ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanIdentifier, password, keepActive);
      if (res.success && res.role) {
        const requestedFrom = (location.state as any)?.from?.pathname;
        const dest =
          requestedFrom &&
          requestedFrom !== '/' &&
          requestedFrom !== '/login' &&
          requestedFrom !== '/signin' &&
          requestedFrom !== '/signup' &&
          isRouteAllowedForRole(requestedFrom, res.role)
            ? requestedFrom
            : getDefaultRouteForRole(res.role);

        navigate(dest, { replace: true });
      } else {
        setErrorMessage(res.message || 'Invalid company credentials or password.');
      }
    } catch (err: any) {
      setErrorMessage('Invalid company credentials or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validate Company Name
    const cleanCompanyName = companyName.trim();
    if (!cleanCompanyName) {
      setErrorMessage('Company Name cannot be empty.');
      return;
    }

    // 2. Validate Company Email/ID format
    const cleanIdentifier = companyEmailOrId.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Company Email or ID cannot be empty.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanIdentifier.includes('@')) {
      if (!emailRegex.test(cleanIdentifier)) {
        setErrorMessage('Please enter a valid Company Email address.');
        return;
      }
    } else {
      const idRegex = /^[a-zA-Z0-9_\-\.]+$/;
      if (cleanIdentifier.length < 3 || !idRegex.test(cleanIdentifier)) {
        setErrorMessage('Company ID must be at least 3 alphanumeric characters.');
        return;
      }
    }

    // 3. Validate Password Security Rules
    if (!allPasswordRulesMet) {
      if (!hasMinLength) {
        setErrorMessage('Password must be at least 8 characters long.');
      } else if (!hasUpper) {
        setErrorMessage('Password must contain at least one uppercase letter (A-Z).');
      } else if (!hasLower) {
        setErrorMessage('Password must contain at least one lowercase letter (a-z).');
      } else if (!hasNumber) {
        setErrorMessage('Password must contain at least one number (0-9).');
      } else if (!hasSpecial) {
        setErrorMessage('Password must contain at least one special character (e.g. @ # $ % ! * &).');
      } else {
        setErrorMessage('Please satisfy all password requirements.');
      }
      return;
    }

    // 4. Validate Confirm Password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        companyName: cleanCompanyName,
        companyEmailOrId: cleanIdentifier,
        password,
        confirmPassword,
        role: selectedRole,
      });

      if (res.success) {
        // DO NOT log user in automatically. Require explicit sign-in first.
        setPassword('');
        setConfirmPassword('');
        const successNotice =
          res.message || 'Company account created successfully. Please sign in with your Company Email/ID to continue.';
        setSuccessMessage(successNotice);
        navigate('/signin', {
          replace: true,
          state: {
            registeredEmail: cleanIdentifier,
            successMessage: successNotice,
          },
        });
        setIsRegisterMode(false);
      } else {
        setErrorMessage(res.message || 'Company registration failed. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Company registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F7F5FF] dark:bg-[#0E0C1A] text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 border border-[#E8E5F2] dark:border-[#282342] hover:bg-white dark:hover:bg-[#141124] rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-[460px] py-8">
        {/* Modern Corporate Elevated Card */}
        <div className="bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#6C4CE6]/10 dark:shadow-none relative">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C4CE6] to-[#8C6EF2] flex items-center justify-center text-white shadow-md shadow-[#6C4CE6]/25 mb-3.5">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isRegisterMode ? 'Register Your Company' : 'FleetFlow / StockSense Portal'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#A5A1BE] mt-1">
              {isRegisterMode
                ? 'Create a dedicated corporate tenant with encrypted telemetry'
                : 'Enterprise Logistics & Central Inventory Access'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 p-1 rounded-2xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-white dark:bg-[#141124] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-white dark:bg-[#141124] text-[#6C4CE6] dark:text-[#A78BFA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {isRegisterMode ? (
            /* ================= SIGN UP FORM (Company Name, Company Email/ID, Password, Confirm Password) ================= */
            <form onSubmit={handleSignUp} className="flex flex-col gap-3 mt-5">
              {/* Company Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="reg-company-name">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-company-name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Logistics"
                    className="h-10 w-full pl-9 pr-3 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]"
                  />
                </div>
              </div>

              {/* Company Email / ID */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="reg-company-id">
                  Company Email or ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-company-id"
                    type="text"
                    required
                    value={companyEmailOrId}
                    onChange={(e) => setCompanyEmailOrId(e.target.value)}
                    placeholder="e.g. admin@company.com or COMPANY-ID"
                    className="h-10 w-full pl-9 pr-3 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#8D88A6] pl-0.5">
                  Use your corporate email or unique company ID for sign-in.
                </span>
              </div>

              {/* Operational Role Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="reg-role">
                  Operational Role
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="reg-role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="h-10 w-full pl-9 pr-8 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6] cursor-pointer"
                  >
                    <option value="admin">Admin (Executive Dashboard &amp; Full Access)</option>
                    <option value="inventory_manager">Inventory Manager (Stock &amp; Forecasting)</option>
                    <option value="warehouse_staff">Warehouse Staff (Barcode / QR Scanner Station)</option>
                    <option value="purchase_manager">Purchase Manager (Purchase Orders &amp; Receipts)</option>
                  </select>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#8D88A6] pl-0.5">
                  Your workspace dashboard will automatically adapt to this role.
                </span>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (e.g. StockSense@123)"
                    className="h-10 w-full pl-9 pr-10 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-2xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#A5A1BE]">
                  Password requirements:
                </span>
                <ul className="flex flex-col gap-1.5">
                  {passwordRules.map((rule, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
                        rule.met
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {rule.met ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                      <span>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="reg-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`h-10 w-full pl-9 pr-10 bg-[#FAF9FD] dark:bg-[#1B172E] border rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 transition-all ${
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? 'border-rose-300 dark:border-rose-800/80 focus:ring-rose-500/20 focus:border-rose-500'
                        : confirmPassword.length > 0 && confirmPassword === password
                        ? 'border-emerald-300 dark:border-emerald-800/80 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-[#E8E5F2] dark:border-[#282342] focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-0.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Passwords do not match.</span>
                  </div>
                )}
                {confirmPassword.length > 0 && confirmPassword === password && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Passwords match.</span>
                  </div>
                )}
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#6C4CE6]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Company...</span>
                  </>
                ) : (
                  <>
                    <span>Register Company</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN IN FORM (Company Email/ID + Password) ================= */
            <form onSubmit={handleSignIn} className="flex flex-col gap-3.5 mt-5">
              {/* Company Email / ID */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="signin-id">
                  Company Email or ID
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-id"
                    type="text"
                    required
                    value={companyEmailOrId}
                    onChange={(e) => setCompanyEmailOrId(e.target.value)}
                    placeholder="e.g. admin@company.com or COMPANY-ID"
                    className="h-10 w-full pl-9 pr-3 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="signin-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full pl-9 pr-10 bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4CE6]/20 focus:border-[#6C4CE6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Keep session active */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={keepActive}
                    onChange={(e) => setKeepActive(e.target.checked)}
                    className="accent-[#6C4CE6] rounded"
                  />
                  <span>Keep company session active</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 h-11 w-full bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#6C4CE6]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Company Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Register / Login Footer */}
          <div className="mt-5 text-center">
            {isRegisterMode ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already registered your company?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className="font-semibold text-[#6C4CE6] dark:text-[#A78BFA] hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Need to register a new company?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className="font-semibold text-[#6C4CE6] dark:text-[#A78BFA] hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
