import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSET_IMAGES } from '../../data/initialData';
import { signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const LoginView: React.FC = () => {
  const { login, register, isDarkMode, toggleDarkMode, showToast } = useApp();
  const [email, setEmail] = useState('operator@stocksense.internal');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleResetPassword = async () => {
    if (!email) {
      showToast('ENTER YOUR EMAIL ADDRESS FOR PASSWORD RESET');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`OTP / PASSWORD RESET DISPATCHED TO ${email.toUpperCase()}`);
    } catch (err: any) {
      showToast(`PASSWORD RESET DISPATCHED TO ${email.toUpperCase()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      await register(email, password, firstName, lastName);
    } else {
      await login(email, password);
    }
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
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 mb-3 flex items-center justify-center">
              <img
                alt="StockSense Logo"
                className="w-12 h-12 object-contain rounded-[2px]"
                src={ASSET_IMAGES.brandLogo}
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1 mb-2 font-medium">
              {phoneMode 
                ? 'Sign in with Phone'
                : isRegisterMode ? 'Create an Account' : 'Welcome back'}
            </h1>
            <p className="font-body-sm text-body-sm text-secondary">
              Inventory management system.
            </p>
          </div>

          {/* Structural Hairline Rule */}
          <div className="w-full h-[1px] bg-rule my-5" />

          {/* Form Section */}
          {phoneMode ? (
             <div className="flex flex-col gap-4">
               {!confirmationResult ? (
                 <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="phone-first-name">
                      First Name
                    </label>
                    <input
                      id="phone-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="phone-last-name">
                      Last Name
                    </label>
                    <input
                      id="phone-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="phone-number">
                      Phone Number
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                    />
                  </div>
                    <div id="recaptcha-container"></div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (!(window as any).recaptchaVerifier) {
                            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                              size: 'invisible',
                              callback: (response: any) => {
                                // reCAPTCHA solved
                              }
                            });
                          }
                          const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
                          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
                          setConfirmationResult(confirmation);
                        } catch (error) {
                          console.error('Phone auth error:', error);
                          // Reset reCAPTCHA so they can try again
                          if ((window as any).recaptchaVerifier) {
                            (window as any).recaptchaVerifier.clear();
                            (window as any).recaptchaVerifier = undefined;
                          }
                          alert("Failed to send SMS. Make sure the phone number includes the country code (e.g. +1).");
                        }
                      }}
                      className="w-full mt-2 h-10 bg-primary-container hover:bg-[#8E4217] text-white font-label-lg tracking-wider uppercase rounded-[2px] transition-colors"
                    >
                      Send OTP
                    </button>
                   </>
               ) : (
                 <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="otp">
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await confirmationResult.confirm(verificationCode);
                        const userDoc = await getDoc(doc(db, 'users', res.user.uid));
                        if (!userDoc.exists()) {
                          await setDoc(doc(db, 'users', res.user.uid), {
                            email: res.user.phoneNumber,
                            firstName,
                            lastName,
                            role: 'warehouse_staff',
                            createdAt: new Date().toISOString()
                          });
                        }
                      } catch (error) {
                        alert("Invalid code.");
                      }
                    }}
                    className="w-full mt-2 h-10 bg-primary-container hover:bg-[#8E4217] text-white font-label-lg tracking-wider uppercase rounded-[2px] transition-colors"
                  >
                    Verify
                  </button>
                 </>
               )}
               <button onClick={() => setPhoneMode(false)} className="mt-2 text-secondary hover:text-on-surface text-sm">
                 Back to Email Login
               </button>
             </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {isRegisterMode && (
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase text-secondary tracking-wider" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-9 px-3 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md uppercase text-secondary tracking-wider flex items-center gap-1.5" htmlFor="password">
                    <span>Password</span>
                  </label>
                  <button type="button" onClick={handleResetPassword} className="font-body-sm text-body-sm text-secondary hover:text-on-surface hover:underline transition-colors focus:outline-none cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-9 pl-3 pr-10 bg-surface-lowest text-on-surface font-body-md text-body-md border border-rule rounded-[2px] outline-none transition-colors placeholder:text-tertiary focus:border-primary-container"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 select-none">
                <label htmlFor="persist-session" className="flex items-center gap-2 cursor-pointer group">
                  <input id="persist-session" type="checkbox" checked={keepActive} onChange={(e) => setKeepActive(e.target.checked)} className="sr-only peer" />
                  <span className="w-[14px] h-[14px] border border-secondary rounded-[2px] bg-surface-lowest peer-checked:bg-on-surface peer-checked:border-on-surface flex items-center justify-center transition-colors">
                    <svg className="w-2.5 h-2.5 text-surface opacity-0 peer-checked:opacity-100 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary group-hover:text-on-surface transition-colors">
                    Remember me
                  </span>
                </label>
              </div>

              <button type="submit" className="w-full mt-2 h-10 bg-primary-container hover:bg-[#8E4217] text-white font-label-lg tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-2">
                <span>{isRegisterMode ? 'Register' : 'Log In'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const provider = new GoogleAuthProvider();
                      const res = await signInWithPopup(auth, provider);
                      const userDoc = await getDoc(doc(db, 'users', res.user.uid));
                      if (!userDoc.exists()) {
                        await setDoc(doc(db, 'users', res.user.uid), {
                          email: res.user.email,
                          role: 'warehouse_staff',
                          createdAt: new Date().toISOString()
                        });
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="flex-1 h-10 border border-rule hover:bg-surface-lowest flex items-center justify-center gap-2 rounded-[2px] font-label-md text-on-surface uppercase tracking-wider"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneMode(true)}
                  className="flex-1 h-10 border border-rule hover:bg-surface-lowest flex items-center justify-center gap-2 rounded-[2px] font-label-md text-on-surface uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                  Phone
                </button>
              </div>
            </form>
          )}

          {/* Lower Ledger Routing & Footnote */}
          <div className="mt-6 pt-4 border-t border-rule flex flex-col items-center gap-1.5 text-center">
            <div className="font-body-sm text-body-sm text-secondary">
              {isRegisterMode ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-on-surface hover:underline font-medium ml-1 transition-colors"
              >
                {isRegisterMode ? 'Log in here' : 'Sign up here'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
