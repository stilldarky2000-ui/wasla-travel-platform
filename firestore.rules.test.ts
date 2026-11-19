/**
 * Red Team Adversarial Security Rule Specification Tests
 * Maps each of the "Dirty Dozen" attack payloads in security_spec.md
 * to verify expected PERMISSION_DENIED behavior against firestore.rules.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Role Escalation on Access Request',
    collectionPath: '/access_requests/user-123',
    operation: 'create',
    auth: { uid: 'user-123', email: 'vendor@example.com', email_verified: true },
    payload: {
      uid: 'user-123',
      email: 'vendor@example.com',
      displayName: 'Vendor',
      requestedRole: 'supplier',
      status: 'Approved',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Self-Granting Admin/Staff Role',
    collectionPath: '/staff_roles/user-123',
    operation: 'create',
    auth: { uid: 'user-123', email: 'attacker@example.com', email_verified: true },
    payload: {
      uid: 'user-123',
      email: 'attacker@example.com',
      displayName: 'Attacker',
      role: 'owner',
      status: 'Active',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unapproved Trip Self-Publishing by Supplier',
    collectionPath: '/trips/sup-trip-evil',
    operation: 'create',
    auth: { uid: 'sup-1', email: 'supplier@example.com', email_verified: true },
    payload: {
      id: 'sup-trip-evil',
      supplierUid: 'sup-1',
      approvalStatus: 'Approved',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-Supplier Hijack',
    collectionPath: '/trips/trip-owned-by-b',
    operation: 'update',
    auth: { uid: 'sup-a', email: 'a@example.com', email_verified: true },
    payload: {
      price: 1,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Unauthenticated PII Scrape on Bookings',
    collectionPath: '/bookings',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Booking Ghost Field Injection',
    collectionPath: '/bookings/WT-999',
    operation: 'create',
    auth: null,
    payload: {
      id: 'WT-999',
      isPaid: true,
      discountOverride: 100,
      status: 'Pending',
      paymentStatus: 'Awaiting link',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Booking Status Tampering on Create',
    collectionPath: '/bookings/WT-998',
    operation: 'create',
    auth: null,
    payload: {
      id: 'WT-998',
      status: 'Confirmed',
      paymentStatus: 'Paid online',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Spoofed Admin Email (Unverified)',
    collectionPath: '/owner_settings/platform',
    operation: 'get',
    auth: { uid: 'spoof', email: 'stilldarky2000@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning Attack',
    collectionPath: '/bookings/invalid..id$$##@@',
    operation: 'create',
    auth: null,
    payload: { id: 'invalid..id$$##@@' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable createdAt Tampering',
    collectionPath: '/trips/sup-trip-1',
    operation: 'update',
    auth: { uid: 'sup-1', email: 'supplier@example.com', email_verified: true },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Terminal Booking Mutation by Non-Owner',
    collectionPath: '/bookings/WT-401',
    operation: 'update',
    auth: { uid: 'ops-1', email: 'ops@example.com', email_verified: true },
    payload: {
      status: 'Pending',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unbounded Array / Payload Bloat',
    collectionPath: '/trips/sup-trip-bloat',
    operation: 'create',
    auth: { uid: 'sup-1', email: 'supplier@example.com', email_verified: true },
    payload: {
      images: new Array(25).fill('https://example.com/a.jpg'),
    },
    expected: 'PERMISSION_DENIED',
  },
];
