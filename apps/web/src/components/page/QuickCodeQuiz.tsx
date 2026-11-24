'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/components/providers';

interface QuestionCopy {
  prompt: string;
  options: string[];
  explanation: string;
}

interface CodeQuestion {
  code: string;
  answer: number;
  uz: QuestionCopy;
  ru: QuestionCopy;
  en: QuestionCopy;
}

const questions: CodeQuestion[] = [
  {
    code: '<p>CodeHub</p>',
    answer: 0,
    uz: {
      prompt: 'HTML kodida nima xato?',
      options: ['Yopuvchi tegda / belgisi yo‘q', 'p tegi matn uchun ishlatilmaydi', 'Matnda CodeHub yozish mumkin emas'],
      explanation: 'Yopuvchi teg ochiluvchi tegga o‘xshaydi, faqat teg nomidan oldin / belgisi yoziladi: </p>.',
    },
    ru: {
      prompt: 'Что не так с HTML-кодом?',
      options: ['В закрывающем теге нет символа /', 'Тег p нельзя использовать для текста', 'Нельзя писать CodeHub внутри текста'],
      explanation: 'Закрывающий тег похож на открывающий, но перед его именем ставится символ /: </p>.',
    },
    en: {
      prompt: 'What is wrong with this HTML?',
      options: ['The closing tag is missing /', 'The p tag cannot contain text', 'CodeHub cannot appear in text'],
      explanation: 'A closing tag uses the same name as its opening tag, with a / before the name: </p>.',
    },
  },
  {
    code: '.title {\n  text-colour: cyan;\n}',
    answer: 1,
    uz: {
      prompt: 'CSS da matn rangini o‘zgartiradigan to‘g‘ri xususiyat qaysi?',
      options: ['text-colour', 'color', 'font-color'],
      explanation: 'CSS da matn rangi color xususiyati bilan belgilanadi. Masalan: color: cyan;.',
    },
    ru: {
      prompt: 'Какое свойство CSS задаёт цвет текста?',
      options: ['text-colour', 'color', 'font-color'],
      explanation: 'Цвет текста в CSS задаётся свойством color. Например: color: cyan;.',
    },
    en: {
      prompt: 'Which CSS property changes the text color?',
      options: ['text-colour', 'color', 'font-color'],
      explanation: 'CSS uses the color property to set text color. For example: color: cyan;.',
    },
  },
  {
    code: 'let projects = 1;\nprojects = 2;',
    answer: 0,
    uz: {
      prompt: 'Qiymati keyin o‘zgaradigan o‘zgaruvchi uchun qaysi kalit so‘z ishlatilgan?',
      options: ['let', 'const', 'return'],
      explanation: 'let bilan e’lon qilingan qiymatni keyin o‘zgartirish mumkin. const esa qayta qiymat berilmaydigan o‘zgaruvchi uchun ishlatiladi.',
    },
    ru: {
      prompt: 'Какое ключевое слово использовано для изменяемой переменной?',
      options: ['let', 'const', 'return'],
      explanation: 'Значение переменной, объявленной через let, можно изменить. const используют, когда переменной не нужно присваивать новое значение.',
    },
    en: {
      prompt: 'Which keyword declares a variable whose value can change?',
      options: ['let', 'const', 'return'],
      explanation: 'A variable declared with let can be reassigned. Use const when you do not need to assign it a new value.',
    },
  },
] as const;

