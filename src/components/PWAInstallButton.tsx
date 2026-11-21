import React, { useState } from 'react';
import { Check, Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { Lang } from '../data/i18n';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { WaslaBrandMark } from './WaslaBrandMark';

interface PWAInstallButtonProps {
  lang?: Lang;
  darkMode?: boolean;
  compact?: boolean;
  iconOnly?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'en',
  darkMode = false,
  compact = false,
  iconOnly = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Automatically hide when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const label =
    lang === 'ar'
      ? 'تثبيت التطبيق'
      : lang === 'de'
      ? 'App installieren'
      : 'Install App';

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuideModal(true);
      }
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        title={label}
        aria-label={label}
        className={
          iconOnly
            ? `inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer shrink-0 ${
                darkMode
                  ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'text-[#475569] hover:bg-[#FFF7ED] hover:text-[#EE5426]'
              }`
            : `inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition-all active:scale-95 cursor-pointer shrink-0 ${
                compact
                  ? 'min-h-[32px] px-2.5 py-1 text-xs'
                  : 'min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1.5 text-xs'
              } ${
                darkMode
                  ? 'border-[#EE5426]/60 bg-[#EE5426]/15 text-[#FDBA74] hover:bg-[#EE5426] hover:text-white'
                  : 'border-[#FED7AA] bg-[#FFF7ED] text-[#D9461B] hover:border-[#EE5426] hover:bg-[#EE5426] hover:text-white'
              }`
        }
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!iconOnly && <span className={compact ? 'inline' : 'hidden md:inline'}>{label}</span>}
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/65 p-4 backdrop-blur-xs"
          onClick={() => setShowGuideModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-modal-title"
        >
          <div
            className="card-wasla w-full max-w-md text-[#0F2233] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <WaslaBrandMark size="md" />
                <div>
                  <h3
                    id="pwa-install-modal-title"
                    className="font-display text-lg font-bold text-[#0F2233]"
                  >
                    {lang === 'ar'
                      ? 'تثبيت تطبيق Wasla Travel'
                      : lang === 'de'
                      ? 'Wasla Travel App installieren'
                      : 'Install Wasla Travel App'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {lang === 'ar'
                      ? 'أضف التطبيق إلى شاشة هاتفك للوصول السريع'
                      : lang === 'de'
                      ? 'Für schnellen Zugriff zum Startbildschirm hinzufügen'
                      : 'Add to your home screen for instant mobile access'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close"
                className="rounded-lg border border-[#C8C2B8]/60 p-1.5 text-[#64748B] hover:bg-[#FAF4ED] hover:text-[#0F2233] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isInstallable && (
              <button
                type="button"
                onClick={() => void install()}
                className="btn-wasla-primary w-full min-h-[44px] rounded-full text-sm cursor-pointer"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>
                  {lang === 'ar'
                    ? 'تثبيت مباشر الآن'
                    : lang === 'de'
                    ? 'Jetzt direkt installieren'
                    : 'Install Directly Now'}
                </span>
              </button>
            )}

            <div className="space-y-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/70 p-4 text-xs text-[#334155]">
              {isIOS ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#D9461B]">
                    <Share className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {lang === 'ar'
                        ? 'خطوات التثبيت على iPhone / iPad (Safari):'
                        : lang === 'de'
                        ? 'Installation auf iPhone / iPad (Safari):'
                        : 'Install on iPhone / iPad (Safari):'}
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>
                      {lang === 'ar' ? (
                        <>
                          اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari.
                        </>
                      ) : lang === 'de' ? (
                        <>
                          Tippen Sie in Safari auf die <strong>Teilen-Schaltfläche (Share)</strong>.
                        </>
                      ) : (
                        <>
                          Tap the <strong>Share</strong> button in your Safari toolbar.
                        </>
                      )}
                    </li>
                    <li>
                      {lang === 'ar' ? (
                        <>
                          مرّر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                        </>
                      ) : lang === 'de' ? (
                        <>
                          Wählen Sie <strong>Zum Home-Bildschirm (Add to Home Screen)</strong>.
                        </>
                      ) : (
                        <>
                          Scroll down and tap <strong>Add to Home Screen</strong>.
                        </>
                      )}
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#D9461B]">
                    <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {lang === 'ar'
                        ? 'خطوات التثبيت على Android أو الكمبيوتر:'
                        : lang === 'de'
                        ? 'Installation auf Android oder Desktop:'
                        : 'Install on Android or Desktop:'}
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>
                      {lang === 'ar' ? (
                        <>
                          افتح الموقع في متصفح <strong>Chrome</strong> أو <strong>Safari</strong>.
                        </>
                      ) : lang === 'de' ? (
                        <>
                          Öffnen Sie die Seite in <strong>Chrome</strong> oder <strong>Edge</strong>.
                        </>
                      ) : (
                        <>
                          Open the site in <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari</strong>.
                        </>
                      )}
                    </li>
                    <li>
                      {lang === 'ar' ? (
                        <>
                          اضغط على قائمة المتصفح <strong>(⋮)</strong> ثم اختر{' '}
                          <strong>تثبيت التطبيق (Install app / Add to Home screen)</strong>.
                        </>
                      ) : lang === 'de' ? (
                        <>
                          Tippen Sie auf das Browser-Menü <strong>(⋮)</strong> und wählen Sie{' '}
                          <strong>App installieren</strong>.
                        </>
                      ) : (
                        <>
                          Tap the browser menu <strong>(⋮)</strong> or address bar icon and select{' '}
                          <strong>Install app / Add to Home screen</strong>.
                        </>
                      )}
                    </li>
                  </ol>
                </div>
              )}

              <div className="pt-2 border-t border-[#FED7AA] flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-[#9A3412]">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>
                    {lang === 'ar'
                      ? 'يعمل بدون شريط متصفح'
                      : lang === 'de'
                      ? 'Vollbild-App-Ansicht'
                      : 'Full-screen app experience'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>
                    {lang === 'ar'
                      ? 'حفظ تلقائي للرحلات بدون إنترنت'
                      : lang === 'de'
                      ? 'Offline-Zwischenspeicher'
                      : 'Offline trip caching'}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="btn-wasla-outline w-full min-h-[40px] py-2 text-xs cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : lang === 'de' ? 'Schließen' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<{ lang?: Lang }> = ({ lang = 'en' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 start-4 z-50 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 animate-pulse" aria-hidden="true" />
      <span>
        {lang === 'ar'
          ? 'وضع عدم الاتصال — يتم عرض البيانات المحفوظة'
          : lang === 'de'
          ? 'Offline-Modus — Zwischengespeicherte Daten aktiv'
          : 'Offline Mode — Showing cached trips & bookings'}
      </span>
    </div>
  );
};
