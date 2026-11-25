# Entry pack: itineraries for all trips + sea departure times corrected to 09:00 (2026-11-25)

Owner decisions behind this pack:
1. Every trip gets a day itinerary in the `itinerary` field, the way the Luxor trip already has one. Today only `luxor-valley-small-van` carries the field; the other 25 trips have none. One of the 25, the shopping tour, is excluded by the owner's ruling below, leaving 24 itineraries in this pack.
2. ALL Hurghada sea trips start at 09:00. The owner stated this before and it was not applied: three island trips and the diving boat were entered at 08:30. Correct them.

## Format rules (copied from the Luxor entry, do not improvise)

- Field: `itinerary: TripItineraryStop[]` on the trip object in `src/data/marketplaceData.ts`.
- Stop shape: `{ kind, title: {en, ar, de}, subtitle?: {en, ar, de} }`. Kinds allowed: `'pickup' | 'stop' | 'break' | 'end'`.
- First stop is the pickup, last stop is kind `'end'`. Meals, dinner, tea and rest stops are kind `'break'`.
- Do NOT use the `durationOrTime` field anywhere (Luxor does not use it).
- No durations, no optional prices and no times inside titles or subtitles, except a pickup window where the trip's own confirmed pattern has one (Luxor pattern). The sea trips carry no window: pickup time is confirmed after booking.
- Stops follow the real sequence of the day, taken from the trip's own confirmed program and its entered highlights. Nothing invented: no telescope, no village stop, no activity that is not in the trip's confirmed facts.
- No em dashes anywhere. No supplier names. rating and reviewCount stay untouched.
- The guide line is NOT an itinerary stop (it already lives in the highlights, as on Luxor).

## Section A: departure time corrections (exact edits)

| Trip id | Current | Set to |
|---|---|---|
| `dolphin-house-snorkeling` | `['08:30 AM']` | `['09:00 AM']` |
| `paradise-island-premium` | `['08:30 AM']` | `['09:00 AM']` |
| `hula-hula-island` | `['08:30 AM']` | `['09:00 AM']` |
| `hurghada-diving-snorkeling-boat` | `['08:30 AM']` | `['09:00 AM']` |

Already correct, do not touch: `orange-bay-small-group` (09:00), `sahl-hasheesh-beach-dive` (09:00). Marsa Alam trips keep their own times (different pattern, not part of this correction).

## Section B: itinerary arrays (paste as the trip's `itinerary` field)

