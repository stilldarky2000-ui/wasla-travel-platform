import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../functions/package.json',import.meta.url));
const {dispatchBookingNotifications,configuredNotificationChannels}=require('../functions/lib/bookingNotifications.js');
const payload={bookingId:'WT7K9M4X2P',eventType:'booking_created',tripTitle:'Sea',destination:'Hurghada',tripDate:'2026-12-01',supplierName:'Supplier',guestName:'Guest',guestCountry:'EG',guestEmail:'guest@example.test',hotel:'Hotel',adults:2,children:0,infants:0,grossEur:80,paymentStatus:'Awaiting link'};
const recipients={ownerEmails:['owner@example.test'],ownerWhatsappDigits:'201111111111',ownerWhatsappDisplay:'+201111111111',appUrl:'https://example.test'};
const env={RESEND_API_KEY:'test',RESEND_FROM_EMAIL:'bookings@example.test',OWNER_ALERT_WEBHOOK_URL:'https://example.test/hook'};
test('per-channel dispatch sends just that channel with a stable provider idempotency key',async t=>{
 const calls=[];const original=globalThis.fetch;t.after(()=>globalThis.fetch=original);
 globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response('{}',{status:200});};
 assert.deepEqual(configuredNotificationChannels(payload,env),['email','guestEmail','webhook']);
 const result=await dispatchBookingNotifications(payload,recipients,env,{channel:'guestEmail',idempotencyKey:'job:guestEmail'});
 assert.equal(calls.length,1);assert.equal(calls[0].options.headers['Idempotency-Key'],'job:guestEmail');
 const email=JSON.parse(calls[0].options.body);
 assert.match(email.subject,/request saved/i);assert.doesNotMatch(email.subject,/confirmed/i);
 assert.equal(result.guestEmail.sent,true);assert.equal(result.email.sent,false);assert.equal(result.webhook.sent,false);
});
test('provider errors remain failures, not delivered records',async t=>{
 const original=globalThis.fetch;t.after(()=>globalThis.fetch=original);
 globalThis.fetch=async()=>new Response('{}',{status:503});
 const result=await dispatchBookingNotifications(payload,recipients,env,{channel:'email',idempotencyKey:'job:email'});
 assert.equal(result.email.sent,false);assert.equal(result.delivered,false);
});
test('confirmed email requires a private-link secret and includes the private link',async t=>{
 const originalFetch=globalThis.fetch;const previous=process.env.VOUCHER_LINK_SECRET;
 t.after(()=>{globalThis.fetch=originalFetch;if(previous===undefined)delete process.env.VOUCHER_LINK_SECRET;else process.env.VOUCHER_LINK_SECRET=previous;});
 const messages=[];globalThis.fetch=async(_url,options)=>{messages.push(JSON.parse(options.body));return new Response('{}',{status:200});};
 delete process.env.VOUCHER_LINK_SECRET;
 const confirmed={...payload,eventType:'booking_confirmed'};
 await assert.rejects(dispatchBookingNotifications(confirmed,recipients,env,{channel:'guestEmail',idempotencyKey:'confirmed:guestEmail'}));
 assert.equal(messages.length,0);
 process.env.VOUCHER_LINK_SECRET='x'.repeat(64);
 await dispatchBookingNotifications(confirmed,recipients,env,{channel:'guestEmail',idempotencyKey:'confirmed:guestEmail'});
 assert.match(messages[0].html,/#voucherToken=[a-f0-9]{64}/);
});
