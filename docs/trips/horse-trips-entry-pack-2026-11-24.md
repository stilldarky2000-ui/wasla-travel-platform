# حزمة إدخال رحلات الخيل — النسخة النهائية للإدخال (٢٤ نوفمبر ٢٠٢٦)

خمس رحلات جاهزة للإدخال دلوقتي: الركوب الأساسي (بيحل محل الرحلة القديمة بنفس الـ id)، السيشن، الفلاينج دريس، العربة، الجمل. الست ساعات واليوم الكامل بره الحزمة دي بقرار تنفيذ توصيات الخبير.

## تعليمات الربط في الكود (لجيميناي في الاستوديو)

- الصور بتتحط في `src/assets/images/` بالأسماء اللي في جدول الصور تحت، وبتتستورد في أول `src/data/marketplaceData.ts` بنفس أسلوب الاستيرادات الموجودة.
- رحلة الركوب بتحل محل كائن الرحلة القديمة `sahl-hasheesh-horse-swim` بالكامل (نفس الـ id عشان الروابط الداخلية ما تتكسرش)، وباقي الرحلات كائنات جديدة بتتضاف في نفس المصفوفة.
- ممنوع `meetingPointUrl` في أي رحلة من دول نهائيًا.
- `rating: 0` و `reviewCount: 0` لكل الرحلات الجديدة، مفيش تقييمات وهمية.
- مفيش شرطة طويلة (—) في أي نص، ومفيش اسم إسطبل أو مورد في أي حقل ضيف يشوفه. حقل `supplierName` داخلي بس وقيمته زي ما هي في الرحلة القديمة.
- الأسعار والمدد في الاختيارات وحقل المدة بس، مش في الوصف ولا النقاط المميزة.

## جدول الصور (من مجلد horse-photos/for-studio)

| ملف الاستوديو | الرحلة | الترتيب |
|---|---|---|
| wasla_horse_ride_hero.jpg + wasla_horse_ride_02..08.jpg | الركوب | hero أول صورة وبعدها 02 لحد 08 |
| wasla_horse_session_hero.jpg + wasla_horse_session_02..06.jpg | السيشن | hero وبعدها بالترتيب |
| wasla_flying_dress_hero.jpg + wasla_flying_dress_02..06.jpg | الفلاينج دريس | hero وبعدها بالترتيب |
| wasla_carriage_hero.jpg + wasla_carriage_02..06.jpg | العربة | hero وبعدها بالترتيب |
| wasla_camel_hero.jpg + wasla_camel_02..06.jpg | الجمل | hero وبعدها بالترتيب |

سطر الاستلام بره الغردقة المشترك (بيتكرر في tips):
- EN: Pickup outside Hurghada and El Gouna is not included: Sahl Hasheesh and Makadi +€10 per person, Soma Bay and Safaga +€15 per person, payable on site.
- AR: الاستلام خارج الغردقة والجونة غير مشمول: سهل حشيش ومكادي +١٠ يورو للفرد، سوما باي وسفاجا +١٥ يورو للفرد، وتدفع في المكان.
- DE: Abholung außerhalb von Hurghada und El Gouna ist nicht inklusive: Sahl Hasheesh und Makadi +10 € pro Person, Soma Bay und Safaga +15 € pro Person, zahlbar vor Ort.

وحقل pickup المشترك:
- EN: Hurghada and El Gouna included · Sahl Hasheesh and Makadi +€10/pp · Soma Bay and Safaga +€15/pp
- AR: الغردقة والجونة مشمولة · سهل حشيش ومكادي +١٠ يورو للفرد · سوما باي وسفاجا +١٥ يورو للفرد
- DE: Hurghada und El Gouna inklusive · Sahl Hasheesh und Makadi +10 €/Pers. · Soma Bay und Safaga +15 €/Pers.

---

## الرحلة ١ — الركوب الأساسي (استبدال sahl-hasheesh-horse-swim)

- id: sahl-hasheesh-horse-swim · category: horse · destination: Hurghada
- name: EN "Hurghada Horse Riding: Beach or Desert, with a Swim Stop" · AR "ركوب الخيل في الغردقة: شاطئ أو صحراء مع وقفة سباحة" · DE "Ausritt in Hurghada: Strand oder Wüste, mit Badestopp"
- duration: EN "2 or 3 hours" · AR "ساعتين أو ٣ ساعات" · DE "2 oder 3 Stunden"
- departureTimes: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM']
- timingNote: EN "2-hour rides start at the times shown. The 3-hour ride starts at any time you choose, confirmed after booking." · AR "رحلات الساعتين تبدأ في المواعيد المعروضة، ورحلة التلات ساعات تبدأ في أي وقت تختاره ويتأكد بعد الحجز." · DE "Der 2-stündige Ritt startet zu den angegebenen Zeiten. Der 3-stündige Ritt startet zu Ihrer Wunschzeit, bestätigt nach der Buchung."
- price: 40 · rating: 0 · reviewCount: 0 · languages: ['English', 'German'] · operatingDays: [0,1,2,3,4,5,6] · outerTransferEnabled: true · featured: true · familyFriendly: true · womenFriendly: true · minChildAge: 5

options:
1. id opt-horse-2h · price 40
   - title: EN "Horse Ride, 2 Hours (Beach or Desert)" · AR "ركوب خيل، ساعتين (شاطئ أو صحراء)" · DE "Ausritt, 2 Stunden (Strand oder Wüste)"
   - detail: EN "Guided ride with an instructor, Hurghada hotel pickup included" · AR "ركوب موجّه مع مدرب، والاستلام من فنادق الغردقة مشمول" · DE "Geführter Ritt mit Reitlehrer, Hotelabholung in Hurghada inklusive"
2. id opt-horse-3h-swim · price 60
   - title: EN "Horse Ride, 3 Hours, with a Swim Stop" · AR "ركوب خيل، ٣ ساعات، مع وقفة سباحة" · DE "Ausritt, 3 Stunden, mit Badestopp"
   - detail: EN "Longer guided ride with a swim stop in the sea with your horse, start at a time of your choice" · AR "ركوب موجّه أطول مع وقفة سباحة في البحر مع حصانك، والبداية في وقت من اختيارك" · DE "Längerer geführter Ritt mit Badestopp im Meer, Start zu Ihrer Wunschzeit"