### 1. `orange-bay-small-group`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
  },
  {
    kind: 'stop',
    title: { en: 'First snorkeling stop', ar: 'أول محطة سنوركلينج', de: 'Erster Schnorchelstopp' },
    subtitle: { en: 'Coral reef, full gear and life jacket provided', ar: 'شعاب مرجانية، مع كامل المعدات وسترة نجاة', de: 'Korallenriff, komplette Ausrüstung und Schwimmweste inklusive' },
  },
  {
    kind: 'stop',
    title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
    subtitle: { en: 'A different reef', ar: 'شعاب مرجانية مختلفة', de: 'Ein anderes Riff' },
  },
  {
    kind: 'stop',
    title: { en: 'Orange Bay island', ar: 'جزيرة أورانج باي', de: 'Insel Orange Bay' },
    subtitle: { en: 'Swimming, the sandbar and the famous water swings', ar: 'سباحة واللسان الرملي والأرجوحات المائية الشهيرة', de: 'Schwimmen, die Sandbank und die berühmten Wasserschaukeln' },
  },
  {
    kind: 'break',
    title: { en: 'Open buffet lunch on board', ar: 'غداء بوفيه مفتوح على المركب', de: 'Offenes Buffet-Mittagessen an Bord' },
  },
  {
    kind: 'end',
    title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 2. `dolphin-house-snorkeling` (also apply the Section A time fix)

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
  },
  {
    kind: 'stop',
    title: { en: 'The Dolphin House reef', ar: 'شعاب بيت الدلافين', de: 'Das Dolphin-House-Riff' },
    subtitle: { en: 'Watch wild dolphins, and swim near them when conditions allow', ar: 'مشاهدة الدلافين البرية، والسباحة قربها عندما تسمح الظروف', de: 'Wilde Delfine beobachten und, wenn die Bedingungen es erlauben, in ihrer Nähe schwimmen' },
  },
  {
    kind: 'stop',
    title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
    subtitle: { en: 'Coral reef, full gear and life jacket provided', ar: 'شعاب مرجانية، مع كامل المعدات وسترة نجاة', de: 'Korallenriff, komplette Ausrüstung und Schwimmweste inklusive' },
  },
  {
    kind: 'break',
    title: { en: 'Open buffet lunch on board', ar: 'غداء بوفيه مفتوح على المركب', de: 'Offenes Buffet-Mittagessen an Bord' },
  },
  {
    kind: 'stop',
    title: { en: 'Third snorkeling stop', ar: 'ثالث محطة سنوركلينج', de: 'Dritter Schnorchelstopp' },
    subtitle: { en: 'Another coral reef', ar: 'شعاب مرجانية أخرى', de: 'Ein weiteres Korallenriff' },
  },
  {
    kind: 'end',
    title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 3. `paradise-island-premium` (also apply the Section A time fix)

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
  },
  {
    kind: 'stop',
    title: { en: 'First snorkeling stop', ar: 'أول محطة سنوركلينج', de: 'Erster Schnorchelstopp' },
    subtitle: { en: 'A protected reef away from the crowds', ar: 'شعاب محمية بعيدًا عن الزحام', de: 'Ein geschütztes Riff abseits der Menschenmengen' },
  },
  {
    kind: 'stop',
    title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
    subtitle: { en: 'Another quiet reef', ar: 'شعاب هادئة أخرى', de: 'Ein weiteres ruhiges Riff' },
  },
  {
    kind: 'stop',
    title: { en: 'Paradise Island', ar: 'جزيرة بارادايس', de: 'Paradise Island' },
    subtitle: { en: 'A long, unhurried stop on the island', ar: 'وقفة طويلة على الجزيرة من غير استعجال', de: 'Ein langer, entspannter Aufenthalt auf der Insel' },
  },
  {
    kind: 'break',
    title: { en: 'Premium open buffet lunch on the island', ar: 'غداء بوفيه مفتوح فاخر على الجزيرة', de: 'Premium-Buffet-Mittagessen auf der Insel' },
  },
  {
    kind: 'end',
    title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 4. `hula-hula-island` (also apply the Section A time fix)

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
  },
  {
    kind: 'stop',
    title: { en: 'First snorkeling stop', ar: 'أول محطة سنوركلينج', de: 'Erster Schnorchelstopp' },
    subtitle: { en: 'Colourful reef fish, full gear and life jacket provided', ar: 'أسماك شعاب ملونة، مع كامل المعدات وسترة نجاة', de: 'Bunte Rifffische, komplette Ausrüstung und Schwimmweste inklusive' },
  },
  {
    kind: 'stop',
    title: { en: 'Second snorkeling stop', ar: 'ثاني محطة سنوركلينج', de: 'Zweiter Schnorchelstopp' },
    subtitle: { en: 'Another reef', ar: 'شعاب أخرى', de: 'Ein weiteres Riff' },
  },
  {
    kind: 'stop',
    title: { en: 'Hula Hula island', ar: 'جزيرة هولا هولا', de: 'Insel Hula Hula' },
    subtitle: { en: 'Soft white sand and crystal clear water', ar: 'رمال بيضاء ناعمة ومياه صافية', de: 'Weicher weißer Sand und kristallklares Wasser' },
  },
  {
    kind: 'break',
    title: { en: 'Open buffet lunch on board', ar: 'غداء بوفيه مفتوح على المركب', de: 'Offenes Buffet-Mittagessen an Bord' },
  },
  {
    kind: 'end',
    title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 5. `hurghada-private-speed-boat`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Transfer to the marina, departure time agreed with you after booking', ar: 'الانتقال إلى المارينا، وموعد التحرك يُتفق عليه معك بعد الحجز', de: 'Transfer zur Marina, die Abfahrtszeit wird nach der Buchung mit Ihnen vereinbart' },
  },
  {
    kind: 'stop',
    title: { en: 'Board your private speed boat', ar: 'ركوب اللانش السريع الخاص بك', de: 'An Bord Ihres privaten Speedboots' },
    subtitle: { en: 'For your group only, with a captain and a guide', ar: 'لمجموعتك فقط، مع قبطان ومرشد', de: 'Nur für Ihre Gruppe, mit Kapitän und Guide' },
  },
  {
    kind: 'stop',
    title: { en: 'Fast run across the Red Sea', ar: 'جولة سريعة في البحر الأحمر', de: 'Schnelle Fahrt über das Rote Meer' },
  },
  {
    kind: 'stop',
    title: { en: 'Photo and swim stops along the coast', ar: 'وقفات تصوير وسباحة على الساحل', de: 'Foto- und Badestopps entlang der Küste' },
    subtitle: { en: 'Wherever you want them', ar: 'في الأماكن اللي تختارها', de: 'Wo immer Sie möchten' },
  },
  {
    kind: 'end',
    title: { en: 'Return to the marina and hotel drop-off', ar: 'العودة للمارينا والتوصيل للفندق', de: 'Rückkehr zur Marina und Rücktransfer zum Hotel' },
  },
],
```

### 6. `sahl-hasheesh-beach-dive`

```ts
itinerary: [
  {
    kind: 'stop',
    title: { en: 'Welcome at the beach in Sahl Hasheesh', ar: 'الاستقبال على الشاطئ في سهل حشيش', de: 'Begrüßung am Strand in Sahl Hasheesh' },
    subtitle: { en: 'Full equipment fitting', ar: 'تجهيز كامل المعدات', de: 'Komplette Ausrüstungsanpassung' },
  },
  {
    kind: 'stop',
    title: { en: 'Safety briefing', ar: 'شرح السلامة', de: 'Sicherheitsbriefing' },
    subtitle: { en: 'Equipment introduction, step by step', ar: 'تعريف بالمعدات خطوة بخطوة', de: 'Einführung in die Ausrüstung, Schritt für Schritt' },
  },
  {
    kind: 'stop',
    title: { en: 'Guided dive from the shore', ar: 'غوصة إرشادية من الشاطئ', de: 'Geführter Tauchgang vom Ufer' },
    subtitle: { en: 'Coral reefs and marine life, no boat required', ar: 'شعاب مرجانية وحياة بحرية، من غير مركب', de: 'Korallenriffe und Meeresleben, ganz ohne Boot' },
  },
  {
    kind: 'break',
    title: { en: 'Soft drinks and debrief', ar: 'مشروبات غازية وختام الجلسة', de: 'Softdrinks und Nachbesprechung' },
  },
  {
    kind: 'end',
    title: { en: 'End of the session', ar: 'نهاية الجلسة', de: 'Ende der Session' },
  },
],
```

### 7. `hurghada-diving-snorkeling-boat` (also apply the Section A time fix)

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
  },
  {
    kind: 'stop',
    title: { en: 'Board the dive boat', ar: 'ركوب مركب الغوص', de: 'An Bord des Tauchboots' },
    subtitle: { en: 'Meet the dive team and fit your equipment', ar: 'التعرف على فريق الغوص وتجهيز المعدات', de: 'Tauchteam kennenlernen und Ausrüstung anpassen' },
  },
  {
    kind: 'stop',
    title: { en: 'First site', ar: 'الموقع الأول', de: 'Erster Spot' },
    subtitle: { en: 'Snorkelling, intro dive or certified dive, as booked', ar: 'سنوركلينج أو غوصة تعريفية أو غوصة معتمدة، حسب الحجز', de: 'Schnorcheln, Schnuppertauchen oder zertifiziertes Tauchen, je nach Buchung' },
  },
  {
    kind: 'break',
    title: { en: 'Buffet lunch on board', ar: 'غداء بوفيه على المركب', de: 'Buffet-Mittagessen an Bord' },
    subtitle: { en: 'With fruit and unlimited soft drinks', ar: 'مع فاكهة ومشروبات غازية بلا حدود', de: 'Mit Obst und unbegrenzten Softdrinks' },
  },
  {
    kind: 'stop',
    title: { en: 'Second site', ar: 'الموقع الثاني', de: 'Zweiter Spot' },
    subtitle: { en: 'Sites are chosen daily for weather and experience level', ar: 'المواقع تُختار يوميًا حسب الطقس ومستوى الخبرة', de: 'Die Spots werden täglich nach Wetter und Erfahrungsstand gewählt' },
  },
  {
    kind: 'end',
    title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 8. `eastern-desert-sunset-safari` (Quad Safari)

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Air-conditioned vehicle to the quad station', ar: 'عربية مكيفة إلى محطة الكواد', de: 'Klimatisiertes Fahrzeug zur Quad-Station' },
  },
  {
    kind: 'stop',
    title: { en: 'Quad station', ar: 'محطة الكواد', de: 'Quad-Station' },
    subtitle: { en: 'Helmet fitting, safety briefing and a practice ride', ar: 'تجهيز الخوذة وشرح السلامة وجولة تجريبية', de: 'Helmanpassung, Sicherheitsbriefing und Probefahrt' },
  },
  {
    kind: 'stop',
    title: { en: 'Quad ride to the Bedouin village', ar: 'ركوب الكواد إلى القرية البدوية', de: 'Quadfahrt zum Beduinendorf' },
    subtitle: { en: 'Across open desert', ar: 'عبر الصحراء المفتوحة', de: 'Durch die offene Wüste' },
  },
  {
    kind: 'break',
    title: { en: 'In the Bedouin village', ar: 'في القرية البدوية', de: 'Im Beduinendorf' },
    subtitle: { en: 'Bread baking and Bedouin tea', ar: 'خبز العيش وشاي بدوي', de: 'Brotbacken und Beduinentee' },
  },
  {
    kind: 'stop',
    title: { en: 'Camel ride', ar: 'ركوب الجمال', de: 'Kamelritt' },
    subtitle: { en: 'With the Red Sea mountains as your backdrop', ar: 'وجبال البحر الأحمر خلفك', de: 'Mit den Bergen des Roten Meeres als Kulisse' },
  },
  {
    kind: 'end',
    title: { en: 'Return quad ride and hotel drop-off', ar: 'ركوب الكواد عودة والتوصيل للفندق', de: 'Rückfahrt mit dem Quad und Rücktransfer zum Hotel' },
  },
],
```