export function QuickCodeQuiz() {
  const { language, tr } = useI18n();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const complete = questionIndex >= questions.length;
  const question = questions[Math.min(questionIndex, questions.length - 1)];
  const copy = question[language];

  const reset = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  };

  const selectAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === question.answer) setScore(current => current + 1);
  };

  const continueQuiz = () => {
    setQuestionIndex(current => current + 1);
    setSelectedAnswer(null);
  };

  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] bg-[#090d1b] py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_50%,rgba(34,211,238,0.08),transparent_36%),radial-gradient(ellipse_at_90%_15%,rgba(139,92,246,0.1),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-[1220px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/[0.07] px-3 py-1.5 text-[10px] font-semibold text-neon-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan motion-safe:animate-pulse" aria-hidden="true" />
            {tr('60 soniyalik kod sinovi', 'Код за 60 секунд', '60-second code check')}
          </div>
          <h2 className="mt-4 max-w-md font-[Space_Grotesk] text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {tr('Xatoni toping. Bilimingizni mustahkamlang.', 'Найдите ошибку. Закрепите знания.', 'Spot the bug. Lock in what you learn.')}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            {tr('Uchta qisqa savolga javob bering. Har javobdan keyin nima uchunligini bilib oling — ro‘yxatdan o‘tish shart emas.', 'Ответьте на три коротких вопроса. После каждого узнайте почему — регистрация не нужна.', 'Answer three quick questions and learn why each answer is right. No account needed.')}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] text-slate-400">
            {[tr('HTML', 'HTML', 'HTML'), tr('CSS', 'CSS', 'CSS'), tr('JavaScript', 'JavaScript', 'JavaScript')].map(topic => (
              <span key={topic} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">{topic}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1222]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-6">
          {!complete ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-300">{tr('Savol', 'Вопрос', 'Question')} {questionIndex + 1} <span className="text-slate-500">/ {questions.length}</span></p>
                <div className="flex gap-1.5" aria-label={`${questionIndex + 1} / ${questions.length}`}>
                  {questions.map((item, index) => (
                    <span key={item.code} className={`h-1.5 w-8 rounded-full ${index <= questionIndex ? 'bg-neon-cyan' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#060914] p-4 font-mono text-xs leading-6 text-cyan-100 sm:text-sm"><code>{question.code}</code></pre>
              <h3 className="mt-4 text-sm font-semibold leading-6 text-white sm:text-base">{copy.prompt}</h3>
              <div className="mt-3 grid gap-2">
                {copy.options.map((option, index) => {
                  const answered = selectedAnswer !== null;
                  const correct = index === question.answer;
                  const chosen = selectedAnswer === index;
                  const stateClass = !answered
                    ? 'border-white/10 bg-white/[0.025] text-slate-300 hover:border-neon-cyan/40 hover:bg-neon-cyan/[0.05]'
                    : correct
                      ? 'border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-200'
                      : chosen
                        ? 'border-rose-400/40 bg-rose-400/[0.08] text-rose-200'
                        : 'border-white/[0.06] bg-white/[0.015] text-slate-500';
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={answered}
                      onClick={() => selectAnswer(index)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs transition-colors disabled:cursor-default sm:px-4 sm:text-sm ${stateClass}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-current/20 font-mono text-[10px]">{String.fromCharCode(65 + index)}</span>
                      <code className="font-mono">{option}</code>
                      {answered && correct && <span className="ml-auto text-emerald-300" aria-hidden="true">✓</span>}
                      {answered && chosen && !correct && <span className="ml-auto text-rose-300" aria-hidden="true">×</span>}
                    </button>
                  );
                })}
              </div>
              {selectedAnswer !== null && (
                <div role="status" aria-live="polite" className={`mt-4 rounded-xl border p-3 text-xs leading-5 ${selectedAnswer === question.answer ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-100' : 'border-amber-400/20 bg-amber-400/[0.06] text-amber-100'}`}>
                  <p className="font-semibold">{selectedAnswer === question.answer ? tr('To‘g‘ri topdingiz!', 'Верно!', 'That’s right!') : tr('Yaxshi urinish — mana sababi:', 'Хорошая попытка — вот почему:', 'Good try — here’s why:')}</p>
                  <p className="mt-1 text-slate-300">{copy.explanation}</p>
                  <button type="button" onClick={continueQuiz} className="mt-3 rounded-lg bg-white/[0.08] px-3 py-2 font-semibold text-white transition-colors hover:bg-white/[0.14]">
                    {questionIndex === questions.length - 1 ? tr('Natijani ko‘rish', 'Посмотреть результат', 'See my result') : tr('Keyingi savol', 'Следующий вопрос', 'Next question')} <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center sm:py-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/[0.08] font-[Space_Grotesk] text-xl font-bold text-neon-cyan">{score}/{questions.length}</div>
              <h3 className="mt-4 text-lg font-semibold text-white">{tr('Sinov yakunlandi!', 'Проверка завершена!', 'Challenge complete!')}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">{tr('Har bir xato — yangi bilim. Endi shu bilimni haqiqiy kodda sinab ko‘ring.', 'Каждая ошибка — новый урок. Теперь примените знания в настоящем коде.', 'Every mistake is a lesson. Now put your skills to work in real code.')}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={reset} className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/[0.06]">{tr('Yana sinash', 'Попробовать ещё раз', 'Try again')}</button>
                <Link href="/challenge" className="rounded-xl bg-gradient-to-r from-[#7346ff] to-[#a83dff] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(132,65,255,0.22)]">{tr('Kunlik mashqqa o‘tish', 'Перейти к заданию дня', 'Open daily challenge')} <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
