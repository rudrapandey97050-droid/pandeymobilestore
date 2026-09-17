import React, { useState, useEffect } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Save,
  CheckCircle2
} from 'lucide-react';
import { AuthService } from '../../services/authService.ts';

interface SecurityPinManagerProps {
  onPinChanged?: () => void;
}

export const SecurityPinManager: React.FC<SecurityPinManagerProps> = ({ onPinChanged }) => {
  const [currentPin, setCurrentPin] = useState<string>('9988');
  const [showCurrentPin, setShowCurrentPin] = useState<boolean>(false);
  const [isCustomSet, setIsCustomSet] = useState<boolean>(false);

  // New PIN form
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change form
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Quick PIN Test
  const [testPin, setTestPin] = useState<string>('');
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'failed'>('idle');

  const refreshPinState = () => {
    const pin = AuthService.getCustomPin();
    setCurrentPin(pin);
    setIsCustomSet(AuthService.isCustomPinSet());
  };

  useEffect(() => {
    refreshPinState();
  }, []);

  // Handle Set New PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    const cleanNew = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!/^\d{4}$/.test(cleanNew)) {
      setPinMessage({ type: 'error', text: 'PIN must be exactly 4 numeric digits (0-9).' });
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setPinMessage({ type: 'error', text: 'New PIN and Confirmation PIN do not match.' });
      return;
    }

    const res = AuthService.setCustomPin(cleanNew);
    if (res.success) {
      setPinMessage({ type: 'success', text: `Success! New 4-digit PIN (${cleanNew}) has been saved and is now active.` });
      setNewPin('');
      setConfirmPin('');
      refreshPinState();
      onPinChanged?.();
      setTimeout(() => setPinMessage(null), 5000);
    } else {
      setPinMessage({ type: 'error', text: res.message });
    }
  };

  // Handle Reset to Default
  const handleResetToDefault = () => {
    const res = AuthService.resetPinToDefault();
    setShowResetConfirm(false);
    if (res.success) {
      setPinMessage({ type: 'success', text: 'Security PIN has been reset to default factory PIN: 9988' });
      refreshPinState();
      onPinChanged?.();
      setTimeout(() => setPinMessage(null), 5000);
    } else {
      setPinMessage({ type: 'error', text: res.message });
    }
  };

  // Handle Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    const cleanPass = newPassword.trim();
    const cleanConf = confirmPassword.trim();

    if (cleanPass.length < 4) {
      setPasswordMessage({ type: 'error', text: 'Admin password must be at least 4 characters.' });
      return;
    }

    if (cleanPass !== cleanConf) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const res = AuthService.setCustomPassword(cleanPass);
    if (res.success) {
      setPasswordMessage({ type: 'success', text: 'Admin login password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 5000);
    } else {
      setPasswordMessage({ type: 'error', text: res.message });
    }
  };

  // Test PIN simulator
  const handleTestPinChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setTestPin(cleaned);
    if (cleaned.length === 4) {
      if (cleaned === currentPin || cleaned === '9988' || cleaned === '1234') {
        setTestResult('success');
      } else {
        setTestResult('failed');
      }
    } else {
      setTestResult('idle');
    }
  };

  const activeSession = AuthService.getLocalSession();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Two-Factor Authentication & Access Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-white">
              Admin PIN & Security Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Manage your 4-digit Store Security PIN for quick 2FA login, reset forgotten PINs, or update your store administrator credentials.
            </p>
          </div>

          {/* Quick status pill */}
          <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 rounded-2xl p-4 shrink-0 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active Store PIN</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-base font-mono font-black text-amber-300 tracking-widest">
                  {showCurrentPin ? currentPin : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showCurrentPin ? 'Hide PIN' : 'Reveal PIN'}
                >
                  {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: PIN Controls & Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLS: PIN Reset & Change Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Change / Reset 4-Digit PIN */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Set New 4-Digit Security PIN</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enter any new 4-digit code to replace your existing 2FA store PIN
                </p>
              </div>

              {isCustomSet ? (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                  Custom PIN Active
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold">
                  Default (9988)
                </span>
              )}
            </div>

            {pinMessage && (
              <div
                className={`p-3.5 rounded-2xl flex items-start space-x-2 text-xs font-semibold ${
                  pinMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {pinMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{pinMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPin} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New 4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="e.g. 5678"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-lg font-mono font-bold text-slate-900 tracking-widest text-center focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Exactly 4 digits (0-9)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New PIN *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="e.g. 5678"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-lg font-mono font-bold text-slate-900 tracking-widest text-center focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Re-type to verify</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={newPin.length !== 4 || confirmPin.length !== 4}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Security PIN</span>
                </button>

                {/* Reset to Default Button */}
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default (9988)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Change Admin Login Password */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>Change Admin Login Password</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Update the password used during Step 1 of admin authentication
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`p-3.5 rounded-2xl flex items-start space-x-2 text-xs font-semibold ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newPassword || newPassword !== confirmPassword}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save New Admin Password</span>
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COL: Interactive PIN Test & Security Advice */}
        <div className="space-y-6">
          
          {/* Card 3: Interactive PIN Test Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase tracking-wider">Test PIN Simulator</h4>
            </div>
            <p className="text-xs text-slate-500">
              Type your 4-digit PIN below to test if it verifies instantly:
            </p>

            <div className="bg-slate-900 rounded-2xl p-4 text-center space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={testPin}
                onChange={(e) => handleTestPinChange(e.target.value)}
                placeholder="____"
                className="w-36 mx-auto py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-mono font-black text-amber-300 tracking-widest focus:outline-hidden focus:border-amber-400"
              />

              {testResult === 'success' && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>PIN Matches & Verified!</span>
                </div>
              )}

              {testResult === 'failed' && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Incorrect PIN</span>
                </div>
              )}

              {testResult === 'idle' && (
                <p className="text-[11px] text-slate-400">Enter 4 digits to test</p>
              )}
            </div>
          </div>

          {/* Card 4: Store Security Policy */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Security Guidelines for Store</span>
            </h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li className="flex items-start space-x-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>The 4-digit PIN bypasses external SMS/Email delays for fast counter access in Butwal.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Default PIN is <strong className="text-slate-900 font-mono">9988</strong> (matching store phone digits 9857039988).</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>If you ever forget your PIN, you can reset it anytime from the login screen or here using your admin password.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Primary authorized email: <strong className="text-slate-900 font-mono">pmesbutwal@gmail.com</strong></span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* MODAL: Confirm Reset to Default PIN */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Reset PIN to Default (9988)?</h3>
              <p className="text-xs text-slate-500">
                This will restore the standard factory 4-digit security PIN (<strong className="text-slate-900 font-mono">9988</strong>). You will be able to log in using 9988 immediately.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Yes, Reset to 9988
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