### 9. `hurghada-super-safari`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Air-conditioned vehicle to the desert station', ar: 'عربية مكيفة إلى محطة الصحراء', de: 'Klimatisiertes Fahrzeug zur Wüstenstation' },
  },
  {
    kind: 'stop',
    title: { en: 'Desert station', ar: 'محطة الصحراء', de: 'Wüstenstation' },
    subtitle: { en: 'Safety briefing, driving test and helmet fitting', ar: 'شرح السلامة واختبار قيادة وتجهيز الخوذة', de: 'Sicherheitsbriefing, Fahrtest und Helmanpassung' },
  },
  {
    kind: 'stop',
    title: { en: 'Quad bike ride', ar: 'ركوب الكواد', de: 'Quadfahrt' },
    subtitle: { en: 'Across open desert', ar: 'عبر الصحراء المفتوحة', de: 'Durch die offene Wüste' },
  },
  {
    kind: 'stop',
    title: { en: 'Spider car ride', ar: 'ركوب سيارة العنكبوت', de: 'Fahrt im Spider Car' },
    subtitle: { en: 'Two seats, built for the sand', ar: 'مقعدان، مصممة للرمال', de: 'Zwei Sitze, gebaut für den Sand' },
  },
  {
    kind: 'stop',
    title: { en: 'Jeep journey to the Bedouin village', ar: 'رحلة بالجيب إلى القرية البدوية', de: 'Jeepfahrt zum Beduinendorf' },
  },
  {
    kind: 'break',
    title: { en: 'In the Bedouin village', ar: 'في القرية البدوية', de: 'Im Beduinendorf' },
    subtitle: { en: 'Bedouin tea and a camel ride', ar: 'شاي بدوي وركوب جمال', de: 'Beduinentee und Kamelritt' },
  },
  {
    kind: 'break',
    title: { en: 'Open-buffet BBQ dinner', ar: 'عشاء مشويات بوفيه مفتوح', de: 'BBQ-Abendessen vom offenen Buffet' },
  },
  {
    kind: 'stop',
    title: { en: 'Oriental show', ar: 'العرض الشرقي', de: 'Orientalische Show' },
    subtitle: { en: 'Tanoura, belly dance and fire performance', ar: 'تنورة ورقص شرقي وعرض نار', de: 'Tanoura, Bauchtanz und Feuershow' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
  },
],
```

### 10. `hurghada-star-gazing-jeep`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in the early evening', ar: 'الاستلام من الفندق أول الليل', de: 'Hotelabholung am frühen Abend' },
  },
  {
    kind: 'stop',
    title: { en: 'Jeep ride into the open desert', ar: 'رحلة بالجيب إلى الصحراء المفتوحة', de: 'Jeepfahrt in die offene Wüste' },
    subtitle: { en: 'Away from the city lights', ar: 'بعيدًا عن أضواء المدينة', de: 'Weit weg von den Lichtern der Stadt' },
  },
  {
    kind: 'break',
    title: { en: 'Dinner in the desert', ar: 'عشاء في الصحراء', de: 'Abendessen in der Wüste' },
  },
  {
    kind: 'stop',
    title: { en: 'Star watching', ar: 'مشاهدة النجوم', de: 'Sterne beobachten' },
    subtitle: { en: 'Under a dark desert sky, with the Milky Way overhead', ar: 'تحت سماء صحراوية مظلمة، ودرب التبانة فوقك', de: 'Unter dunklem Wüstenhimmel, mit der Milchstraße über Ihnen' },
  },
  {
    kind: 'end',
    title: { en: 'Jeep ride back to your hotel', ar: 'العودة بالجيب إلى فندقك', de: 'Rückfahrt mit dem Jeep zu Ihrem Hotel' },
  },
],
```

