'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/components/providers';
import { getSupabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const courses = useCourseStore(state => state.courses);
  const syncError = useCourseStore(state => state.syncError);
  const coursesInitialized = useCourseStore(state => state.initialized);
  const { currentUser } = useAuthStore();
  const { tr } = useI18n();
  const [mode, setMode] = useState<'rules' | 'ai'>('rules');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [clearGeminiKey, setClearGeminiKey] = useState(false);
  const [clearOpenAiKey, setClearOpenAiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/ai/tutor', { cache: 'no-store' })
      .then(async response => {
        const result = await response.json() as {
          mode?: 'rules' | 'ai';
          hasGeminiKey?: boolean;
          hasOpenAiKey?: boolean;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || 'AI sozlamalarini yuklab bo‘lmadi.');
        if (!active) return;
        setMode(result.mode === 'ai' ? 'ai' : 'rules');
        setHasGeminiKey(Boolean(result.hasGeminiKey));
        setHasOpenAiKey(Boolean(result.hasOpenAiKey));
      })
      .catch(error => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'AI sozlamalarini yuklab bo‘lmadi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const saveAiSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { data, error: sessionError } = await getSupabase().auth.getSession();
      if (sessionError) throw sessionError;
      const token = data.session?.access_token;
      if (!token) throw new Error(tr('Sozlamani o‘zgartirish uchun qayta tizimga kiring.', 'Войдите снова, чтобы изменить настройки.', 'Sign in again to change these settings.'));

      const response = await fetch('/api/ai/tutor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode,
          geminiApiKey,
          openaiApiKey: openAiApiKey,
          clearGeminiKey,
          clearOpenAiKey: clearOpenAiKey,
        }),
      });
      const result = await response.json() as {
        mode?: 'rules' | 'ai';
        hasGeminiKey?: boolean;
        hasOpenAiKey?: boolean;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || tr('AI sozlamalarini saqlab bo‘lmadi.', 'Не удалось сохранить настройки ИИ.', 'Could not save AI settings.'));

      setMode(result.mode === 'ai' ? 'ai' : 'rules');
      setHasGeminiKey(Boolean(result.hasGeminiKey));
      setHasOpenAiKey(Boolean(result.hasOpenAiKey));
      setGeminiApiKey('');
      setOpenAiApiKey('');
      setClearGeminiKey(false);
      setClearOpenAiKey(false);
      setSuccessMessage(tr('AI Ustoz sozlamalari saqlandi.', 'Настройки наставника сохранены.', 'AI tutor settings saved.'));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : tr('AI sozlamalarini saqlab bo‘lmadi.', 'Не удалось сохранить настройки ИИ.', 'Could not save AI settings.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-white/10">
        <h1 className="font-[Space_Grotesk] text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <span>⚙️</span> {tr('Tizim sozlamalari', 'Настройки системы', 'System settings')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {tr('CodeHub platformasi va ma’lumotlar bazasi holati.', 'Состояние платформы CodeHub и базы данных.', 'CodeHub platform and database status.')}
        </p>
      </div>

      {/* System info */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0a0f24]">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <span>ℹ️</span> {tr('Tizim holati', 'Состояние системы', 'System status')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 block mb-1">{tr('Platforma:', 'Платформа:', 'Platform:')}</span>
            <span className="text-white font-mono font-bold">CodeHub</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 block mb-1">{tr('Boşqaruvçi:', 'Администратор:', 'Administrator:')}</span>
            <span className="text-neon-cyan font-mono font-bold">{currentUser?.name} ({currentUser?.role?.toUpperCase()})</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 block mb-1">{tr('Faol kurslar:', 'Активные курсы:', 'Active courses:')}</span>
            <span className="text-emerald-400 font-mono font-bold">{courses.filter(course => course.isActive).length}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 block mb-1">{tr('Ma’lumotlar bazasi:', 'База данных:', 'Database:')}</span>
            <span className={`font-mono font-bold ${syncError ? 'text-red-300' : 'text-purple-300'}`}>{syncError ? tr('Ulaniş xatosi', 'Ошибка подключения', 'Connection error') : coursesInitialized ? tr('Supabase bilan ulangan', 'Подключено к Supabase', 'Connected to Supabase') : tr('Supabase’ga ulanmoqda...', 'Подключение к Supabase...', 'Connecting to Supabase...')}</span>
          </div>
        </div>
      </div>

      <form onSubmit={saveAiSettings} className="space-y-5 rounded-2xl border border-violet-400/20 bg-[#0a0f24] p-5 sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <span>🤖</span> {tr('AI Ustoz boshqaruvi', 'Управление AI-наставником', 'AI tutor controls')}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {tr(
              'AI Ustozning ishlash rejimini tanlang. API kalitlari serverda shifrlangan holda saqlanadi.',
              'Выберите режим наставника. API-ключи хранятся на сервере в зашифрованном виде.',
              'Choose how the tutor works. API keys are encrypted and stored on the server.',
            )}
          </p>
        </div>

        <fieldset className="grid gap-3 sm:grid-cols-2" disabled={loading || saving}>
          <legend className="sr-only">{tr('AI Ustoz rejimi', 'Режим AI-наставника', 'AI tutor mode')}</legend>
          <label className={`cursor-pointer rounded-xl border p-4 transition-colors ${mode === 'rules' ? 'border-cyan-400/50 bg-cyan-400/[0.08]' : 'border-white/10 bg-white/[0.02]'}`}>
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <input type="radio" name="ai-tutor-mode" value="rules" checked={mode === 'rules'} onChange={() => setMode('rules')} />
              {tr('1-rejim: tayyor qoidalar', 'Режим 1: готовые правила', 'Mode 1: predefined rules')}
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-400">
              {tr('API kaliti kerak emas. Oldindan yozilgan qoidalar asosida javob beradi.', 'API-ключ не нужен. Ответы формируются по заранее заданным правилам.', 'No API key needed. Replies follow predefined rules.')}
            </span>
          </label>
          <label className={`cursor-pointer rounded-xl border p-4 transition-colors ${mode === 'ai' ? 'border-violet-400/50 bg-violet-400/[0.08]' : 'border-white/10 bg-white/[0.02]'}`}>
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <input type="radio" name="ai-tutor-mode" value="ai" checked={mode === 'ai'} onChange={() => setMode('ai')} />
              {tr('2-rejim: haqiqiy AI', 'Режим 2: настоящий ИИ', 'Mode 2: real AI')}
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-400">
              {tr('Ikkala kalit ham saqlansa, Gemini avval sinab ko‘riladi; limiti tugasa OpenAI ishlaydi. Har yangi savolda Gemini qayta sinab ko‘riladi.', 'Если сохранены оба ключа, сначала используется Gemini; при исчерпании лимита — OpenAI. Для каждого нового вопроса Gemini проверяется снова.', 'If both keys are saved, Gemini is tried first; OpenAI takes over when its limit is reached. Gemini is retried for every new question.')}
            </span>
          </label>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="gemini-api-key" className="text-sm font-semibold text-white">Google Gemini</label>
              <span className={`text-[10px] ${hasGeminiKey && !clearGeminiKey ? 'text-emerald-300' : 'text-slate-500'}`}>
                {hasGeminiKey && !clearGeminiKey ? tr('Kalit saqlangan', 'Ключ сохранён', 'Key saved') : tr('Kalit kiritilmagan', 'Ключ не добавлен', 'No key added')}
              </span>
            </div>
            <input
              id="gemini-api-key"
              type="password"
              autoComplete="new-password"
              maxLength={500}
              value={geminiApiKey}
              onChange={event => { setGeminiApiKey(event.target.value); setClearGeminiKey(false); }}
              placeholder={hasGeminiKey ? tr('Yangi kalit kiritish uchun yozing', 'Введите новый ключ для замены', 'Enter a new key to replace it') : 'Gemini API key'}
              className="w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50"
            />
            {hasGeminiKey && (
              <label className="flex items-center gap-2 text-[11px] text-slate-400">
                <input type="checkbox" checked={clearGeminiKey} onChange={event => { setClearGeminiKey(event.target.checked); setGeminiApiKey(''); }} />
                {tr('Saqlangan Gemini kalitini o‘chirish', 'Удалить сохранённый ключ Gemini', 'Remove saved Gemini key')}
              </label>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="openai-api-key" className="text-sm font-semibold text-white">OpenAI</label>
              <span className={`text-[10px] ${hasOpenAiKey && !clearOpenAiKey ? 'text-emerald-300' : 'text-slate-500'}`}>
                {hasOpenAiKey && !clearOpenAiKey ? tr('Kalit saqlangan', 'Ключ сохранён', 'Key saved') : tr('Kalit kiritilmagan', 'Ключ не добавлен', 'No key added')}
              </span>
            </div>
            <input
              id="openai-api-key"
              type="password"
              autoComplete="new-password"
              maxLength={500}
              value={openAiApiKey}
              onChange={event => { setOpenAiApiKey(event.target.value); setClearOpenAiKey(false); }}
              placeholder={hasOpenAiKey ? tr('Yangi kalit kiritish uchun yozing', 'Введите новый ключ для замены', 'Enter a new key to replace it') : 'OpenAI API key'}
              className="w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50"
            />
            {hasOpenAiKey && (
              <label className="flex items-center gap-2 text-[11px] text-slate-400">
                <input type="checkbox" checked={clearOpenAiKey} onChange={event => { setClearOpenAiKey(event.target.checked); setOpenAiApiKey(''); }} />
                {tr('Saqlangan OpenAI kalitini o‘chirish', 'Удалить сохранённый ключ OpenAI', 'Remove saved OpenAI key')}
              </label>
            )}
          </div>
        </div>

        <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.05] p-3 text-[11px] leading-5 text-amber-100/80">
          {tr(
            'Haqiqiy AI rejimida foydalanuvchi savollari Gemini yoki OpenAI’ga uzatiladi va API tarifiga qarab haq olinishi mumkin. Kalitlar qayta ko‘rsatilmaydi; kalitni almashtirish uchun yangisini kiriting.',
            'В режиме настоящего ИИ вопросы пользователей отправляются в Gemini или OpenAI и могут тарифицироваться по условиям API. Сохранённые ключи повторно не показываются; для замены введите новый.',
            'In real-AI mode, user questions are sent to Gemini or OpenAI and may incur API charges. Saved keys are never displayed again; enter a new key to replace one.',
          )}
        </p>

        {errorMessage && <p role="alert" className="text-xs text-rose-300">{errorMessage}</p>}
        {successMessage && <p role="status" className="text-xs text-emerald-300">{successMessage}</p>}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">
            {loading
              ? tr('Sozlamalar yuklanmoqda...', 'Загрузка настроек...', 'Loading settings...')
              : tr('Holat faqat kalit bor-yo‘qligini ko‘rsatadi; kalitning o‘zi ochilmaydi.', 'Показывается только наличие ключа, сам ключ не раскрывается.', 'Only whether a key exists is shown; the key itself is never revealed.')}
          </p>
          <button type="submit" disabled={loading || saving} className="min-h-11 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? tr('Saqlanmoqda...', 'Сохранение...', 'Saving...') : tr('AI sozlamalarini saqlash', 'Сохранить настройки ИИ', 'Save AI settings')}
          </button>
        </div>
      </form>
    </div>
  );
}
