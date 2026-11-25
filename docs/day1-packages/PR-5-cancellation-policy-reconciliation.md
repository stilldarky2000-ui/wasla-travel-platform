# PR 5 — مصالحة وعد الإلغاء (بند 1 من التوجيه، اليوم الأول)

الحالة: الصياغة بصيغة الخبير القانوني (حكم ٢٥ نوفمبر ٢٠٢٦) + قراري المالك (٢٥ نوفمبر ٢٠٢٦). صياغة المسودة الأولى مرفوضة بحكم الخبير: جملتها الثانية كانت تحيل العميل لسياسة طرف ثالث لا يراها إلا بعد الحجز، وهو تضليل تحت قانون المستهلك الألماني والأوروبي، وكانت غير حقيقية أصلًا لأن شروط الموردين مختلفة وغير مجموعة بعد.

## قرارا المالك (٢٥ نوفمبر ٢٠٢٦)
1. الإلغاء داخل آخر ٢٤ ساعة = لا استرداد، يُحسب سعر الرحلة الكامل.
2. رسم الحجز (على الرحلات الأربع الغالية، كتنويه لا كشرط) يتحفظ لوصلة عند الإلغاء داخل ٢٤ ساعة، ويُحسب من ضمن السعر الكامل المستحق.

## الصياغة النهائية الكاملة (الأسئلة الشائعة، النافذة القانونية، صفحات الرحلات، بيانات الأسئلة المنظمة)

**EN:** Free cancellation up to 24 hours before the trip start time shown on your booking. Cancellations within 24 hours of the start time are charged at the full trip price. On the Marsa Alam trips, marine park permits are arranged in advance and are not refundable once issued.

**AR:** إلغاء مجاني حتى 24 ساعة قبل موعد بداية الرحلة المكتوب في حجزك. الإلغاء خلال آخر 24 ساعة قبل البداية يُحسب بسعر الرحلة الكامل. في رحلات مرسى علم، تصاريح المحمية البحرية تُجهَّز مقدمًا ولا تُسترد بعد إصدارها.

**DE:** Kostenlose Stornierung bis 24 Stunden vor der auf Ihrer Buchung angegebenen Startzeit der Tour. Bei einer Stornierung innerhalb von 24 Stunden vor der Startzeit wird der volle Tourpreis berechnet. Bei den Touren nach Marsa Alam gilt: Genehmigungen für den Meerespark werden im Voraus beschafft und sind nach Ausstellung nicht erstattungsfähig.

## الصياغة القصيرة (أسطح الوصف فقط: meta وog وtwitter)

**EN:** Hurghada excursions in small groups: boat trips, safari, diving and Luxor. Free cancellation up to 24 hours before the trip. Cash on pickup, no deposit.

**AR:** رحلات في الغردقة بمجموعات صغيرة: رحلات بحرية وسفاري وغوص والأقصر. إلغاء مجاني حتى 24 ساعة قبل الرحلة. الدفع نقدًا عند الاستلام، من غير مقدم.

**DE:** Ausflüge in Hurghada in kleinen Gruppen: Bootstouren, Safari, Tauchen und Luxor. Kostenlose Stornierung bis 24 Stunden vor der Tour. Barzahlung bei Abholung, keine Anzahlung.

تنبيه الخبير: بيانات الأسئلة المنظمة ليست سطح وصف، جوجل يقتبسها حرفيًا كإجابة سياسة، فتأخذ الصياغة الكاملة مطابقة تمامًا لإجابة الأسئلة الظاهرة.

## جمل إضافية إلزامية

**عدم الحضور (النافذة القانونية):**
- EN: If you neither cancel nor appear at pickup, the booking is treated as completed and the full trip price applies.
- AR: إذا لم تُلغِ ولم تحضر في موعد الاستلام، يُحتسب الحجز مكتملًا ويُطبَّق سعر الرحلة الكامل.
- DE: Wenn Sie weder stornieren noch zur Abholung erscheinen, gilt die Buchung als abgeschlossen und der volle Tourpreis wird berechnet.

