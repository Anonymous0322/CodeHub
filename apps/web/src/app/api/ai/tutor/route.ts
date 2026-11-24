import { NextResponse } from 'next/server';
import {
  AiTutorSettings,
  allowTutorRequest,
  decryptProviderKey,
  encryptApiKey,
  getAiTutorSettings,
  getPublicAiTutorSettings,
  getServiceRoleClient,
  publicSettings,
  requireAdministrator,
} from '@/lib/server/aiTutor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Provider = 'gemini' | 'openai';
type ChatMessage = { role: 'user' | 'assistant'; text: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<ChatMessage>;
  return (message.role === 'user' || message.role === 'assistant')
    && typeof message.text === 'string'
    && message.text.length <= 500;
}

function keyColumns(provider: Provider) {
  return provider === 'gemini'
    ? ['gemini_key_ciphertext', 'gemini_key_iv', 'gemini_key_tag'] as const
    : ['openai_key_ciphertext', 'openai_key_iv', 'openai_key_tag'] as const;
}

function applyKeyChange(
  row: AiTutorSettings,
  provider: Provider,
  value: unknown,
  clear: unknown,
): string | null {
  const [ciphertextField, ivField, tagField] = keyColumns(provider);
  if (typeof clear !== 'undefined' && typeof clear !== 'boolean') {
    return `${provider} kalitini o‘chirish sozlamasi noto‘g‘ri.`;
  }
  if (clear === true) {
    if (typeof value === 'string' && value.trim()) {
      return `Yangi ${provider} kalitini kiritish yoki mavjud kalitni o‘chirishdan birini tanlang.`;
    }
    row[ciphertextField] = null;
    row[ivField] = null;
    row[tagField] = null;
    return null;
  }
  if (typeof value === 'undefined' || value === '') return null;
  if (typeof value !== 'string' || value.length > 500) {
    return `${provider} API kaliti 500 belgidan oshmasligi kerak.`;
  }
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;
  const encrypted = encryptApiKey(trimmedValue);
  row[ciphertextField] = encrypted.ciphertext;
  row[ivField] = encrypted.iv;
  row[tagField] = encrypted.tag;
  return null;
}

export async function GET() {
  try {
    return NextResponse.json(await getPublicAiTutorSettings(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Could not load public AI tutor settings.', error);
    return NextResponse.json({ error: 'AI Ustoz sozlamalarini yuklab bo‘lmadi.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const authorization = await requireAdministrator(request);
    if ('error' in authorization) {
      return NextResponse.json({ error: authorization.error }, { status: authorization.status });
    }

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'So‘rov ma’lumotlari noto‘g‘ri.' }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'So‘rov ma’lumotlari noto‘g‘ri.' }, { status: 400 });
    }
    if (body.mode !== 'rules' && body.mode !== 'ai') {
      return NextResponse.json({ error: 'AI Ustoz rejimi noto‘g‘ri tanlangan.' }, { status: 400 });
    }

    const current = await getAiTutorSettings();
    const row: AiTutorSettings = current ?? {
      id: 'default',
      mode: 'rules',
      gemini_key_ciphertext: null,
      gemini_key_iv: null,
      gemini_key_tag: null,
      openai_key_ciphertext: null,
      openai_key_iv: null,
      openai_key_tag: null,
    };
    const geminiError = applyKeyChange(row, 'gemini', body.geminiApiKey, body.clearGeminiKey);
    const openAiError = applyKeyChange(row, 'openai', body.openaiApiKey, body.clearOpenAiKey);
    if (geminiError || openAiError) {
      return NextResponse.json({ error: geminiError ?? openAiError }, { status: 400 });
    }

    if (body.mode === 'ai' && !row.gemini_key_ciphertext && !row.openai_key_ciphertext) {
      return NextResponse.json(
        { error: 'Haqiqiy AI rejimi uchun avval Gemini yoki OpenAI API kalitini saqlang.' },
        { status: 400 },
      );
    }

    const { error } = await getServiceRoleClient()
      .from('ai_tutor_settings')
      .upsert({
        ...row,
        mode: body.mode,
        updated_by: authorization.userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    if (error) throw error;
    return NextResponse.json(publicSettings({ ...row, mode: body.mode }));
  } catch (error) {
    console.error('Could not save AI tutor settings.', error);
    return NextResponse.json({ error: 'AI Ustoz sozlamalarini saqlab bo‘lmadi. Server sozlamalarini tekshiring.' }, { status: 500 });
  }
}

function getProviderError(status: number) {
  return status === 429 || (status >= 500 && status <= 599);
}

async function askGemini(apiKey: string, messages: ChatMessage[], language: string) {
  const contents = messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.text }],
  }));
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: `You are CodeHub's programming tutor. Explain clearly and accurately to a beginner. Focus on HTML, CSS, JavaScript and learning programming. Answer in ${language}. When answering in Uzbek, use CodeHub's Uzbek Latin orthography: write Oʻ/oʻ as Ö/ö, Gʻ/gʻ as Ğ/ğ, sh as Ş/ş, and ch as Ç/ç. Do not use Uzbek Cyrillic. Keep answers concise. Never claim to run code.`,
          }],
        },
        contents,
        generationConfig: { maxOutputTokens: 700, temperature: 0.6 },
      }),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
    },
  );
  if (!response.ok) return { status: response.status, text: null };
  const result = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = result.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim();
  return { status: response.status, text: text || null };
}

