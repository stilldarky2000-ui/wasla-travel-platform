import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { CheckCircle2, LogOut, ShieldCheck, X } from 'lucide-react';
import { AccessRequestRecord } from '../data/platformData';
import { EffectiveRole } from '../hooks/useWaslaFirebase';
import { WaslaBrandMark } from './WaslaBrandMark';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-auth-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <WaslaBrandMark size="sm" />
            <h2 id="portal-auth-title" className="text-base font-semibold text-[#0F172A]">
              Wasla Staff &amp; Partner Portal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!user ? (
            <>
              <p className="text-xs text-[#475569] leading-relaxed">
                Sign in with your own verified Google account to request access to Owner Control,
                Reservations &amp; Dispatch, or the Supplier Portal. Tourists never see internal management screens.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="wasla-book-glare inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Sign in with Google</span>
              </button>
              {authError && (
                <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]">
                  {authError}
                </p>
              )}
            </>
          ) : effectiveRole !== 'none' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Verified Role: {effectiveRole.toUpperCase()}</span>
                </div>
                <p className="text-xs text-[#475569]">{user.email}</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEnterPortal(effectiveRole)}
                  className="wasla-book-glare flex-1 min-h-[42px] rounded-full px-4 text-xs font-semibold text-white cursor-pointer"
                >
                  Open My Workspace
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-[#CBD5E1] px-3 text-xs font-semibold text-[#475569] hover:text-[#0F172A] cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : ownAccessRequest ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#FDE68A] bg-[#FEFCE8] p-4 space-y-1">
                <div className="text-xs font-semibold text-[#B45309]">
                  Access Request Status: {ownAccessRequest.status}
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Signed in as <strong>{user.email}</strong> ({ownAccessRequest.requestedRole}). Once the Wasla Owner
                  approves you as <strong>Co-Owner (all 3 portals)</strong> or as{' '}
                  <strong>{ownAccessRequest.requestedRole}</strong>, this screen unlocks automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full min-h-[40px] rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:text-[#0F172A] cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequest} className="space-y-3">
              <p className="text-xs text-[#475569]">
                Signed in as <strong>{user.email}</strong>. Send an access request so the Owner can grant your portal
                role (or full Co-Owner access across all 3 portals):
              </p>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-[#0F172A]">Requested Portal</span>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as 'operations' | 'supplier')}
                  className="min-h-[40px] w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs"
                >
                  <option value="operations">Reservations &amp; Dispatch / Partner Review (Owner can grant all 3 portals)</option>
                  <option value="supplier">Supplier Portal (Add Trips &amp; Options)</option>
                </select>
              </label>

              {requestedRole === 'supplier' && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#0F172A]">Company / Boat Name</span>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Red Sea Marina Co."
                      className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] px-3 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[#0F172A]">Base City</span>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="min-h-[38px] w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs"
                    >
                      <option value="Hurghada">Hurghada</option>
                      <option value="Marsa Alam">Marsa Alam</option>
                      <option value="Luxor">Luxor</option>
                      <option value="Cairo">Cairo</option>
                    </select>
                  </label>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="wasla-book-glare flex-1 min-h-[40px] rounded-full px-4 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Sending request...' : 'Request Owner Approval'}
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="min-h-[40px] rounded-lg border border-[#CBD5E1] px-3 text-xs font-semibold text-[#475569] cursor-pointer"
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