shortDescription:
- EN: A real guided ride along the Red Sea shore or through the desert, on a horse matched to your level, with a swim stop on the longer ride.
- AR: ركوب موجّه حقيقي على شاطئ البحر الأحمر أو في الصحرا، على حصان مناسب لمستواك، مع وقفة سباحة في الرحلة الأطول.
- DE: Ein echter geführter Ritt am Roten Meer oder durch die Wüste, auf einem Pferd passend zu Ihrem Niveau, mit Badestopp beim längeren Ritt.

fullDescription:
- EN: This is a riding trip first: you come to ride, and the horses, the shore and the desert do the rest. After pickup from your hotel, you meet the team at the coastal stables, get your safety briefing, and are offered a helmet and vest before you mount. Your horse is matched to your level, and your instructor rides with you the whole way.\n\nYou ride out along the Red Sea shore or into the desert behind Hurghada, as you choose on the day and as the weather allows. The pace follows the least experienced rider in the group, and nobody is ever pushed to go faster than they are comfortable with. On the 3-hour ride there is a swim stop, where you take your horse into the sea.\n\nThe team takes casual photos along the way, and if you want a dedicated photoshoot with directed poses, that is our separate Horse Photoshoot Session. Small groups, a private option, and horses that are worked and rested in rotation.
- AR: دي رحلة ركوب قبل أي حاجة: انت جاي تركب، والخيل والبحر والصحرا هيكملوا الباقي. بعد الاستلام من فندقك بتقابل الفريق في الاسطبلات الساحلية، تسمع شرح الأمان، وتتجهز بخوذة وصديرية قبل ما تركب. حصانك بيتناسب مع مستواك، ومدربك راكب معاك الطريق كله.\n\nبتركب على شاطئ البحر الأحمر أو في صحرا الغردقة، حسب اختيارك في اليوم وحسب الجو. السرعة على حسب أقل راكب خبرة في المجموعة، ومحدش بيتدفع يجري أسرع من اللي هو مرتاح له أبدًا. وفي رحلة التلات ساعات فيه وقفة سباحة بتدخل فيها بحصانك البحر.\n\nالفريق بياخد لقطات عابرة على الطريق، ولو عايز سيشن تصوير كامل بوقفات موجهة دي رحلتنا المنفصلة سيشن تصوير الحصان. مجموعات صغيرة، واختيار خاص، وخيل بتشتغل وبترتاح بالتناوب.
- DE: Dies ist zuerst ein Reitausflug: Sie kommen zum Reiten, den Rest übernehmen die Pferde, das Meer und die Wüste. Nach der Abholung am Hotel lernen Sie das Team am Küstenstall kennen, erhalten die Sicherheitseinweisung und bekommen Helm und Weste angeboten. Ihr Pferd wird passend zu Ihrem Niveau ausgewählt, Ihr Reitlehrer begleitet Sie den ganzen Weg.\n\nSie reiten am Roten Meer entlang oder in die Wüste hinter Hurghada, nach Ihrer Wahl am Tag und je nach Wetter. Das Tempo richtet sich nach dem unerfahrensten Reiter der Gruppe, niemand wird je zu mehr Tempo gedrängt, als ihm angenehm ist. Beim 3-stündigen Ritt gibt es einen Badestopp, bei dem Sie mit Ihrem Pferd ins Meer reiten.\n\nDas Team macht unterwegs beiläufige Fotos. Wenn Sie ein eigenes Fotoshooting mit angeleiteten Posen möchten, ist das unsere separate Pferde-Fotosession. Kleine Gruppen, eine Privatoption und Pferde, die im Wechsel arbeiten und ruhen.

highlights (بالترتيب):
1. EN: Ride along the Red Sea shore or out into the desert, your choice on the day · AR: اركب على شاطئ البحر الأحمر أو في الصحرا، اختيارك في اليوم نفسه · DE: Reiten Sie am Roten Meer entlang oder in die Wüste, Ihre Wahl am Tag
2. EN: A horse and a pace matched to your riding level, beginner or experienced · AR: حصان وسرعة مناسبين لمستواك، مبتدئ أو متمرس · DE: Pferd und Tempo passend zu Ihrem Niveau, Anfänger oder erfahren
3. EN: On the 3-hour ride, take your horse into the sea for a swim stop · AR: في رحلة التلات ساعات، ادخل بحصانك البحر في وقفة سباحة · DE: Beim 3-stündigen Ritt reiten Sie mit Ihrem Pferd zum Baden ins Meer
4. EN: Small groups, with a private option for your group only · AR: مجموعات صغيرة، مع اختيار خاص لمجموعتك بس · DE: Kleine Gruppen, mit Privatoption nur für Ihre Gruppe
5. EN: A professional instructor rides with you the whole way · AR: مدرب محترف راكب معاك الطريق كله · DE: Ein professioneller Reitlehrer begleitet Sie den ganzen Weg

included:
- EN: Hotel pickup and drop-off in Hurghada · AR: الاستلام من فنادق الغردقة والرجوع · DE: Hotelabholung und Rücktransfer in Hurghada
- EN: Professional instructor riding with you · AR: مدرب محترف راكب معاك · DE: Professioneller Reitlehrer an Ihrer Seite
- EN: Safety briefing and supervision throughout · AR: شرح أمان وإشراف طول الرحلة · DE: Sicherheitseinweisung und Betreuung durchgehend
- EN: Horse and full riding equipment · AR: الحصان ومعدات الركوب كاملة · DE: Pferd und komplette Reitausrüstung
- EN: Helmet and safety vest, offered to every rider before mounting · AR: خوذة وصديرية أمان بيتقدموا لكل راكب قبل الركوب · DE: Helm und Sicherheitsweste werden jedem Reiter vor dem Aufsteigen angeboten
- EN: Bottled water · AR: مياه معبأة · DE: Wasser in Flaschen

tips:
- سطر الاستلام بره الغردقة المشترك
- EN: A dedicated photoshoot with directed poses is our separate Horse Photoshoot Session · AR: سيشن التصوير الكامل بوقفات موجهة هو رحلتنا المنفصلة سيشن تصوير الحصان · DE: Ein eigenes Fotoshooting mit angeleiteten Posen ist unsere separate Pferde-Fotosession

notSuitableFor: نفس الخمسة بتوع الرحلة القديمة (تحت ٥ سنين، حوامل، مشاكل ظهر، كراسي متحركة، فوق ١١٠ كجم).

meetingPoint: EN "Coastal Stables, Hurghada South / Hotel Lobby Pickup" · AR "اسطبلات ساحلية في جنوب الغردقة أو الاستلام من بهو الفندق" · DE "Küstenstall Hurghada Süd / Hotelabholung" (من غير meetingPointUrl)

