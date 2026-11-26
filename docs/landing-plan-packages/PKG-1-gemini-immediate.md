# PKG-1 — Immediate Gemini batch (paste-ready prompts)

Executor: Gemini in Google AI Studio, after syncing Studio FROM GitHub. One prompt at a time; report changed lines after each. The Arabic strings marked [AR by Muse] are Muse's translations, flagged for the owner.

## Prompt A — Zero-rating display bridge
```text
In src/components/TripExplorer.tsx, src/components/TripCard.tsx, and anywhere else a trip's star rating is rendered: when a trip's reviewCount is 0, do not render the star icon, the numeric rating, or "0.0" anywhere for that trip. Render nothing in the rating slot on the detail card, and in list rows show a small neutral badge with the existing "New" wording from the i18n files if one exists, otherwise render nothing. Do not change any stored trip data, do not change layout spacing for trips that do have reviews, and do not touch trips with reviewCount above 0. No em dashes in any text. Run the TypeScript check and confirm it passes.
```

## Prompt B — Contact trust line (removes the em dash and the unkeepable promise)
```text
In src/components/ContactSupportSection.tsx, replace the trust line in all three languages with exactly these strings:
EN: "You write to the owner, not a call centre. He replies personally, stays in touch while your trip is on the road, and answers every day."
DE: "Sie schreiben dem Inhaber persönlich, nicht einem Callcenter. Er antwortet selbst, bleibt während Ihrer Tour erreichbar und ist jeden Tag für Sie da."
AR: "بتكتب للمالك نفسه، مش مركز اتصالات. بيرد عليك بنفسه، وبيفضل على تواصل أثناء رحلتك، وبيرد كل يوم."
Change nothing else in the section. No em dashes anywhere in the new text. Run the TypeScript check and confirm it passes.
```

## Prompt C — Reserve wording + payment microcopy + fixed-price lockups
```text
Three related changes, nothing else:
1) In src/data/i18n.ts, change the bookNow string: EN "Book now" becomes "Reserve your spot"; DE "Jetzt buchen" becomes "Platz reservieren"; AR "احجز الآن" becomes "احجز مكانك".
2) Directly under every booking button that uses bookNow (TripExplorer detail card and the trip booking card), add one small line of microcopy from i18n: EN "Nothing to pay today. Cash on pickup." DE "Heute nichts zu bezahlen. Barzahlung bei Abholung." AR "لا دفع اليوم. الدفع كاش عند الاستلام."
3) For trips whose pricingMode is per-group (for example the private speed boat and the airport transfer), the price lockup must show the unit, not "per adult": EN pattern "€101 · whole boat, up to 6 guests" / for the transfer "per vehicle"; DE pattern "€101 · ganzes Boot, bis zu 6 Gäste" / "pro Fahrzeug"; AR pattern "١٠١ يورو · القارب بالكامل، حتى ٦ ضيوف" / "للسيارة". Use each trip's existing price and maxGuests values; do not hardcode numbers. Per-person trips keep "per adult".
No em dashes in any text. Run the TypeScript check and confirm it passes, and list every file you changed.
```

## Prompt D — Explorer default order and default selection
```text
In src/components/TripExplorer.tsx: change the DEFAULT state only (before the user searches, filters, or sorts). The default selected trip becomes luxor-valley-small-van. The default list order becomes: luxor-valley-small-van first, then orange-bay-small-group, then eastern-desert-sunset-safari, then all remaining trips in their current relative order. Implement this as one explicit featured-order list of trip ids applied only to the default unsorted, unfiltered state; any user-chosen sort or filter behaves exactly as it does today. Change nothing else. Run the TypeScript check and confirm it passes.
```

## Prompt E — Explorer list container (dead space under the list)
```text
In src/components/TripExplorer.tsx, the trips list container (currently using lg:max-h-[420px] with internal scroll inside a card that stretches to the detail card's height) leaves dead white space under short lists. Fix: remove the fixed lg:max-h-[420px]; make the list flex-1 with min-h-0 so its scroll area fills the card's remaining height exactly and ends flush with the card's bottom edge; add a thin styled scrollbar (about 4px, slate colour at low opacity) instead of the hidden scrollbar on desktop. Mobile behaviour (horizontal snap carousel) stays exactly as it is. Change nothing else. Run the TypeScript check and confirm it passes.
```

## Prompt F — Hero H1 and lede (final expert wording)
```text
In src/data/i18n.ts, replace heroTitleLine1, heroTitleLine2 and heroLede for EN, DE and AR with exactly:
EN line1: "Hurghada excursions in small groups,"  line2: "booked without the guesswork."
EN lede: "Boat trips, desert safaris and Luxor days with hand-picked local operators, confirmed personally by the owner. Nothing to pay today; you pay cash when we pick you up."
DE line1: "Hurghada Ausflüge in kleinen Gruppen,"  line2: "gebucht ohne Rätselraten."
DE lede: "Bootstouren, Wüstensafaris und Luxor-Tage mit handverlesenen lokalen Veranstaltern, vom Inhaber persönlich bestätigt. Heute zahlen Sie nichts; die Barzahlung erfolgt bei der Abholung."
AR line1: "رحلات الغردقة بمجموعات صغيرة،"  line2: "محجوزة بدون أي حيرة."
AR lede: "رحلات بحرية وسفاري صحراوية وأيام في الأقصر مع مشغلين محليين مختارين بعناية، بيأكدها المالك بنفسه. لا دفع اليوم، والدفع كاش عند الاستلام."
Change nothing else in the hero. No em dashes. Run the TypeScript check and confirm it passes.
```