### 11. `sahl-hasheesh-horse-swim`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
    subtitle: { en: 'Transfer to the stables', ar: 'الانتقال إلى الإسطبل', de: 'Transfer zum Stall' },
  },
  {
    kind: 'stop',
    title: { en: 'At the stables', ar: 'في الإسطبل', de: 'Im Stall' },
    subtitle: { en: 'Meet your horse, matched to your riding level, and fit your helmet', ar: 'التعرف على حصانك المناسب لمستواك وتجهيز الخوذة', de: 'Ihr Pferd kennenlernen, passend zu Ihrem Reitniveau, und Helm anpassen' },
  },
  {
    kind: 'stop',
    title: { en: 'Guided ride', ar: 'جولة ركوب إرشادية', de: 'Geführter Ritt' },
    subtitle: { en: 'Along the Red Sea shore or out into the desert, your choice on the day', ar: 'على شاطئ البحر الأحمر أو في الصحراء، اختيارك في اليوم نفسه', de: 'Entlang der Küste des Roten Meeres oder in die Wüste, Ihre Wahl am Tag selbst' },
  },
  {
    kind: 'stop',
    title: { en: 'Swim stop with your horse', ar: 'وقفة سباحة مع حصانك', de: 'Badestopp mit Ihrem Pferd' },
    subtitle: { en: 'On the 3-hour ride, take your horse into the sea', ar: 'في جولة الثلاث ساعات، تنزل بحصانك إلى البحر', de: 'Beim 3-stündigen Ritt geht es mit Ihrem Pferd ins Meer' },
  },
  {
    kind: 'end',
    title: { en: 'Ride back and hotel drop-off', ar: 'الركوب عودة والتوصيل للفندق', de: 'Rückritt und Rücktransfer zum Hotel' },
  },
],
```

### 12. `hurghada-horse-photoshoot-session`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
    subtitle: { en: 'Transfer to the stables', ar: 'الانتقال إلى الإسطبل', de: 'Transfer zum Stall' },
  },
  {
    kind: 'stop',
    title: { en: 'Meet the team and your horse', ar: 'التعرف على الفريق وحصانك', de: 'Team und Ihr Pferd kennenlernen' },
    subtitle: { en: 'A decorated horse, prepared for the session', ar: 'حصان مزيّن ومجهّز للجلسة', de: 'Ein geschmücktes Pferd, vorbereitet für die Session' },
  },
  {
    kind: 'stop',
    title: { en: 'Photoshoot on the beach', ar: 'جلسة التصوير على الشاطئ', de: 'Fotoshooting am Strand' },
    subtitle: { en: 'Directed poses at hand-picked spots, the team sets up every shot', ar: 'وضعيات موجّهة في أماكن مختارة، والفريق يجهّز كل لقطة', de: 'Angeleitete Posen an ausgewählten Spots, das Team richtet jede Aufnahme ein' },
  },
  {
    kind: 'stop',
    title: { en: 'Photos in the sea', ar: 'صور في البحر', de: 'Fotos im Meer' },
    subtitle: { en: 'With a gentle ride between locations, no riding experience needed', ar: 'مع ركوب هادئ بين الأماكن، من غير ما تحتاج خبرة ركوب', de: 'Mit einem ruhigen Ritt zwischen den Locations, ganz ohne Reiterfahrung' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
    subtitle: { en: 'Everyone in your group gets photographed', ar: 'كل فرد في مجموعتك بيتصور', de: 'Jeder in Ihrer Gruppe wird fotografiert' },
  },
],
```