**رسم الحجز (تنويه تأكيد الحجز للرحلات الأربع الغالية فقط):**
- EN: The reservation fee is not refundable if you cancel within 24 hours of the trip start time, and it counts toward the full trip price charged.
- AR: رسم الحجز لا يُسترد إذا ألغيت خلال آخر ٢٤ ساعة قبل بداية الرحلة، ويُحسب من ضمن سعر الرحلة الكامل المستحق.
- DE: Die Reservierungsgebühr ist bei einer Stornierung innerhalb von 24 Stunden vor der Startzeit nicht erstattungsfähig und wird auf den fälligen vollen Tourpreis angerechnet.

## الأماكن المطلوب تعديلها

| # | الملف | الموضع | المطلوب |
|---|---|---|---|
| 1 | `src/data/i18n.ts` | 259 | الصياغة الكاملة EN |
| 2 | `src/data/i18n.ts` | 309 | النصف الأول بالصياغة الكاملة، والنصف الثاني كما هو |
| 3 | `src/components/LegalPoliciesModal.tsx` | 183 | الصياغة الكاملة AR + جملة عدم الحضور |
| 4 | `index.html` | 8 (meta description) | الصياغة القصيرة |
| 5 | `index.html` | 19 (og:description) | الصياغة القصيرة |
| 6 | `index.html` | 26 (twitter:description) | الصياغة القصيرة |
| 7 | `index.html` | ~75 (JSON-LD FAQ) | الصياغة الكاملة، مطابقة لإجابة الأسئلة الظاهرة حرفيًا |
| 8 | `src/components/TripDetailTemplate.tsx` | 1224-1229 | الصياغة الكاملة باللغات الثلاث |
| 9 | `src/components/TripDetailTemplate.tsx` | 2128-2133 | نفس الاستبدال |
| 10 | `src/components/StorefrontFaq.tsx` | 71 | الجواب بالصياغة الكاملة |
| 11 | صفحتا رحلتي مرسى علم (Samadai + Marsa Mubarak) | قسم قبل الحجز | جملة التصاريح من الصياغة الكاملة ظاهرة على الصفحة نفسها |
| 12 | `src/data/packs/cs.ts` | 217 | مواءمة سطر حزمة اللغة الداخلية على القاعدة المنشورة (حكم الخبير: الحزمة سطح عملي يواجه الضيف) |

## قوالب الواتساب المعتمدة
- `docs/whatsapp-templates.md` — قالب اليوم السابق: **يُحذف سطر الإلغاء المجاني نهائيًا ولا يُستبدل بصياغة إلغاء** (حكم الخبير)، ويحل محله سطر تأكيد الحضور:
  - EN: Please reply to this message to confirm for tomorrow. If you cannot join us, please tell us tonight.
  - DE: Bitte antworten Sie auf diese Nachricht und bestätigen Sie für morgen. Falls Sie nicht teilnehmen können, sagen Sie uns bitte heute Abend Bescheid.
- يُفك تجميد الملف لهذا التعديل فقط، ويُسجَّل في تاريخه أسفله: "2026-11-25: حذف سطر الإلغاء من قالب اليوم السابق واستبداله بسطر تأكيد الحضور، بحكم الخبير وموافقة المالك"، ثم يُعاد تجميده. ممنوع أي تعديل آخر.

## معيار القبول (على الموقع المُصيَّر، لا على الريبو)
1. `grep -rn "Free cancellation" src/ index.html` — كل نتيجة هي الصياغة الكاملة أو القصيرة المعتمدة فقط، ولا "مجاني" مطلق في أي مكان.
2. نفس الفحص للألمانية والعربية.
3. فحص بصري: الصفحة الرئيسية وصفحة رحلة وصفحة مرسى علم، وبيانات الأسئلة المنظمة مطابقة للنص الظاهر.
4. `npm test` أخضر.

## ما لا يتغير
- لا لمسة لملفات الكتالوج أو أسعار الرحلات أو سياسات الموردين. اختلاف شروط الموردين مسألة تكلفة واختيار موردين (شغل اليوم الثاني)، ولا يدخل أي نص يراه الضيف.