whatToBring:
- EN: Hat · AR: قبعة · DE: Hut
- EN: Sunscreen · AR: واقي شمس · DE: Sonnencreme
- EN: Comfortable clothes and closed shoes · AR: ملابس مريحة وحذاء مقفول · DE: Bequeme Kleidung und geschlossene Schuhe
- EN: Swimwear and a towel on the 3-hour ride · AR: مايوه وفوطة في رحلة التلات ساعات · DE: Badesachen und Handtuch beim 3-stündigen Ritt

notAllowed:
- EN: Pets · AR: الحيوانات الأليفة · DE: Haustiere
- EN: Alcohol and drugs · AR: الكحول والمخدرات · DE: Alkohol und Drogen

knowBeforeYouGo:
- EN: Suitable for beginners and experienced riders, the pace follows the least experienced rider and nobody is pushed to ride faster than they are comfortable with · AR: مناسبة للمبتدئين والمتمرسين، والسرعة على حسب أقل راكب خبرة ومحدش بيتدفع يجري أسرع من راحته · DE: Für Anfänger und Erfahrene geeignet, das Tempo richtet sich nach dem unerfahrensten Reiter und niemand wird zu mehr Tempo gedrängt
- EN: Want the ride just for your group? A private ride adds €30 per booking, tell us when you book and we will arrange it · AR: عايز الرحلة لمجموعتك بس؟ الرحلة الخاصة بتضيف ٣٠ يورو على الحجز كله، قولنا وقت الحجز ونرتبها · DE: Nur für Ihre Gruppe? Ein privater Ritt kostet 30 € Aufpreis pro Buchung, sagen Sie uns bei der Buchung Bescheid
- EN: Tell us your hotel and we confirm your exact pickup time after booking · AR: قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز · DE: Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung

galleryCaptions (بترتيب الصور):
1. EN: Riders take their horses deep into the Red Sea · AR: فرسان داخلين بخيولهم في البحر الأحمر · DE: Reiter reiten mit ihren Pferden tief ins Rote Meer
2. EN: A gallop along the beach · AR: عدو على الشاطئ · DE: Galopp am Strand
3. EN: An evening ride along the shore · AR: ركوب مسائي على الشاطئ · DE: Abendritt entlang der Küste
4. EN: A swim stop with the horses at sunset · AR: وقفة سباحة مع الخيل وقت الغروب · DE: Badestopp mit den Pferden bei Sonnenuntergang
5. EN: Friends galloping together on the sand · AR: أصدقاء بيعدوا سوا على الرمل · DE: Freundinnen galoppieren gemeinsam über den Sand
6. EN: Out in the desert behind Hurghada · AR: في صحرا الغردقة · DE: In der Wüste hinter Hurghada
7. EN: The group rides back as the sun goes down · AR: المجموعة راجعة مع غروب الشمس · DE: Die Gruppe reitet bei Sonnenuntergang zurück
8. EN: A quiet moment with your horse after the ride · AR: لحظة هادية مع حصانك بعد الرحلة · DE: Ein ruhiger Moment mit Ihrem Pferd nach dem Ritt

---

## الرحلة ٢ — سيشن التصوير (جديدة)

- id: hurghada-horse-photoshoot-session · category: horse · destination: Hurghada
- name: EN "Horse Photoshoot Session in Hurghada: Beach and Sea Shots" · AR "سيشن تصوير على الحصان في الغردقة: لقطات الشاطئ والبحر" · DE "Pferde-Fotoshooting in Hurghada: Strand- und Meerbilder"
- duration: EN "1 or 2 hours" · AR "ساعة أو ساعتين" · DE "1 oder 2 Stunden"
- departureTimes: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM']
- timingNote: EN "Your exact start time is confirmed after booking, around the light you want." · AR "وقت البداية بالظبط بيتأكد بعد الحجز، على حسب الإضاءة اللي عايزها." · DE "Ihre genaue Startzeit wird nach der Buchung bestätigt, passend zum Licht Ihrer Wahl."
- price: 60 · rating: 0 · reviewCount: 0 · languages: ['English', 'German'] · operatingDays: [0,1,2,3,4,5,6] · outerTransferEnabled: true · featured: false · familyFriendly: true · womenFriendly: true · minChildAge: 5 · pickup: المشترك

options:
1. id opt-session-1h · price 60
   - title: EN "Photoshoot Session, 1 Hour" · AR "سيشن تصوير، ساعة" · DE "Fotosession, 1 Stunde"
   - detail: EN "Directed phone photoshoot on a decorated horse, Hurghada pickup included" · AR "سيشن تصوير موجّه بالموبايل على حصان مزين، واستلام الغردقة مشمول" · DE "Angeleitetes Handy-Fotoshooting auf einem geschmückten Pferd, Abholung in Hurghada inklusive"
2. id opt-session-2h · price 60
   - title: EN "Photoshoot Session, 2 Hours" · AR "سيشن تصوير، ساعتين" · DE "Fotosession, 2 Stunden"
   - detail: EN "A longer session with more spots and more looks, same price" · AR "سيشن أطول بأماكن ولقطات أكتر، بنفس السعر" · DE "Eine längere Session mit mehr Orten und Looks, gleicher Preis"

shortDescription:
- EN: A guided photoshoot on horseback at the beach and in the sea shallows, shot on phone with directed poses at the spots that photograph best.
- AR: سيشن تصوير موجّه على الحصان على الشاطئ وفي المية الضحلة، بيتصور بالموبايل بوقفات موجهة في الأماكن اللي تصويرها أحلى.
- DE: Ein angeleitetes Fotoshooting zu Pferd am Strand und im flachen Meer, mit dem Handy fotografiert und angeleiteten Posen an den fotogensten Orten.

