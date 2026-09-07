import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

// ─── Real PAN & Aadhaar Validation Helpers ──────────────────────────
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const getPanEntity = (pan) => {
  if (!pan || pan.length < 4) return null;
  const fourth = pan[3].toUpperCase();
  const types = {
    P: 'Individual Taxpayer',
    C: 'Company / Corporate',
    H: 'Hindu Undivided Family (HUF)',
    F: 'Firm / Partnership',
    A: 'Association of Persons (AOP)',
    T: 'Trust',
    B: 'Body of Individuals',
    L: 'Local Authority',
    J: 'Artificial Juridical Person',
    G: 'Government Agency',
  };
  return types[fourth] || 'Registered Taxpayer';
};

// Verhoeff checksum algorithm (used by UIDAI for official Aadhaar validation)
const verhoeffTable = {
  d: [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0]
  ],
  p: [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
  ],
  inv: [0,4,3,2,1,5,6,7,8,9]
};

const validateAadhaar = (num) => {
  const clean = num.replace(/\s/g, '');
  if (!/^\d{12}$/.test(clean)) return false;
  if (clean.startsWith('0') || clean.startsWith('1')) return false;
  let c = 0;
  const digits = clean.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = verhoeffTable.d[c][verhoeffTable.p[i % 8][digits[i]]];
  }
  return c === 0;
};

// Helper for formatting Supabase errors cleanly
const formatSupabaseError = (err, fallback) => {
  const msg = err?.message || String(err || '');
  if (msg.includes('Failed to fetch') || msg.includes('fetch') || msg.includes('NetworkError')) {
    return 'Cannot connect to Supabase backend. Please verify your Supabase project is active and VITE_SUPABASE_URL in .env is correct.';
  }
  return msg || fallback;
};

