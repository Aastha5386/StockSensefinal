import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getDefaultRouteForRole } from '../../lib/roleRoutes';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Boxes,
  RefreshCw,
  Activity,
  Building2,
  Zap,
  ShieldCheck,
  Briefcase,
  HardHat,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Check,
  EyeOff,
  PackageMinus,
  Archive,
  Clock,
  Sparkles,
  BarChart3,
  QrCode,
  FileText,
  Send,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const { isAuthenticated, userRole, logout, isDarkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const destinationRoute = getDefaultRouteForRole(userRole);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate(destinationRoute);
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F5FF] dark:bg-[#0E0C1A] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#6C4CE6]/20 selection:text-[#6C4CE6] transition-colors scroll-smooth">
      {/* =========================================================================
          1. STICKY NAVBAR
      ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-[#0E0C1A]/85 border-b border-[#E8E5F2] dark:border-[#282342] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Name */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C4CE6] to-[#8C6EF2] flex items-center justify-center text-white shadow-md shadow-[#6C4CE6]/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                StockSense
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4CE6]" />
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-[#A5A1BE] hidden sm:block">
                Intelligent Inventory
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('home')}
              className="hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('intelligence')}
              className="hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
            >
              Intelligence
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-slate-600 dark:text-slate-300 hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors cursor-pointer shadow-2xs"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate(destinationRoute)}
                  className="px-4 py-2.5 rounded-xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold shadow-md shadow-[#6C4CE6]/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/signin', { replace: true });
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] hover:bg-white dark:hover:bg-[#141124] border border-transparent hover:border-[#E8E5F2] dark:hover:border-[#282342] transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2.5 rounded-xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold shadow-md shadow-[#6C4CE6]/25 flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#6C4CE6]/30"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-slate-600 dark:text-slate-300"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2 rounded-xl border border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] text-slate-700 dark:text-slate-200 cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] px-4 pt-3 pb-6 flex flex-col gap-3 shadow-xl animate-in slide-in-from-top-2">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C4CE6]"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C4CE6]"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('intelligence')}
              className="text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C4CE6]"
            >
              Intelligence
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C4CE6]"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6C4CE6]"
            >
              About
            </button>

            <div className="h-px bg-[#E8E5F2] dark:bg-[#282342] my-1" />

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => navigate(destinationRoute)}
                  className="w-full py-2.5 rounded-xl bg-[#6C4CE6] text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/signin', { replace: true });
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full py-2.5 rounded-xl border border-[#E8E5F2] dark:border-[#282342] text-xs font-semibold text-slate-700 dark:text-slate-200 text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-2.5 rounded-xl bg-[#6C4CE6] text-white text-xs font-semibold text-center shadow-md shadow-[#6C4CE6]/25"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section
        id="home"
        className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden border-b border-[#E8E5F2] dark:border-[#282342]"
      >
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-gradient-to-tr from-[#6C4CE6]/15 to-[#8C6EF2]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Small Trust/Product Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141124] border border-[#6C4CE6]/30 dark:border-[#8C6EF2]/30 shadow-xs mb-6 text-[#6C4CE6] dark:text-[#A78BFA] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTELLIGENT INVENTORY MANAGEMENT</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Turn Inventory Data Into{' '}
              <span className="bg-gradient-to-r from-[#6C4CE6] via-[#8C6EF2] to-[#A78BFA] bg-clip-text text-transparent">
                Smarter Decisions.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-[#A5A1BE] max-w-2xl leading-relaxed">
              StockSense helps businesses monitor inventory, predict demand, optimize stock levels and make faster
              data-driven decisions from one intelligent platform.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate(destinationRoute)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-sm font-semibold shadow-xl shadow-[#6C4CE6]/30 hover:shadow-2xl hover:shadow-[#6C4CE6]/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/signin', { replace: true });
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#141124] hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E] text-slate-700 dark:text-slate-200 border border-[#E8E5F2] dark:border-[#282342] text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-sm font-semibold shadow-xl shadow-[#6C4CE6]/30 hover:shadow-2xl hover:shadow-[#6C4CE6]/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/signin')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#141124] hover:bg-[#FAF9FD] dark:hover:bg-[#1B172E] text-slate-700 dark:text-slate-200 border border-[#E8E5F2] dark:border-[#282342] text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

          </div>

          {/* =========================================================================
              3. HERO VISUAL: MINIATURE DASHBOARD PREVIEW
          ========================================================================= */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl p-3 sm:p-6 shadow-2xl shadow-[#6C4CE6]/15 dark:shadow-none transition-all">
              {/* Fake Window Browser Chrome */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E8E5F2] dark:border-[#282342] text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    telemetry.stocksense.internal/live
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                    LIVE TELEMETRY ACTIVE
                  </span>
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                {/* 1. Inventory Health Score */}
                <div className="p-4 rounded-2xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Inventory Health Score
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      HEALTHY
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">88</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-[#6C4CE6] h-full rounded-full w-[88%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-[#A5A1BE] mt-2">
                    <span>92% Stable SKUs</span>
                    <span className="text-amber-500 font-medium">8% Needs Review</span>
                  </div>
                </div>

                {/* 2. Total Inventory & Value */}
                <div className="p-4 rounded-2xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Total Inventory</span>
                    <Boxes className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">14,820</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+12% vs last mo</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#A5A1BE]">
                    <span>Total Asset Value</span>
                    <span className="font-bold text-slate-900 dark:text-white">$342,850.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#A5A1BE] mt-1">
                    <span>Active Locations</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">3 Warehouses</span>
                  </div>
                </div>

                {/* 3. Low Stock Alerts */}
                <div className="p-4 rounded-2xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Low Stock Alerts</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      3 URGENT
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between text-[11px] bg-white dark:bg-[#141124] p-1.5 rounded-lg border border-[#E8E5F2] dark:border-[#282342]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Dell UltraSharp 27"</span>
                      <span className="text-rose-600 font-bold shrink-0">4 left</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] bg-white dark:bg-[#141124] p-1.5 rounded-lg border border-[#E8E5F2] dark:border-[#282342]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">USB-C Hub Dual</span>
                      <span className="text-amber-600 font-bold shrink-0">8 left</span>
                    </div>
                  </div>
                </div>

                {/* 4. Demand Forecast (Wide 2-col on MD) */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#6C4CE6] dark:text-[#A78BFA]" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        30-Day Demand Forecast &amp; Inventory Trend
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      +18.4% Expected Surge
                    </span>
                  </div>

                  {/* SVG Trend Line Visual */}
                  <div className="h-28 w-full mt-2 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 90" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6C4CE6" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#6C4CE6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,70 Q 60,65 100,50 T 200,35 T 300,20 T 400,10 L 400,90 L 0,90 Z"
                        fill="url(#purpleGrad)"
                      />
                      <path
                        d="M0,70 Q 60,65 100,50 T 200,35 T 300,20 T 400,10"
                        fill="none"
                        stroke="#6C4CE6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4 (Surge Projected)</span>
                  </div>
                </div>

                {/* 5. Smart Reorder Recommendation */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6C4CE6]/10 to-transparent dark:from-[#6C4CE6]/20 border border-[#6C4CE6]/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#6C4CE6] dark:text-[#A78BFA] mb-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>Smart Reorder Rec</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      Reorder 80 units of Laptop Chargers within 3 days.
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#A5A1BE] mt-1.5">
                      Calculated from 5-day supplier lead time and average burn rate.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#6C4CE6]/20 flex items-center justify-between text-[10px] text-[#6C4CE6] dark:text-[#A78BFA] font-semibold">
                    <span>Optimal Reorder Qty: 80</span>
                    <span>PO Drafted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PROBLEM -> SOLUTION SECTION
      ========================================================================= */}
      <section id="problem-solution" className="py-16 sm:py-24 border-b border-[#E8E5F2] dark:border-[#282342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#6C4CE6] dark:text-[#A78BFA]">
              The Supply Chain Challenge
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Inventory Management Shouldn't Be Guesswork.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A1BE] mt-3">
              Traditional spreadsheets and disjointed tools fail to catch stockouts before they hit your revenue.
            </p>
          </div>

          {/* 3 Problems */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Problem 1: Low Stock */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-rose-300 dark:hover:border-rose-900/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PackageMinus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Low Stock</h3>
              <p className="text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                "Unexpected stockouts can interrupt operations."
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-3">
                Causes missed shipments and lost customer trust.
              </p>
            </div>

            {/* Problem 2: Dead Stock */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-amber-300 dark:hover:border-amber-900/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dead Stock</h3>
              <p className="text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                "Slow-moving inventory ties up valuable capital."
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-3">
                Occupies warehouse square footage with zero turnover.
              </p>
            </div>

            {/* Problem 3: Poor Visibility */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-blue-300 dark:hover:border-blue-900/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Poor Visibility</h3>
              <p className="text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                "Scattered inventory data makes decisions slower."
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-3">
                Disorganized spreadsheets delay critical purchasing cycles.
              </p>
            </div>
          </div>

          {/* Solution Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6C4CE6] to-[#8C6EF2] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#6C4CE6]/25">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">The StockSense Solution</span>
              <h3 className="text-xl sm:text-2xl font-bold">
                One platform. Complete inventory visibility. Smarter decisions.
              </h3>
              <p className="text-xs sm:text-sm text-purple-100 max-w-xl mt-1">
                From barcode-scanned floor operations to predictive procurement, StockSense connects every node in your
                inventory ecosystem.
              </p>
            </div>
            <button
              onClick={handleAuthAction}
              className="px-6 py-3 rounded-2xl bg-white text-[#6C4CE6] text-xs font-bold shadow-md hover:bg-[#FAF9FD] transition-all shrink-0 cursor-pointer"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Explore Platform'}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CORE FEATURES SECTION
      ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 border-b border-[#E8E5F2] dark:border-[#282342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#6C4CE6] dark:text-[#A78BFA]">
              Precision Operations
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything You Need to Manage Inventory Smarter
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A1BE] mt-3">
              Comprehensive telemetry, automated workflows, and intelligence engines designed for operational rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Smart Inventory Management */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] dark:hover:border-[#8C6EF2] hover:shadow-lg hover:shadow-[#6C4CE6]/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Inventory Management</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                Track products, quantities, categories and inventory movement across every warehouse bin and shelf.
              </p>
            </div>

            {/* Feature 2: Demand Forecasting */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] dark:hover:border-[#8C6EF2] hover:shadow-lg hover:shadow-[#6C4CE6]/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Demand Forecasting</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                Analyze historical trends and seasonal spikes to accurately estimate future inventory requirements.
              </p>
            </div>

            {/* Feature 3: Smart Reorder Recommendations */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] dark:hover:border-[#8C6EF2] hover:shadow-lg hover:shadow-[#6C4CE6]/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Reorder Recommendations</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                Identify products that need replenishment and automatically recommend optimal reorder quantities.
              </p>
            </div>

            {/* Feature 4: Inventory Health Score */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] dark:hover:border-[#8C6EF2] hover:shadow-lg hover:shadow-[#6C4CE6]/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Inventory Health Score</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                Understand the overall health and risk level of your inventory with intuitive 0–100 scoring.
              </p>
            </div>

            {/* Feature 5: Supplier Intelligence */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] dark:hover:border-[#8C6EF2] hover:shadow-lg hover:shadow-[#6C4CE6]/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Supplier Intelligence</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                Monitor supplier performance, delivery reliability, on-time delivery rates and purchasing activity.
              </p>
            </div>

            {/* Feature 6: Real-Time Insights */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] dark:hover:border-[#8C6EF2] hover:shadow-lg hover:shadow-[#6C4CE6]/10 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Insights</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                Get actionable alerts and insights directly in your workspace instead of manually checking spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. INTELLIGENCE SECTION
      ========================================================================= */}
      <section id="intelligence" className="py-16 sm:py-24 border-b border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#120F20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#6C4CE6] dark:text-[#A78BFA]">
              Data-Driven Telemetry
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              From Inventory Data to Actionable Intelligence.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A1BE] mt-3">
              Live algorithmic signals that identify vulnerabilities, forecast consumption, and automate safety stock.
            </p>
          </div>

          {/* AI / Analytics Command Center Visual */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#6C4CE6]/10">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E5F2] dark:border-[#282342]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C4CE6] animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  StockSense Telemetry Stream
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">5 active algorithmic triggers</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Signal 1: Stockout Risk */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                      ⚠ 7 products are at high stockout risk.
                    </span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-400">
                      Projected depletion in less than 4 operational days based on current burn rate.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-200/60 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 text-[10px] font-bold self-start sm:self-center shrink-0">
                  CRITICAL BUFFER
                </span>
              </div>

              {/* Signal 2: Expected Demand */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#6C4CE6] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">
                      ↗ Expected demand increased by 18%.
                    </span>
                    <span className="text-[11px] text-purple-700 dark:text-purple-400">
                      Seasonality model identifies heightened consumption over the upcoming fiscal sprint.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-200/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-[10px] font-bold self-start sm:self-center shrink-0">
                  DEMAND SURGE
                </span>
              </div>

              {/* Signal 3: Smart Reorder */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                      ⟳ Reorder 80 units of Product A.
                    </span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-400">
                      Calculated using supplier lead time of 6 days and safety stock requirements.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-200/60 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] font-bold self-start sm:self-center shrink-0">
                  REORDER READY
                </span>
              </div>

              {/* Signal 4: Dead Stock Detector */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      ⚠ 23 products have not moved in 60+ days.
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      Holding cost estimated at $4,200/month. Recommended for clearance or bundling.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold self-start sm:self-center shrink-0">
                  DEAD STOCK
                </span>
              </div>

              {/* Signal 5: Health Score */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                      ✓ Inventory health score: 84/100.
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Overall inventory catalog maintains strong stock health and balanced fulfillment ratios.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-200/60 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold self-start sm:self-center shrink-0">
                  OPTIMAL STATUS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HOW IT WORKS SECTION
      ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#E8E5F2] dark:border-[#282342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#6C4CE6] dark:text-[#A78BFA]">
              Streamlined Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">How It Works</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A1BE] mt-3">
              Simple, reliable 4-step execution designed to transform warehouse disorder into intelligent flow.
            </p>
          </div>

          {/* Timeline Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm relative flex flex-col justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#6C4CE6] dark:text-[#A78BFA] block mb-2 font-mono">
                  01
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Inventory</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                  Add products, suppliers and stock information into the centralized system.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[11px] font-semibold text-slate-500">
                Catalog Enrollment
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm relative flex flex-col justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#6C4CE6] dark:text-[#A78BFA] block mb-2 font-mono">
                  02
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Track</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                  Monitor inventory movement and stock levels with barcode scanning and live receipts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[11px] font-semibold text-slate-500">
                Floor Telemetry
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm relative flex flex-col justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#6C4CE6] dark:text-[#A78BFA] block mb-2 font-mono">
                  03
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyze</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                  StockSense analyzes inventory data and identifies risks, dead stock, and demand surges.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[11px] font-semibold text-slate-500">
                Algorithmic Synthesis
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm relative flex flex-col justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#6C4CE6] dark:text-[#A78BFA] block mb-2 font-mono">
                  04
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Act</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2 leading-relaxed">
                  Use recommendations and insights to make better inventory and procurement decisions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[11px] font-semibold text-slate-500">
                Autonomous Execution
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. DASHBOARD PREVIEW CARDS SECTION
      ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#E8E5F2] dark:border-[#282342] bg-[#FAF9FD] dark:bg-[#120F20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#6C4CE6] dark:text-[#A78BFA]">
              Modular Interface
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything You Need. One Intelligent Dashboard.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A1BE] mt-3">
              Explore the core UI components powering everyday operations across leading teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Inventory Overview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#6C4CE6]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Inventory Overview</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600">84 SKUs Live</span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Peripherals &amp; Displays</span>
                  <span className="font-semibold">4,120 units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Audio &amp; Accessories</span>
                  <span className="font-semibold">6,450 units</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Network Adapters</span>
                  <span className="font-semibold">4,250 units</span>
                </div>
              </div>
            </div>

            {/* Card 2: Low Stock Alerts */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Low Stock Alerts</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600">TRIGGERED</span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex justify-between items-center">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Logitech MX Master 3S</span>
                  <span className="font-bold text-rose-600">3 left</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex justify-between items-center">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Keychron K2 Wireless</span>
                  <span className="font-bold text-amber-600">7 left</span>
                </div>
              </div>
            </div>

            {/* Card 3: Demand Forecast */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Demand Forecast</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600">Next 30 Days</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">+24.6%</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Projected demand index</p>
                </div>
                <div className="h-10 w-24 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">
                  Confidence 94%
                </div>
              </div>
            </div>

            {/* Card 4: Supplier Performance */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#6C4CE6]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Supplier Performance</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">9 Active Vendors</span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Apex Hardware Supply</span>
                  <span className="font-bold text-emerald-600">98% On-Time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Nova Distribution Ltd</span>
                  <span className="font-bold text-blue-600">91% On-Time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Global Tech Components</span>
                  <span className="font-bold text-amber-600">84% On-Time</span>
                </div>
              </div>
            </div>

            {/* Card 5: Inventory Health */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Inventory Health</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">88/100</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Composite Health Rating</p>
                </div>
                <div className="flex flex-col text-[11px] text-right">
                  <span className="text-emerald-600 font-semibold">92% In Stock</span>
                  <span className="text-amber-500 font-semibold">8% Watchlist</span>
                </div>
              </div>
            </div>

            {/* Card 6: Recent Stock Movements */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E5F2] dark:border-[#282342]">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#6C4CE6]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Recent Movements</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Barcode Synced</span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">INBOUND PO-9041</span>
                  <span className="text-emerald-600 font-bold">+120 Units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">DISPATCH OUT-3302</span>
                  <span className="text-rose-500 font-bold">-45 Units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">TRANSFER WH-A → B</span>
                  <span className="text-blue-600 font-bold">50 Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. ROLE-BASED ACCESS SECTION
      ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#E8E5F2] dark:border-[#282342]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#6C4CE6] dark:text-[#A78BFA]">
              Security &amp; Governance
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Secure Role-Based Access
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5A1BE] mt-3">
              StockSense is built around strict enterprise segregation of duties with dedicated workspaces for every
              role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-[#6C4CE6] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4CE6]/10 text-[#6C4CE6] dark:text-[#A78BFA] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                Manage users and system configuration.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[10px] font-bold text-[#6C4CE6] dark:text-[#A78BFA] uppercase">
                Full System Governance
              </div>
            </div>

            {/* Inventory Manager */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-blue-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Inventory Manager</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                Monitor inventory and approve stock operations.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[10px] font-bold text-blue-600 uppercase">
                Executive Telemetry
              </div>
            </div>

            {/* Warehouse Staff */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-amber-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4">
                <HardHat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Warehouse Staff</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                Manage receiving, issuing and stock movement.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[10px] font-bold text-amber-600 uppercase">
                Floor &amp; Barcode Terminal
              </div>
            </div>

            {/* Purchase Manager */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] shadow-sm hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Purchase Manager</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A5A1BE] mt-2">
                Manage suppliers and purchase orders.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E5F2] dark:border-[#282342] text-[10px] font-bold text-emerald-600 uppercase">
                Procurement &amp; Supply
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FINAL CTA SECTION
      ========================================================================= */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-gradient-to-tr from-[#6C4CE6] to-[#8C6EF2] rounded-3xl p-8 sm:p-14 text-white shadow-2xl shadow-[#6C4CE6]/30">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to Make Your Inventory Smarter?
            </h2>
            <p className="text-sm sm:text-base text-purple-100 max-w-xl mx-auto mt-4 leading-relaxed">
              Start managing inventory with better visibility, insights and control.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(destinationRoute)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#6C4CE6] text-sm font-bold shadow-xl hover:bg-[#FAF9FD] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open StockSense Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#6C4CE6] text-sm font-bold shadow-xl hover:bg-[#FAF9FD] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/signin')}
                    className="text-xs sm:text-sm font-semibold text-purple-100 hover:text-white underline cursor-pointer py-2"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. FOOTER
      ========================================================================= */}
      <footer id="about" className="border-t border-[#E8E5F2] dark:border-[#282342] bg-white dark:bg-[#141124] py-12 sm:py-16 text-slate-600 dark:text-[#A5A1BE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E8E5F2] dark:border-[#282342]">
            {/* Brand Col */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6C4CE6] flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-lg">StockSense</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#A5A1BE] max-w-sm leading-relaxed">
                Intelligent Inventory Management platform powered by data-driven insights. Built for high-velocity
                warehousing, multi-location logistics, and automated replenishment.
              </p>
            </div>

            {/* Navigation Links Col */}
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                Navigation
              </span>
              <button
                onClick={() => handleNavClick('home')}
                className="text-left hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="text-left hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('intelligence')}
                className="text-left hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors"
              >
                Intelligence
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="text-left hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors"
              >
                How It Works
              </button>
            </div>

            {/* Access Col */}
            <div className="flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                Access
              </span>
              <button
                onClick={() => navigate('/signin')}
                className="text-left hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="text-left hover:text-[#6C4CE6] dark:hover:text-[#A78BFA] transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 StockSense. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Enterprise Grade</span>
              <span>•</span>
              <span>Data-Driven Precision</span>
              <span>•</span>
              <span>JWT &amp; MongoDB</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