### 13. `hurghada-flying-dress-photoshoot`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
    subtitle: { en: 'Timing arranged with you after booking', ar: 'الموعد يُرتّب معك بعد الحجز', de: 'Die Zeit wird nach der Buchung mit Ihnen abgestimmt' },
  },
  {
    kind: 'stop',
    title: { en: 'Choose your dress', ar: 'اختيار فستانك', de: 'Wählen Sie Ihr Kleid' },
    subtitle: { en: 'Dress and colour from the dresses provided', ar: 'الفستان واللون من الفساتين المتوفرة', de: 'Kleid und Farbe aus den bereitgestellten Kleidern' },
  },
  {
    kind: 'stop',
    title: { en: 'First location: the sea shallows', ar: 'الموقع الأول: مياه البحر الضحلة', de: 'Erste Location: das flache Meerwasser' },
    subtitle: { en: 'Shoot with a prepared horse, the team sets up every shot', ar: 'تصوير مع حصان مجهّز، والفريق يجهّز كل لقطة', de: 'Shooting mit einem vorbereiteten Pferd, das Team richtet jede Aufnahme ein' },
  },
  {
    kind: 'stop',
    title: { en: 'Second location: the desert', ar: 'الموقع الثاني: الصحراء', de: 'Zweite Location: die Wüste' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
    subtitle: { en: '22 professionally edited photos to take home', ar: 'اتنين وعشرين صورة معدّلة باحتراف تاخدها معاك', de: '22 professionell bearbeitete Fotos für Sie' },
  },
],
```

### 14. `hurghada-horse-carriage-sea-ride`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
    subtitle: { en: 'Transfer to the carriage point', ar: 'الانتقال إلى نقطة العربة', de: 'Transfer zum Kutschenpunkt' },
  },
  {
    kind: 'stop',
    title: { en: 'Board the horse carriage', ar: 'ركوب عربة الحصان', de: 'Einsteigen in die Pferdekutsche' },
    subtitle: { en: 'Families and groups ride together in one carriage', ar: 'العائلات والمجموعات تركب معًا في عربة واحدة', de: 'Familien und Gruppen fahren gemeinsam in einer Kutsche' },
  },
  {
    kind: 'stop',
    title: { en: 'Ride along the beach', ar: 'جولة على الشاطئ', de: 'Fahrt entlang des Strandes' },
  },
  {
    kind: 'stop',
    title: { en: 'The carriage rolls into the shallow sea', ar: 'العربة تدخل مياه البحر الضحلة', de: 'Die Kutsche rollt ins flache Meer' },
  },
  {
    kind: 'stop',
    title: { en: 'Photo stops along the way', ar: 'وقفات تصوير على الطريق', de: 'Fotostopps unterwegs' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
  },
],
```

