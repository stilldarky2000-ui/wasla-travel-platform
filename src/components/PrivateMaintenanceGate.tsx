import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Mail,
  MessageCircle,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/marketplaceData';
import { WaslaLogo } from './brand/WaslaLogo';

interface PrivateMaintenanceGateProps {
  onUnlock: () => void;
}

const EXPECTED_PASSCODE = '4004';
const STORAGE_KEY = 'wasla_private_launch_unlocked_v1';

export const isPrivateGateUnlocked = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'unlocked_4004';
};

export const lockPrivateGate = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const unlockPrivateGate = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, 'unlocked_4004');
};

export const PrivateMaintenanceGate: React.FC<PrivateMaintenanceGateProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // If user already unlocked previously in this browser, allow through
    if (isPrivateGateUnlocked()) {
      onUnlock();
    }
  }, [onUnlock]);

  const handleVerify = (codeToTest: string) => {
    if (codeToTest === EXPECTED_PASSCODE) {
      setIsSuccess(true);
      setErrorMsg('');
      unlockPrivateGate();
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setErrorMsg('رمز المرور غير صحيح. يرجى المحاولة مرة أخرى.');
      setPin('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(pin.trim());
  };

  const handleKeypadPress = (digit: string) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleVerify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full bg-[#0F2233] text-slate-100 flex flex-col justify-between selection:bg-[#EE5426]/20 selection:text-white overflow-hidden"
    >
      {/* Ambient Red Sea glow backdrop */}
      <div
        className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#19354F]/50 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 end-0 w-[450px] h-[450px] rounded-full bg-[#EE5426]/15 blur-[120px]"
        aria-hidden="true"
      />

      {/* Top minimal header bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-[#0F2233]/80">
        <div className="flex items-center gap-3">
          <WaslaLogo variant="full" theme="dark" className="h-9 sm:h-11 w-auto" />
        </div>

        <button
          type="button"
          onClick={() => setShowPinDialog(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          title="دخول الإدارة وفريق العمل"
        >
          <Lock className="h-3.5 w-3.5 text-[#EE5426]" />
          <span>دخول الإدارة</span>
        </button>
      </header>

      {/* Main launch notification body */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EE5426]/15 border border-[#EE5426]/30 text-[#FDBA74] text-xs font-semibold shadow-inner">
            <Shield className="h-4 w-4 text-[#EE5426]" />
            <span>وضع التجهيز والإطلاق الخاص مفعّل (قيد التطوير)</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-arabic leading-tight">
              نلتقي بكم قريباً جداً
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-arabic">
              نعمل حالياً على تجهيز منصة <strong className="text-white font-semibold">«وصلة ترافيل»</strong>{' '}
              وربط أفضل رحلات وتجارب البحر الأحمر (الغردقة، مرسى علم، الأقصر، والقاهرة) بخدمة موثوقة وفورية.
            </p>
            <p className="text-xs text-slate-400 font-sans tracking-wide">
              Wasla Travel platform is currently in private preparation mode. Launching soon.
            </p>
          </div>

          {/* Value points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-start pt-2">
            <div className="p-4 rounded-xl bg-[#19354F]/60 border border-[#334155] backdrop-blur-sm">
              <span className="block text-xs font-semibold text-[#EE5426] mb-1">رحلات بحرية وسفاري</span>
              <p className="text-xs text-slate-300">حجز فوري ومباشر مع موردين معتمدين</p>
            </div>
            <div className="p-4 rounded-xl bg-[#19354F]/60 border border-[#334155] backdrop-blur-sm">
              <span className="block text-xs font-semibold text-[#FAF4ED] mb-1">تأكيد رسمي بالواتساب</span>
              <p className="text-xs text-slate-300">مواعيد بيك أب دقيقة من الفندق</p>
            </div>
            <div className="p-4 rounded-xl bg-[#19354F]/60 border border-[#334155] backdrop-blur-sm">
              <span className="block text-xs font-semibold text-[#10B981] mb-1">أفضل أسعار بدون وسيط</span>
              <p className="text-xs text-slate-300">أسعار شفافة ودعم عملاء متواصل</p>
            </div>
          </div>

          {/* Official Contact Info */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <p className="text-xs text-slate-400">للاستفسارات الرسمية أو طلبات الحجز المباشر:</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <a
                href="mailto:booking@waslatravel.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19354F]/70 hover:bg-[#19354F] border border-[#334155] text-slate-200 transition-colors"
              >
                <Mail className="h-4 w-4 text-[#EE5426]" />
                <span dir="ltr">booking@waslatravel.com</span>
              </a>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/40 text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#10B981]" />
                <span>واتساب مباشر: {SITE_CONFIG.whatsappDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 w-full px-6 py-4 text-center border-t border-white/5 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Wasla Travel (وصلة ترافيل) · جميع الحقوق محفوظة</p>
      </footer>

      {/* Owner Unlock PIN Modal */}
      {showPinDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#19354F] border border-[#334155] p-6 shadow-2xl space-y-5 text-center">
            <WaslaLogo variant="icon" iconStyle="orange" className="h-12 w-12 mx-auto" />

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-arabic">فتح المعاينة الخاصة بالإدارة</h2>
              <p className="text-xs text-slate-300">
                أدخل رمز المرور السري الخاص بك لعرض وتجربة المنصة كاملة
              </p>
            </div>

            {/* PIN Dots Display */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full border transition-all ${
                      filled
                        ? 'bg-[#EE5426] border-[#EE5426] scale-110 shadow-[0_0_8px_rgba(238,84,38,0.5)]'
                        : 'border-white/30 bg-white/5'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}

            {isSuccess && (
              <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>تم التحقق بنجاح! جاري الدخول...</span>
              </p>
            )}

            {/* Keyboard input form (for copy/paste or mobile keyboard) */}
            <form onSubmit={handleFormSubmit} className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setErrorMsg('');
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPin(val);
                  if (val.length === 4) {
                    handleVerify(val);
                  }
                }}
                placeholder="أو اكتب رمز 4004 هنا"
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/20 text-center text-lg tracking-[0.3em] font-mono text-white focus:outline-none focus:ring-2 focus:ring-[#EE5426] placeholder:text-slate-500 placeholder:text-xs placeholder:tracking-normal"
                autoFocus
              />
            </form>

            {/* Interactive Number Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1" dir="ltr">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-3 rounded-lg bg-white/5 hover:bg-white/10 active:bg-[#EE5426]/20 border border-white/10 text-white font-mono font-bold text-lg transition-colors cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPin('');
                  setErrorMsg('');
                }}
                className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium cursor-pointer"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-lg bg-white/5 hover:bg-white/10 active:bg-[#EE5426]/20 border border-white/10 text-white font-mono font-bold text-lg transition-colors cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-medium cursor-pointer"
              >
                ←
              </button>
            </div>

            {/* Close button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinDialog(false);
                  setPin('');
                  setErrorMsg('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