async function askOpenAi(apiKey: string, messages: ChatMessage[], language: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are CodeHub's programming tutor. Explain clearly and accurately to a beginner. Focus on HTML, CSS, JavaScript and learning programming. Answer in ${language}. When answering in Uzbek, use CodeHub's Uzbek Latin orthography: write Oʻ/oʻ as Ö/ö, Gʻ/gʻ as Ğ/ğ, sh as Ş/ş, and ch as Ç/ç. Do not use Uzbek Cyrillic. Keep answers concise. Never claim to run code.`,
        },
        ...messages,
      ],
      max_tokens: 700,
      temperature: 0.6,
    }),
    signal: AbortSignal.timeout(20000),
    cache: 'no-store',
  });
  if (!response.ok) return { status: response.status, text: null };
  const result = await response.json() as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const text = result.choices?.[0]?.message?.content?.trim();
  return { status: response.status, text: text || null };
}

export async function POST(request: Request) {
  try {
    let body: { message?: unknown; language?: unknown; history?: unknown };
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Savol ma’lumotlari noto‘g‘ri.' }, { status: 400 });
      }
      body = parsed as typeof body;
    } catch {
      return NextResponse.json({ error: 'Savol ma’lumotlari noto‘g‘ri.' }, { status: 400 });
    }

    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 500) {
      return NextResponse.json({ error: 'Savol 1 dan 500 tagacha belgidan iborat bo‘lishi kerak.' }, { status: 400 });
    }
    const language = body.language === 'ru' ? 'Russian' : body.language === 'en' ? 'English' : 'Uzbek';
    const history = Array.isArray(body.history)
      ? body.history.slice(-8).filter(isChatMessage)
      : [];
    const messages = [...history, { role: 'user' as const, text: body.message.trim() }];

    const settings = await getAiTutorSettings();
    if (!settings || settings.mode !== 'ai') {
      return NextResponse.json({ error: 'Haqiqiy AI rejimi hozir yoqilmagan.' }, { status: 409 });
    }
    if (!await allowTutorRequest(request)) {
      return NextResponse.json({ error: 'Juda ko‘p so‘rov yuborildi. Bir daqiqadan so‘ng qayta urinib ko‘ring.' }, { status: 429 });
    }

    const providers: Provider[] = [];
    if (settings.gemini_key_ciphertext) providers.push('gemini');
    if (settings.openai_key_ciphertext) providers.push('openai');
    const failures: number[] = [];

    for (const provider of providers) {
      const apiKey = decryptProviderKey(settings, provider);
      if (!apiKey) continue;
      const result = provider === 'gemini'
        ? await askGemini(apiKey, messages, language)
        : await askOpenAi(apiKey, messages, language);
      if (result.text) return NextResponse.json({ reply: result.text, provider });
      failures.push(result.status);
      if (!getProviderError(result.status)) {
        console.error(`AI tutor provider ${provider} returned HTTP ${result.status}.`);
        return NextResponse.json(
          { error: 'AI xizmati so‘rovni qabul qilmadi. API kalitini va xizmat sozlamalarini tekshiring.' },
          { status: 502 },
        );
      }
    }

    if (failures.length > 0) {
      return NextResponse.json(
        { error: 'Gemini va OpenAI hozir limitga yetgan yoki vaqtincha ishlamayapti. Keyinroq qayta urinib ko‘ring.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'Ishlaydigan AI API kaliti topilmadi.' }, { status: 503 });
  } catch (error) {
    console.error('AI tutor request failed.', error);
    return NextResponse.json({ error: 'AI Ustoz hozir javob bera olmadi. Keyinroq qayta urinib ko‘ring.' }, { status: 500 });
  }
}
