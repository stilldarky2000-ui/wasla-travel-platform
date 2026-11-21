import test from 'node:test';
import assert from 'node:assert/strict';
import { voucherToken, validVoucherToken } from '../server/utils/voucherAccess.ts';
import { voucherToken as cloudVoucherToken } from '../functions/src/voucherAccess.ts';
import { createBookingReference } from '../src/lib/bookingReference.ts';
test('references are unambiguous, dash-free and random', () => {
 const refs = Array.from({length:10000}, createBookingReference);
 assert.equal(new Set(refs).size, refs.length);
 for (const ref of refs) assert.match(ref, /^WT[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
});
test('private token is bound to booking, rejects tampering and fails closed', () => {
 process.env.VOUCHER_LINK_SECRET = 'a'.repeat(64);
 const token = voucherToken('WT7K9M4X2P');
 assert.equal(cloudVoucherToken('WT7K9M4X2P'), token);
 assert.equal(validVoucherToken('WT7K9M4X2P', token), true);
 assert.equal(validVoucherToken('WTOTHER', token), false);
 assert.equal(validVoucherToken('WT7K9M4X2P', '0'.repeat(64)), false);
 assert.equal(validVoucherToken('WT7K9M4X2P', ''), false);
 assert.equal(validVoucherToken('WT-412', voucherToken('WT-412')), true);
 delete process.env.VOUCHER_LINK_SECRET;
 assert.equal(validVoucherToken('WT7K9M4X2P', token), false);
 assert.throws(() => voucherToken('WT7K9M4X2P'));
});
