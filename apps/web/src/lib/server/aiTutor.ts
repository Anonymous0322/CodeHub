import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Provider = 'gemini' | 'openai';
type TutorMode = 'rules' | 'ai';

interface EncryptedKey {
  ciphertext: string | null;
  iv: string | null;
  tag: string | null;
}

export interface AiTutorSettings {
  id: string;
  mode: TutorMode;
  gemini_key_ciphertext: string | null;
  gemini_key_iv: string | null;
  gemini_key_tag: string | null;
  openai_key_ciphertext: string | null;
  openai_key_iv: string | null;
  openai_key_tag: string | null;
}

let adminClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

function getAdminClient() {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server credentials are not configured.');
  }
  adminClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

export function getServiceRoleClient() {
  return getAdminClient();
}

function getPublicClient() {
  if (publicClient) return publicClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase public credentials are not configured.');
  }
  publicClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return publicClient;
}

function getEncryptionKey() {
  const value = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error('AI_SETTINGS_ENCRYPTION_KEY must be a 64-character hexadecimal key.');
  }
  return Buffer.from(value, 'hex');
}

export function encryptApiKey(apiKey: string): EncryptedKey {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  };
}

export function decryptApiKey(encrypted: EncryptedKey): string | null {
  if (!encrypted.ciphertext || !encrypted.iv || !encrypted.tag) return null;
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(encrypted.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

export function publicSettings(settings: AiTutorSettings | null) {
  return {
    mode: settings?.mode ?? 'rules',
    hasGeminiKey: Boolean(settings?.gemini_key_ciphertext),
    hasOpenAiKey: Boolean(settings?.openai_key_ciphertext),
  } as const;
}

export async function getAiTutorSettings() {
  const { data, error } = await getAdminClient()
    .from('ai_tutor_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();
  if (error) throw error;
  return data as AiTutorSettings | null;
}

export async function getPublicAiTutorSettings() {
  const { data, error } = await getPublicClient().rpc('get_public_ai_tutor_settings');
  if (error) throw error;
  return data as ReturnType<typeof publicSettings>;
}

export async function requireAdministrator(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: 'Tizimga kiring va qayta urinib ko‘ring.', status: 401 } as const;

  const supabase = getAdminClient();
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData.user) {
    return { error: 'Kirish muddati tugagan. Qayta tizimga kiring.', status: 401 } as const;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role,status')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile || profile.status !== 'active' || (profile.role !== 'creator' && profile.role !== 'admin')) {
    return { error: 'Bu sozlamani o‘zgartirish uchun administrator huquqi kerak.', status: 403 } as const;
  }
  return { userId: userData.user.id } as const;
}

export async function allowTutorRequest(request: Request) {
  const key = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (!key || !/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('AI_SETTINGS_ENCRYPTION_KEY must be a 64-character hexadecimal key.');
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const clientKey = createHmac('sha256', Buffer.from(key, 'hex')).update(ip).digest('hex');
  const { data, error } = await getAdminClient().rpc('consume_ai_tutor_rate_limit', {
    requested_client_key: clientKey,
  });
  if (error) throw error;
  return data === true;
}

export function decryptProviderKey(settings: AiTutorSettings, provider: Provider) {
  const prefix = provider === 'gemini' ? 'gemini' : 'openai';
  return decryptApiKey({
    ciphertext: settings[`${prefix}_key_ciphertext`],
    iv: settings[`${prefix}_key_iv`],
    tag: settings[`${prefix}_key_tag`],
  });
}