fullDescription:
- EN: This is the photoshoot, not a riding tour with photos on the side. The team prepares a decorated horse, walks you between the spots that photograph best on the beach and in the sea shallows, and directs every pose: standing with your horse, sitting tall in the saddle, lying back along its neck, walking it through the water.\n\nNo riding experience is needed. Between locations you ride at a gentle walk with a handler beside you, and everyone booked in your group is photographed, not just one of you.\n\nThe session is shot on phone and the photos are shared with you afterwards. If you want a professional camera, a flying dress and edited photos, that is our Flying Dress Photoshoot. If you want to actually ride, that is our Horse Riding trip.
- AR: ده سيشن التصوير نفسه، مش رحلة ركوب وعلى جنبها صور. الفريق بيجهز حصان مزين، ويمشي بيك بين الأماكن اللي تصويرها أحلى على الشاطئ وفي المية الضحلة، ويوجهك في كل وقفة: واقف جنب حصانك، قاعد على السرج، مستلقي على رقبته، ماشي بيه في المية.\n\nمش محتاج خبرة ركوب. بين الأماكن بتركب بمشية هادية ومرافق جنبك، وكل اللي حاجزين في مجموعتك بيتصوروا مش واحد بس.\n\nالسيشن بيتصور بالموبايل والصور بتوصلك بعدها. ولو عايز كاميرا احترافية وفستان طائر وصور معدلة، دي رحلتنا سيشن الفستان الطائر. ولو عايز تركب بجد، دي رحلتنا ركوب الخيل.
- DE: Dies ist das Fotoshooting selbst, keine Reittour mit Fotos nebenbei. Das Team bereitet ein geschmücktes Pferd vor, führt Sie zu den Orten am Strand und im flachen Meer, die sich am besten fotografieren lassen, und leitet jede Pose an: stehend neben Ihrem Pferd, aufrecht im Sattel, zurückgelehnt am Hals, durchs Wasser führend.\n\nReiterfahrung ist nicht nötig. Zwischen den Orten reiten Sie im ruhigen Schritt mit einem Begleiter an Ihrer Seite, und alle Gebuchten Ihrer Gruppe werden fotografiert, nicht nur einer.\n\nDie Session wird mit dem Handy fotografiert und die Fotos werden Ihnen danach geteilt. Wenn Sie eine Profikamera, ein Flying Dress und bearbeitete Fotos möchten, ist das unser Flying-Dress-Fotoshooting. Wenn Sie wirklich reiten möchten, ist das unser Ausritt.

highlights:
1. EN: A dedicated photoshoot on a decorated horse, at the beach and in the sea · AR: سيشن تصوير كامل على حصان مزين، على الشاطئ وفي البحر · DE: Ein eigenes Fotoshooting auf einem geschmückten Pferd, am Strand und im Meer
2. EN: Directed poses at hand-picked spots, the team sets up every shot · AR: وقفات موجهة في أماكن مختارة، والفريق بيظبط كل لقطة · DE: Angeleitete Posen an ausgewählten Orten, das Team richtet jede Aufnahme ein
3. EN: A gentle ride between locations, no riding experience needed · AR: ركوب هادي بين الأماكن، من غير خبرة ركوب · DE: Ruhiges Reiten zwischen den Orten, keine Reiterfahrung nötig
4. EN: Everyone in your group gets photographed · AR: كل مجموعتك بتتصور · DE: Alle in Ihrer Gruppe werden fotografiert
5. EN: Guided throughout by the team who shoot these sessions every day · AR: معاك طول الوقت الفريق اللي بيصور السيشنز دي كل يوم · DE: Begleitet vom Team, das diese Sessions jeden Tag fotografiert

included:
- EN: Hotel pickup and drop-off in Hurghada · AR: الاستلام من فنادق الغردقة والرجوع · DE: Hotelabholung und Rücktransfer in Hurghada
- EN: Decorated horse and handler · AR: حصان مزين ومرافق · DE: Geschmücktes Pferd und Begleiter
- EN: Phone photoshoot with directed poses · AR: سيشن تصوير بالموبايل بوقفات موجهة · DE: Handy-Fotoshooting mit angeleiteten Posen
- EN: Safety briefing and supervision throughout · AR: شرح أمان وإشراف طول السيشن · DE: Sicherheitseinweisung und Betreuung durchgehend
- EN: Bottled water · AR: مياه معبأة · DE: Wasser in Flaschen

tips:
- سطر الاستلام بره الغردقة المشترك
- EN: Professional camera work and edited photos are the Flying Dress Photoshoot, a separate experience · AR: التصوير بكاميرا احترافية والصور المعدلة هو سيشن الفستان الطائر، تجربة منفصلة · DE: Profikamera und bearbeitete Fotos sind das Flying-Dress-Fotoshooting, ein separates Erlebnis

notSuitableFor: تحت ٥ سنين، حوامل، مشاكل ظهر، كراسي متحركة، فوق ١١٠ كجم (نفس صياغات الرحلة ١).

meetingPoint: نفس الرحلة ١.

whatToBring:
- EN: An outfit you love being photographed in · AR: لبس بتحب تتصور بيه · DE: Ein Outfit, in dem Sie sich gern fotografieren lassen
- EN: Sunscreen · AR: واقي شمس · DE: Sonnencreme
- EN: Hat · AR: قبعة · DE: Hut
- EN: Comfortable clothes and closed shoes for mounting · AR: ملابس مريحة وحذاء مقفول للركوب · DE: Bequeme Kleidung und geschlossene Schuhe zum Aufsteigen

notAllowed: حيوانات أليفة، كحول ومخدرات (نفس صياغات الرحلة ١).

knowBeforeYouGo:
- EN: No riding experience is needed, the horse is led and a handler walks beside you · AR: مش محتاج خبرة ركوب، الحصان بيتمشى بيه ومرافق ماشي جنبك · DE: Keine Reiterfahrung nötig, das Pferd wird geführt und ein Begleiter geht neben Ihnen
- EN: Everyone booked in your group is photographed · AR: كل اللي حاجزين في مجموعتك بيتصوروا · DE: Alle Gebuchten Ihrer Gruppe werden fotografiert
- EN: Tell us your hotel and we confirm your exact pickup time after booking · AR: قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز · DE: Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung

galleryCaptions:
1. EN: A quiet portrait with a white horse by the sea · AR: بورتريه هادي مع حصان أبيض على البحر · DE: Ein ruhiges Porträt mit einem weißen Pferd am Meer
2. EN: Reclining on her horse at the water's edge · AR: مستلقية على حصانها عند حافة المية · DE: Zurückgelehnt auf ihrem Pferd am Wasser
3. EN: Golden hour with a pinto horse · AR: الساعة الذهبية مع حصان مرقط · DE: Goldene Stunde mit einem gescheckten Pferd
4. EN: A kiss for the horse · AR: بوسة للحصان · DE: Ein Kuss für das Pferd
5. EN: Standing tall in the shallows · AR: واقفة على الحصان في المية الضحلة · DE: Aufrecht stehend im flachen Wasser
6. EN: Feeding time at the stables · AR: وقت الأكل في الاسطبل · DE: Fütterungszeit am Stall

---