### 15. `hurghada-camel-ride-beach`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup', ar: 'الاستلام من الفندق', de: 'Hotelabholung' },
    subtitle: { en: 'Transfer to the beach', ar: 'الانتقال إلى الشاطئ', de: 'Transfer zum Strand' },
  },
  {
    kind: 'stop',
    title: { en: 'Meet your camel', ar: 'التعرف على جملك', de: 'Ihr Kamel kennenlernen' },
    subtitle: { en: 'Led by an experienced camel handler the whole way', ar: 'بقيادة قائد جمال خبير طوال الطريق', de: 'Den ganzen Weg von einem erfahrenen Kamelführer begleitet' },
  },
  {
    kind: 'stop',
    title: { en: 'Camel ride along the beach', ar: 'ركوب الجمل على الشاطئ', de: 'Kamelritt entlang des Strandes' },
    subtitle: { en: 'And the desert edge', ar: 'وعلى حافة الصحراء', de: 'Und am Rand der Wüste' },
  },
  {
    kind: 'stop',
    title: { en: 'Photo stops on the shore', ar: 'وقفات تصوير على الشاطئ', de: 'Fotostopps am Ufer' },
  },
  {
    kind: 'break',
    title: { en: 'Bedouin tea stop', ar: 'وقفة شاي بدوي', de: 'Pause mit Beduinentee' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back to your hotel', ar: 'الانتقال عودة إلى فندقك', de: 'Rücktransfer zu Ihrem Hotel' },
  },
],
```

### 16. `marsa-alam-abu-dabbab-turtles`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Pickup in Marsa Alam', ar: 'الاستلام في مرسى علم', de: 'Abholung in Marsa Alam' },
    subtitle: { en: 'Transfer to Abu Dabbab bay', ar: 'الانتقال إلى خليج أبو دباب', de: 'Transfer zur Bucht von Abu Dabbab' },
  },
  {
    kind: 'stop',
    title: { en: 'Wildlife etiquette briefing', ar: 'شرح آداب التعامل مع الحياة البرية', de: 'Briefing zum Umgang mit den Tieren' },
    subtitle: { en: 'With a local reef ranger, before you enter the water', ar: 'مع حارس شعاب محلي، قبل نزول المياه', de: 'Mit einem lokalen Riff-Ranger, bevor es ins Wasser geht' },
  },
  {
    kind: 'stop',
    title: { en: 'Guided snorkelling from the beach', ar: 'سنوركلينج إرشادي من الشاطئ', de: 'Geführtes Schnorcheln vom Strand' },
    subtitle: { en: 'Walk straight in from soft sand, ideal for gentle swimmers', ar: 'دخول مباشر من رمال ناعمة، مثالي للسباحين الهادئين', de: 'Direkter Einstieg über weichen Sand, ideal für ruhige Schwimmer' },
  },
  {
    kind: 'break',
    title: { en: 'Free time on the beach', ar: 'وقت حر على الشاطئ', de: 'Freie Zeit am Strand' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back', ar: 'الانتقال عودة', de: 'Rücktransfer' },
  },
],
```

### 17. `marsa-alam-samadai-dolphin-house`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Marsa Alam', ar: 'الاستلام من الفندق في مرسى علم', de: 'Hotelabholung in Marsa Alam' },
    subtitle: { en: 'Transfer to the marina', ar: 'الانتقال إلى المارينا', de: 'Transfer zur Marina' },
  },
  {
    kind: 'stop',
    title: { en: 'Boat trip to Shaab Samadai reef', ar: 'رحلة بالمركب إلى شعاب صمداي', de: 'Bootsfahrt zum Riff Shaab Samadai' },
    subtitle: { en: 'The natural home of wild spinner dolphins', ar: 'الموطن الطبيعي للدلافين الدوّارة البرية', de: 'Die natürliche Heimat wilder Spinnerdelfine' },
  },
  {
    kind: 'stop',
    title: { en: 'First guided snorkelling session', ar: 'أول جلسة سنوركلينج إرشادية', de: 'Erste geführte Schnorchelsession' },
    subtitle: { en: 'Over the coral gardens, full equipment and life jackets provided', ar: 'فوق حدائق المرجان، مع كامل المعدات وسترات النجاة', de: 'Über den Korallengärten, komplette Ausrüstung und Schwimmwesten inklusive' },
  },
  {
    kind: 'break',
    title: { en: 'Buffet lunch on board', ar: 'غداء بوفيه على المركب', de: 'Buffet-Mittagessen an Bord' },
    subtitle: { en: 'With soft drinks', ar: 'مع مشروبات غازية', de: 'Mit Softdrinks' },
  },
  {
    kind: 'stop',
    title: { en: 'Second guided snorkelling session', ar: 'ثاني جلسة سنوركلينج إرشادية', de: 'Zweite geführte Schnorchelsession' },
  },
  {
    kind: 'end',
    title: { en: 'Sail back and hotel drop-off', ar: 'الإبحار عودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 18. `marsa-alam-mubarak-turtles`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Pickup in Marsa Alam', ar: 'الاستلام في مرسى علم', de: 'Abholung in Marsa Alam' },
    subtitle: { en: 'Transfer to Marsa Mubarak', ar: 'الانتقال إلى مرسى مبارك', de: 'Transfer nach Marsa Mubarak' },
  },
  {
    kind: 'stop',
    title: { en: 'Snorkelling in the sheltered bay', ar: 'سنوركلينج في الخليج المحمي', de: 'Schnorcheln in der geschützten Bucht' },
    subtitle: { en: 'Calm, sheltered water', ar: 'مياه هادئة ومحمية', de: 'Ruhiges, geschütztes Wasser' },
  },
  {
    kind: 'stop',
    title: { en: 'Sea turtles over the seagrass beds', ar: 'سلاحف بحرية فوق مروج الأعشاب البحرية', de: 'Meeresschildkröten über den Seegraswiesen' },
    subtitle: { en: 'And the chance to spot the rare dugong, the sea cow', ar: 'وفرصة لمشاهدة الأطوم النادر، بقرة البحر', de: 'Und die Chance, das seltene Dugong, die Seekuh, zu sehen' },
  },
  {
    kind: 'break',
    title: { en: 'Freshly prepared lunch on board', ar: 'غداء طازج على المركب', de: 'Frisch zubereitetes Mittagessen an Bord' },
    subtitle: { en: 'With soft drinks', ar: 'مع مشروبات غازية', de: 'Mit Softdrinks' },
  },
  {
    kind: 'stop',
    title: { en: 'Coral reef snorkelling', ar: 'سنوركلينج عند الشعاب المرجانية', de: 'Schnorcheln am Korallenriff' },
    subtitle: { en: 'Vibrant reefs full of colourful fish, or an optional dive with an instructor', ar: 'شعاب نابضة مليئة بالأسماك الملونة، أو غوصة اختيارية مع مدرب', de: 'Lebendige Riffe voller bunter Fische, oder ein optionaler Tauchgang mit einem Instructor' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back', ar: 'الانتقال عودة', de: 'Rücktransfer' },
  },
],
```

### 19. `hurghada-old-town-marina-walk`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Meet your guide in Hurghada', ar: 'مقابلة مرشدك في الغردقة', de: 'Treffen mit Ihrem Guide in Hurghada' },
  },
  {
    kind: 'stop',
    title: { en: 'Hurghada Marina', ar: 'مارينا الغردقة', de: 'Hurghada Marina' },
    subtitle: { en: 'A walk along the promenade', ar: 'تمشية على الكورنيش', de: 'Ein Spaziergang entlang der Promenade' },
  },
  {
    kind: 'stop',
    title: { en: 'El Dahar, the old town', ar: 'الدهار، البلد القديمة', de: 'El Dahar, die Altstadt' },
    subtitle: { en: 'The souq, real local bakeries and markets, zero commission shopping pressure', ar: 'السوق ومخابز وأسواق محلية حقيقية، من غير أي ضغط شراء بعمولات', de: 'Der Souq, echte lokale Bäckereien und Märkte, ganz ohne Kaufdruck' },
  },
  {
    kind: 'stop',
    title: { en: 'The mosque', ar: 'المسجد', de: 'Die Moschee' },
  },
  {
    kind: 'end',
    title: { en: 'End of the walk', ar: 'نهاية الجولة', de: 'Ende des Rundgangs' },
  },
],
```

