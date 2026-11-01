import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Mail, 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  X,
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';
import { AppUser } from '../types/marketing';
import { generateRandomBase32Secret, generateTOTPCode, verifyTOTPToken, getOtpAuthUri } from '../services/totpService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: AppUser) => void;
  existingUsers: AppUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  existingUsers,
}) => {
  const [step, setStep] = useState<'gmail' | 'totp_2fa'>('gmail');
  const [emailInput, setEmailInput] = useState('ghahreman.tapsidoctor@gmail.com');
  const [nameInput, setNameInput] = useState('قهرمان (مارکتینگ تپسی دکتر)');
  const [totpCode, setTotpCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [liveCalculatedCode, setLiveCalculatedCode] = useState('');

  // Pre-calculate live code for convenience
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const updateCode = async () => {
      try {
        const code = await generateTOTPCode(totpSecret);
        setLiveCalculatedCode(code);
      } catch (e) {
        console.error(e);
      }
    };
    if (step === 'totp_2fa') {
      updateCode();
      timer = setInterval(updateCode, 10000);
    }
    return () => clearInterval(timer);
  }, [step, totpSecret]);

  if (!isOpen) return null;

  const handleSelectQuickAccount = (user: AppUser) => {
    setEmailInput(user.email);
    setNameInput(user.name);
    if (user.twoFactorSecret) {
      setTotpSecret(user.twoFactorSecret);
    }
  };

  const handleProceedTo2FA = () => {
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('لطفاً یک آدرس ایمیل / جیمیل معتبر وارد کنید.');
      return;
    }
    setErrorMessage('');
    
    // Check if user exists or generate new secret
    const existing = existingUsers.find((u) => u.email.toLowerCase() === emailInput.toLowerCase());
    if (existing?.twoFactorSecret) {
      setTotpSecret(existing.twoFactorSecret);
    } else {
      setTotpSecret(generateRandomBase32Secret(16));
    }

    setStep('totp_2fa');
  };

  const handleVerify2FA = async (codeToVerify = totpCode) => {
    if (codeToVerify.length !== 6) {
      setErrorMessage('کد احراز هویت باید ۶ رقم باشد.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const isValid = await verifyTOTPToken(totpSecret, codeToVerify);
      if (isValid) {
        const existing = existingUsers.find((u) => u.email.toLowerCase() === emailInput.toLowerCase());
        const loggedUser: AppUser = existing || {
          id: `usr_${Date.now()}`,
          name: nameInput || 'کاربر تپسی دکتر',
          email: emailInput,
          role: emailInput.includes('ghahreman') || emailInput.includes('admin') ? 'super_admin' : 'marketing_lead',
          has2FA: true,
          twoFactorSecret: totpSecret,
          status: 'active',
          lastLogin: 'هم‌اکنون',
        };

        onSuccessLogin(loggedUser);
        onClose();
      } else {
        setErrorMessage('کد وارد شده نامعتبر یا منقضی شده است. لطفاً کد جدید را از نرم‌افزار Google Authenticator وارد کنید.');
      }
    } catch (err) {
      setErrorMessage('خطا در اعتبارسنجی کد.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleFillLiveTestCode = () => {
    if (liveCalculatedCode) {
      setTotpCode(liveCalculatedCode);
      handleVerify2FA(liveCalculatedCode);
    }
  };

  const otpAuthUri = getOtpAuthUri(totpSecret, emailInput, 'TapsiDoctor-TPDR');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-right">
        
        {/* Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 px-3 py-1 rounded-2xl bg-white/95 border border-slate-700/60 flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
            <img
              src="https://tapsi.doctor/images/logo/tapsi-doctor-logo.svg"
              alt="تپسی دکتر"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              احراز هویت دو مرحله‌ای (Google OAuth & Authenticator)
            </h3>
            <p className="text-xs text-slate-400">
              دسترسی امن به داشبورد مارکتینگ تپسی دکتر (tpdr.nexzone.ir)
            </p>
          </div>
        </div>

        {/* STEP 1: Gmail Sign-in */}
        {step === 'gmail' && (
          <div className="space-y-4">
            
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                ورود با حساب گوگل / جیمیل سازمانی:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@tapsidoctor.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Quick account pickers */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                حساب‌های کاربری تایید شده:
              </span>
              <div className="space-y-1.5">
                {existingUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectQuickAccount(u)}
                    type="button"
                    className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                      emailInput.toLowerCase() === u.email.toLowerCase()
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono" dir="ltr">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                      {u.role === 'super_admin' ? 'Super Admin' : 'Marketing'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleProceedTo2FA}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
            >
              <span>ادامه به مرحله Google Authenticator</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* STEP 2: Google Authenticator (TOTP 2FA) */}
        {step === 'totp_2fa' && (
          <div className="space-y-4">
            
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center">
              <span className="text-xs text-slate-300 font-medium mb-3">
                اسکن بارکد در اپلیکیشن <strong className="text-emerald-400">Google Authenticator</strong>
              </span>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl shadow-md mb-3">
                <QRCodeSVG value={otpAuthUri} size={150} level="M" />
              </div>

              {/* Manual Secret Key */}
              <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <span className="text-[10px] text-slate-400">کلید دستی (Secret):</span>
                <span className="font-mono text-emerald-400 font-semibold tracking-wider" dir="ltr">{totpSecret}</span>
                <button
                  onClick={handleCopySecret}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="کپی کلید"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 6-Digit Code Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                کد ۶ رقمی تأیید دو مرحله‌ای:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center tracking-[0.5em] text-xl font-mono bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Auto-fill test code helper */}
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>کد زنده جهت تست فوری:</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700" dir="ltr">
                  {liveCalculatedCode || 'در حال محاسبه...'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillLiveTestCode}
                className="text-[11px] font-bold text-emerald-400 hover:underline"
              >
                درج و ورود
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('gmail')}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                بازگشت
              </button>
              <button
                onClick={() => handleVerify2FA()}
                disabled={isVerifying || totpCode.length !== 6}
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
              >
                {isVerifying ? 'در حال بررسی...' : 'تأیید و ورود به پنل'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