## الرحلة ٣ — الفلاينج دريس (جديدة)

- id: hurghada-flying-dress-photoshoot · category: horse · destination: Hurghada
- name: EN "Flying Dress Photoshoot with Horses in Hurghada" · AR "سيشن الفستان الطائر مع الخيل في الغردقة" · DE "Flying-Dress-Fotoshooting mit Pferden in Hurghada"
- duration: EN "Timing arranged with you" · AR "التوقيت بيترتب معاك" · DE "Die Zeit wird mit Ihnen abgestimmt"
- departureTimes: []
- timingNote: EN "We arrange the start around the best light and confirm it after booking." · AR "بنرتب البداية على أحلى إضاءة ونأكدها بعد الحجز." · DE "Wir legen den Start auf das beste Licht und bestätigen ihn nach der Buchung."
- price: 250 · rating: 0 · reviewCount: 0 · languages: ['English', 'German'] · operatingDays: [0,1,2,3,4,5,6] · outerTransferEnabled: false · featured: false · familyFriendly: false · womenFriendly: true
- pickup: EN "Private hotel pickup included" · AR "استلام خاص من الفندق مشمول" · DE "Private Hotelabholung inklusive"

options:
1. id opt-flying-dress · price 250
   - title: EN "Flying Dress Photoshoot, Two Locations" · AR "سيشن الفستان الطائر، مكانين" · DE "Flying-Dress-Fotoshooting, zwei Orte"
   - detail: EN "Two dresses, professional camera and editing, 22 edited photos" · AR "فستانين، كاميرا احترافية وتعديل احترافي، ٢٢ صورة معدلة" · DE "Zwei Kleider, Profikamera und Bearbeitung, 22 bearbeitete Fotos"

shortDescription:
- EN: A professional flying dress shoot on a prepared horse at two locations, with a professional camera, professional editing and 22 finished photos.
- AR: سيشن فستان طائر احترافي على حصان مجهز في مكانين، بكاميرا احترافية وتعديل احترافي و٢٢ صورة جاهزة.
- DE: Ein professionelles Flying-Dress-Shooting auf einem vorbereiteten Pferd an zwei Orten, mit Profikamera, professioneller Bearbeitung und 22 fertigen Fotos.

fullDescription:
- EN: You choose your dress and its colour from the dresses provided, and the team prepares your horse. Then the shoot moves between two locations: the sea shallows, where the dress flies over the water, and the open desert.\n\nA professional photographer shoots on a professional camera, and the team sets up every shot around you, the dress and the horse. No riding experience is needed, the horse is led and handled by the team throughout.\n\nYour photos are professionally retouched, and you receive 22 edited photos from the session.
- AR: بتختاري فستانك ولونه من الفساتين المتوفرة، والفريق بيجهز حصانك. وبعدين السيشن بيتنقل بين مكانين: المية الضحلة على البحر، وهناك الفستان بيطير فوق المية، والصحرا المفتوحة.\n\nمصور محترف بيصور بكاميرا احترافية، والفريق بيظبط كل لقطة حواليكي وحوالين الفستان والحصان. مش محتاجة خبرة ركوب، الحصان بيتمشى بيه والفريق ماسكه طول الوقت.\n\nصورك بتتعدل باحترافية، وبتستلمي ٢٢ صورة معدلة من السيشن.
- DE: Sie wählen Ihr Kleid und seine Farbe aus den bereitgestellten Kleidern, und das Team bereitet Ihr Pferd vor. Dann wechselt das Shooting zwischen zwei Orten: dem flachen Meer, wo das Kleid über dem Wasser fliegt, und der offenen Wüste.\n\nEin professioneller Fotograf fotografiert mit einer Profikamera, und das Team richtet jede Aufnahme um Sie, das Kleid und das Pferd ein. Reiterfahrung ist nicht nötig, das Pferd wird durchgehend vom Team geführt und gehalten.\n\nIhre Fotos werden professionell retuschiert, und Sie erhalten 22 bearbeitete Fotos aus der Session.

highlights:
1. EN: Choose your dress and colour from the dresses provided · AR: اختاري فستانك ولونه من الفساتين المتوفرة · DE: Wählen Sie Ihr Kleid und seine Farbe aus den bereitgestellten Kleidern
2. EN: Two locations: the sea shallows and the desert · AR: مكانين: المية الضحلة على البحر والصحرا · DE: Zwei Orte: das flache Meer und die Wüste
3. EN: A prepared horse and a team that sets up every shot · AR: حصان مجهز وفريق بيظبط كل لقطة · DE: Ein vorbereitetes Pferd und ein Team, das jede Aufnahme einrichtet
4. EN: Professional camera and professional editing · AR: كاميرا احترافية وتعديل احترافي · DE: Profikamera und professionelle Bearbeitung
5. EN: 22 edited photos to take home · AR: ٢٢ صورة معدلة تاخديها معاكي · DE: 22 bearbeitete Fotos zum Mitnehmen

included:
- EN: Private hotel pickup and drop-off · AR: استلام خاص من الفندق والرجوع · DE: Private Hotelabholung und Rücktransfer
- EN: Dress of your choice from the dresses provided · AR: فستان من اختيارك من الفساتين المتوفرة · DE: Kleid Ihrer Wahl aus den bereitgestellten Kleidern
- EN: Prepared horse and the full team · AR: حصان مجهز والفريق كله · DE: Vorbereitetes Pferd und das ganze Team
- EN: Professional photographer and camera · AR: مصور محترف وكاميرا احترافية · DE: Professioneller Fotograf und Kamera
- EN: Professional retouching · AR: تعديل احترافي على الصور · DE: Professionelle Retusche
- EN: 22 edited photos · AR: ٢٢ صورة معدلة · DE: 22 bearbeitete Fotos

tips:
- EN: Pickup outside Hurghada is arranged individually, ask us when you book · AR: الاستلام خارج الغردقة بيترتب بشكل فردي، اسألنا وقت الحجز · DE: Abholung außerhalb von Hurghada wird individuell vereinbart, fragen Sie uns bei der Buchung

notSuitableFor: حوامل، مشاكل ظهر، كراسي متحركة، فوق ١١٠ كجم (نفس الصياغات من غير بند الأطفال).

meetingPoint: نفس الرحلة ١.

whatToBring:
- EN: Sunscreen · AR: واقي شمس · DE: Sonnencreme
- EN: Hat · AR: قبعة · DE: Hut
- EN: Your own camera for behind-the-scenes shots · AR: كاميرتك لصور كواليس · DE: Ihre eigene Kamera für Behind-the-Scenes-Fotos

