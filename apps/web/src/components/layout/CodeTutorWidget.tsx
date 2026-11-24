'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/providers';

interface ChatMessage {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  link?: { href: string; label: string };
}

interface CoachReply {
  text: string;
  link?: ChatMessage['link'];
}

function RobotCapIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 5.5 4.5 12l15.5 6.3L35.5 12 20 5.5Z" fill="#A78BFA" stroke="#DDD6FE" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 14v6.2c0 3.2 4.9 5.8 11 5.8s11-2.6 11-5.8V14l-11 4.5L9 14Z" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M35.5 12v8" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20.5v3" stroke="#67E8F9" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="9.5" y="23" width="21" height="14" rx="5" fill="#0E172B" stroke="#67E8F9" strokeWidth="1.5" />
      <path d="M14 30h.1M26 30h.1" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 34h6" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CodeTutorWidget() {
  const { language, tr } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<'rules' | 'ai'>('rules');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const nextId = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcome = tr(
    'Salom! Men CodeHub Ustozman. HTML, CSS yoki JavaScript bo‘yicha savolingizni yozing — ishora va tushuntirish beraman.',
    'Здравствуйте! Я наставник CodeHub. Задайте вопрос по HTML, CSS или JavaScript — я подскажу и объясню.',
    'Hi! I’m CodeHub Coach. Ask me about HTML, CSS, or JavaScript and I’ll offer a hint and explanation.',
  );
  const prompts = [
    tr('HTML nimadan boshlanadi?', 'С чего начать HTML?', 'How do I start with HTML?'),
    tr('CSS xatolarini topish', 'Как найти ошибку в CSS?', 'Help me find a CSS bug'),
    tr('JavaScriptni o‘rganish', 'Как начать JavaScript?', 'How do I learn JavaScript?'),
  ];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: nextId.current++, role: 'assistant', text: welcome }]);
      return;
    }
    if (messages.length === 1 && messages[0].id === 0) {
      setMessages([{ ...messages[0], text: welcome }]);
    }
  }, [language, messages.length, welcome]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const getReply = (rawMessage: string): CoachReply => {
    const message = rawMessage.toLowerCase();
    if (/\bconst\b/.test(message) && /(?:^|[;\n])\s*[a-z_$][\w$]*\s*=(?!=|>)/.test(message.replace(/\bconst\s+[a-z_$][\w$]*\s*=/, ''))) {
      return {
        text: tr(
          'const bilan yaratilgan o‘zgaruvchiga qayta qiymat berib bo‘lmaydi. Qiymat o‘zgarishi kerak bo‘lsa, let dan foydalaning. Masalan: let count = 1; count = 2;.',
          'Переменной, объявленной через const, нельзя присвоить новое значение. Если значение меняется, используйте let. Например: let count = 1; count = 2;.',
          'A const variable cannot be reassigned. Use let when its value needs to change. For example: let count = 1; count = 2;.',
        ),
      };
    }
    if (message.includes('html') || message.includes('teg') || message.includes('тег')) {
      return {
        text: tr(
          'HTML sahifa tuzilishini belgilaydi. Masalan, sarlavha <h1>...</h1>, matn esa <p>...</p> teglari ichida yoziladi. Har bir ochilgan tegni mos yopuvchi teg bilan yoping. Interaktiv muharrirda sinab ko‘ring.',
          'HTML задаёт структуру страницы. Например, заголовок записывается внутри <h1>...</h1>, а абзац — внутри <p>...</p>. Закрывайте каждый открытый тег соответствующим закрывающим тегом. Попробуйте в редакторе урока.',
          'HTML describes page structure. For example, put a heading inside <h1>...</h1> and a paragraph inside <p>...</p>. Close each opening tag with its matching closing tag. Try it in a lesson editor.',
        ),
      };
    }
    if (message.includes('css') || message.includes('rang') || message.includes('color') || message.includes('цвет')) {
      return {
        text: tr(
          'CSS sahifa ko‘rinishini boshqaradi. Masalan, h1 { color: cyan; } sarlavha rangini o‘zgartiradi. Xususiyat va qiymat orasida ikki nuqta, qoidalar atrofida esa { } qavslari bo‘lishini tekshiring.',
          'CSS отвечает за внешний вид страницы. Например, h1 { color: cyan; } меняет цвет заголовка. Проверьте двоеточие между свойством и значением, а также скобки { } вокруг правила.',
          'CSS controls how a page looks. For example, h1 { color: cyan; } changes the heading color. Check for a colon between the property and value, and braces { } around the rule.',
        ),
      };
    }
    if (message.includes('javascript') || message.includes('js') || message.includes('переменн') || message.includes('o‘zgaruvchi') || message.includes('event') || message.includes('функц')) {
      return {
        text: tr(
          'JavaScript sahifaga harakat qo‘shadi. Boshlash uchun o‘zgaruvchilarni (`let`, `const`), shartlarni va funksiyalarni o‘rganing. Qiymati o‘zgaradigan o‘zgaruvchi uchun `let`, o‘zgarmaydigan qiymat uchun `const` ishlating.',
          'JavaScript добавляет странице интерактивность. Начните с переменных (`let`, `const`), условий и функций. Используйте `let` для изменяемых значений и `const` для тех, которые не переназначаются.',
          'JavaScript adds interactivity to a page. Start with variables (`let`, `const`), conditions, and functions. Use `let` for values that change and `const` for values that do not get reassigned.',
        ),
      };
    }
    if (message.includes('kurs') || message.includes('курс') || message.includes('course') || message.includes('boshlash') || message.includes('начать') || message.includes('start')) {
      return {
        text: tr(
          'Boshlash uchun HTML kursini tanlang, keyin CSS va JavaScript’ga o‘ting. Darslarni brauzerda sinab, keyin kichik loyiha yarating.',
          'Начните с курса HTML, затем переходите к CSS и JavaScript. Практикуйтесь в браузере и закрепляйте знания небольшим проектом.',
          'Start with HTML, then move on to CSS and JavaScript. Practice in the browser and reinforce each step with a small project.',
        ),
        link: { href: '/courses', label: tr('Kurslarni ko‘rish', 'Смотреть курсы', 'Explore courses') },
      };
    }
    if (message.includes('mashq') || message.includes('задани') || message.includes('challenge') || message.includes('vazifa')) {
      return {
        text: tr(
          'Kunlik mashqda HTML kodini yozib, natijani tekshirishingiz mumkin. Har kuni yangi topshiriq chiqadi.',
          'В ежедневном задании можно написать HTML-код и проверить результат. Новое задание появляется каждый день.',
          'Try the daily challenge to write HTML and check your result. A new task appears each day.',
        ),
        link: { href: '/challenge', label: tr('Kunlik mashqqa o‘tish', 'Перейти к заданию', 'Open daily challenge') },
      };
    }
    return {
      text: tr(
        'Men hozircha HTML, CSS va JavaScript bo‘yicha keng tarqalgan savollarga javob beraman. Xato haqida so‘rasangiz, kod parchasi yoki brauzerdagi xato matnini ham yuboring.',
        'Пока я отвечаю на типичные вопросы по HTML, CSS и JavaScript. Если ищете ошибку, отправьте фрагмент кода или текст ошибки из браузера.',
        'I can currently help with common HTML, CSS, and JavaScript questions. For debugging, include a short code snippet or the exact browser error.',
      ),
    };
  };

  const sendMessage = async (value: string) => {
    const text = value.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError('');
    try {
      const settingsResponse = await fetch('/api/ai/tutor', { cache: 'no-store' });
      if (!settingsResponse.ok) throw new Error(tr(
        'AI Ustoz sozlamalarini yuklab bo‘lmadi. Keyinroq qayta urinib ko‘ring.',
        'Не удалось загрузить настройки наставника. Попробуйте позже.',
        'Could not load tutor settings. Please try again later.',
      ));
      const settings = await settingsResponse.json() as { mode: 'rules' | 'ai' };
      setMode(settings.mode);

      let reply: CoachReply;
      if (settings.mode === 'ai') {
        const response = await fetch('/api/ai/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language,
            history: messages
              .filter(message => message.role === 'user' || message.role === 'assistant')
              .map(({ role, text: messageText }) => ({ role, text: messageText })),
          }),
        });
        const result = await response.json() as { reply?: string; error?: string };
        if (!response.ok || !result.reply) {
          throw new Error(result.error || tr(
            'AI Ustoz javob bera olmadi. Keyinroq qayta urinib ko‘ring.',
            'Наставник не смог ответить. Попробуйте позже.',
            'The tutor could not answer. Please try again later.',
          ));
        }
        reply = { text: result.reply };
      } else {
        reply = getReply(text);
      }

      setMessages(current => [
        ...current,
        { id: nextId.current++, role: 'user', text },
        { id: nextId.current++, role: 'assistant', text: reply.text, link: reply.link },
      ]);
      setInput('');
    } catch (error) {
      setSendError(error instanceof Error ? error.message : tr(
        'Xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.',
        'Произошла ошибка. Попробуйте позже.',
        'Something went wrong. Please try again later.',
      ));
    } finally {
      setSending(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[70] flex flex-col items-end gap-3 sm:right-6">
      {open && (
        <section
          id="code-tutor-dialog"
          role="dialog"
          aria-modal="false"
          aria-labelledby="code-tutor-title"
          className="flex max-h-[min(34rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/[0.98] shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-fade-in"
        >
          <header className="flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-violet-500/[0.13] to-cyan-400/[0.06] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08]">
                <RobotCapIcon />
              </span>
              <div>
                <h2 id="code-tutor-title" className="text-sm font-semibold text-white">{tr('AI Ustoz', 'AI-наставник', 'AI Coach')}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {tr('Yordam berishga tayyor', 'Готов помочь', 'Ready to help')}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={tr('Chatni yopish', 'Закрыть чат', 'Close chat')} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </button>
          </header>

          <div ref={listRef} className="min-h-36 flex-1 space-y-3 overflow-y-auto p-3.5" aria-live="polite">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-5 ${message.role === 'user' ? 'rounded-br-md bg-violet-500/20 text-violet-50' : 'rounded-bl-md border border-white/[0.07] bg-white/[0.04] text-slate-200'}`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.link && <Link href={message.link.href} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-1 font-semibold text-neon-cyan hover:underline">{message.link.label} <span aria-hidden="true">→</span></Link>}
                </div>
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-3.5 py-2.5">
              {prompts.map(prompt => (
                <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="rounded-full border border-white/[0.1] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:border-violet-300/30 hover:text-white">
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/[0.08] p-3">
            <label className="sr-only" htmlFor="code-tutor-message">{tr('Savolingiz', 'Ваш вопрос', 'Your question')}</label>
            <input
              ref={inputRef}
              id="code-tutor-message"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder={tr('Savolingizni yozing…', 'Напишите вопрос…', 'Ask a question…')}
              maxLength={500}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-[#060914] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-violet-300/40"
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label={sending ? tr('Javob kutilmoqda', 'Ожидание ответа', 'Waiting for reply') : tr('Yuborish', 'Отправить', 'Send')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10 17 3l-4.5 14-2.6-5.2L3 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m9.9 11.8 3.2-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </form>
          {sendError && <p role="alert" className="px-3 pb-2 text-center text-[10px] text-rose-300">{sendError}</p>}
          <p className="px-3 pb-2 text-center text-[9px] text-slate-600">
            {mode === 'ai'
              ? tr('Haqiqiy AI · savollar Gemini yoki OpenAI xizmatiga yuboriladi', 'Настоящий ИИ · вопросы отправляются в Gemini или OpenAI', 'Real AI · questions are sent to Gemini or OpenAI')
              : tr('Oldindan belgilangan qoidalar · API kaliti ishlatilmaydi', 'Готовые правила · без API-ключа', 'Predefined rules · no API key used')}
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-label={open ? tr('Chatni yopish', 'Закрыть чат', 'Close chat') : tr('AI Ustoz bilan suhbat', 'Открыть чат с наставником', 'Chat with AI Coach')}
        aria-expanded={open}
        aria-controls="code-tutor-dialog"
        className="group flex items-center gap-2 rounded-full border border-violet-300/25 bg-[#11152a]/95 py-2 pl-2 pr-4 text-xs font-semibold text-white shadow-[0_12px_40px_rgba(91,56,180,0.35)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:shadow-[0_14px_44px_rgba(91,56,180,0.48)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-400/10 ring-1 ring-white/10 transition-transform group-hover:scale-105">
          <RobotCapIcon />
        </span>
        <span>{tr('AI Ustoz', 'AI-наставник', 'AI Coach')}</span>
        <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" aria-hidden="true" />
      </button>
    </div>
  );
}
