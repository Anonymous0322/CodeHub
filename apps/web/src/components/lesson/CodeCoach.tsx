'use client';

import { useState } from 'react';
import { useI18n } from '@/components/providers';
import { LessonExercise } from '@/store/courseStore';

type CoachLanguage = 'html' | 'css' | 'javascript';
type FindingId =
  | 'html-incomplete-tag'
  | 'html-unclosed-tag'
  | 'html-unmatched-close'
  | 'css-color-name'
  | 'css-missing-brace'
  | 'css-missing-colon'
  | 'js-const-reassignment'
  | 'exercise-check';

interface Finding {
  id: FindingId;
  detail?: string;
  expectation?: string;
}

const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function inspectHtml(code: string): Finding | null {
  if (/<[a-z][^<>]*$/i.test(code)) return { id: 'html-incomplete-tag' };

  const stack: string[] = [];
  const tokens = code
    .replace(/<!--[\s\S]*?-->/g, '')
    .matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi);

  for (const token of tokens) {
    const tag = token[1].toLowerCase();
    const closing = /^<\//.test(token[0]);
    if (closing) {
      const openIndex = stack.lastIndexOf(tag);
      if (openIndex === -1) return { id: 'html-unmatched-close', detail: tag };
      stack.splice(openIndex);
    } else if (!voidTags.has(tag) && !/\/\s*>$/.test(token[0])) {
      stack.push(tag);
    }
  }

  const unclosedTag = stack[stack.length - 1];
  return unclosedTag ? { id: 'html-unclosed-tag', detail: unclosedTag } : null;
}

function inspectCss(code: string): Finding | null {
  const misspelledColor = code.match(/\b(text-colou?r|font-color)\b/i);
  if (misspelledColor) return { id: 'css-color-name', detail: misspelledColor[1] };

  const openingBraces = (code.match(/\{/g) || []).length;
  const closingBraces = (code.match(/\}/g) || []).length;
  if (openingBraces !== closingBraces) return { id: 'css-missing-brace' };

  for (const block of code.matchAll(/\{([^{}]*)\}/g)) {
    const declarations = block[1].split(/[;\n]/);
    for (const declaration of declarations) {
      const trimmed = declaration.trim();
      if (/^[a-z-]+\s+[^:]+$/i.test(trimmed)) {
        return { id: 'css-missing-colon', detail: trimmed.split(/\s+/)[0] };
      }
    }
  }
  return null;
}

function inspectJavaScript(code: string): Finding | null {
  const declarations = /\bconst\s+([A-Za-z_$][\w$]*)\s*=/g;
  for (const declaration of code.matchAll(declarations)) {
    const name = declaration[1];
    const declarationEnd = declaration.index + declaration[0].length;
    const laterCode = code.slice(declarationEnd);
    if (new RegExp(`(?:^|[;\\n])\\s*${name}\\s*=(?!=|>)`).test(laterCode)) {
      return { id: 'js-const-reassignment', detail: name };
    }
  }
  return null;
}

function inspectCode(language: CoachLanguage, code: string): Finding[] {
  const finding = language === 'html'
    ? inspectHtml(code)
    : language === 'css'
      ? inspectCss(code)
      : inspectJavaScript(code);
  return finding ? [finding] : [];
}