notAllowed: حيوانات أليفة، كحول ومخدرات.

knowBeforeYouGo:
- EN: No riding experience is needed, the horse is led by the team throughout · AR: مش محتاجة خبرة ركوب، الفريق ماشي بالحصان طول الوقت · DE: Keine Reiterfahrung nötig, das Pferd wird durchgehend vom Team geführt
- EN: The start time is set around the best light and confirmed after booking · AR: وقت البداية بيتحط على أحلى إضاءة ويتأكد بعد الحجز · DE: Die Startzeit wird auf das beste Licht gelegt und nach der Buchung bestätigt
- EN: You receive 22 edited photos from the session · AR: بتستلمي ٢٢ صورة معدلة من السيشن · DE: Sie erhalten 22 bearbeitete Fotos aus der Session

galleryCaptions:
1. EN: The red dress flies over the sea shallows · AR: الفستان الأحمر طاير فوق المية الضحلة · DE: Das rote Kleid fliegt über das flache Meer
2. EN: A rearing horse under a dramatic sky · AR: حصان شابب تحت سما درامية · DE: Ein steigendes Pferd unter dramatischem Himmel
3. EN: The blue dress at a gallop · AR: الفستان الأزرق في العدو · DE: Das blaue Kleid im Galopp
4. EN: The red dress in the desert at sunset · AR: الفستان الأحمر في الصحرا وقت الغروب · DE: Das rote Kleid in der Wüste bei Sonnenuntergang
5. EN: The blue dress on the beach · AR: الفستان الأزرق على الشاطئ · DE: Das blaue Kleid am Strand
6. EN: White dress, red hat, calm sea · AR: فستان أبيض وقبعة حمرا وبحر هادي · DE: Weißes Kleid, roter Hut, ruhiges Meer

---

## الرحلة ٤ — العربة (جديدة)

- id: hurghada-horse-carriage-sea-ride · category: horse · destination: Hurghada
- name: EN "Horse Carriage Ride in Hurghada: Along the Beach and Into the Sea" · AR "جولة بعربة الحصان في الغردقة: على الشاطئ وجوه المية" · DE "Kutschfahrt in Hurghada: Am Strand entlang und ins Meer"
- duration: EN "2 or 3 hours" · AR "ساعتين أو ٣ ساعات" · DE "2 oder 3 Stunden"
- departureTimes: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM']
- price: 20 · rating: 0 · reviewCount: 0 · languages: ['English', 'German'] · operatingDays: [0,1,2,3,4,5,6] · outerTransferEnabled: true · featured: false · familyFriendly: true · womenFriendly: true · childPriceEur: 0
- kidsDiscount: EN "Children ride free with a paying adult" · AR "الأطفال بيركبوا مجانًا مع بالغ دافع" · DE "Kinder fahren kostenlos mit einem zahlenden Erwachsenen"
- pickup: المشترك

options:
1. id opt-carriage-2h · price 20
   - title: EN "Carriage Ride, 2 Hours" · AR "جولة بالعربة، ساعتين" · DE "Kutschfahrt, 2 Stunden"
   - detail: EN "Per person, children ride free with a paying adult" · AR "للفرد، والأطفال مجانًا مع بالغ دافع" · DE "Pro Person, Kinder fahren kostenlos mit einem zahlenden Erwachsenen"
2. id opt-carriage-3h · price 20
   - title: EN "Carriage Ride, 3 Hours" · AR "جولة بالعربة، ٣ ساعات" · DE "Kutschfahrt, 3 Stunden"
   - detail: EN "The longer ride, more beach and more photo stops, same price" · AR "الجولة الأطول، شاطئ أكتر ووقفات تصوير أكتر، بنفس السعر" · DE "Die längere Fahrt, mehr Strand und mehr Fotostopps, gleicher Preis"

shortDescription:
- EN: A relaxed horse carriage ride along the Hurghada beach, and right into the shallow sea, with your family together in one carriage.
- AR: جولة هادية بعربة حصان على شاطئ الغردقة، ودخول بالعربة جوه المية الضحلة، وعيلتك سوا في عربة واحدة.
- DE: Eine entspannte Kutschfahrt am Strand von Hurghada entlang, und direkt ins flache Meer hinein, mit Ihrer Familie gemeinsam in einer Kutsche.

fullDescription:
- EN: Some Hurghada experiences are about speed. This one is about slowing down. Your carriage rolls along the beach at a walking pace, and then does the thing guests remember most: it rolls straight into the shallow sea, horses and wheels in the water, while you sit back and take it in.\n\nFamilies and groups ride together in one carriage, with a driver and team with you the whole way and photo stops whenever the light or the view asks for one.\n\nIt is an easy, gentle outing for all ages, and children ride free with a paying adult.
- AR: فيه تجارب في الغردقة عن السرعة، ودي عن الهدوء. عربتك بتمشي على الشاطئ بخطوة هادية، وبعدين بتعمل الحاجة اللي الضيوف بيفتكروها أكتر حاجة: بتدخل على طول جوه المية الضحلة، الخيل والعجل في المية، وانت قاعد مسترخي وبتتفرج.\n\nالعائلات والمجموعات بيركبوا سوا في عربة واحدة، مع سواق وفريق معاك الطريق كله ووقفات تصوير كل ما الإضاءة أو المنظر يطلب.\n\nخروجة سهلة وهادية لكل الأعمار، والأطفال بيركبوا مجانًا مع بالغ دافع.
- DE: Manche Erlebnisse in Hurghada drehen sich um Tempo. Dieses dreht sich ums Entschleunigen. Ihre Kutsche rollt im Schritt am Strand entlang und tut dann das, woran sich Gäste am meisten erinnern: Sie fährt direkt ins flache Meer hinein, Pferde und Räder im Wasser, während Sie sich zurücklehnen und genießen.\n\nFamilien und Gruppen fahren gemeinsam in einer Kutsche, mit Fahrer und Team an Ihrer Seite und Fotostopps, wann immer Licht oder Aussicht danach verlangen.\n\nEin leichter, sanfter Ausflug für alle Altersgruppen, und Kinder fahren kostenlos mit einem zahlenden Erwachsenen.

