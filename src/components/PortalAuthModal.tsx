import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { CheckCircle2, LogOut, ShieldCheck, X } from 'lucide-react';
import { AccessRequestRecord } from '../data/platformData';
import { EffectiveRole } from '../hooks/useWaslaFirebase';
import { WaslaLogo } from './brand/WaslaLogo';

interface PortalAuthModalProps {
  open: boolean;
  user: User | null;
  effectiveRole: EffectiveRole;
  authError: string;
  ownAccessRequest: AccessRequestRecord | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSubmitAccessRequest: (
    requestedRole: 'operations' | 'supplier',
    companyName: string,
    city: string
  ) => Promise<void>;
  onEnterPortal: (role: EffectiveRole) => void;
  onClose: () => void;
}

export const PortalAuthModal: React.FC<PortalAuthModalProps> = ({
  open,
  user,
  effectiveRole,
  authError,
  ownAccessRequest,
  onSignIn,
  onSignOut,
  onSubmitAccessRequest,
  onEnterPortal,
  onClose,
}) => {
  const [requestedRole, setRequestedRole] = useState<'operations' | 'supplier'>('supplier');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('Hurghada');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitAccessRequest(requestedRole, companyName, city);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2233]/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-auth-title"
    >
      <div
        className="card-wasla max-w-md w-full mx-auto relative"
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#C8C2B8]/60 dark:border-[#334155] text-[#64748B] hover:border-[#EE5426] hover:text-[#EE5426] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <WaslaLogo variant="full" withCardBg className="h-14 w-auto mx-auto mb-6" />

        <div className="text-center mb-5">
          <h2 id="portal-auth-title" className="text-lg font-bold text-[#0F2233] dark:text-white">
            Wasla Staff &amp; Partner Portal
          </h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-300">
            Secure Firebase Authentication for Owner, Operations &amp; Suppliers
          </p>
        </div>

        <div className="space-y-4">
          {!user ? (
            <>
              <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed text-center">
                Sign in with your own verified Google account to request access to Owner Control,
                Reservations &amp; Dispatch, or the Supplier Portal. Tourists never see internal management screens.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="btn-wasla-primary w-full cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Sign in with Google</span>
              </button>
              {authError && (
                <p className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
                  {authError}
                </p>
              )}
            </>
          ) : effectiveRole !== 'none' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-4 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Verified Role: {effectiveRole.toUpperCase()}</span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-slate-300">{user.email}</p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onEnterPortal(effectiveRole)}
                  className="btn-wasla-primary w-full cursor-pointer"
                >
                  Open My Workspace
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="btn-wasla-outline w-full text-sm cursor-pointer"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : ownAccessRequest ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 space-y-1">
                <div className="text-xs font-semibold text-[#F59E0B]">
                  Access Request Status: {ownAccessRequest.status}
                </div>
                <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                  Signed in as <strong className="text-[#0F2233] dark:text-white">{user.email}</strong> ({ownAccessRequest.requestedRole}). Once the Wasla Owner
                  approves you as <strong>Co-Owner (all 3 portals)</strong> or as{' '}
                  <strong>{ownAccessRequest.requestedRole}</strong>, this screen unlocks automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="btn-wasla-outline w-full text-sm cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequest} className="space-y-3.5">
              <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                Signed in as <strong className="text-[#0F2233] dark:text-white">{user.email}</strong>. Send an access request so the Owner can grant your portal
                role (or full Co-Owner access across all 3 portals):
              </p>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#0F2233] dark:text-white">Requested Portal</span>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as 'operations' | 'supplier')}
                  className="input-wasla text-xs"
                >
                  <option value="operations">Reservations &amp; Dispatch / Partner Review (Owner can grant all 3 portals)</option>
                  <option value="supplier">Supplier Portal (Add Trips &amp; Options)</option>
                </select>
              </label>

              {requestedRole === 'supplier' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#0F2233] dark:text-white">Company / Boat Name</span>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Red Sea Marina Co."
                      className="input-wasla text-xs"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#0F2233] dark:text-white">Base City</span>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-wasla text-xs"
                    >
                      <option value="Hurghada">Hurghada</option>
                      <option value="Marsa Alam">Marsa Alam</option>
                      <option value="Luxor">Luxor</option>
                      <option value="Cairo">Cairo</option>
                    </select>
                  </label>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-wasla-primary w-full cursor-pointer"
                >
                  {submitting ? 'Sending request...' : 'Request Owner Approval'}
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="btn-wasla-outline w-full text-sm cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