export function CodeCoach({
  language,
  code,
  exercise,
  checkResults,
  formatText,
}: {
  language: CoachLanguage;
  code: string;
  exercise?: LessonExercise;
  checkResults: Record<string, boolean> | null;
  formatText: (text: string | null | undefined) => string;
}) {
  const { tr } = useI18n();
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const inspect = () => {
    const failedCheck = exercise?.checks.find(check => checkResults?.[check.id] === false);
    const nextFindings = failedCheck
      ? [{ id: 'exercise-check' as const, detail: failedCheck.selector, expectation: formatText(failedCheck.label) }]
      : inspectCode(language, code);
    setFindings(nextFindings);
    setShowExplanation(false);
  };

  const titleFor = (finding: Finding) => {
    if (finding.id === 'html-incomplete-tag') return tr('HTML tegini tugatib ko‘ring', 'Проверьте, закрыт ли HTML-тег', 'Check whether the HTML tag is complete');
    if (finding.id === 'html-unclosed-tag') return tr(`</${finding.detail}> yopuvchi tegi yetishmayapti`, `Не найден закрывающий тег </${finding.detail}>`, `A closing </${finding.detail}> tag is missing`);
    if (finding.id === 'html-unmatched-close') return tr(`</${finding.detail}> tegi uchun ochuvchi teg topilmadi`, `Для </${finding.detail}> не найден открывающий тег`, `No opening tag was found for </${finding.detail}>`);
    if (finding.id === 'css-color-name') return tr(`${finding.detail} CSS xususiyati tanilmaydi`, `Свойство ${finding.detail} не распознано в CSS`, `${finding.detail} is not a recognized CSS property`);
    if (finding.id === 'css-missing-brace') return tr('CSS blokining qavslarini tekshiring', 'Проверьте фигурные скобки CSS-блока', 'Check the CSS block braces');
    if (finding.id === 'css-missing-colon') return tr(`${finding.detail} qatorida ikki nuqta yo‘q`, `В строке ${finding.detail} пропущено двоеточие`, `The ${finding.detail} declaration is missing a colon`);
    if (finding.id === 'js-const-reassignment') return tr(`${finding.detail} o‘zgarmas qiymatga qayta qiymat berilgan`, `Переменной const ${finding.detail} присваивается новое значение`, `The const variable ${finding.detail} is being reassigned`);
    return tr('Mashqdagi bir qadam bajarilmagan', 'Один из шагов задания не выполнен', 'One exercise check did not pass');
  };

  const hintFor = (finding: Finding) => {
    if (finding.id === 'html-incomplete-tag') return tr('Kursor turgan joydan oldingi < belgisini va teg oxiridagi > belgisini tekshiring.', 'Проверьте символ < в начале тега и символ > в его конце.', 'Check the < at the start of the tag and the > at its end.');
    if (finding.id === 'html-unclosed-tag') return tr(`${finding.detail} tegidan ochilgan elementni shu teg nomi bilan yoping.`, `Закройте элемент ${finding.detail} тегом с тем же именем.`, `Close the ${finding.detail} element using a tag with the same name.`);
    if (finding.id === 'html-unmatched-close') return tr(`</${finding.detail}> dan oldin mos <${finding.detail}> ochuvchi tegi borligini tekshiring.`, `Проверьте, есть ли открывающий тег <${finding.detail}> перед </${finding.detail}>.`, `Check for a matching <${finding.detail}> opening tag before </${finding.detail}>.`);
    if (finding.id === 'css-color-name') return tr('Matn rangini belgilaydigan CSS xususiyatini eslang.', 'Вспомните CSS-свойство, которое задаёт цвет текста.', 'Recall the CSS property used to set text color.');
    if (finding.id === 'css-missing-brace') return tr('Har bir { ochuvchi qavsga mos } yopuvchi qavs bo‘lishi kerak.', 'Каждой открывающей скобке { нужна закрывающая скобка }.', 'Each opening { brace needs a matching closing } brace.');
    if (finding.id === 'css-missing-colon') return tr('CSS xususiyati va uning qiymati orasiga : belgisi qo‘ying.', 'Поставьте : между CSS-свойством и его значением.', 'Add a : between the CSS property and its value.');
    if (finding.id === 'js-const-reassignment') return tr('Qiymati o‘zgaradigan o‘zgaruvchi uchun boshqa kalit so‘zni tanlang.', 'Для переменной, значение которой меняется, выберите другое ключевое слово.', 'Use a different keyword for a variable whose value changes.');
    return tr(`Avval ${finding.detail} elementini va unga tegishli CSS tekshiruvini ko‘rib chiqing.`, `Сначала проверьте элемент ${finding.detail} и связанное с ним CSS-условие.`, `First check the ${finding.detail} element and its related CSS requirement.`);
  };

  const explanationFor = (finding: Finding) => {
    if (finding.id === 'html-incomplete-tag') return tr('HTML tegi < belgisidan boshlanadi va > belgisi bilan tugaydi. Masalan: <p>Matn</p>.', 'HTML-тег начинается с < и заканчивается символом >. Например: <p>Текст</p>.', 'An HTML tag starts with < and ends with >. For example: <p>Text</p>.');
    if (finding.id === 'html-unclosed-tag') return tr(`<${finding.detail}> tegidan keyin uning mazmunini </${finding.detail}> bilan yoping.`, `После содержимого <${finding.detail}> добавьте закрывающий тег </${finding.detail}>.`, `After the contents of <${finding.detail}>, add its closing tag </${finding.detail}>.`);
    if (finding.id === 'html-unmatched-close') return tr('Har bir yopuvchi tegdan oldin shu nomdagi ochuvchi teg bo‘lishi kerak.', 'Перед закрывающим тегом должен быть открывающий тег с тем же именем.', 'A closing tag should have a matching opening tag with the same name.');
    if (finding.id === 'css-color-name') return tr(`Matn rangini CSS da color xususiyati bilan yozing. Masalan: color: cyan;.`, `Цвет текста в CSS задаётся свойством color. Например: color: cyan;.`, `Use the CSS color property to set text color. For example: color: cyan;`);
    if (finding.id === 'css-missing-brace') return tr('CSS qoidasi selector { xususiyat: qiymat; } shaklida yoziladi.', 'Правило CSS записывается так: селектор { свойство: значение; }.', 'A CSS rule follows this shape: selector { property: value; }.');
    if (finding.id === 'css-missing-colon') return tr('CSS yozuvi xususiyat: qiymat shaklida bo‘ladi. Masalan: color: cyan;.', 'Запись CSS имеет вид свойство: значение. Например: color: cyan;.', 'A CSS declaration uses property: value. For example: color: cyan;.');
    if (finding.id === 'js-const-reassignment') return tr('const bilan e’lon qilingan qiymatni qayta belgilab bo‘lmaydi. O‘zgaradigan qiymatlar uchun let ishlating.', 'Значение const нельзя переназначить. Для изменяемых значений используйте let.', 'A const value cannot be reassigned. Use let for a value that needs to change.');
    return formatText(finding.expectation);
  };

  return (
    <div className="mt-4 rounded-xl border border-violet-300/15 bg-[linear-gradient(125deg,rgba(139,92,246,0.09),rgba(6,182,212,0.035))] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-400/10 font-mono text-[10px] text-violet-200" aria-hidden="true">CH</span>
            {tr('CodeHub Ustoz', 'Наставник CodeHub', 'CodeHub Coach')}
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {tr('API kaliti kerak emas. Kod serverga yuborilmaydi; yordamchi oldindan belgilangan qoidalar bilan ishlaydi.', 'API-ключ не нужен. Код не отправляется на сервер; помощник использует заранее заданные правила.', 'No API key needed. Your code stays on this device; the coach uses predefined rules.')}
          </p>
        </div>
        <button
          type="button"
          onClick={inspect}
          className="rounded-lg border border-violet-300/25 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-100 transition-colors hover:bg-violet-400/15"
        >
          {tr('Kodimga ishora ber', 'Подсказать по коду', 'Give me a hint')} <span aria-hidden="true">→</span>
        </button>
      </div>

      {findings !== null && (
        <div className="mt-4 border-t border-white/[0.08] pt-4" aria-live="polite">
          {findings.length === 0 ? (
            <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] p-3">
              <p className="text-xs font-semibold text-emerald-200">{tr('Aniq tanish xato topilmadi.', 'Знакомая ошибка не обнаружена.', 'No known issue was detected.')}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{tr('Bu kod albatta to‘g‘ri degani emas. Natijani “Kodni ishga tushirish” yoki “Vazifani tekshirish” tugmasi bilan sinab ko‘ring.', 'Это не гарантирует, что код правильный. Проверьте результат кнопкой запуска или проверки задания.', 'This does not guarantee the code is correct. Try Run Code or Check Exercise to verify the result.')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {findings.map((finding, index) => (
                <li key={`${finding.id}-${index}`} className="rounded-lg border border-white/[0.08] bg-black/10 p-3">
                  <p className="text-xs font-semibold text-amber-100">{titleFor(finding)}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    <span className="font-semibold text-violet-200">{tr('Ishora:', 'Подсказка:', 'Hint:')}</span> {hintFor(finding)}
                  </p>
                  {showExplanation && (
                    <p className="mt-2 border-t border-white/[0.08] pt-2 text-xs leading-5 text-slate-400">
                      <span className="font-semibold text-neon-cyan">{tr('Sababi:', 'Объяснение:', 'Why:')}</span> {explanationFor(finding)}
                    </p>
                  )}
                  {finding.id !== 'exercise-check' && (
                    <button
                      type="button"
                      onClick={() => setShowExplanation(current => !current)}
                      className="mt-2 text-[11px] font-semibold text-neon-cyan underline decoration-neon-cyan/30 underline-offset-4 hover:decoration-neon-cyan"
                    >
                      {showExplanation ? tr('Izohni yashirish', 'Скрыть объяснение', 'Hide explanation') : tr('Sababini tushuntir', 'Объяснить причину', 'Explain why')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {exercise && checkResults === null && (
            <p className="mt-3 text-[11px] leading-5 text-slate-500">{tr('Bajarilmagan qadamlar bo‘yicha aniqroq ishora olish uchun avval “Vazifani tekshirish” tugmasini bosing.', 'Чтобы получить подсказку по невыполненным шагам, сначала нажмите «Проверить задание».', 'For a hint about incomplete steps, click Check Exercise first.')}</p>
          )}
        </div>
      )}
    </div>
  );
}