highlights:
1. EN: Ride in a traditional horse carriage along the beach · AR: اركب عربة حصان تقليدية على الشاطئ · DE: Fahren Sie in einer traditionellen Pferdekutsche am Strand entlang
2. EN: The carriage rolls right into the shallow sea · AR: العربة بتدخل على طول جوه المية الضحلة · DE: Die Kutsche fährt direkt ins flache Meer hinein
3. EN: Families and groups ride together in one carriage · AR: العائلات والمجموعات بيركبوا سوا في عربة واحدة · DE: Familien und Gruppen fahren gemeinsam in einer Kutsche
4. EN: Photo stops along the way · AR: وقفات تصوير على الطريق · DE: Fotostopps unterwegs
5. EN: A driver and team with you the whole ride · AR: سواق وفريق معاك الجولة كلها · DE: Ein Fahrer und Team begleiten Sie die ganze Fahrt

included:
- EN: Hotel pickup and drop-off in Hurghada · AR: الاستلام من فنادق الغردقة والرجوع · DE: Hotelabholung und Rücktransfer in Hurghada
- EN: Carriage ride with a driver · AR: جولة بالعربة مع سواق · DE: Kutschfahrt mit Fahrer
- EN: Photo stops along the way · AR: وقفات تصوير على الطريق · DE: Fotostopps unterwegs
- EN: Assistance and supervision throughout · AR: مساعدة وإشراف طول الجولة · DE: Betreuung und Aufsicht durchgehend

tips:
- سطر الاستلام بره الغردقة المشترك

notSuitableFor: مشاكل ظهر، كراسي متحركة (نفس الصياغات).

meetingPoint: نفس الرحلة ١.

whatToBring:
- EN: Hat · AR: قبعة · DE: Hut
- EN: Sunscreen · AR: واقي شمس · DE: Sonnencreme
- EN: Camera · AR: كاميرا · DE: Kamera

notAllowed: حيوانات أليفة، كحول ومخدرات.

knowBeforeYouGo:
- EN: The price is per person, and children ride free with a paying adult · AR: السعر للفرد، والأطفال بيركبوا مجانًا مع بالغ دافع · DE: Der Preis gilt pro Person, und Kinder fahren kostenlos mit einem zahlenden Erwachsenen
- EN: Tell us your hotel and we confirm your exact pickup time after booking · AR: قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز · DE: Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung

galleryCaptions:
1. EN: The carriage rolls into the sea, and everyone laughs · AR: العربة داخلة المية، والكل بيضحك · DE: Die Kutsche fährt ins Meer, und alle lachen
2. EN: A family ride at sunset · AR: جولة عائلية وقت الغروب · DE: Eine Familienfahrt bei Sonnenuntergang
3. EN: Standing in the carriage as the sun goes down · AR: واقفين في العربة والشمس بتغيب · DE: Stehend in der Kutsche, während die Sonne untergeht
4. EN: The carriage horses on the beach · AR: خيول العربة على الشاطئ · DE: Die Kutschpferde am Strand
5. EN: Three friends share the carriage · AR: تلات صديقات بيتشاركوا العربة · DE: Drei Freundinnen teilen sich die Kutsche
6. EN: Into the sea at sunset · AR: دخول المية وقت الغروب · DE: Ins Meer bei Sonnenuntergang

---

## الرحلة ٥ — الجمل (جديدة)

- id: hurghada-camel-ride-beach · category: desert · destination: Hurghada
- name: EN "Camel Ride in Hurghada: Along the Beach at Golden Hour" · AR "ركوب الجمل في الغردقة: على الشاطئ في الساعة الذهبية" · DE "Kamelritt in Hurghada: Am Strand zur goldenen Stunde"
- duration: EN "1 to 3 hours" · AR "من ساعة لتلات ساعات" · DE "1 bis 3 Stunden"
- departureTimes: ['08:00 AM (Morning)', '04:00 PM (Sunset)']
- price: 20 · rating: 0 · reviewCount: 0 · languages: ['English', 'German'] · operatingDays: [0,1,2,3,4,5,6] · outerTransferEnabled: true · featured: false · familyFriendly: true · womenFriendly: true · childPriceEur: 20
- pickup: المشترك

options:
1. id opt-camel-1h · price 20 · title: EN "Camel Ride, 1 Hour" · AR "ركوب جمل، ساعة" · DE "Kamelritt, 1 Stunde" · detail: EN "A gentle first taste, along the beach" · AR "تجربة أولى هادية على الشاطئ" · DE "Ein sanfter erster Eindruck, am Strand entlang"
2. id opt-camel-2h · price 20 · title: EN "Camel Ride, 2 Hours" · AR "ركوب جمل، ساعتين" · DE "Kamelritt, 2 Stunden" · detail: EN "More beach, the desert edge and a tea stop" · AR "شاطئ أكتر وحافة الصحرا ووقفة شاي" · DE "Mehr Strand, der Wüstenrand und ein Teestopp"
3. id opt-camel-3h · price 20 · title: EN "Camel Ride, 3 Hours" · AR "ركوب جمل، ٣ ساعات" · DE "Kamelritt, 3 Stunden" · detail: EN "The full slow ride, morning or sunset" · AR "الركوب الهادي الكامل، صباحًا أو مع الغروب" · DE "Der volle langsame Ritt, morgens oder bei Sonnenuntergang"

shortDescription:
- EN: A slow camel ride along the Hurghada shore and the desert edge, in the morning or at sunset, with photo stops and a Bedouin tea stop.
- AR: ركوب جمل هادي على شاطئ الغردقة وحافة الصحرا، صباحًا أو مع الغروب، مع وقفات تصوير ووقفة شاي بدوي.
- DE: Ein langsamer Kamelritt an der Küste von Hurghada und am Wüstenrand, morgens oder bei Sonnenuntergang, mit Fotostopps und einem Beduinentee-Stopp.

