import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Smartphone,
  Loader2,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Clock,
  X,
  RotateCcw,
  CheckCircle2,
  Key
} from 'lucide-react';
import QRCode from 'qrcode';
import { AuthService, TotpSetupInfo } from '../services/authService.ts';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  // Authentication Step: 'credentials' (Email+Password) | '2fa' (Verification code)
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');

  // Step 1: Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: 2FA State
  const [preAuthTicket, setPreAuthTicket] = useState<string>('');
  const [totpSetup, setTotpSetup] = useState<TotpSetupInfo | null>(null);
  const [pinMode, setPinMode] = useState<'6digit' | '4digit'>('6digit');
  const [otpDigits4, setOtpDigits4] = useState<string[]>(['', '', '', '']);
  const [otpDigits6, setOtpDigits6] = useState<string[]>(['', '', '', '', '', '']);
  const [activeStorePin, setActiveStorePin] = useState<string>(AuthService.getCustomPin());

  // Reset PIN Modal States
  const [showResetPinModal, setShowResetPinModal] = useState<boolean>(false);
  const [resetPasswordInput, setResetPasswordInput] = useState<string>('');
  const [newResetPin, setNewResetPin] = useState<string>('');
  const [confirmResetPin, setConfirmResetPin] = useState<string>('');
  const [resetModalMessage, setResetModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const digitInputRefs4 = useRef<(HTMLInputElement | null)[]>([]);
  const digitInputRefs6 = useRef<(HTMLInputElement | null)[]>([]);

  // 2FA Setup Modal State
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // 30s TOTP Time Step Indicator
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // General Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState<string>('');

  // 30-second cycle countdown effect for TOTP
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setSecondsRemaining(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate QR Code image when totpSetup is available
  useEffect(() => {
    if (totpSetup?.otpauthUri) {
      QRCode.toDataURL(
        totpSetup.otpauthUri,
        {
          width: 220,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeDataUrl(url);
          }
        }
      );
    }
  }, [totpSetup]);

  // Focus first digit when switching to 2FA step or mode
  useEffect(() => {
    if (step === '2fa') {
      setTimeout(() => {
        if (pinMode === '4digit') {
          digitInputRefs4.current[0]?.focus();
        } else {
          digitInputRefs6.current[0]?.focus();
        }
      }, 100);
    }
  }, [step, pinMode]);

  // Handle Step 1 Submit (Email + Password)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorType('');

    if (!email.trim()) {
      setErrorType('MISSING_EMAIL');
      setErrorMessage('Please enter your authorized admin email address.');
      return;
    }

    if (!password.trim()) {
      setErrorType('MISSING_PASSWORD');
      setErrorMessage('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.login(email, password);
      setIsLoading(false);

      if (result.success) {
        if (result.requires2FA && result.preAuthTicket) {
          // Advance to 2FA step
          setPreAuthTicket(result.preAuthTicket);
          if (result.totpSetup) {
            setTotpSetup(result.totpSetup);
          }
          setOtpDigits4(['', '', '', '']);
          setOtpDigits6(['', '', '', '', '', '']);
          setPinMode('6digit');
          setStep('2fa');
        } else if (result.session) {
          // Direct login fallback
          onLoginSuccess();
        }
      } else {
        setErrorType(result.errorType || 'AUTH_FAILED');
        setErrorMessage(result.message || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setIsLoading(false);
      setErrorType('UNEXPECTED');
      setErrorMessage('An unexpected connection error occurred. Please try again.');
    }
  };

  // Handle Step 2 2FA / PIN Submit
  const handleVerify2FA = async (codeToVerify?: string) => {
    const activeDigits = pinMode === '4digit' ? otpDigits4 : otpDigits6;
    const requiredLength = pinMode === '4digit' ? 4 : 6;
    const code = codeToVerify || activeDigits.join('');

    setErrorMessage('');
    setErrorType('');

    if (!code || code.length < requiredLength) {
      setErrorType('INVALID_CODE_LENGTH');
      setErrorMessage(
        pinMode === '4digit'
          ? 'कृपया ४-अङ्कको सेक्युरिटी पिन हाल्नुहोस्।'
          : 'Please enter all 6 digits from your Authenticator app.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.verify2FA(preAuthTicket, code);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorType(result.errorType || 'INVALID_2FA_CODE');
        setErrorMessage(result.message || 'Invalid verification code or PIN. Please try again.');
        // Clear digits on error and re-focus first input
        if (pinMode === '4digit') {
          setOtpDigits4(['', '', '', '']);
          digitInputRefs4.current[0]?.focus();
        } else {
          setOtpDigits6(['', '', '', '', '', '']);
          digitInputRefs6.current[0]?.focus();
        }
      }
    } catch {
      setIsLoading(false);
      setErrorType('UNEXPECTED');
      setErrorMessage('Verification failed due to a network error. Please try again.');
    }
  };

  // Handle individual digit input change for 4-digit PIN
  const handleDigitChange4 = (index: number, value: string) => {
    if (errorMessage) setErrorMessage('');

    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 4).split('');
      if (pastedDigits.length > 0) {
        const newDigits = [...otpDigits4];
        pastedDigits.forEach((digit, i) => {
          if (i < 4) newDigits[i] = digit;
        });
        setOtpDigits4(newDigits);

        const focusTarget = Math.min(pastedDigits.length, 3);
        digitInputRefs4.current[focusTarget]?.focus();

        if (pastedDigits.length === 4) {
          handleVerify2FA(pastedDigits.join(''));
        }
      }
      return;
    }

    const cleanDigit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits4];
    newDigits[index] = cleanDigit;
    setOtpDigits4(newDigits);

    if (cleanDigit && index < 3) {
      digitInputRefs4.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 4 && cleanDigit) {
      handleVerify2FA(fullCode);
    }
  };

  // Handle backspace key for 4-digit PIN
  const handleDigitKeyDown4 = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits4[index] && index > 0) {
        const newDigits = [...otpDigits4];
        newDigits[index - 1] = '';
        setOtpDigits4(newDigits);
        digitInputRefs4.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits4];
        newDigits[index] = '';
        setOtpDigits4(newDigits);
      }
    }
  };

  // Handle individual digit input change for 6-digit TOTP
  const handleDigitChange6 = (index: number, value: string) => {
    if (errorMessage) setErrorMessage('');

    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pastedDigits.length > 0) {
        const newDigits = [...otpDigits6];
        pastedDigits.forEach((digit, i) => {
          if (i < 6) newDigits[i] = digit;
        });
        setOtpDigits6(newDigits);

        const focusTarget = Math.min(pastedDigits.length, 5);
        digitInputRefs6.current[focusTarget]?.focus();

        if (pastedDigits.length === 6) {
          handleVerify2FA(pastedDigits.join(''));
        }
      }
      return;
    }

    const cleanDigit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits6];
    newDigits[index] = cleanDigit;
    setOtpDigits6(newDigits);

    if (cleanDigit && index < 5) {
      digitInputRefs6.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && cleanDigit) {
      handleVerify2FA(fullCode);
    }
  };

  // Handle backspace key for 6-digit TOTP
  const handleDigitKeyDown6 = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits6[index] && index > 0) {
        const newDigits = [...otpDigits6];
        newDigits[index - 1] = '';
        setOtpDigits6(newDigits);
        digitInputRefs6.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits6];
        newDigits[index] = '';
        setOtpDigits6(newDigits);
      }
    }
  };

  // Copy secret key
  const handleCopySecret = () => {
    if (totpSetup?.secret) {
      navigator.clipboard.writeText(totpSetup.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  // Handle Reset PIN submission from modal
  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetModalMessage(null);

    const cleanPin = newResetPin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      setResetModalMessage({ type: 'error', text: 'PIN must be exactly 4 numeric digits (0-9).' });
      return;
    }

    if (cleanPin !== confirmResetPin.trim()) {
      setResetModalMessage({ type: 'error', text: 'PINs do not match.' });
      return;
    }

    // Verify using entered password or the password stored in state
    const pwdToVerify = resetPasswordInput.trim() || password.trim();
    const res = AuthService.resetPinWithPassword(pwdToVerify, cleanPin);

    if (res.success) {
      setActiveStorePin(cleanPin);
      setResetModalMessage({ type: 'success', text: `Success! PIN has been reset to ${cleanPin}. Filling into verification...` });
      setOtpDigits4(cleanPin.split(''));
      setPinMode('4digit');
      setTimeout(() => {
        setShowResetPinModal(false);
        setResetModalMessage(null);
        setResetPasswordInput('');
        setNewResetPin('');
        setConfirmResetPin('');
      }, 1400);
    } else {
      setResetModalMessage({ type: 'error', text: res.message });
    }
  };

  // Quick reset to default 9988
  const handleQuickResetToDefault = () => {
    const res = AuthService.resetPinToDefault();
    if (res.success) {
      setActiveStorePin('9988');
      setOtpDigits4(['9', '9', '8', '8']);
      setPinMode('4digit');
      setResetModalMessage({ type: 'success', text: 'Reset to default PIN (9988)! Filling into verification...' });
      setTimeout(() => {
        setShowResetPinModal(false);
        setResetModalMessage(null);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Bar with Back Button */}
      <header className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStore}
          className="group flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Store</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-mono font-medium text-slate-400">
            Pandey Admin Security Gateway
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden relative backdrop-blur-md">
          
          {/* STEP 1: CREDENTIALS (Email + Password) */}
          {step === 'credentials' && (
            <>
              {/* Card Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800/80 via-slate-900 to-slate-900 border-b border-slate-800 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <img
                    src="https://1000logos.net/wp-content/uploads/2017/02/Apple-Logo.png"
                    alt="Apple Logo"
                    className="w-7 h-7 object-contain brightness-0 invert"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
                  Admin Portal Login
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Enter your store management credentials to proceed
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleCredentialsSubmit} className="p-6 sm:p-8 space-y-5">
                
                {/* Error Message Box */}
                {errorMessage && (
                  <div
                    id="admin-login-error"
                    className="p-4 bg-rose-950/70 border border-rose-800/80 rounded-2xl text-rose-200 text-xs flex items-start space-x-3 shadow-inner animate-in fade-in duration-200"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-rose-300">
                        {errorType === 'UNAUTHORIZED_ACCOUNT' && 'Access Denied: Unauthorized Account'}
                        {errorType === 'WRONG_PASSWORD' && 'Access Denied: Incorrect Password'}
                        {errorType === 'MISSING_FIELDS' && 'Required Information Missing'}
                        {errorType === 'NETWORK_ERROR' && 'Connection Error'}
                        {!['UNAUTHORIZED_ACCOUNT', 'WRONG_PASSWORD', 'MISSING_FIELDS', 'NETWORK_ERROR'].includes(errorType) && 'Authentication Error'}
                      </p>
                      <p className="text-rose-200/90 leading-relaxed font-normal">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                  >
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      placeholder="Enter admin email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="admin-password"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                    >
                      Admin Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your admin password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="admin-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800/60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Continue to 2FA Verification</span>
                    </>
                  )}
                </button>

                {/* 2FA Badge & Security Notice */}
                <div className="pt-3 border-t border-slate-800/80 text-center space-y-1">
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 inline shrink-0" />
                    <span>Protected by Two-Factor Authentication</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Supports Google Authenticator, Microsoft Authenticator & Store Security PIN.
                  </p>
                </div>

              </form>
            </>
          )}

          {/* STEP 2: TWO-FACTOR VERIFICATION (TOTP & STORE PIN) */}
          {step === '2fa' && (
            <>
              {/* Card Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-b border-slate-800 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
                  Two-Factor Security Verification
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                  Confirm your identity to unlock store management
                </p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-indigo-300">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  <span>{email}</span>
                </div>
              </div>

              {/* 2FA Body */}
              <div className="p-6 sm:p-8 space-y-5">
                
                {/* Error Message Box */}
                {errorMessage && (
                  <div
                    id="admin-2fa-error"
                    className="p-4 bg-rose-950/70 border border-rose-800/80 rounded-2xl text-rose-200 text-xs flex items-start space-x-3 shadow-inner animate-in fade-in duration-200"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-rose-300">
                        {errorType === 'INVALID_2FA_CODE' ? 'Invalid Code / PIN' : 'Verification Error'}
                      </p>
                      <p className="text-rose-200/90 leading-relaxed font-normal">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mode Selector Tabs: 2 Clean Methods */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPinMode('6digit');
                      setErrorMessage('');
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      pinMode === '6digit'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Authenticator App (6-Digit)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinMode('4digit');
                      setErrorMessage('');
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      pinMode === '4digit'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Store Security PIN (4-Digit)</span>
                  </button>
                </div>

                {/* 1. 6-DIGIT TOTP INPUT MODE (Google Authenticator) */}
                {pinMode === '6digit' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        6-Digit Authenticator Code
                      </label>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{secondsRemaining}s</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                      {otpDigits6.map((digit, index) => (
                        <input
                          key={`6digit-${index}`}
                          ref={(el) => (digitInputRefs6.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleDigitChange6(index, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown6(index, e)}
                          className={`w-full h-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold bg-slate-950 border rounded-xl transition-all focus:outline-hidden ${
                            digit
                              ? 'border-indigo-500 text-white bg-indigo-950/20 shadow-sm shadow-indigo-500/20'
                              : 'border-slate-700 text-slate-300 placeholder:text-slate-600'
                          } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-400 text-center">
                      Enter the 6-digit code from your Google Authenticator or 2FA app.
                    </p>
                  </div>
                )}

                {/* 2. 4-DIGIT STORE SECURITY PIN MODE */}
                {pinMode === '4digit' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        ४-Digit Store Security PIN
                      </label>
                      <span className="text-[11px] text-slate-400">Master Store PIN</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {otpDigits4.map((digit, index) => (
                        <input
                          key={`4digit-${index}`}
                          ref={(el) => (digitInputRefs4.current[index] = el)}
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          value={digit}
                          onChange={(e) => handleDigitChange4(index, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown4(index, e)}
                          className={`w-full h-14 sm:h-16 text-center text-2xl sm:text-3xl font-mono font-bold bg-slate-950 border rounded-2xl transition-all focus:outline-hidden ${
                            digit
                              ? 'border-indigo-500 text-white bg-indigo-950/20 shadow-md shadow-indigo-500/20'
                              : 'border-slate-700 text-slate-300 placeholder:text-slate-600'
                          } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col items-center space-y-2 text-center">
                      <p className="text-[11px] text-slate-400">
                        स्टोर एडमिनको ४-अङ्कको सेक्युरिटी पिन: <strong className="text-amber-300 font-mono text-xs">{activeStorePin}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setResetModalMessage(null);
                          setShowResetPinModal(true);
                        }}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>पिन बिर्सिनुभयो? / Reset 4-Digit PIN</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Verification Button */}
                <button
                  id="admin-2fa-submit"
                  type="button"
                  onClick={() => handleVerify2FA()}
                  disabled={
                    isLoading ||
                    (pinMode === '4digit'
                      ? otpDigits4.join('').length !== 4
                      : otpDigits6.join('').length !== 6)
                  }
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>
                        {pinMode === '4digit'
                          ? 'Verify Store PIN & Login'
                          : 'Verify Authenticator Code & Login'}
                      </span>
                    </>
                  )}
                </button>

                {/* Authenticator Setup QR Modal Trigger */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(true)}
                    className="w-full py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 flex items-center justify-center space-x-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    <span>View QR Code / Setup Google Authenticator</span>
                  </button>
                </div>

                {/* Switch Account / Back */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setErrorMessage('');
                      setErrorType('');
                    }}
                    className="text-slate-400 hover:text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Credentials</span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Step 2 of 2
                  </span>
                </div>

              </div>
            </>
          )}

        </div>
      </main>

      {/* 2FA SETUP MODAL (QR CODE & SECRET KEY) */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Authenticator App Setup</h3>
                  <p className="text-[11px] text-slate-400">Google Authenticator • Microsoft • Apple Passwords</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* Step instructions */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="font-bold text-slate-200">Instructions:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400 leading-relaxed">
                  <li>Open <strong>Google Authenticator</strong> or any TOTP 2FA app on your phone.</li>
                  <li>Tap <strong>+</strong> and scan the QR code below, or copy the manual key.</li>
                  <li>Enter the live 6-digit code shown on your phone to complete login.</li>
                </ol>
              </div>

              {/* QR Code Canvas/Image */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner mx-auto max-w-[240px]">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="2FA TOTP QR Code"
                    className="w-48 h-48 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-900">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
                <span className="text-[10px] text-slate-600 font-semibold mt-1">
                  Scan with Google Authenticator
                </span>
              </div>

              {/* Manual Secret Key */}
              {totpSetup?.secret && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Manual Base32 Secret Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-indigo-300 select-all truncate">
                      {totpSetup.secret}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedSecret ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Return to Login Verification
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET 4-DIGIT PIN MODAL */}
      {/* ========================================================================= */}
      {showResetPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowResetPinModal(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl shadow-black overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Reset 4-Digit Security PIN</h3>
                  <p className="text-[11px] text-amber-100">Store Admin PIN Recovery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetPinModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {resetModalMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                    resetModalMessage.type === 'success'
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/80 border border-red-500/50 text-red-300'
                  }`}
                >
                  {resetModalMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{resetModalMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleResetPinSubmit} className="space-y-3.5">
                {/* Admin Password verification */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Enter Current Admin Password
                  </label>
                  <input
                    type="password"
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter password (default: admin123)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Default factory password is: <strong className="text-amber-300 font-mono">admin123</strong>
                  </span>
                </div>

                {/* New 4-digit PIN */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      New 4-Digit PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      pattern="[0-9]*"
                      value={newResetPin}
                      onChange={(e) => setNewResetPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 9988"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-mono font-bold text-amber-300 placeholder:text-slate-600 focus:border-amber-400 focus:outline-hidden tracking-widest"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      pattern="[0-9]*"
                      value={confirmResetPin}
                      onChange={(e) => setConfirmResetPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 9988"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-mono font-bold text-amber-300 placeholder:text-slate-600 focus:border-amber-400 focus:outline-hidden tracking-widest"
                      required
                    />
                  </div>
                </div>

                {/* Submit New PIN Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Update & Save 4-Digit PIN</span>
                </button>
              </form>

              {/* Quick Reset Option Divider */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-800"></div>
                <span className="shrink mx-2 text-[10px] text-slate-500 uppercase font-mono">OR QUICK RESET</span>
                <div className="grow border-t border-slate-800"></div>
              </div>

              {/* Quick Reset to Factory Default 9988 */}
              <button
                type="button"
                onClick={handleQuickResetToDefault}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>One-Click Reset to Default PIN (9988)</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Pandey Mobile Store • Traffic Chowk, Butwal, Nepal</p>
      </footer>

    </div>
  );
};