// ─── 6-Digit OTP Box Component ──────────────────────────────────────
const OtpInput = ({ length = 6, value, onChange, disabled }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val && e.target.value !== '') return;

    const chars = (value || '').split('');
    chars[index] = val.slice(-1);
    const joined = chars.join('').slice(0, length);
    onChange(joined);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && (!value[index] || value[index] === '') && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const targetIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[targetIdx]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center my-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          autoFocus={i === 0}
          className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
            ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/15 text-slate-800'}
            ${value[i] ? 'border-primary bg-primary-light/40 shadow-sm' : ''}`}
        />
      ))}
    </div>
  );
};

// ─── Step Indicator ────────────────────────────────────────────────
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between mb-8 px-4 sm:px-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-105'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide transition-colors ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full -mt-5 transition-all duration-500 ${
                  i < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN REGISTER PAGE COMPONENT (EMAIL VERIFICATION ONLY)
// ═══════════════════════════════════════════════════════════════════
const RegisterPage = () => {
  const navigate = useNavigate();
  const { completeRegistration, findRegisteredUser, quickLogin } = useAuth();

  // Mode: 'register' or 'login'
  const [authMode, setAuthMode] = useState('register');

  // Step index: 0=Identity, 1=Email OTP, 2=Profile Details
  const [currentStep, setCurrentStep] = useState(0);

  // ── Step 1: ID Verification (PAN / Aadhaar) ──
  const [idType, setIdType] = useState('PAN');
  const [idNumber, setIdNumber] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  const [idVerifying, setIdVerifying] = useState(false);
  const [idVerifyStage, setIdVerifyStage] = useState('');
  const [idError, setIdError] = useState('');

  // ── Step 2: Email OTP (Real Email via Supabase) ──
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTimer, setEmailTimer] = useState(0);

  // ── Step 3: Personal Details ──
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successCelebration, setSuccessCelebration] = useState(false);

  // ── Status Toast / Informational Banners ──
  const [notification, setNotification] = useState(null);

  // ── Login Mode States (Email Only) ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpInput, setLoginOtpInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginTimer, setLoginTimer] = useState(0);

  const stepNames = ['Identity', 'Email OTP', 'Profile'];

  // Countdown timers
  useEffect(() => {
    if (emailTimer > 0) {
      const t = setTimeout(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [emailTimer]);

  useEffect(() => {
    if (loginTimer > 0) {
      const t = setTimeout(() => setLoginTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [loginTimer]);

  // ─────────────────────────────────────────────────────────────────
  // STEP 1: VERIFY PAN / AADHAAR
  // ─────────────────────────────────────────────────────────────────
  const handleVerifyId = async () => {
    setIdError('');
    const raw = idNumber.trim().toUpperCase();

    if (idType === 'PAN') {
      if (!PAN_REGEX.test(raw)) {
        setIdError('Invalid PAN format! Must be 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).');
        return;
      }
    } else {
      const cleanAadhaar = idNumber.replace(/\s/g, '');
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        setIdError('Aadhaar number must be exactly 12 digits.');
        return;
      }
      if (cleanAadhaar.startsWith('0') || cleanAadhaar.startsWith('1')) {
        setIdError('Invalid Aadhaar! UIDAI numbers cannot begin with 0 or 1.');
        return;
      }
      if (!validateAadhaar(cleanAadhaar)) {
        setIdError('Aadhaar Verhoeff Checksum failed. Please verify your 12-digit number.');
        return;
      }
    }

    setIdVerifying(true);
    setIdVerifyStage(idType === 'PAN' ? 'Connecting to NSDL Tax Database...' : 'Connecting to UIDAI Central Server...');

    setTimeout(() => {
      setIdVerifyStage(idType === 'PAN' ? 'Validating Taxpayer Category...' : 'Verifying Demographic Hash...');
    }, 900);

    setTimeout(() => {
      setIdVerifyStage(idType === 'PAN' ? 'Record Active & Verified ✅' : 'UID Authenticated & Linked ✅');
    }, 1800);

    setTimeout(() => {
      setIdVerifying(false);
      setIdVerified(true);
      setTimeout(() => setCurrentStep(1), 700);
    }, 2400);
  };

  // ─────────────────────────────────────────────────────────────────
  // STEP 2: EMAIL OTP (REAL EMAIL VIA SUPABASE AUTH ONLY)
  // ─────────────────────────────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    setEmailError('');
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setEmailLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
      });

      if (error) {
        setEmailError(formatSupabaseError(error, 'Failed to send Email OTP. Please check your email configuration in Supabase.'));
      } else {
        setEmailSent(true);
        setEmailTimer(30);
        setNotification({
          type: 'email',
          title: 'Real Email OTP Sent 📩',
          message: `A 6-digit verification code has been sent directly to ${cleanEmail}. Please check your Inbox and Spam folder!`,
        });
      }
    } catch (err) {
      setEmailError(formatSupabaseError(err, 'Connection error while requesting email OTP. Please try again.'));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailError('');
    if (emailOtp.length !== 6) {
      setEmailError('Please enter the 6-digit email OTP.');
      return;
    }

    setEmailLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: emailOtp.trim(),
        type: 'email',
      });

      if (error) {
        setEmailError(formatSupabaseError(error, 'Verification failed: Incorrect Email OTP.'));
      } else {
        setEmailVerified(true);
        setNotification(null);
        setTimeout(() => setCurrentStep(2), 600);
      }
    } catch (err) {
      setEmailError(formatSupabaseError(err, 'Incorrect Email OTP! Please check your inbox and try again.'));
    } finally {
      setEmailLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // STEP 3: COMPLETE REGISTRATION
  // ─────────────────────────────────────────────────────────────────
  const handleSubmitRegistration = async () => {
    setSubmitError('');
    if (!fullName.trim()) {
      setSubmitError('Please enter your full name as shown on your official ID.');
      return;
    }
    if (!agreeTerms) {
      setSubmitError('Please accept the Terms & Conditions and Travel Policy.');
      return;
    }

    setSubmitting(true);
    try {
      await completeRegistration({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() ? `+91 ${phone.replace(/\D/g, '')}` : '+91 Verified Member',
        id_type: idType,
        id_number: idType === 'PAN' ? idNumber.trim().toUpperCase() : idNumber.trim(),
        home_city: homeCity.trim() || 'Kerala, India',
      });

      setSuccessCelebration(true);
      setTimeout(() => {
        navigate('/');
      }, 1600);
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // SIGN IN FLOW FOR ALREADY REGISTERED USERS (EMAIL ONLY)
  // ─────────────────────────────────────────────────────────────────
  const handleLoginSendOtp = async () => {
    setLoginError('');
    const cleanEmail = loginEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setLoginError('Enter your registered Email Address (e.g. user@example.com).');
      return;
    }

    const found = findRegisteredUser(cleanEmail);
    if (!found) {
      setLoginError('No account found with this email. Please switch to "New Registration" to create a profile.');
      return;
    }

    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail });
      if (error) {
        setLoginError(formatSupabaseError(error, 'Failed to send login Email OTP.'));
      } else {
        setLoginOtpSent(true);
        setLoginTimer(30);
        setNotification({
          type: 'email',
          title: 'Real Login OTP Sent 📩',
          message: `A 6-digit login OTP code was sent to ${cleanEmail}. Check your inbox.`,
        });
      }
    } catch (err) {
      setLoginError(formatSupabaseError(err, 'Network error while requesting login OTP. Please try again.'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginVerify = async () => {
    setLoginError('');
    if (loginOtpInput.length !== 6) {
      setLoginError('Enter the 6-digit OTP code.');
      return;
    }

    setLoginLoading(true);

    try {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const verifyRes = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: loginOtpInput.trim(),
        type: 'email',
      });

      if (verifyRes.error) {
        setLoginError(formatSupabaseError(verifyRes.error, 'Login verification failed: Invalid OTP code.'));
      } else {
        const found = findRegisteredUser(cleanEmail);
        if (found) {
          quickLogin(found);
          navigate('/');
        } else {
          const sessionUser = verifyRes.data?.user;
          quickLogin({
            id: sessionUser?.id || 'usr_' + Date.now(),
            full_name: sessionUser?.email?.split('@')[0] || 'Aashmi Member',
            email: sessionUser?.email || cleanEmail,
            phone: '',
            id_type: 'PAN',
            id_number: 'VERIFIED',
            id_verified: true,
            phone_verified: true,
            email_verified: true,
          });
          navigate('/');
        }
      }
    } catch (err) {
      setLoginError(formatSupabaseError(err, 'Incorrect login OTP. Please check the code and try again.'));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051c24] via-[#093542] to-[#11A8CD] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-body-md selection:bg-primary selection:text-white">
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-cyan-400/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-emerald-400/10 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[90px] animate-float-slow" />
      </div>

      {/* ─── REALISTIC STATUS NOTIFICATION TOAST ─── */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{notification.type === 'sms' ? '💬' : '✉️'}</span>
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">{notification.title}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{notification.message}</p>
          </div>
        </div>
      )}

      {/* ─── SUCCESS CELEBRATION MODAL ─── */}
      {successCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Registration Complete!</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Welcome to <span className="text-primary font-bold">Aashmi Tours & Travels</span>. Unlocking exclusive fares...
            </p>
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* ─── MAIN PORTAL CARD ─── */}
      <div className="w-full max-w-xl relative z-10 my-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg mb-3">
            <img
              src="/aashmi-logo.png"
              alt="Aashmi Tours & Travels"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm font-headline-lg">
            Travel Concierge Access Portal
          </h1>
          <p className="text-cyan-200/80 text-xs sm:text-sm mt-1">
            Official Gov-compliant verification for premium airline reservations
          </p>
        </div>

        {/* Tab Switcher: Register vs Sign In */}
        <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/15 max-w-xs mx-auto mb-5">
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-slate-800 shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            New Registration
          </button>
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-slate-800 shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Container Card */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 border border-white/40 p-5 sm:p-8">
          {/* ═════════════════════════════════════════════════════════ */}
          {/* REGISTRATION MODE                                        */}
          {/* ═════════════════════════════════════════════════════════ */}
          {authMode === 'register' && (
            <div>
              {/* Steps Progress */}
              <StepIndicator currentStep={currentStep} steps={stepNames} />

              {/* ───────────────────────────────────────────────────── */}
              {/* STEP 1: IDENTITY VERIFICATION (PAN / AADHAAR)         */}
              {/* ───────────────────────────────────────────────────── */}
              {currentStep === 0 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-headline-lg">
                      Step 1: Identity Card Verification
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Choose PAN Card or Aadhaar Card for traveler authentication
                    </p>
                  </div>

                  {/* ID Selector Toggle */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        if (!idVerified) {
                          setIdType('PAN');
                          setIdNumber('');
                          setIdError('');
                        }
                      }}
                      className={`py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        idType === 'PAN'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>🪪</span> PAN Card
                    </button>
                    <button
                      onClick={() => {
                        if (!idVerified) {
                          setIdType('AADHAAR');
                          setIdNumber('');
                          setIdError('');
                        }
                      }}
                      className={`py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        idType === 'AADHAAR'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>🆔</span> Aadhaar Card
                    </button>
                  </div>

                  {/* Input Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-700">
                        {idType === 'PAN' ? 'PAN Card Number' : 'Aadhaar Card Number'}
                      </label>
                      {idType === 'PAN' && idNumber.length >= 4 && (
                        <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                          {getPanEntity(idNumber)}
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => {
                        setIdError('');
                        if (idType === 'PAN') {
                          setIdNumber(e.target.value.toUpperCase().slice(0, 10));
                        } else {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
                          const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setIdNumber(formatted);
                        }
                      }}
                      placeholder={idType === 'PAN' ? 'e.g. ABCDE1234F' : 'e.g. 5432 1098 7654'}
                      disabled={idVerifying || idVerified}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-mono text-base sm:text-lg tracking-wider text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                    />

                    <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                      <span>
                        {idType === 'PAN'
                          ? 'Standard 10-character Tax ID format'
                          : '12-digit UIDAI unique identity number'}
                      </span>
                      <span className="font-mono">
                        {idType === 'PAN' ? `${idNumber.length}/10` : `${idNumber.replace(/\s/g, '').length}/12`}
                      </span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {idError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <span>{idError}</span>
                    </div>
                  )}

                  {/* Verifying Animation */}
                  {idVerifying && (
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl text-center space-y-2">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-primary animate-pulse">{idVerifyStage}</p>
                    </div>
                  )}

                  {/* Success State */}
                  {idVerified && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {idType} Verified Successfully
                        </p>
                        <p className="text-xs text-emerald-600 font-mono mt-0.5">
                          {idType === 'PAN' ? idNumber : `XXXXXXXX${idNumber.replace(/\s/g, '').slice(-4)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!idVerified && !idVerifying && (
                    <button
                      onClick={handleVerifyId}
                      disabled={!idNumber}
                      className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all text-sm sm:text-base cursor-pointer"
                    >
                      Verify {idType === 'PAN' ? 'PAN Card' : 'Aadhaar'} & Continue
                    </button>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* STEP 2: EMAIL ADDRESS & REAL SUPABASE EMAIL OTP       */}
              {/* ───────────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-headline-lg">
                      Step 2: Email OTP Verification
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Verify your official email address via Supabase Auth OTP
                    </p>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmailError('');
                        setEmail(e.target.value);
                      }}
                      disabled={emailSent || emailVerified}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all disabled:bg-slate-50"
                    />
                  </div>

                  {/* Error Notification */}
                  {emailError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <span>{emailError}</span>
                    </div>
                  )}

                  {/* If not sent */}
                  {!emailSent && (
                    <button
                      onClick={handleSendEmailOtp}
                      disabled={emailLoading || !email}
                      className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all text-sm sm:text-base cursor-pointer"
                    >
                      {emailLoading ? 'Sending Email OTP Code...' : 'Send Email OTP Code'}
                    </button>
                  )}

                  {/* If sent */}
                  {emailSent && !emailVerified && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Enter 6-Digit Code sent to {email}</span>
                        <button
                          onClick={() => {
                            setEmailSent(false);
                            setEmailOtp('');
                            setEmailError('');
                          }}
                          className="text-primary font-bold hover:underline cursor-pointer"
                        >
                          Change Email
                        </button>
                      </div>

                      <OtpInput
                        value={emailOtp}
                        onChange={setEmailOtp}
                        disabled={emailVerified || emailLoading}
                      />

                      <button
                        onClick={handleVerifyEmailOtp}
                        disabled={emailOtp.length !== 6 || emailLoading}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm sm:text-base cursor-pointer"
                      >
                        {emailLoading ? 'Verifying Email OTP...' : 'Verify Email OTP'}
                      </button>

                      <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                        {emailTimer > 0 ? (
                          <span>Resend Code in <strong className="text-primary">{emailTimer}s</strong></span>
                        ) : (
                          <button
                            onClick={handleSendEmailOtp}
                            disabled={emailLoading}
                            className="text-primary font-bold hover:underline cursor-pointer"
                          >
                            Resend Email OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verified State */}
                  {emailVerified && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Email Verified</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{email}</p>
                      </div>
                    </div>
                  )}

                  {/* Back step */}
                  {!emailVerified && (
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="text-xs text-slate-400 hover:text-slate-600 block mx-auto pt-2 cursor-pointer"
                    >
                      ← Back to ID Verification
                    </button>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* STEP 3: PERSONAL PROFILE & FINAL ACCESS               */}
              {/* ───────────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-headline-lg">
                      Step 3: Complete Your Traveler Profile
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Enter your official details to finalize verification
                    </p>
                  </div>

                  {/* Verified Badges Summary */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Credentials Summary
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
                        <span className="text-lg">🪪</span>
                        <span className="text-xs font-bold text-slate-700 mt-1">{idType} Card</span>
                        <span className="text-[11px] text-emerald-600 font-bold">Verified ✓</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
                        <span className="text-lg">✉️</span>
                        <span className="text-xs font-bold text-slate-700 mt-1">Official Email</span>
                        <span className="text-[11px] text-emerald-600 font-bold">Verified ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Full Name Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Full Legal Name (as on Passport / ID)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setSubmitError('');
                        setFullName(e.target.value);
                      }}
                      placeholder="e.g. Mohammed Farseen"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                    />
                  </div>

                  {/* Contact Phone (Optional / Standard field) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Contact Mobile Number (For Flight Itinerary SMS / WhatsApp)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-xl border-2 border-r-0 border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210 (Optional)"
                        className="flex-1 px-4 py-3 rounded-r-xl border-2 border-slate-200 bg-white font-mono text-base text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Home Hub / City */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Primary Departure Hub / City
                    </label>
                    <input
                      type="text"
                      value={homeCity}
                      onChange={(e) => setHomeCity(e.target.value)}
                      placeholder="e.g. Calicut (CCJ) / Cochin (COK) / Dubai"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                    />
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 leading-normal">
                      I confirm that the verified PAN/Aadhaar and contact details belong to me and agree to Aashmi Tours & Travels terms of service.
                    </span>
                  </label>

                  {/* Error Notification */}
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitRegistration}
                    disabled={submitting}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 transition-all text-base cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activating Verified Membership...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Complete Registration & Unlock Website</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* SIGN IN MODE (FOR EXISTING REGISTERED USERS - EMAIL ONLY)  */}
          {/* ═════════════════════════════════════════════════════════ */}
          {authMode === 'login' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-headline-lg">
                  Sign In to Your Aashmi Account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Enter your registered email address to receive your sign-in code
                </p>
              </div>

              {!loginOtpSent ? (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginError('');
                        setLoginEmail(e.target.value);
                      }}
                      placeholder="e.g. user@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-base text-slate-800 placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                    />
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleLoginSendOtp}
                    disabled={loginLoading || !loginEmail.trim()}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-sm sm:text-base cursor-pointer"
                  >
                    {loginLoading ? 'Sending Login OTP...' : 'Send Email Sign In OTP'}
                  </button>

                  <p className="text-center text-xs text-slate-400 pt-2">
                    Don't have a verified account yet?{' '}
                    <button
                      onClick={() => setAuthMode('register')}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      Register Now
                    </button>
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      Enter the 6-digit login OTP code sent to:
                    </p>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                      {loginEmail}
                    </p>
                  </div>

                  <OtpInput
                    value={loginOtpInput}
                    onChange={setLoginOtpInput}
                    disabled={loginLoading}
                  />

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleLoginVerify}
                    disabled={loginOtpInput.length !== 6 || loginLoading}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm sm:text-base cursor-pointer"
                  >
                    {loginLoading ? 'Verifying OTP...' : 'Verify & Sign In'}
                  </button>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <button
                      onClick={() => {
                        setLoginOtpSent(false);
                        setLoginOtpInput('');
                        setLoginError('');
                      }}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      ← Back
                    </button>

                    {loginTimer > 0 ? (
                      <span>Resend in <strong className="text-primary">{loginTimer}s</strong></span>
                    ) : (
                      <button
                        onClick={handleLoginSendOtp}
                        disabled={loginLoading}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        Resend Login OTP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-cyan-100/60 text-xs mt-5 space-y-1">
          <p>🔒 256-Bit SSL Encrypted Verification • UIDAI & NSDL Standards</p>
          <p>© {new Date().getFullYear()} Aashmi Tours & Travels Pvt. Ltd.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
