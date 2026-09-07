import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

// ─── Google "G" SVG Icon ────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

// ─── Shared Input Component ─────────────────────────────────────────
const FormInput = ({ label, icon, error, ...props }) => (
  <div>
    {label && (
      <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border-2 bg-white text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/15'
        }`}
      />
    </div>
    {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN REGISTER PAGE
// ═══════════════════════════════════════════════════════════════════
const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    registerUser,
    loginWithCredentials,
    signInWithGoogle,
    checkGoogleLogin,
    findRegisteredUserByEmail,
    quickLogin,
  } = useAuth();

  // Tab: 'register' or 'login'
  const [mode, setMode] = useState('register');

  // ─── Register Form Fields ───
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // ─── Login Form Fields ───
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPasswords, setShowRegPasswords] = useState(false);

  // ─── Success Modal ───
  const [successCelebration, setSuccessCelebration] = useState(false);
  const [successName, setSuccessName] = useState('');

  // Check for Google OAuth callback on mount
  useEffect(() => {
    const checkGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.hash?.replace('#', '?'));
      if (urlParams.get('access_token') || window.location.hash.includes('access_token')) {
        setGoogleLoading(true);
        // Give Supabase a moment to process
        await new Promise(r => setTimeout(r, 800));
        const profile = await checkGoogleLogin();
        if (profile) {
          setSuccessName(profile.full_name || profile.first_name || 'Traveler');
          setSuccessCelebration(true);
          setTimeout(() => {
            quickLogin(profile);
            navigate('/');
          }, 1400);
        } else {
          setMode('login');
          setLoginError('This Google account is not registered yet. Please register first, then use Google Sign-In.');
          // Sign out the unregistered Google session
          try {
            await supabase.auth.signOut();
          } catch {}
        }
        setGoogleLoading(false);
      }
    };
    checkGoogleCallback();
  }, []);

  // Form change handler
  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setRegisterError('');
  };

  // ─── REGISTER ─────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    const errors = {};

    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Enter a valid email address';
    } else {
      // Check if email already exists
      const existing = findRegisteredUserByEmail(form.email.trim());
      if (existing) {
        errors.email = 'This email is already registered. Please sign in instead.';
      }
    }
    if (!form.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!form.address.trim()) errors.address = 'Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!form.country.trim()) errors.country = 'Country is required';
    if (!form.pinCode.trim()) {
      errors.pinCode = 'PIN Code is required';
    } else if (!/^\d{4,6}$/.test(form.pinCode.replace(/\D/g, ''))) {
      errors.pinCode = 'Enter a valid PIN / ZIP code';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setRegisterLoading(true);
    try {
      const newUser = await registerUser(form);
      setSuccessName(newUser.full_name || form.firstName);
      setSuccessCelebration(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // ─── LOGIN WITH EMAIL + PASSWORD ──────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter your email and password.');
      return;
    }

    setLoginLoading(true);
    const result = loginWithCredentials(loginEmail.trim().toLowerCase(), loginPassword);
    if (result.success) {
      setSuccessName(loginEmail.split('@')[0]);
      setSuccessCelebration(true);
      setTimeout(() => navigate('/'), 1400);
    } else {
      setLoginError(result.error);
    }
    setLoginLoading(false);
  };

  // ─── LOGIN WITH GOOGLE ───────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoginError('');
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        if (
          error.message?.includes('provider is not enabled') ||
          error.message?.includes('Unsupported provider') ||
          error.message?.includes('validation failed')
        ) {
          setLoginError(
            'Google Sign-In is not enabled in the Supabase Dashboard yet. Go to Supabase → Authentication → Providers → Google and enable it.'
          );
        } else {
          setLoginError(error.message || 'Google Sign-In failed.');
        }
        setGoogleLoading(false);
      }
      // If no error, Supabase will redirect to Google — don't reset loading
    } catch (err) {
      setLoginError('Connection error. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051c24] via-[#093542] to-[#11A8CD] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-body-md selection:bg-primary selection:text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-cyan-400/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-emerald-400/10 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[90px] animate-float-slow" />
      </div>

      {/* Success Celebration Modal */}
      {successCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Welcome, {successName}!</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Your account is verified. Unlocking exclusive airline fares...
            </p>
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-lg relative z-10 my-4">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg mb-3">
            <img
              src="/aashmi-logo.png"
              alt="Aashmi Tours & Travels"
              className="h-11 sm:h-14 w-auto object-contain drop-shadow"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-sm font-headline-lg">
            {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-cyan-200/70 text-xs sm:text-sm mt-1">
            {mode === 'register'
              ? 'Register to access exclusive airline fares & concierge services'
              : 'Sign in to your Aashmi Travels account'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/15 max-w-xs mx-auto mb-5">
          <button
            onClick={() => { setMode('register'); setLoginError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-slate-800 shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setMode('login'); setRegisterError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-slate-800 shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 border border-white/50 p-5 sm:p-7">

          {/* ═══════════ REGISTER MODE ═══════════ */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="First Name"
                  icon="person"
                  placeholder="e.g. Mohammed"
                  value={form.firstName}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  error={fieldErrors.firstName}
                />
                <FormInput
                  label="Last Name"
                  placeholder="e.g. Farseen"
                  value={form.lastName}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                  error={fieldErrors.lastName}
                />
              </div>

              {/* Email */}
              <FormInput
                label="Email"
                icon="mail"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                error={fieldErrors.email}
              />

              {/* Mobile */}
              <FormInput
                label="Mobile Number"
                icon="call"
                type="tel"
                placeholder="98765 43210"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))}
                error={fieldErrors.phone}
              />

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">lock</span>
                    <input
                      type={showRegPasswords ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 bg-white text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all ${
                        fieldErrors.password ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPasswords(!showRegPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPasswords ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showRegPasswords ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      className={`w-full pl-4 pr-4 py-2.5 rounded-xl border-2 bg-white text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all ${
                        fieldErrors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/15'
                      }`}
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* Address Divider */}
              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center pt-2">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/95 px-2.5 text-slate-400 font-bold tracking-wider uppercase text-[10px]">
                    Address Details
                  </span>
                </div>
              </div>

              {/* Address */}
              <FormInput
                label="Address"
                icon="home"
                placeholder="House No, Street, Area"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                error={fieldErrors.address}
              />

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="City"
                  placeholder="e.g. Kozhikode"
                  value={form.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  error={fieldErrors.city}
                />
                <FormInput
                  label="State"
                  placeholder="e.g. Kerala"
                  value={form.state}
                  onChange={(e) => updateForm('state', e.target.value)}
                  error={fieldErrors.state}
                />
              </div>

              {/* Country + PIN Code */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Country"
                  icon="public"
                  placeholder="e.g. India"
                  value={form.country}
                  onChange={(e) => updateForm('country', e.target.value)}
                  error={fieldErrors.country}
                />
                <FormInput
                  label="PIN Code"
                  placeholder="e.g. 673001"
                  value={form.pinCode}
                  onChange={(e) => updateForm('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={fieldErrors.pinCode}
                />
              </div>

              {/* Register Error */}
              {registerError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                  <span className="text-sm leading-none">⚠️</span>
                  <span>{registerError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {registerLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Create Account</span>
                  </>
                )}
              </button>

              {/* Switch to login */}
              <p className="text-center text-xs text-slate-400 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* ═══════════ LOGIN MODE ═══════════ */}
          {mode === 'login' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Google Sign In (Only for registered users) */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border-2 border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="group-hover:text-slate-900 transition-colors">
                    {googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}
                  </span>
                </button>
                <p className="text-center text-[11px] text-slate-400">
                  Only works if you've already registered with the same email
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/95 px-3 text-slate-400 font-bold tracking-wider">
                    or sign in with email
                  </span>
                </div>
              </div>

              {/* Email + Password Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <FormInput
                  label="Email Address"
                  icon="mail"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginError(''); setLoginEmail(e.target.value); }}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => { setLoginError(''); setLoginPassword(e.target.value); }}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>

                {/* Login Error */}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                    <span className="text-sm leading-none">⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Switch to register */}
              <p className="text-center text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Register Now
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-cyan-100/60 text-xs mt-5 space-y-1">
          <p>🔒 256-Bit SSL Encrypted • Official Airline Partner</p>
          <p>© {new Date().getFullYear()} Aashmi Tours & Travels Pvt. Ltd.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
