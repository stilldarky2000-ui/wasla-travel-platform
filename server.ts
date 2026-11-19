import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function parseModelJson<T>(rawText: string | undefined, contextLabel: string): T {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) {
    throw new Error(`${contextLabel} returned an empty JSON response.`);
  }
  return JSON.parse(cleaned) as T;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/maps-config', (_req, res) => {
    const apiKey =
      process.env.GOOGLE_MAPS_PLATFORM_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.json({ apiKey });
  });

  app.get('/dev-sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store');
    res.send(
      `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.registration.unregister())
  );
});`
    );
  });

  app.post('/api/assistant', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable AI draft replies.',
      });
      return;
    }

      const {
        customerName,
        language,
        targetLanguageOverride,
        tripTitle,
        bookingRef,
        pickupInfo,
        latestMessage,
        conversationHistory,
        bookingContext,
        operatorIntent,
        audioBase64,
        mimeType = 'audio/webm',
      } = req.body ?? {};
      const rawAudio =
        typeof audioBase64 === 'string'
          ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim()
          : '';
      const trimmedOperatorText = String(operatorIntent ?? '').trim();
      if (!latestMessage && !trimmedOperatorText && !rawAudio) {
        res.status(400).json({ error: 'Missing message context for assistant.' });
        return;
      }

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const preferredLang = String(targetLanguageOverride || language || 'en').trim();

        const systemInstruction =
          'You are a high-precision multilingual translator and messaging assistant for Wasla Travel (waslatravel.com).\n' +
          'CRITICAL FIDELITY RULE (HIGHEST PRIORITY):\n' +
          '1. When the operator provides specific words, sentences, facts, apologies, or instructions (e.g. "اعتذر له وقول له إنك في السكة", "قوله البيك أب الساعة 9 قدام البوابة", "I am 5 minutes away"), you MUST translate and express THAT EXACT SPECIFIC MEANING accurately and faithfully.\n' +
          '   - DO NOT invent extra sentences, unrequested apologies, extra promises, or extra booking details (like hotel/driver/price) unless the operator explicitly included them.\n' +
          '   - DO NOT alter numbers, times, locations, or facts, and DO NOT paraphrase creatively to change the meaning.\n' +
          '   - Strip out operator wrapper phrases like "قوله", "قله", "ابعتله", "بالألماني", "رد عليه وقل له", so ONLY the clean customer-facing message appears in `draft`.\n' +
          '   - Translate Egyptian Arabic idioms faithfully (e.g., "في السكة" -> "on the way / unterwegs", "قدام البوابة" -> "in front of the main gate / vor dem Haupteingang", "عشان الزحمة" -> "due to traffic / wegen des Verkehrs").\n' +
          '2. ONLY if the operator provides NO specific message (empty text, OR strictly a bare command like "رد عليه" / "رد عليه بالألماني" with zero message content), read `Full Recent Conversation` and `Latest Customer Message` to write a concise, direct reply answering what the customer just asked.\n' +
          '3. TARGET LANGUAGE RULE: If `targetLanguageOverride` is provided, or if the operator explicitly asks for a language inside their text (e.g. "بالألماني", "in German", "بالإنجليزي", "بالعربي", "بالفرنساوي"), output `draft` in THAT exact language. Otherwise use `Default Thread Language`.';

        const historyText = Array.isArray(conversationHistory)
          ? conversationHistory
              .slice(-15)
              .map((m: { sender?: string; text?: string; timestamp?: string }) =>
                `${m.sender === 'operator' ? 'Operations' : customerName || 'Customer'} (${m.timestamp || ''}): ${m.text || ''}`
              )
              .join('\n')
          : '';

        const bookingDetailsText = bookingContext
          ? JSON.stringify(bookingContext)
          : `Pickup/schedule note: ${pickupInfo || 'N/A'}`;

        const prompt = [
          `Customer Name: ${customerName || 'Guest'}`,
          `Default Thread Language: ${language || 'en'}`,
          `Target Language Override: ${preferredLang}`,
          `Booking Ref: ${bookingRef || 'Inquiry'} | Trip: ${tripTitle || 'Excursion'}`,
          `Live Booking Context (reference only if operator text is empty or asks to use booking details): ${bookingDetailsText}`,
          historyText
            ? `Full Recent Conversation:\n${historyText}`
            : `Latest Customer Message: ${latestMessage || '(none)'}`,
          rawAudio
            ? 'Operator Command: Transcribe audio into `transcript` and follow the strict fidelity rule for `draft`.'
            : trimmedOperatorText
            ? `Exact Operator Message / Command to Deliver Faithfully:\n${trimmedOperatorText}`
            : 'Operator provided empty draft: Generate a concise, direct context-based reply to the customer’s latest message above.',
        ].join('\n\n');

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            hasSpeech: {
              type: Type.BOOLEAN,
              description: 'True for text input or valid spoken speech.',
            },
            transcript: {
              type: Type.STRING,
              description: 'Empty string for text input, or exact audio transcript.',
            },
            draft: {
              type: Type.STRING,
              description: 'The exact customer-facing message in the target language, faithfully matching the operator’s exact meaning.',
            },
            targetLanguage: {
              type: Type.STRING,
              description: 'Uppercase ISO language code of the draft (e.g. DE, EN, AR, FR, NL, RU).',
            },
            operatorNote: {
              type: Type.STRING,
              description: 'Very brief Arabic confirmation note (e.g. تم تجهيز النص بدقة بالألمانية — راجعه واضغط Send).',
            },
          },
          required: ['hasSpeech', 'transcript', 'draft', 'targetLanguage', 'operatorNote'],
        };

        const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
        const contentsPayload = rawAudio
          ? {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: prompt },
              ],
            }
          : prompt;

        let modelUsed = 'gemini-4-hydrogen';
        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: contentsPayload,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
        } catch {
          modelUsed = 'gemini-3.1-flash-lite';
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contentsPayload,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
        }

        const parsed = parseModelJson<{
          hasSpeech?: boolean;
          transcript?: string;
          draft?: string;
          targetLanguage?: string;
          operatorNote?: string;
        }>(response.text, 'Operations chat assistant');

        res.json({
          hasSpeech: parsed.hasSpeech !== false,
          transcript: (parsed.transcript ?? '').trim(),
          draft: (parsed.draft ?? '').trim(),
          targetLanguage: (parsed.targetLanguage ?? preferredLang).toUpperCase(),
          operatorNote: (parsed.operatorNote ?? '').trim(),
          modelUsed,
        });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Assistant request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/translate', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable message translation.',
      });
      return;
    }

    const { text, sourceLang, targetLang = 'ar' } = req.body ?? {};
    const trimmed = String(text ?? '').trim();
    if (!trimmed) {
      res.status(400).json({ error: 'Missing text to translate.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction =
        'You are a literal, high-precision translator for Wasla Travel operations.\n' +
        'Translate the given customer message accurately and naturally into clear Arabic (or requested target language).\n' +
        'CRITICAL RULES:\n' +
        '- Preserve EVERY detail, time, number, hotel name, child age, and question faithfully.\n' +
        '- DO NOT add commentary, greetings, explanations, or extra text.\n' +
        '- Output ONLY the clean translation in the JSON `translation` field.';

      const prompt = [
        `Source Language Hint: ${sourceLang || 'auto'}`,
        `Target Language: ${targetLang === 'ar' ? 'Arabic (Clear natural Arabic)' : targetLang}`,
        `Customer Message:\n${trimmed}`,
      ].join('\n\n');

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          translation: {
            type: Type.STRING,
            description: 'Clean, accurate translation of the customer message only.',
          },
        },
        required: ['translation'],
      };

      const modelUsed = 'gemini-3.1-flash-lite';
      const response = await ai.models.generateContent({
        model: modelUsed,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const parsed = parseModelJson<{ translation?: string }>(response.text, 'Message translator');
      res.json({
        translation: (parsed.translation ?? '').trim(),
        modelUsed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/ads/generate', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable AI ad generation.',
      });
      return;
    }

    const {
      tripTitle,
      destination,
      price,
      duration,
      highlights,
      platform,
      audienceLanguage,
      goal,
      offerNote,
      commissionPerBooking,
    } = req.body ?? {};

    if (!tripTitle || !platform) {
      res.status(400).json({ error: 'Missing trip or platform selection.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction =
        'You are a high-ROI performance marketer for Wasla Travel (waslatravel.com), a local Red Sea & Egypt excursions marketplace in Hurghada, Marsa Alam, Luxor, and Cairo. ' +
        'Write persuasive, conversion-focused ad copy in the requested audienceLanguage (en, de, or ar) that emphasizes local direct pricing (no hotel rep markup), free hotel pickup, verified Egyptian guides, and instant WhatsApp booking. ' +
        'Keep copy authentic, punchy, and tailored to the requested platform. Provide practical audience targeting and budget advice so ad spend stays profitable relative to the commission per booking.';

      const prompt = [
        `Platform: ${platform}`,
        `Audience Language: ${audienceLanguage || 'en'}`,
        `Campaign Goal: ${goal || 'Direct Bookings'}`,
        `Trip: ${tripTitle} (${destination || 'Hurghada'})`,
        `Price: €${price ?? 45} per person | Duration: ${duration || 'Full day'}`,
        `Estimated owner commission per guest: €${commissionPerBooking ?? 7}`,
        `Key Highlights: ${Array.isArray(highlights) ? highlights.join(', ') : highlights || 'Hotel pickup included'}`,
        `Special Offer / Angle: ${offerNote || 'Pay on pickup · Instant WhatsApp confirmation'}`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook: {
                type: Type.STRING,
                description: 'Scroll-stopping opening line or video hook.',
              },
              headline: {
                type: Type.STRING,
                description: 'Short, clickable ad headline (under 60 characters).',
              },
              primaryText: {
                type: Type.STRING,
                description: 'Main persuasive body copy formatted cleanly for the chosen platform.',
              },
              cta: {
                type: Type.STRING,
                description: 'Direct call to action prompting booking or WhatsApp message.',
              },
              targetingTip: {
                type: Type.STRING,
                description: 'Practical audience geo-targeting, radius, and max CPA budget advice for this trip margin.',
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 6 relevant hashtags.',
              },
            },
            required: ['hook', 'headline', 'primaryText', 'cta', 'targetingTip', 'hashtags'],
          },
        },
      });

      const parsed = parseModelJson<Record<string, unknown>>(response.text, 'Ad generation');
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ad generation request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/owner/copilot', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable the AI Executive Copilot.',
      });
      return;
    }

    const {
      mode = 'briefing',
      language = 'ar',
      question = '',
      audioBase64,
      mimeType = 'audio/webm',
      snapshot,
    } = req.body ?? {};
    if (!snapshot) {
      res.status(400).json({ error: 'Missing company snapshot data.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const snapshotText = JSON.stringify(snapshot, null, 2);

      const chatSystemInstruction =
        language === 'ar'
          ? 'أنت المساعد التنفيذي الشخصي (AI Chief of Staff) لمالك شركة Wasla Travel (waslatravel.com) في الغردقة والأقصر والقاهرة ومرسى علم. ' +
            'مواصفات شخصيتك وأسلوبك في الكلام: أنت شاب مصري قاهري، ذكي جداً، سريع البديهة، فطن ولمّاح. ' +
            'اتكلم بالعامية المصرية القاهرية الطبيعية الذكية والسريعة، ادخل في المفيد علطول من غير مقدمات طويلة ولا كلام إنشائي، وخلي ردودك مركزة (من جملتين لـ 4 جمل سريعة وواضحة). ' +
            'استخدم الأرقام الحقيقية من بيانات الشركة اللي قدامك، ونبّه المالك بذكاء لأي حجز عاجل أو شكوى أو فرصة تزود المكسب، ولا تخترع أرقام غير موجودة.'
          : 'You are the AI Chief of Staff for the owner of Wasla Travel (waslatravel.com). ' +
            'Your persona: a smart, quick-witted, sharp young Cairene Egyptian executive partner. ' +
            'Be brisk, direct, street-smart, and profit-focused (2 to 4 crisp sentences), grounded strictly in the live company snapshot.';

      if (mode === 'voice-chat') {
        const rawAudio =
          typeof audioBase64 === 'string'
            ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim()
            : '';
        if (!rawAudio) {
          res.status(400).json({ error: 'Missing recorded voice payload.' });
          return;
        }

        const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
        const voicePrompt =
          language === 'ar'
            ? `استمع إلى التسجيل الصوتي المرفق من مالك الشركة، وحوّل كلامه بدقة إلى نص في الحقل \`transcript\`، ثم اكتب ردك التنفيذي الذكي والسريع في الحقل \`reply\` بناءً على بيانات الشركة الحية التالية:\n${snapshotText}\nإذا كان التسجيل صامتاً تماماً أو مجرد ضوضاء بدون أي كلام بشري واضح، اجعل \`hasSpeech\` بقيمة false واجعل \`transcript\` و \`reply\` نصاً فارغاً.`
            : `Listen to the attached voice recording from the company owner, transcribe their exact words into \`transcript\`, and write your brisk executive reply in \`reply\` grounded in this live company snapshot:\n${snapshotText}\nIf the recording is silent or contains no intelligible speech, set \`hasSpeech\` to false and both \`transcript\` and \`reply\` to empty strings.`;

        const voiceChatSchema = {
          type: Type.OBJECT,
          properties: {
            hasSpeech: {
              type: Type.BOOLEAN,
              description: 'True only if clear human speech was heard in the audio clip.',
            },
            transcript: {
              type: Type.STRING,
              description: 'Exact transcription of what the owner said, or empty string if silent.',
            },
            reply: {
              type: Type.STRING,
              description: 'Your executive reply to the owner question, or empty string if silent.',
            },
          },
          required: ['hasSpeech', 'transcript', 'reply'],
        };

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: voicePrompt },
              ],
            },
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema: voiceChatSchema,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: voicePrompt },
              ],
            },
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: voiceChatSchema,
            },
          });
        }

        const parsed = parseModelJson<{
          hasSpeech?: boolean;
          transcript?: string;
          reply?: string;
        }>(response.text, 'Voice copilot chat');

        res.json({
          hasSpeech: parsed.hasSpeech !== false,
          transcript: (parsed.transcript ?? '').trim(),
          reply: (parsed.reply ?? '').trim(),
        });
        return;
      }

      if (mode === 'transcribe') {
        const rawAudio =
          typeof audioBase64 === 'string'
            ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim()
            : '';
        if (!rawAudio) {
          res.status(400).json({ error: 'Missing recorded voice payload.' });
          return;
        }

        const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
        const transcribePrompt =
          language === 'ar'
            ? 'استمع إلى التسجيل الصوتي وحوّله بدقة إلى نص مكتوب فقط دون إضافة أي تعليق. إذا كان صامتاً اجعل hasSpeech بقيمة false و transcript فارغاً.'
            : 'Listen to the voice clip and transcribe the exact spoken words cleanly into `transcript`. If silent or unintelligible, set `hasSpeech` to false and `transcript` to empty string.';

        const transcribeSchema = {
          type: Type.OBJECT,
          properties: {
            hasSpeech: { type: Type.BOOLEAN },
            transcript: { type: Type.STRING },
          },
          required: ['hasSpeech', 'transcript'],
        };

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: transcribePrompt },
              ],
            },
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: 'application/json',
              responseSchema: transcribeSchema,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: {
              parts: [
                { inlineData: { mimeType: cleanMime, data: rawAudio } },
                { text: transcribePrompt },
              ],
            },
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: transcribeSchema,
            },
          });
        }

        const parsed = parseModelJson<{
          hasSpeech?: boolean;
          transcript?: string;
        }>(response.text, 'Voice transcription');

        res.json({
          hasSpeech: parsed.hasSpeech !== false,
          transcript: (parsed.transcript ?? '').trim(),
        });
        return;
      }

      if (mode === 'chat') {
        if (!String(question).trim()) {
          res.status(400).json({ error: 'Please enter a question for the executive assistant.' });
          return;
        }

        const chatPrompt = [
          `Live Company Snapshot:\n${snapshotText}`,
          `Owner Question:\n${question}`,
        ].join('\n\n');

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: chatPrompt,
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: chatPrompt,
            config: {
              systemInstruction: chatSystemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
        }

        res.json({ reply: (response.text ?? '').trim() });
        return;
      }

      const briefingSystemInstruction =
        language === 'ar'
          ? 'أنت المساعد التنفيذي الشخصي الذكي لإدارة شركة Wasla Travel بالكامل (waslatravel.com). ' +
            'شخصيتك: شاب مصري قاهري، ذكي وسريع وفطن ولمّاح. ' +
            'حلل بيانات الشركة الحية (الحجوزات، الإيرادات، نسبة العمولة، الموردين المعلقين، الشكاوى، المحادثات، والرحلات) وقدم للمالك تقريراً حازماً وسريعاً باللهجة المصرية القاهرية الذكية والمباشرة يشمل: ملخص الموقف، أهم التنبيهات العاجلة، الفرص الذهبية لزيادة المكسب، وخطة تسويق عملية للأسبوع القادم.'
          : 'You are the personal AI Chief of Staff managing Wasla Travel (waslatravel.com) with the persona of a smart, quick-witted, sharp young Cairene Egyptian executive. ' +
            'Analyze the live company snapshot and return a brisk, decisive executive briefing covering company status, critical alerts, high-margin opportunities, and a concrete 7-day marketing plan.';

      const briefingSchema = {
        type: Type.OBJECT,
        properties: {
          executiveSummary: {
            type: Type.STRING,
            description: 'Concise 2-3 sentence summary of current revenue, operations health, and top priority.',
          },
          criticalAlerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                severity: { type: Type.STRING, description: 'high or medium' },
                detail: { type: Type.STRING },
                action: { type: Type.STRING },
              },
              required: ['title', 'severity', 'detail', 'action'],
            },
          },
          growthOpportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedImpact: { type: Type.STRING },
                detail: { type: Type.STRING },
                action: { type: Type.STRING },
              },
              required: ['title', 'estimatedImpact', 'detail', 'action'],
            },
          },
          marketingPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                channel: { type: Type.STRING },
                focusTripOrAngle: { type: Type.STRING },
                weeklyAction: { type: Type.STRING },
                expectedReturn: { type: Type.STRING },
              },
              required: ['channel', 'focusTripOrAngle', 'weeklyAction', 'expectedReturn'],
            },
          },
        },
        required: ['executiveSummary', 'criticalAlerts', 'growthOpportunities', 'marketingPlan'],
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Analyze this live company snapshot and produce the executive briefing:\n${snapshotText}`,
          config: {
            systemInstruction: briefingSystemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: briefingSchema,
          },
        });
      } catch {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Analyze this live company snapshot and produce the executive briefing:\n${snapshotText}`,
          config: {
            systemInstruction: briefingSystemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: briefingSchema,
          },
        });
      }

      const parsed = parseModelJson<Record<string, unknown>>(response.text, 'Executive briefing');
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Executive copilot request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  app.post('/api/owner/transcribe', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable voice input.',
      });
      return;
    }

    const { audioBase64, mimeType = 'audio/webm', language = 'ar' } = req.body ?? {};
    const rawData = typeof audioBase64 === 'string' ? audioBase64.replace(/^data:[^;]+;base64,/, '').trim() : '';
    if (!rawData) {
      res.status(400).json({ error: 'Missing recorded audio payload.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cleanMime = String(mimeType).split(';')[0].trim() || 'audio/webm';
      const promptHint =
        language === 'auto'
          ? 'Transcribe the spoken human voice in this audio clip into its exact spoken language (Egyptian Arabic / العامية المصرية, Standard Arabic, English, or German). If the clip is silent, only background noise, or contains no intelligible speech, set hasSpeech to false and transcript to an empty string. Never invent or guess words.'
          : language === 'ar'
          ? 'حول الكلام المنطوق في هذا التسجيل الصوتي بدقة إلى النص العربي (بالعامية المصرية أو الفصحى كما قيلت) أو الإنجليزية إن نُطقت. إذا كان التسجيل صامتاً أو مجرد ضوضاء بدون كلام واضح، اجعل hasSpeech بقيمة false و transcript نصاً فارغاً تماماً دون تأليف أي جمل.'
          : 'Transcribe the spoken human voice in this audio clip accurately in its spoken language (English, German, or Arabic). If there is no intelligible speech, set hasSpeech to false and transcript to an empty string.';

      const audioPart = {
        inlineData: {
          mimeType: cleanMime,
          data: rawData,
        },
      };

      const transcribeSchema = {
        type: Type.OBJECT,
        properties: {
          hasSpeech: {
            type: Type.BOOLEAN,
            description: 'True only if clear human speech is audible in the recording.',
          },
          transcript: {
            type: Type.STRING,
            description: 'Exact transcription of the spoken words, or empty string if silent/noise.',
          },
        },
        required: ['hasSpeech', 'transcript'],
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts: [audioPart, { text: promptHint }] },
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: transcribeSchema,
          },
        });
      } catch {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: { parts: [audioPart, { text: promptHint }] },
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: transcribeSchema,
          },
        });
      }

      const parsed = parseModelJson<{ hasSpeech?: boolean; transcript?: string }>(
        response.text,
        'Voice transcription'
      );
      const transcript = parsed.hasSpeech === false ? '' : (parsed.transcript ?? '').trim();
      res.json({ transcript });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio transcription failed.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/owner/tts', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable spoken replies.',
      });
      return;
    }

    const { text = '' } = req.body ?? {};
    const cleanedText = String(text)
      .replace(/[#*_`>~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1400);

    if (!cleanedText) {
      res.status(400).json({ error: 'Missing text to synthesize.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanedText,
                  speechMetadata: {
                    style:
                      'Smart, quick-witted, energetic young Cairene Egyptian man speaking natural Cairene Arabic clearly and briskly (شاب مصري قاهري ذكي وسريع وفطن)',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck',
                },
              },
            },
          },
        });
      } catch {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanedText,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck',
                },
              },
            },
          },
        });
      }

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const audioPart = parts.find((p) => p.inlineData?.data);
      const audioData = audioPart?.inlineData?.data;
      if (!audioData) {
        res.status(502).json({ error: 'TTS model returned no audio stream.' });
        return;
      }

      res.json({
        audioBase64: audioData,
        mimeType: audioPart?.inlineData?.mimeType || 'audio/wav',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Voice reply synthesis failed.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/trips/translate', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to enable auto-translation.',
      });
      return;
    }

    const {
      title,
      duration,
      pickup,
      shortDescription,
      fullDescription,
      itinerary,
      historicalFacts,
      galleryCaptions,
      highlights,
      included,
      tips,
      notSuitableFor,
      whatToBring,
      notAllowed,
      knowBeforeYouGo,
      options,
    } = req.body ?? {};
    if (!title || !shortDescription) {
      res.status(400).json({ error: 'Missing trip title or description for translation.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const localizedSchema = {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING },
          ar: { type: Type.STRING },
          de: { type: Type.STRING },
        },
        required: ['en', 'ar', 'de'],
      };

      const systemInstruction =
        'You are a professional multilingual tourism translator for Wasla Travel in Hurghada, Luxor, Cairo, and Marsa Alam. ' +
        'Translate the supplier input (which may be written in Arabic, English, German, or mixed) accurately and naturally into all three languages: ' +
        'English (en), clear modern Arabic (ar), and natural German (de). Preserve numbers, times, places, and tour package details faithfully.';

      const inputPayload = JSON.stringify({
        title,
        duration: duration || '4 hours',
        pickup: pickup || 'Hurghada City included · Outer zones +€10–15/pp',
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        itinerary: Array.isArray(itinerary) ? itinerary : [],
        historicalFacts: Array.isArray(historicalFacts) ? historicalFacts : [],
        galleryCaptions: Array.isArray(galleryCaptions) ? galleryCaptions : [],
        highlights: Array.isArray(highlights) && highlights.length > 0 ? highlights : [shortDescription],
        included: Array.isArray(included) && included.length > 0 ? included : ['Hotel pickup & vetted local guide'],
        tips: Array.isArray(tips) ? tips : [],
        notSuitableFor: Array.isArray(notSuitableFor) ? notSuitableFor : [],
        whatToBring: Array.isArray(whatToBring) ? whatToBring : [],
        notAllowed: Array.isArray(notAllowed) ? notAllowed : [],
        knowBeforeYouGo: Array.isArray(knowBeforeYouGo) ? knowBeforeYouGo : [],
        options: Array.isArray(options) ? options : [],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Translate this tourism listing JSON into en, ar, and de:\n${inputPayload}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: localizedSchema,
              duration: localizedSchema,
              pickup: localizedSchema,
              shortDescription: localizedSchema,
              fullDescription: localizedSchema,
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: localizedSchema,
                    subtitle: localizedSchema,
                    durationOrTime: localizedSchema,
                  },
                  required: ['title'],
                },
              },
              historicalFacts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    era: localizedSchema,
                    metric: localizedSchema,
                    title: localizedSchema,
                    fact: localizedSchema,
                  },
                  required: ['title', 'fact'],
                },
              },
              galleryCaptions: { type: Type.ARRAY, items: localizedSchema },
              highlights: { type: Type.ARRAY, items: localizedSchema },
              included: { type: Type.ARRAY, items: localizedSchema },
              tips: { type: Type.ARRAY, items: localizedSchema },
              notSuitableFor: { type: Type.ARRAY, items: localizedSchema },
              whatToBring: { type: Type.ARRAY, items: localizedSchema },
              notAllowed: { type: Type.ARRAY, items: localizedSchema },
              knowBeforeYouGo: { type: Type.ARRAY, items: localizedSchema },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: localizedSchema,
                    detail: localizedSchema,
                  },
                  required: ['title', 'detail'],
                },
              },
            },
            required: ['name', 'duration', 'pickup', 'shortDescription', 'highlights', 'included', 'options'],
          },
        },
      });

      const parsed = parseModelJson<Record<string, unknown>>(response.text, 'Auto-translation');
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto-translation request failed.';
      res.status(err instanceof SyntaxError ? 502 : 500).json({ error: message });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });

    app.use('/@vite/client', async (req, res, next) => {
      try {
        const result = await vite.transformRequest(req.originalUrl || '/@vite/client');
        if (result?.code) {
          const patched = result.code.replace(
            /reject\(\/\*\s*@__PURE__\s*\*\/\s*new Error\("WebSocket closed without opened\."\)\)/g,
            'resolve()'
          );
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          res.status(200).send(patched);
          return;
        }
      } catch {
        // Fall through to default vite middleware
      }
      next();
    });

    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Wasla Travel server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();