### 20. `cairo-pyramids-gem-day`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup in Hurghada', ar: 'الاستلام من الفندق في الغردقة', de: 'Hotelabholung in Hurghada' },
    subtitle: { en: 'Early morning, exact time confirmed after booking', ar: 'بدري الصبح، ويتم تأكيد الموعد الدقيق بعد الحجز', de: 'Früh am Morgen, genaue Zeit wird nach Buchung bestätigt' },
  },
  {
    kind: 'stop',
    title: { en: 'The road to Cairo', ar: 'الطريق إلى القاهرة', de: 'Die Fahrt nach Kairo' },
  },
  {
    kind: 'stop',
    title: { en: 'The Giza Pyramids', ar: 'أهرامات الجيزة', de: 'Die Pyramiden von Gizeh' },
    subtitle: { en: 'Guided visit with a dedicated Egyptologist', ar: 'زيارة إرشادية مع عالم مصريات متخصص', de: 'Geführte Besichtigung mit einem spezialisierten Ägyptologen' },
  },
  {
    kind: 'stop',
    title: { en: 'The Sphinx', ar: 'أبو الهول', de: 'Die Sphinx' },
  },
  {
    kind: 'stop',
    title: { en: 'The Grand Egyptian Museum', ar: 'المتحف المصري الكبير', de: 'Das Grand Egyptian Museum' },
  },
  {
    kind: 'end',
    title: { en: 'The road back and hotel drop-off', ar: 'طريق العودة والتوصيل للفندق', de: 'Rückfahrt und Rücktransfer zum Hotel' },
  },
],
```

### 21. `hurghada-private-airport-transfer`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Pickup at the agreed point', ar: 'الاستلام من النقطة المتفق عليها', de: 'Abholung am vereinbarten Punkt' },
    subtitle: { en: 'Driver details and vehicle plate sent via WhatsApp before pickup', ar: 'بيانات السائق ولوحة العربية تُرسل واتساب قبل الاستلام', de: 'Fahrerdaten und Kennzeichen werden vor der Abholung per WhatsApp gesendet' },
  },
  {
    kind: 'stop',
    title: { en: 'The drive', ar: 'الطريق', de: 'Die Fahrt' },
    subtitle: { en: 'Private air-conditioned vehicle', ar: 'عربية خاصة مكيفة', de: 'Privates, klimatisiertes Fahrzeug' },
  },
  {
    kind: 'end',
    title: { en: 'Drop-off', ar: 'الوصول', de: 'Ankunft' },
    subtitle: { en: 'At the airport or your hotel, as booked', ar: 'في المطار أو فندقك، حسب الحجز', de: 'Am Flughafen oder an Ihrem Hotel, je nach Buchung' },
  },
],
```

