import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(new URL('../functions/package.json',import.meta.url));
const {initializeApp,deleteApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const {enqueue,processJob,backoffMs} = require('../functions/lib/notificationOutbox.js');
import {readBooking,guestVoucher} from '../server/utils/bookingStore.ts';
import {initializeApp as clientApp,deleteApp as deleteClient} from 'firebase/app';
import {getFirestore as clientStore,connectFirestoreEmulator,doc,getDoc,setDoc} from 'firebase/firestore';
if (!['127.0.0.1:8091','localhost:8091'].includes(process.env.FIRESTORE_EMULATOR_HOST || '')) throw new Error('Run only through the local Firestore emulator');
const project = 'demo-wasla-outbox';
const app = initializeApp({projectId:project});
const db = getFirestore(app);
const input = {payload:{bookingId:'WT7K9M4X2P',eventType:'booking_created',tripTitle:'Sea',destination:'Hurghada',tripDate:'2026-12-01',supplierName:'Supplier',guestName:'Guest',guestCountry:'EG',hotel:'Hotel',adults:2,children:0,infants:0,grossEur:80,paymentStatus:'Awaiting link'},recipients:{ownerEmails:['owner@example.test'],ownerWhatsappDigits:'201111111111',ownerWhatsappDisplay:'+201111111111',appUrl:'https://example.test'}};
test.after(async()=>{await db.terminate();await deleteApp(app);});
test('duplicate booking events create one durable job',async()=>{
 const ids = await Promise.all(Array.from({length:8},()=>enqueue(db,'same-event',input)));
 assert.equal(new Set(ids).size,1);
 assert.equal((await db.collection('notification_outbox').doc(ids[0]).get()).data().attempts,0);
});
test('concurrent workers claim one job; delivered survives a new worker',async()=>{
 const id = await enqueue(db,'concurrent',input);let sends=0;
 const options={channels:()=>['email'],send:async()=>{sends++;await new Promise(r=>setTimeout(r,30));return true;}};
 await Promise.all(Array.from({length:8},()=>processJob(db,id,options)));
 assert.equal(sends,1);
 await processJob(db,id,options);assert.equal(sends,1);
 assert.equal((await db.collection('notification_outbox').doc(id).get()).data().status,'delivered');
});
test('partial failure persists successes and retries only the failed channel after backoff',async()=>{
 const id=await enqueue(db,'partial',input);let time=Date.now()+100;const counts={email:0,whatsapp:0};
 const options={now:()=>time,channels:()=>['email','whatsapp'],send:async(_job,channel)=>{counts[channel]++;return channel==='email'||counts.whatsapp>1;}};
 assert.equal(await processJob(db,id,options),'retry');
 assert.equal(await processJob(db,id,options),'skipped');
 time+=30001;
 assert.equal(await processJob(db,id,options),'delivered');
 assert.deepEqual(counts,{email:1,whatsapp:2});
});
test('expired lease is rescued and an unexpired lease is left alone',async()=>{
 const id=await enqueue(db,'crash',input);const ref=db.collection('notification_outbox').doc(id);let time=Date.now()+100;
 await ref.update({status:'processing',lease:'dead-worker',nextAttemptAtMs:time+300000});
 const options={now:()=>time,channels:()=>['email'],send:async()=>true};
 assert.equal(await processJob(db,id,options),'skipped');time+=300001;
 assert.equal(await processJob(db,id,options),'delivered');
});
test('no configured channels stays retryable; later configuration recovers',async()=>{
 const id=await enqueue(db,'config',input);let time=Date.now()+100;
 assert.equal(await processJob(db,id,{now:()=>time,channels:()=>[],send:async()=>true}),'retry');time+=30001;
 assert.equal(await processJob(db,id,{now:()=>time,channels:()=>['email'],send:async()=>true}),'delivered');
 assert.equal(backoffMs(100),3600000);
});
test('voucher reads current durable booking and returns no internal fields',async()=>{
 const id='WT7K9M4X2P';await db.doc('bookings/'+id).set({...input.payload,id,status:'Confirmed',roomNumber:'203',notes:'PRIVATE',supplierNotes:'PRIVATE',locationImageUrl:'PASSPORT',costEur:45,guestEmail:'private@example.test'});
 let booking=await readBooking(project,'(default)',id);assert.equal(booking.roomNumber,'203');
 await db.doc('bookings/'+id).update({roomNumber:'204',status:'Cancelled'});
 booking=await readBooking(project,'(default)',id);assert.equal(booking.status,'Cancelled');assert.equal(booking.roomNumber,'204');
 const voucher=guestVoucher(booking);
 for(const field of ['notes','supplierNotes','locationImageUrl','costEur','guestEmail'])assert.equal(field in voucher,false);
 assert.equal(await readBooking(project,'(default)','WTMISSING'),null);
});
test('outbox cannot be read or forged by an unauthenticated browser client',async()=>{
 const client=clientApp({projectId:project,apiKey:'demo-key'},'untrusted');
 const store=clientStore(client);connectFirestoreEmulator(store,'127.0.0.1',8091);
 try {
  await assert.rejects(getDoc(doc(store,'notification_outbox','private-job')),e=>e.code==='permission-denied');
  await assert.rejects(setDoc(doc(store,'notification_outbox','forged-job'),{status:'delivered'}),e=>e.code==='permission-denied');
 } finally { await deleteClient(client); }
});

test('provider exceptions retry, and obsolete notifications are suppressed',async()=>{
 const id=await enqueue(db,'provider-throws',input);let time=Date.now()+100;
 assert.equal(await processJob(db,id,{now:()=>time,channels:()=>['email'],send:async()=>{throw new Error('provider down');}}),'retry');
 time+=30001;let sends=0;
 assert.equal(await processJob(db,id,{now:()=>time,channels:()=>['email'],eligible:async()=>false,send:async()=>{sends++;return true;}}),'superseded');
 assert.equal(sends,0);assert.equal((await db.collection('notification_outbox').doc(id).get()).data().status,'superseded');
});

test('real HTTP routes require private links and read Firestore without a cache', {timeout:45000}, async()=>{
 const {spawn}=await import('node:child_process');
 const {createHmac}=await import('node:crypto');
 const secret='local-test-only-'.repeat(4);
 const child=spawn(process.execPath,['--import','tsx','server.ts'],{
  cwd:new URL('../',import.meta.url),windowsHide:true,
  env:{...process.env,NODE_ENV:'test',PORT:'3017',FIREBASE_PROJECT_ID:project,FIRESTORE_DATABASE_ID:'(default)',VOUCHER_LINK_SECRET:secret},
  stdio:['ignore','pipe','pipe'],
 });
 let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
 const base='http://127.0.0.1:3017';
 try {
  let ready=false;
  for(let i=0;i<100;i++){
   if(child.exitCode!==null)throw new Error('Test server exited: '+logs);
   try {const r=await fetch(base+'/api/vouchers/WT7K9M4X2P');if(r.status===403){ready=true;break;}}catch{}
   await new Promise(r=>setTimeout(r,150));
  }
  assert.equal(ready,true,'test server did not start: '+logs);
  const token=createHmac('sha256',secret).update('voucher:v1:WT7K9M4X2P').digest('hex');
  let response=await fetch(base+'/api/vouchers/WT7K9M4X2P',{headers:{'X-Voucher-Token':token}});
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  let voucher=(await response.json()).voucher;assert.equal(voucher.roomNumber,'204');assert.equal('notes' in voucher,false);assert.equal('costEur' in voucher,false);
  await db.doc('bookings/WT7K9M4X2P').update({roomNumber:'205'});
  response=await fetch(base+'/api/vouchers/WT7K9M4X2P',{headers:{'X-Voucher-Token':token}});
  voucher=(await response.json()).voucher;assert.equal(voucher.roomNumber,'205');
  for(const route of ['/api/vouchers/WT7K9M4X2P/link','/api/vouchers/sync','/api/notifications/booking-confirmed'])assert.equal((await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  await db.doc('booking_receipts/WT7K9M4X2P').set({tripId:'custom-itinerary',tripDate:'2026-12-01',status:'Pending'});
  response=await fetch(base+'/api/notifications/new-booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'WT7K9M4X2P',guestEmail:'attacker@example.test',isTest:false})});
  assert.equal(response.status,202);assert.deepEqual(await response.json(),{ok:true,queued:true,delivered:false});
 }finally{
  const stopped=new Promise(r=>child.once('exit',r));child.kill();await stopped;
 }
});
