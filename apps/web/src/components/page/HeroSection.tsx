'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useI18n } from '@/components/providers';

interface HeroSectionProps {
  ctaLink: string;
}

export function HeroSection({ ctaLink }: HeroSectionProps) {
  const { t, tr } = useI18n();
  const reduceMotion = useReducedMotion();
  const [activeTheme, setActiveTheme] = useState(0);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('css');
  const enterFromBelow = reduceMotion ? {} : { opacity: 0, y: 18 };
  const enterTransition = { duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' as const };
  const themes = [
    { color: '#22d3ee', label: tr('Moviy', 'Голубой', 'Cyan') },
    { color: '#a78bfa', label: tr('Binafsha', 'Фиолетовый', 'Violet') },
    { color: '#fb923c', label: tr('To‘q sariq', 'Оранжевый', 'Orange') },
  ];
  const selectedTheme = themes[activeTheme];

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#050711]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(39,73,224,0.22),transparent_33%),radial-gradient(circle_at_20%_35%,rgba(126,47,255,0.12),transparent_32%),linear-gradient(180deg,#080b18_0%,#050711_100%)]" />
      <div className="premium-grid absolute inset-0 opacity-50" />

      <div className="relative z-10 mx-auto max-w-[1220px] px-4 pb-6 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-2">
          <motion.div
            className="relative z-20 max-w-xl lg:pr-4"
            initial={enterFromBelow}
            animate={{ opacity: 1, y: 0 }}
            transition={enterTransition}
          >
            <motion.div
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium text-slate-300 shadow-lg"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.12 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(25,212,255,0.8)]" aria-hidden="true" />
              {t('heroBadge')}
            </motion.div>
            <h1 className="font-[Space_Grotesk] text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.7rem]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.2 }}
              >
                {t('heroTitleFirst')}
              </motion.span>
              <motion.span
                className="hero-title-accent block"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.32 }}
              >
                {t('heroTitleSecond')}
              </motion.span>
            </h1>
            <motion.p
              className="mt-5 max-w-md text-sm leading-6 text-slate-400 sm:text-base"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.42 }}
            >
              {t('heroText')}
            </motion.p>
            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...enterTransition, delay: reduceMotion ? 0 : 0.5 }}
            >
              <a href={ctaLink} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7346ff] to-[#a83dff] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_25px_rgba(132,65,255,0.32)] transition-transform hover:-translate-y-0.5">{t('start')}<span>→</span></a>
              <a href="#languages" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-slate-200 hover:border-white/40"><span>◎</span> {t('explore')}</a>
            </motion.div>
          </motion.div>

          <motion.div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d1b] shadow-[0_20px_70px_rgba(0,0,0,0.45)] lg:-mr-8"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.18 }}
          >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-neon-cyan/20 bg-neon-cyan/10 font-mono text-xs font-bold text-neon-cyan" aria-hidden="true">&lt;/&gt;</span>
              <div>
                <p className="text-xs font-semibold text-white">CodeHub Lab</p>
                <p className="text-[10px] text-slate-500">{tr('Portfolio kartasi', 'Карточка портфолио', 'Portfolio card')}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              {tr('Jonli natija', 'Живой результат', 'Live preview')}
            </span>
          </div>

          <div className="grid gap-3 p-3 sm:gap-4 sm:p-4 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#060914]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono text-[9px] text-slate-500">index.html</span>
              </div>
              <div className="flex gap-1 border-b border-white/[0.07] px-3 py-2" aria-label={tr('Kod namunasini tanlang', 'Выберите пример кода', 'Choose a code sample')}>
                {(['html', 'css'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors ${activeTab === tab ? 'bg-indigo-400/15 text-indigo-200' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <pre className="min-h-[152px] overflow-x-auto p-3 font-mono text-[10px] leading-[1.8] text-slate-300 sm:min-h-[174px] sm:p-4 sm:text-[11px]" aria-live="polite">
                {activeTab === 'html' ? (
                  <code><span className="text-fuchsia-300">&lt;article</span> <span className="text-sky-300">class</span>=<span className="text-amber-200">"profile"</span><span className="text-fuchsia-300">&gt;</span>{'\n'}  <span className="text-fuchsia-300">&lt;h1&gt;</span>{tr('Salom, dunyo!', 'Привет, мир!', 'Hello, world!')}<span className="text-fuchsia-300">&lt;/h1&gt;</span>{'\n'}  <span className="text-fuchsia-300">&lt;button&gt;</span>{tr('Loyihalarim', 'Мои проекты', 'My projects')}<span className="text-fuchsia-300">&lt;/button&gt;</span>{'\n'}<span className="text-fuchsia-300">&lt;/article&gt;</span></code>
                ) : (
                  <code><span className="text-fuchsia-300">.profile</span> {'{'}{'\n'}  <span className="text-sky-300">padding</span>: <span className="text-amber-200">24px</span>;{'\n'}  <span className="text-sky-300">border-radius</span>: <span className="text-amber-200">20px</span>;{'\n'}  <span className="text-sky-300">background</span>: <span style={{ color: selectedTheme.color }}>{selectedTheme.color}</span>;{'\n'}{'}'}</code>
                )}
              </pre>
            </div>

            <div className="flex min-h-[208px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111727] sm:min-h-[230px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2">
                <span className="text-[10px] font-medium text-slate-300">{tr('Brauzerdagi ko‘rinishi', 'Как это выглядит в браузере', 'How it looks in the browser')}</span>
                <span className="font-mono text-[9px] text-slate-500">preview</span>
              </div>
              <div className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)] p-4 sm:p-5">
                <motion.article
                  key={selectedTheme.color}
                  initial={reduceMotion ? false : { opacity: 0.7, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                  className="w-full max-w-[270px] rounded-2xl border border-slate-200/80 bg-white p-4 text-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.24)] sm:p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-slate-950" style={{ backgroundColor: selectedTheme.color }}>CH</div>
                    <div>
                      <p className="text-xs font-bold">{tr('Sizning ismingiz', 'Ваше имя', 'Your name')}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{tr('Kelajak dasturchisi', 'Будущий разработчик', 'Future developer')}</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-5 text-slate-600">{tr('Birinchi sahifamni CodeHub bilan yaratdim.', 'Я создал свою первую страницу вместе с CodeHub.', 'I built my first page with CodeHub.')}</p>
                  <button type="button" className="mt-4 rounded-lg px-3 py-2 text-[10px] font-semibold text-slate-950 transition-transform hover:scale-[1.03]" style={{ backgroundColor: selectedTheme.color }}>
                    {tr('Loyihalarim', 'Мои проекты', 'My projects')} <span aria-hidden="true">→</span>
                  </button>
                </motion.article>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-3 sm:px-5">
            <p className="text-[10px] text-slate-400">{tr('Rangni bosing — kod va natija birga o‘zgaradi', 'Нажмите на цвет — код и результат изменятся', 'Pick a color — watch the code and result change')}</p>
            <div className="flex items-center gap-2" aria-label={tr('Loyiha rangini tanlang', 'Выберите цвет проекта', 'Choose a project color')}>
              {themes.map((theme, index) => (
                <button
                  key={theme.color}
                  type="button"
                  aria-label={theme.label}
                  aria-pressed={activeTheme === index}
                  onClick={() => setActiveTheme(index)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 ${activeTheme === index ? 'ring-2 ring-white ring-offset-2 ring-offset-[#090d1b]' : ''}`}
                  style={{ backgroundColor: theme.color }}
                >
                  {activeTheme === index && <span className="text-xs font-bold text-slate-950" aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          </div>
          </motion.div>
        </div>

        <div className="relative z-20 mt-7 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-[#10152b]/80 shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur sm:grid-cols-4">
          {[
            ['◉', t('interactiveLessons'), t('learnByDoing')],
            ['✥', t('realProjects'), t('buildPortfolio')],
            ['◎', t('multiLanguage'), 'EN / RU / UZ'],
            ['⌁', t('trackProgress'), t('seeGrowth')],
          ].map(([icon, label, text]) => (
            <div
              key={label}
              className="group relative flex items-center gap-2 border-white/10 px-3 py-3 transition-colors duration-300 hover:bg-indigo-400/[0.08] active:bg-indigo-400/[0.12] first:border-0 sm:border-l sm:px-5 motion-reduce:transition-none"
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/[0.09] via-purple-500/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-indigo-300/10 bg-indigo-500/15 text-sm text-purple-300 shadow-[0_0_0_rgba(99,102,241,0)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:border-indigo-300/30 group-hover:bg-indigo-500/25 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(99,102,241,0.3)] motion-reduce:transform-none motion-reduce:transition-none">
                {icon}
              </span>
              <span className="relative min-w-0">
                <strong className="block truncate text-[9px] font-medium text-white transition-colors duration-300 group-hover:text-indigo-100 sm:text-[10px] motion-reduce:transition-none">{label}</strong>
                <small className="block truncate text-[8px] text-slate-500 transition-colors duration-300 group-hover:text-slate-300 motion-reduce:transition-none">{text}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