fullDescription:
- EN: Camels do not hurry, and that is the point. You meet your camel at the shore, climb up as it rises, and set off at the oldest pace in the desert: a slow, swaying walk along the beach and the desert edge behind it.\n\nYou ride in the morning or at sunset, when the light turns golden over the sea. There are photo stops along the way, and a stop for traditional Bedouin tea in a quiet spot.\n\nNo experience is needed, the camels are led by an experienced handler, and groups stay small. Children pay the same price as adults on this ride.
- AR: الجمال مش بتستعجل، ودي هي النقطة. بتقابل جملك على الشاطئ، تطلع عليه وهو بيقوم، وتمشي بأقدم خطوة في الصحرا: مشية هادية متمايلة على الشاطئ وحافة الصحرا وراه.\n\nبتركب صباحًا أو مع الغروب، لما الإضاءة تبقى ذهبية فوق البحر. فيه وقفات تصوير على الطريق، ووقفة لشاي بدوي تقليدي في مكان هادي.\n\nمش محتاج خبرة، الجمال بيتمشى بيها مرشد متمرس، والمجموعات صغيرة. الأطفال بيدفعوا نفس سعر البالغين في الرحلة دي.
- DE: Kamele haben es nicht eilig, und genau das ist der Punkt. Sie treffen Ihr Kamel an der Küste, steigen auf, während es sich erhebt, und ziehen im ältesten Tempo der Wüste los: ein langsamer, wiegender Gang am Strand und am Wüstenrand dahinter.\n\nSie reiten morgens oder bei Sonnenuntergang, wenn das Licht über dem Meer golden wird. Unterwegs gibt es Fotostopps und einen Stopp für traditionellen Beduinentee an einem ruhigen Ort.\n\nErfahrung ist nicht nötig, die Kamele werden von einem erfahrenen Führer geleitet, und die Gruppen bleiben klein. Kinder zahlen bei diesem Ritt denselben Preis wie Erwachsene.

highlights:
1. EN: Ride a camel along the beach and the desert edge · AR: اركب جمل على الشاطئ وحافة الصحرا · DE: Reiten Sie ein Kamel am Strand und am Wüstenrand
2. EN: Morning or sunset departures, when the light is best · AR: انطلاق صباحًا أو مع الغروب، لما الإضاءة أحلى · DE: Abfahrt morgens oder bei Sonnenuntergang, wenn das Licht am schönsten ist
3. EN: Photo stops on the shore along the way · AR: وقفات تصوير على الشاطئ على الطريق · DE: Fotostopps an der Küste unterwegs
4. EN: A traditional Bedouin tea stop · AR: وقفة شاي بدوي تقليدي · DE: Ein Stopp für traditionellen Beduinentee
5. EN: Led by an experienced camel handler the whole way · AR: معاك مرشد جمال متمرس الطريق كله · DE: Geführt von einem erfahrenen Kamelführer den ganzen Weg

included:
- EN: Hotel pickup and drop-off in Hurghada · AR: الاستلام من فنادق الغردقة والرجوع · DE: Hotelabholung und Rücktransfer in Hurghada
- EN: Experienced camel handler and guide · AR: مرشد جمال متمرس ودليل · DE: Erfahrener Kamelführer und Guide
- EN: Bedouin tea · AR: شاي بدوي · DE: Beduinentee
- EN: Safety assistance and supervision throughout · AR: مساعدة سلامة وإشراف طول الرحلة · DE: Sicherheitshilfe und Aufsicht durchgehend
- EN: Photo stops · AR: وقفات تصوير · DE: Fotostopps

tips:
- سطر الاستلام بره الغردقة المشترك
- EN: Children pay the full price on this ride, there is no child rate · AR: الأطفال بيدفعوا السعر الكامل في الرحلة دي، مفيش سعر أطفال · DE: Kinder zahlen bei diesem Ritt den vollen Preis, es gibt keinen Kindertarif

notSuitableFor: حوامل، مشاكل ظهر، كراسي متحركة (نفس الصياغات).

meetingPoint: نفس الرحلة ١.

whatToBring:
- EN: Hat · AR: قبعة · DE: Hut
- EN: Sunscreen · AR: واقي شمس · DE: Sonnencreme
- EN: Camera · AR: كاميرا · DE: Kamera
- EN: Comfortable clothes · AR: ملابس مريحة · DE: Bequeme Kleidung

notAllowed: حيوانات أليفة، كحول ومخدرات.

knowBeforeYouGo:
- EN: Small groups of up to 10, no experience needed, the camels are led · AR: مجموعات صغيرة لحد ١٠ أفراد، من غير خبرة، والجمال بتتمشى بيها · DE: Kleine Gruppen bis zu 10, keine Erfahrung nötig, die Kamele werden geführt
- EN: Children pay the full adult price on this ride · AR: الأطفال بيدفعوا سعر البالغين الكامل في الرحلة دي · DE: Kinder zahlen bei diesem Ritt den vollen Erwachsenenpreis
- EN: Tell us your hotel and we confirm your exact pickup time after booking · AR: قولنا فندقك ونأكد لك وقت الاستلام بالظبط بعد الحجز · DE: Nennen Sie uns Ihr Hotel und wir bestätigen Ihre genaue Abholzeit nach der Buchung

galleryCaptions:
1. EN: The camels take a break standing in the sea · AR: الجمال واخدة راحة وهي واقفة في البحر · DE: Die Kamele pausieren stehend im Meer
2. EN: Riding out at the desert edge · AR: ركوب عند حافة الصحرا · DE: Ausritt am Wüstenrand
3. EN: A smile from the saddle · AR: ابتسامة من على السرج · DE: Ein Lächeln aus dem Sattel
4. EN: Pausing on the sand · AR: وقفة على الرمل · DE: Pause auf dem Sand
5. EN: The group waves from the desert · AR: المجموعة بتشاور من الصحرا · DE: Die Gruppe winkt aus der Wüste
6. EN: Getting to know her camel on the beach · AR: بتتعرف على جملها على الشاطئ · DE: Sie lernt ihr Kamel am Strand kennen

---

## برومبت جيميناي في الاستوديو (ينسخ زي ما هو بعد رفع الصور)

أضف صور رحلات الخيل اللي رفعتها في src/assets/images/ (الأسماء تبدأ بـ wasla_horse_ride و wasla_horse_session و wasla_flying_dress و wasla_carriage و wasla_camel) إلى src/data/marketplaceData.ts حسب ملف docs/trips/horse-trips-entry-pack-2026-11-24.md: استبدل كائن الرحلة sahl-hasheesh-horse-swim بالكامل ببيانات الرحلة ١ في الملف مع الحفاظ على نفس الـ id، وأضف الرحلات الأربع الجديدة (hurghada-horse-photoshoot-session و hurghada-flying-dress-photoshoot و hurghada-horse-carriage-sea-ride و hurghada-camel-ride-beach) بكل الحقول والترجمات والاختيارات وتعليقات الصور كما هي في الملف حرفيًا. التزم بالآتي: لا تضف meetingPointUrl لأي رحلة، rating و reviewCount يساويان 0 للكل، لا تستخدم الشرطة الطويلة (—) في أي نص، ولا تغيّر أي صياغة أو سعر أو ترجمة من الملف. بعد الإضافة شغّل فحص الأنواع والبناء واعرض لي أي خطأ قبل الحفظ.