### 22. `cairo-khan-el-khalili-nile-evening`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Pickup and transfer to the old city', ar: 'الاستلام والانتقال إلى المدينة القديمة', de: 'Abholung und Transfer in die Altstadt' },
  },
  {
    kind: 'stop',
    title: { en: 'The Citadel', ar: 'القلعة', de: 'Die Zitadelle' },
  },
  {
    kind: 'stop',
    title: { en: 'Khan el-Khalili bazaar', ar: 'بازار خان الخليلي', de: 'Basar Khan el-Khalili' },
    subtitle: { en: 'A curated route avoiding crowded tourist traps', ar: 'مسار مختار بيبعد عن الزحام والأماكن السياحية المكدسة', de: 'Eine kuratierte Route abseits der überlaufenen Touristenfallen' },
  },
  {
    kind: 'stop',
    title: { en: 'Sunset felucca on the Nile', ar: 'فلوكة على النيل وقت الغروب', de: 'Felucca auf dem Nil bei Sonnenuntergang' },
    subtitle: { en: 'Private wooden felucca sail at golden hour', ar: 'إبحار خاص بفلوكة خشبية في الساعة الذهبية', de: 'Private Holz-Felucca in der goldenen Stunde' },
  },
  {
    kind: 'end',
    title: { en: 'Transfer back', ar: 'الانتقال عودة', de: 'Rücktransfer' },
  },
],
```

### 23. `luxor-sunrise-balloon`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Hotel pickup before dawn', ar: 'الاستلام من الفندق قبل الفجر', de: 'Hotelabholung vor Sonnenaufgang' },
  },
  {
    kind: 'stop',
    title: { en: 'Motorboat crossing of the Nile', ar: 'عبور النيل بمركب بمحرك', de: 'Überfahrt über den Nil per Motorboot' },
    subtitle: { en: 'With warm tea before takeoff', ar: 'مع شاي دافئ قبل الإقلاع', de: 'Mit warmem Tee vor dem Start' },
  },
  {
    kind: 'stop',
    title: { en: 'Balloon takeoff', ar: 'إقلاع البالون', de: 'Ballonstart' },
    subtitle: { en: 'Licensed civil aviation pilot', ar: 'طيار مرخّص من الطيران المدني', de: 'Lizenzierter Pilot der Zivilluftfahrt' },
  },
  {
    kind: 'stop',
    title: { en: 'Sunrise flight over the West Bank', ar: 'طيران وقت الشروق فوق البر الغربي', de: 'Flug bei Sonnenaufgang über dem Westufer' },
  },
  {
    kind: 'end',
    title: { en: 'Landing and transfer back', ar: 'الهبوط والانتقال عودة', de: 'Landung und Rücktransfer' },
  },
],
```

### 24. `egyptologist-private-guide-multilang`

```ts
itinerary: [
  {
    kind: 'pickup',
    title: { en: 'Meet your Egyptologist', ar: 'مقابلة عالم المصريات', de: 'Treffen mit Ihrem Ägyptologen' },
    subtitle: { en: 'Matched to your preferred language and archaeological focus', ar: 'متناسب مع لغتك المفضلة وتركيزك الأثري', de: 'Abgestimmt auf Ihre bevorzugte Sprache und Ihren archäologischen Schwerpunkt' },
  },
  {
    kind: 'stop',
    title: { en: 'Guided touring', ar: 'جولات إرشادية', de: 'Geführte Besichtigungen' },
    subtitle: { en: 'The sites on your booked program, at your pace', ar: 'المواقع اللي في برنامج حجزك، وبإيقاعك انت', de: 'Die Orte Ihres gebuchten Programms, in Ihrem Tempo' },
  },
  {
    kind: 'end',
    title: { en: 'End of the tour', ar: 'نهاية الجولة', de: 'Ende der Tour' },
  },
],
```

## Flagged for removal, NOT given an itinerary: shopping

Owner ruling (2026-11-25): there is no such thing as a shopping tour at Wasla. `hurghada-artisan-shopping-tour` therefore gets NO itinerary in this pack. Recommended handling, on the owner's explicit word: remove the trip from the catalog (code seed + its Firestore doc, both, or it re-seeds), and note the `shopping` category is left empty by that removal. This pack does not execute the removal by itself.

## Go-live note (Firestore wins over code)

Every trip in this pack already has a Firestore document, and the existing document overrides the code seed. After entering this pack in code, each touched trip must be deleted once in Owner Control in the current preview and allowed to re-seed from the new code (reload signed in as owner), exactly like the earlier restructures, or the new itineraries and times will not appear. The entering agent must state in its report which trips were re-seeded and verified on the rendered trip pages.

## Verification checklist for the entering agent

- `tsc` clean and build passes.
- Every itinerary renders on its trip page in EN, AR and DE with no missing-language fallbacks.
- The four corrected trips show 09:00 AM as the departure time in the booking widget.
- Zero em dashes in the entered text, no `durationOrTime` used, no supplier names.
- Report per trip: entered / re-seeded / verified on the rendered page.
