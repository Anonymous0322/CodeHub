import { toModernUzbek } from '@/lib/utils';

export type TutorLanguage = 'uz' | 'ru' | 'en';

export interface TutorReply {
  text: string;
  link?: { href: string; label: string };
}

export function normalizeUzbekLatin(text: string) {
  return text.split(/(`[^`]*`|<\/?[a-z][^<>]*>|https?:\/\/\S+)/gi)
    .map((part, index) => index % 2 === 1 ? part : toModernUzbek(part))
    .join('');
}

type Topic =
  | 'html'
  | 'css'
  | 'javascript'
  | 'variables'
  | 'function'
  | 'loop'
  | 'array'
  | 'object'
  | 'dom'
  | 'event'
  | 'condition'
  | 'flex'
  | 'grid'
  | 'boxModel'
  | 'responsive'
  | 'selector'
  | 'classId'
  | 'console'
  | 'semantic'
  | 'form'
  | 'image'
  | 'link'
  | 'debug'
  | 'courses'
  | 'challenge';

type LocalizedMessage = string | ((detail: string) => string);

const answers: Record<Topic, Record<TutorLanguage, string>> = {
  html: {
    uz: 'HTML veb-sahifaning tuzilishini belgilaydi. Matn uchun <p>, sarlavha uchun <h1>, havola uchun <a> kabi teglar ishlatiladi. Masalan: <h1>Salom!</h1><p>Bu matn.</p>. Odatda teglarni to‘g‘ri ochib-yopish muhim.',
    ru: 'HTML задаёт структуру веб-страницы. Для текста используют <p>, для заголовка — <h1>, для ссылки — <a>. Например: <h1>Привет!</h1><p>Это текст.</p>. Обычно важно правильно открывать и закрывать теги.',
    en: 'HTML defines a web page’s structure. Use tags such as <p> for paragraphs, <h1> for headings, and <a> for links. For example: <h1>Hello!</h1><p>Some text.</p>. Most tags should be opened and closed correctly.',
  },
  selector: {
    uz: 'CSS selektori qaysi elementga uslub qo‘llanishini tanlaydi: `p` barcha paragraf teglarini, `.card` `card` klassli elementlarni, `#title` esa `title` ID’li elementni tanlaydi. Masalan: `.card { padding: 16px; }`.',
    ru: 'CSS-селекторы выбирают элементы для стилей: `p` — все абзацы, `.card` — элементы с классом `card`, `#title` — элемент с ID `title`. Например: `.card { padding: 16px; }`.',
    en: 'CSS selectors choose which elements receive styles: `p` selects paragraphs, `.card` selects elements with class `card`, and `#title` selects the element with ID `title`. For example: `.card { padding: 16px; }`.',
  },
  classId: {
    uz: '`class` bir nechta elementga berilishi mumkin va CSS’da `.nom` bilan tanlanadi. `id` sahifada noyob bo‘lishi kerak va CSS’da `#nom` bilan tanlanadi. Bir xil ko‘rinishdagi elementlar uchun odatda `class` ishlating.',
    ru: '`class` можно назначить нескольким элементам и выбрать в CSS через `.имя`. `id` должен быть уникальным и выбирается через `#имя`. Для одинаково оформленных элементов обычно используйте `class`.',
    en: 'A `class` can be shared by multiple elements and is selected with `.name` in CSS. An `id` should be unique and is selected with `#name`. Use a class for elements that share styles.',
  },
  console: {
    uz: 'JavaScript xatolarini ko‘rish uchun brauzerda Developer Tools → Console’ni oching. `console.log(qiymat)` qiymatni tekshiradi; qizil xabarlar va ko‘rsatilgan fayl/qator raqamiga e’tibor bering.',
    ru: 'Чтобы увидеть ошибки JavaScript, откройте Developer Tools → Console в браузере. `console.log(значение)` помогает проверить данные; обратите внимание на красное сообщение, файл и номер строки.',
    en: 'To see JavaScript errors, open Developer Tools → Console in your browser. `console.log(value)` helps inspect data; check the red error message and its file and line number.',
  },
  css: {
    uz: 'CSS sahifaning ko‘rinishini boshqaradi: rang, o‘lcham, joylashuv va oraliqlar. Masalan: p { color: teal; font-size: 18px; }. Selektor elementni tanlaydi, qavslar ichida esa xususiyat: qiymat yoziladi.',
    ru: 'CSS управляет внешним видом страницы: цветами, размерами, расположением и отступами. Например: p { color: teal; font-size: 18px; }. Селектор выбирает элементы, а внутри скобок указываются свойства и значения.',
    en: 'CSS controls a page’s appearance: colors, sizes, layout, and spacing. For example: p { color: teal; font-size: 18px; }. A selector chooses elements; declarations inside braces set property values.',
  },
  javascript: {
    uz: 'JavaScript sahifaga interaktivlik qo‘shadi: tugma bosilishini kuzatish, ma’lumotni o‘zgartirish va natijani ko‘rsatish. Masalan: document.querySelector("button").addEventListener("click", () => { alert("Salom!"); });.',
    ru: 'JavaScript добавляет странице интерактивность: обрабатывает нажатия, изменяет данные и показывает результат. Например: document.querySelector("button").addEventListener("click", () => { alert("Привет!"); });.',
    en: 'JavaScript adds interactivity: it can handle clicks, update data, and show results. For example: document.querySelector("button").addEventListener("click", () => { alert("Hello!"); });.',
  },
  variables: {
    uz: '`let` va `const` qiymatlarni saqlaydi. Qiymat keyin o‘zgarsa `let`, qayta tayinlanmasa `const` ishlating: `let score = 0; score = 1; const name = "Ali";`. `const` obyektining ichki qiymatlari esa o‘zgarishi mumkin.',
    ru: '`let` и `const` хранят значения. Используйте `let`, если значение будет переназначаться, и `const`, если нет: `let score = 0; score = 1; const name = "Ali";`. Содержимое объекта, созданного через `const`, при этом может меняться.',
    en: '`let` and `const` store values. Use `let` when reassigning a value and `const` when you will not reassign it: `let score = 0; score = 1; const name = "Ali";`. Properties inside a `const` object can still change.',
  },
  function: {
    uz: 'Funksiya — qayta ishlatish mumkin bo‘lgan kod bo‘lagi. `function greet(name) { return "Salom, " + name; }` deb e’lon qilib, `greet("Ali")` bilan chaqirasiz. `return` natijani qaytaradi.',
    ru: 'Функция — фрагмент кода, который можно использовать повторно. Объявите `function greet(name) { return "Привет, " + name; }`, затем вызовите `greet("Али")`. `return` возвращает результат.',
    en: 'A function is a reusable piece of code. Declare `function greet(name) { return "Hello, " + name; }`, then call `greet("Ali")`. `return` sends a result back.',
  },
  loop: {
    uz: 'Sikl bir amalni takrorlaydi. Masalan, `for (let i = 0; i < 3; i++) { console.log(i); }` 0, 1, 2 ni chiqaradi. Sikl sharti oxir-oqibat yolg‘on bo‘lishini tekshiring, aks holda cheksiz davom etishi mumkin.',
    ru: 'Цикл повторяет действие. Например, `for (let i = 0; i < 3; i++) { console.log(i); }` выводит 0, 1, 2. Проверьте, что условие цикла со временем станет ложным, иначе он может стать бесконечным.',
    en: 'A loop repeats an action. For example, `for (let i = 0; i < 3; i++) { console.log(i); }` prints 0, 1, 2. Make sure its condition eventually becomes false to avoid an infinite loop.',
  },
  array: {
    uz: 'Massiv bir o‘zgaruvchida bir nechta qiymatni tartib bilan saqlaydi: `const fruits = ["olma", "anor"];`. Birinchi element indeksi `0`: `fruits[0]`. Uzunligi `fruits.length` orqali olinadi.',
    ru: 'Массив хранит несколько упорядоченных значений: `const fruits = ["яблоко", "гранат"];`. Индекс первого элемента — `0`: `fruits[0]`. Длина доступна через `fruits.length`.',
    en: 'An array stores an ordered list of values: `const fruits = ["apple", "pomegranate"];`. The first item has index `0`: `fruits[0]`. Use `fruits.length` to get its length.',
  },
  object: {
    uz: 'Obyekt qiymatlarni nomlangan xususiyatlarda saqlaydi: `const user = { name: "Ali", age: 20 };`. Qiymatni `user.name` yoki `user["name"]` bilan o‘qing.',
    ru: 'Объект хранит значения в именованных свойствах: `const user = { name: "Али", age: 20 };`. Читайте значение как `user.name` или `user["name"]`.',
    en: 'An object stores values under named properties: `const user = { name: "Ali", age: 20 };`. Read a value with `user.name` or `user["name"]`.',
  },
  dom: {
    uz: 'DOM — brauzer HTML sahifa uchun yaratadigan elementlar daraxti. JavaScript’da `document.querySelector("#title")` elementni topadi; so‘ng `.textContent` yoki `.classList` orqali uni o‘zgartirish mumkin. Element topilmagan holatni ham tekshiring.',
    ru: 'DOM — дерево элементов страницы, созданное браузером из HTML. В JavaScript `document.querySelector("#title")` находит элемент; затем его можно изменить через `.textContent` или `.classList`. Также проверяйте случай, когда элемент не найден.',
    en: 'The DOM is the browser’s tree of elements created from HTML. In JavaScript, `document.querySelector("#title")` finds an element; you can update it with `.textContent` or `.classList`. Also handle the case where the element is missing.',
  },
  event: {
    uz: 'Hodisa — foydalanuvchi yoki brauzer harakati, masalan tugma bosilishi. `button.addEventListener("click", handler)` hodisaga funksiya biriktiradi. Avval `button` elementi topilganini tekshiring.',
    ru: 'Событие — действие пользователя или браузера, например нажатие кнопки. `button.addEventListener("click", handler)` связывает событие с функцией. Сначала убедитесь, что элемент `button` найден.',
    en: 'An event is an action from the user or browser, such as a button click. `button.addEventListener("click", handler)` attaches a function to it. First check that the `button` element exists.',
  },
  condition: {
    uz: '`if` shartga qarab kodni tanlaydi: `if (score >= 50) { console.log("O‘tdi"); } else { console.log("Yana urinib ko‘ring"); }`. Taqqoslashda qiymatni tayinlaydigan `=` emas, `===`, `>`, `<` kabi operator ishlating.',
    ru: '`if` выбирает код по условию: `if (score >= 50) { console.log("Сдано"); } else { console.log("Попробуйте ещё раз"); }`. Для сравнения используйте `===`, `>` или `<`, а не `=`, который присваивает значение.',
    en: '`if` selects code based on a condition: `if (score >= 50) { console.log("Passed"); } else { console.log("Try again"); }`. Use comparison operators such as `===`, `>`, or `<`; `=` assigns a value.',
  },
  flex: {
    uz: 'Flexbox elementlarni bitta yo‘nalishda joylashtirish uchun qulay. Ota elementga `display: flex;` bering; `justify-content` asosiy o‘q bo‘ylab, `align-items` esa ko‘ndalang o‘q bo‘ylab tekislaydi.',
    ru: 'Flexbox удобно располагает элементы в одном направлении. Задайте родителю `display: flex;`; `justify-content` выравнивает по главной оси, а `align-items` — по поперечной.',
    en: 'Flexbox is useful for arranging items in one direction. Set `display: flex;` on the parent; `justify-content` aligns along the main axis and `align-items` along the cross axis.',
  },
  grid: {
    uz: 'CSS Grid ikki yo‘nalishli maketlar — qator va ustunlar uchun qulay. Ota elementga `display: grid;` va masalan `grid-template-columns: repeat(2, 1fr);` yozing.',
    ru: 'CSS Grid подходит для макетов с рядами и колонками. Задайте родителю `display: grid;` и, например, `grid-template-columns: repeat(2, 1fr);`.',
    en: 'CSS Grid is useful for layouts with rows and columns. Set `display: grid;` on the parent, then for example `grid-template-columns: repeat(2, 1fr);`.',
  },
  boxModel: {
    uz: 'CSS blok modeli elementning `content`, `padding`, `border` va `margin` qismlaridan iborat. `padding` ichki, `margin` tashqi bo‘shliq. O‘lchamni qulay hisoblash uchun ko‘pincha `* { box-sizing: border-box; }` ishlatiladi.',
    ru: 'Блочная модель CSS состоит из `content`, `padding`, `border` и `margin`. `padding` — внутренний отступ, `margin` — внешний. Для удобного расчёта размеров часто используют `* { box-sizing: border-box; }`.',
    en: 'The CSS box model has `content`, `padding`, `border`, and `margin`. `padding` is inner spacing; `margin` is outer spacing. `* { box-sizing: border-box; }` often makes sizing easier.',
  },
  responsive: {
    uz: 'Moslashuvchan dizayn uchun `width: 100%`, `max-width`, Flexbox yoki Grid’dan foydalaning. Kichik ekranlar uchun media query yozish mumkin: `@media (max-width: 600px) { ... }`. Sahifaga `<meta name="viewport" content="width=device-width, initial-scale=1">` qo‘shing.',
    ru: 'Для адаптивного дизайна используйте `width: 100%`, `max-width`, Flexbox или Grid. Для узких экранов подойдут медиазапросы: `@media (max-width: 600px) { ... }`. Добавьте `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
    en: 'For responsive layouts, use `width: 100%`, `max-width`, Flexbox, or Grid. Media queries can adjust narrow screens: `@media (max-width: 600px) { ... }`. Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
  },
  semantic: {
    uz: 'Semantik HTML elementlari mazmunni aniq bildiradi: sahifa boshi uchun `<header>`, asosiy qism uchun `<main>`, bo‘lim uchun `<section>`, pastki qism uchun `<footer>`. Ular sahifani tushunish va qulay foydalanishga yordam beradi.',
    ru: 'Семантические HTML-элементы описывают смысл содержимого: `<header>` для шапки, `<main>` для основной части, `<section>` для раздела и `<footer>` для подвала. Это помогает понимать страницу и улучшает доступность.',
    en: 'Semantic HTML describes meaning: `<header>` for a page header, `<main>` for primary content, `<section>` for a section, and `<footer>` for the footer. This makes pages easier to understand and improves accessibility.',
  },
  form: {
    uz: 'HTML forma ma’lumot kiritish uchun ishlatiladi: `<form>`, `<label>`, `<input>` va `<button>`. Har bir input’ga tushunarli label bering. JavaScript’da yuborishni `form.addEventListener("submit", handler)` bilan kuzatish mumkin.',
    ru: 'HTML-форма нужна для ввода данных: `<form>`, `<label>`, `<input>` и `<button>`. Добавьте понятную подпись для каждого поля. В JavaScript отправку можно обработать через `form.addEventListener("submit", handler)`.',
    en: 'HTML forms collect input with `<form>`, `<label>`, `<input>`, and `<button>`. Give every field a clear label. JavaScript can handle submission with `form.addEventListener("submit", handler)`.',
  },
  image: {
    uz: 'Rasmni `<img src="rasm.jpg" alt="Rasm tavsifi">` bilan qo‘shing. `src` manzil, `alt` esa rasmni ko‘ra olmaydigan foydalanuvchilar uchun tavsifdir. Rasm faqat bezak bo‘lsa `alt=""` ishlating.',
    ru: 'Добавьте изображение через `<img src="image.jpg" alt="Описание">`. `src` задаёт путь, а `alt` описывает изображение для тех, кто не может его увидеть. Для чисто декоративного изображения используйте `alt=""`.',
    en: 'Add an image with `<img src="image.jpg" alt="Description">`. `src` is its path; `alt` describes it for people who cannot see it. Use `alt=""` for purely decorative images.',
  },
  link: {
    uz: 'Havola uchun `<a href="https://example.com">Sayt</a>` ishlatiladi. `href` manzilni belgilaydi. Havola yangi oynada ochilsa, xavfsizlik uchun `rel="noopener noreferrer"` ham qo‘shing.',
    ru: 'Для ссылки используйте `<a href="https://example.com">Сайт</a>`. `href` задаёт адрес. Если ссылка открывается в новой вкладке, добавьте `rel="noopener noreferrer"`.',
    en: 'Use `<a href="https://example.com">Website</a>` for a link. `href` sets its destination. If it opens in a new tab, also add `rel="noopener noreferrer"`.',
  },
  debug: {
    uz: 'Xatoni topish uchun: 1) brauzer Console yoki terminaldagi xabarni o‘qing; 2) undagi fayl va qatorni oching; 3) xatodan oldingi birinchi o‘zgarishni tekshiring; 4) kichik bo‘lakda qayta sinang. Xato matni va tegishli kodni yuborsangiz, aniqroq tahlil qilaman.',
    ru: 'Чтобы найти ошибку: 1) прочитайте сообщение в Console браузера или терминале; 2) откройте указанный файл и строку; 3) проверьте ближайшее изменение перед ошибкой; 4) повторите проверку на небольшом фрагменте. Пришлите текст ошибки и связанный код — разберу точнее.',
    en: 'To debug: 1) read the browser Console or terminal message; 2) open the referenced file and line; 3) inspect the nearest change before the error; 4) reproduce it with a small example. Share the exact error and related code for a more specific analysis.',
  },
  courses: {
    uz: 'O‘rganishni HTML asoslaridan boshlang, so‘ng CSS va JavaScript’ga o‘ting. Har mavzuda kodni o‘zingiz yozib ko‘ring va kichik loyiha yarating. Kurslarni ko‘rish uchun quyidagi tugmani bosing.',
    ru: 'Начните с основ HTML, затем переходите к CSS и JavaScript. Пишите код самостоятельно и закрепляйте каждую тему небольшим проектом. Нажмите кнопку ниже, чтобы открыть курсы.',
    en: 'Start with HTML fundamentals, then move on to CSS and JavaScript. Write the code yourself and reinforce each topic with a small project. Use the link below to explore courses.',
  },
  challenge: {
    uz: 'Kunlik mashq orqali kichik vazifani bajarib, natijani tekshirishingiz mumkin. Quyidagi tugma kunlik mashq sahifasini ochadi.',
    ru: 'В ежедневном задании можно решить небольшую задачу и проверить результат. Кнопка ниже откроет страницу задания.',
    en: 'Use the daily challenge to solve a small task and check your result. The link below opens the challenge page.',
  },
};

const codeFixes: Record<string, Record<TutorLanguage, LocalizedMessage>> = {
  htmlIncomplete: {
    uz: 'HTML teg to‘liq yozilmagan ko‘rinadi: `<` bilan boshlangan tegni `>` bilan yakunlang.',
    ru: 'Похоже, HTML-тег не завершён: закройте тег, начатый с `<`, символом `>`.',
    en: 'An HTML tag looks incomplete: finish the tag that starts with `<` by adding `>`.',
  },
  htmlMismatch: {
    uz: 'HTML teglarining ichma-ich tartibi noto‘g‘ri ko‘rinadi. Ichkarida ochilgan tegni avval yoping, masalan: `<div><p>Matn</p></div>`.',
    ru: 'Похоже, HTML-теги закрыты не в том порядке. Сначала закройте вложенный тег, например: `<div><p>Текст</p></div>`.',
    en: 'The HTML tags appear to close in the wrong order. Close the inner tag first, for example: `<div><p>Text</p></div>`.',
  },
  htmlUnclosed: {
    uz: (tag: string) => `\`<${tag}>\` tegi ochilgan, lekin \`</${tag}>\` yopuvchi tegi topilmadi.`,
    ru: (tag: string) => `Тег \`<${tag}>\` открыт, но закрывающий \`</${tag}>\` не найден.`,
    en: (tag: string) => `The \`<${tag}>\` tag is open, but its closing \`</${tag}>\` was not found.`,
  },
  htmlUnexpectedClose: {
    uz: (tag: string) => `\`</${tag}>\` uchun mos ochuvchi \`<${tag}>\` tegi topilmadi.`,
    ru: (tag: string) => `Для \`</${tag}>\` не найден соответствующий открывающий тег \`<${tag}>\`.`,
    en: (tag: string) => `No matching \`<${tag}>\` opening tag was found for \`</${tag}>\`.`,
  },
  htmlImageAlt: {
    uz: 'Rasmda `alt` tavsifi yo‘q. Kirish imkoniyati uchun, masalan, `<img src="rasm.jpg" alt="Tog‘ manzarasi">` deb yozing.',
    ru: 'У изображения нет описания `alt`. Для доступности добавьте, например, `<img src="image.jpg" alt="Горный пейзаж">`.',
    en: 'The image has no `alt` description. For accessibility, add one, for example `<img src="image.jpg" alt="Mountain landscape">`.',
  },
  htmlDuplicateId: {
    uz: 'Bir xil `id` sahifada bir necha marta ishlatilgan. `id` noyob bo‘lishi kerak; takrorlanuvchi elementlar uchun `class` ishlating.',
    ru: 'Одинаковый `id` используется несколько раз. Значение `id` должно быть уникальным; для повторяющихся элементов используйте `class`.',
    en: 'The same `id` is used more than once. An `id` should be unique; use a `class` for repeated elements.',
  },
  cssBraces: {
    uz: 'CSS’da `{` va `}` qavslar soni teng emas. Har bir qoida blokining qavslarini tekshiring.',
    ru: 'Количество скобок `{` и `}` в CSS не совпадает. Проверьте фигурные скобки каждого блока.',
    en: 'The number of `{` and `}` braces in the CSS does not match. Check each rule block.',
  },
  cssTypo: {
    uz: (property: string) => `\`${property}\` noto‘g‘ri yozilgan yoki CSS xususiyati emas. Matn rangini \`color\` bilan belgilang; imlosini ham tekshiring.`,
    ru: (property: string) => `\`${property}\` написано с ошибкой или не является CSS-свойством. Цвет текста задаётся через \`color\`; проверьте написание.`,
    en: (property: string) => `\`${property}\` appears misspelled or is not a CSS property. Use \`color\` for text color and check the spelling.`,
  },
  cssColon: {
    uz: (property: string) => `\`${property}\` qatorida xususiyat va qiymat orasida \`:\` belgisi yo‘q. Masalan: \`${property}: qiymat;\`.`,
    ru: (property: string) => `В строке \`${property}\` пропущено \`:\` между свойством и значением. Например: \`${property}: значение;\`.`,
    en: (property: string) => `The \`${property}\` declaration is missing \`:\` between the property and value. For example: \`${property}: value;\`.`,
  },
  jsConst: {
    uz: (name: string) => `\`${name}\` \`const\` bilan e’lon qilingan, lekin keyin unga yangi qiymat berilgan. Qiymat o‘zgarishi kerak bo‘lsa \`let\` ishlating.`,
    ru: (name: string) => `\`${name}\` объявлена через \`const\`, но позже ей присваивается новое значение. Если значение меняется, используйте \`let\`.`,
    en: (name: string) => `\`${name}\` was declared with \`const\` and later reassigned. Use \`let\` if the value needs to change.`,
  } as unknown as Record<TutorLanguage, string>,
  jsBrackets: {
    uz: 'JavaScript’da `()`, `{}` yoki `[]` qavslaridan biri yopilmay qolgan ko‘rinadi. Juft qavslarni va ularning tartibini tekshiring.',
    ru: 'Похоже, в JavaScript не закрыта одна из скобок `()`, `{}` или `[]`. Проверьте пары и порядок скобок.',
    en: 'A JavaScript `()`, `{}`, or `[]` bracket appears to be unclosed. Check matching pairs and their order.',
  },
  jsAssignment: {
    uz: 'Shart ichida `=` qiymat tayinlaydi, taqqoslamaydi. Tenglikni tekshirish uchun ko‘pincha `===` ishlatiladi: `if (score === 10) { ... }`.',
    ru: 'В условии `=` присваивает значение, а не сравнивает. Для проверки равенства обычно используйте `===`: `if (score === 10) { ... }`.',
    en: 'In a condition, `=` assigns a value rather than comparing. Use `===` to check equality: `if (score === 10) { ... }`.',
  },
  jsLooseEquality: {
    uz: '`==` turlarni avtomatik o‘zgartirib solishtiradi. Kutilmagan natijalardan qochish uchun odatda `===` ishlating; `==` ataylab kerak bo‘lsa, qoldirish mumkin.',
    ru: '`==` сравнивает значения с преобразованием типов. Чтобы избежать неожиданных результатов, обычно используйте `===`; оставляйте `==`, только если преобразование нужно намеренно.',
    en: '`==` compares values after type coercion. To avoid surprises, prefer `===`; keep `==` only when coercion is intentional.',
  },
};

type CodeIssue = { key: string; detail?: string };

const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function stripComments(code: string, language: 'html' | 'css' | 'javascript') {
  if (language === 'html') return code.replace(/<!--[\s\S]*?-->/g, '');
  if (language === 'css') return code.replace(/\/\*[\s\S]*?\*\//g, '');
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n\r]*/g, match => match.replace(/[^\n\r]/g, ' '));
}

function inspectHtml(code: string): CodeIssue[] {
  const clean = stripComments(code, 'html');
  if (/<[a-z][^<>]*$/i.test(clean)) return [{ key: 'htmlIncomplete' }];
  const stack: string[] = [];
  const seenIds = new Set<string>();
  const issues: CodeIssue[] = [];
  for (const token of clean.matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi)) {
    const tag = token[1].toLowerCase();
    const markup = token[0];
    if (tag === 'img' && !/\balt\s*=/i.test(markup)) issues.push({ key: 'htmlImageAlt' });
    const id = markup.match(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const idValue = id?.[1] ?? id?.[2] ?? id?.[3];
    if (idValue) {
      if (seenIds.has(idValue)) issues.push({ key: 'htmlDuplicateId' });
      seenIds.add(idValue);
    }

    if (/^<\//.test(markup)) {
      const top = stack[stack.length - 1];
      if (top === tag) {
        stack.pop();
      } else if (stack.includes(tag)) {
        issues.push({ key: 'htmlMismatch' });
        stack.splice(stack.lastIndexOf(tag));
      } else {
        issues.push({ key: 'htmlUnexpectedClose', detail: tag });
      }
    } else if (!voidTags.has(tag) && !/\/\s*>$/.test(markup)) {
      stack.push(tag);
    }
  }
  for (const tag of stack.slice(-2).reverse()) issues.push({ key: 'htmlUnclosed', detail: tag });
  return issues.slice(0, 4);
}

function inspectCss(code: string): CodeIssue[] {
  const clean = stripComments(code, 'css');
  const issues: CodeIssue[] = [];
  const typo = clean.match(/\b(text-colou?r|font-color|background-colou?r|paddding|margn|widht|heigth|justfy-content|alig-items)\b/i);
  if (typo) issues.push({ key: 'cssTypo', detail: typo[1] });

  const openCount = (clean.match(/\{/g) || []).length;
  const closeCount = (clean.match(/\}/g) || []).length;
  if (openCount !== closeCount) issues.push({ key: 'cssBraces' });

  for (const block of clean.matchAll(/\{([^{}]*)\}/g)) {
    for (const declaration of block[1].split(/[;\n]/)) {
      const trimmed = declaration.trim();
      const property = trimmed.match(/^([a-z-]+)\s+[^:]+$/i)?.[1];
      if (property && !trimmed.startsWith('--')) {
        issues.push({ key: 'cssColon', detail: property });
        break;
      }
    }
  }
  return issues.slice(0, 4);
}

function maskJavaScript(code: string) {
  let result = '';
  let state: 'code' | 'single' | 'double' | 'template' | 'line' | 'block' = 'code';
  for (let i = 0; i < code.length; i++) {
    const current = code[i];
    const next = code[i + 1];
    if (state === 'code') {
      if (current === "'" || current === '"' || current === '`') {
        state = current === "'" ? 'single' : current === '"' ? 'double' : 'template';
        result += ' ';
      } else if (current === '/' && next === '/') {
        state = 'line';
        result += '  ';
        i++;
      } else if (current === '/' && next === '*') {
        state = 'block';
        result += '  ';
        i++;
      } else {
        result += current;
      }
    } else if (state === 'line') {
      if (current === '\n' || current === '\r') {
        state = 'code';
        result += current;
      } else result += ' ';
    } else if (state === 'block') {
      if (current === '*' && next === '/') {
        state = 'code';
        result += '  ';
        i++;
      } else result += current === '\n' || current === '\r' ? current : ' ';
    } else if (current === '\\') {
      result += ' ';
      if (i + 1 < code.length) {
        result += code[i + 1] === '\n' || code[i + 1] === '\r' ? code[i + 1] : ' ';
        i++;
      }
    } else if (
      (state === 'single' && current === "'")
      || (state === 'double' && current === '"')
      || (state === 'template' && current === '`')
    ) {
      state = 'code';
      result += ' ';
    } else {
      result += current === '\n' || current === '\r' ? current : ' ';
    }
  }
  return result;
}

function inspectJavaScript(code: string): CodeIssue[] {
  const clean = maskJavaScript(code);
  const issues: CodeIssue[] = [];
  const stack: string[] = [];
  const closing: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of clean) {
    if (char === '(' || char === '{' || char === '[') stack.push(char);
    else if (char in closing) {
      if (stack.pop() !== closing[char]) return [{ key: 'jsBrackets' }];
    }
  }
  if (stack.length) issues.push({ key: 'jsBrackets' });

  for (const declaration of clean.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=/g)) {
    const name = declaration[1];
    const laterCode = clean.slice((declaration.index ?? 0) + declaration[0].length);
    if (new RegExp(`(?:^|[;\\n])\\s*${name}\\s*(?:=(?!=|>)|\\+\\+|--|\\+=|-=)`).test(laterCode)) {
      issues.push({ key: 'jsConst', detail: name });
      break;
    }
  }
  if (!issues.some(issue => issue.key === 'jsConst') && /\b(?:if|while)\s*\([^)]*(?<![=!<>])=(?!=|>)/.test(clean)) {
    issues.push({ key: 'jsAssignment' });
  }
  if (!issues.some(issue => issue.key === 'jsAssignment') && /(^|[^=!])==(?!=)/.test(clean)) {
    issues.push({ key: 'jsLooseEquality' });
  }
  return issues.slice(0, 4);
}

function detectLanguage(code: string): 'html' | 'css' | 'javascript' {
  if (/<\/?[a-z][\w-]*(?:\s[^<>]*)?>/i.test(code)) return 'html';
  if (/\b(?:function|const|let|var|return|console\.|document\.|=>)\b/.test(code)) return 'javascript';
  return 'css';
}

function getCodeSnippet(message: string) {
  const fenced = message.match(/```(?:html|css|javascript|js)?\s*([\s\S]*?)```/i);
  if (fenced?.[1].trim()) return fenced[1].trim();
  const looksLikeCode = /<\/?[a-z][\w-]*(?:\s[^<>]*)?>|\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=|\bfunction\s+[A-Za-z_$][\w$]*\s*\(|=>|(?:^|\n)\s*(?:if|for|while)\s*\(|(?:^|\s)[.#]?[a-z][\w-]*\s*\{[\s\S]*?:|(?:^|\s)[.#]?[a-z][\w-]*\s*\{[^{}]*\b[a-z-]+\s+[^:;}]+/i.test(message);
  return looksLikeCode ? message.trim() : null;
}

function pickTopic(message: string): Topic | null {
  const value = message.toLowerCase();
  const has = (pattern: RegExp) => pattern.test(value);
  if (has(/kunlik|daily|ежеднев|challenge|mashq|vazifa|topshiriq/)) return 'challenge';
  if (has(/kurs|course|курс|qayerdan boshl|nimadan boshl|where.*start|начать уч|o.rganishni boshl/)) return 'courses';
  if (has(/console\.log|console nima|console.*nima|console/)) return 'console';
  if (has(/xato|ошиб|error|debug|ishlamay|не работает|bug\b/)) return 'debug';
  if (has(/responsive|адаптив|moslashuv|media query|telefon ekran|mobile/)) return 'responsive';
  if (has(/class.*id|id.*class|klass.*id|класс.*id|идентификатор/)) return 'classId';
  if (has(/selector|селектор|selektor|css.*tanla|css.*выбира/)) return 'selector';
  if (has(/semantic|semantik|семантик|header.*main|main.*footer/)) return 'semantic';
  if (has(/flexbox|justify-content|align-items/)) return 'flex';
  if (has(/grid|ustun|колонк|column|qator/)) return 'grid';
  if (has(/box model|padding|margin|border|ichki bo.shliq|tashqi bo.shliq/)) return 'boxModel';
  if (has(/form|форма|input|label|anketa/)) return 'form';
  if (has(/img|image|rasm|картинк|alt атрибут|alt attribute/)) return 'image';
  if (has(/href|link|ссылк|havola|ссылка/)) return 'link';
  if (has(/dom\b|queryselector|getelementbyid|document\./)) return 'dom';
  if (has(/event|addEventListener|hodisa|событ|click|tugma bos|нажат/)) return 'event';
  if (has(/array|massiv|массив|\.length|индекс/)) return 'array';
  if (has(/object|obyekt|объект|properties|xususiyatlar/)) return 'object';
  if (has(/function|funksiya|функц|return\b/)) return 'function';
  if (has(/loop|sikl|цикл|for\b|while\b|takror/)) return 'loop';
  if (has(/if\b|else|shart|услови|taqqosla|сравни/)) return 'condition';
  if (has(/variable|o.zgaruvchi|перемен|let\b|const\b/)) return 'variables';
  if (has(/javascript|\bjs\b|скрипт|interaktiv/)) return 'javascript';
  if (has(/\bcss\b|stil|стил|rang|color|цвет/)) return 'css';
  if (has(/\bhtml\b|teg|тег|веб-страниц|web page/)) return 'html';
  return null;
}

function renderIssue(issue: CodeIssue, language: TutorLanguage) {
  const entry = codeFixes[issue.key];
  if (!entry) return '';
  const text = entry[language];
  return typeof text === 'function' ? text(issue.detail || '') : text;
}

export function getCodeTutorRuleReply(message: string, language: TutorLanguage): TutorReply | null {
  const snippet = getCodeSnippet(message);
  if (snippet) {
    const codeLanguage = detectLanguage(snippet);
    const issues = codeLanguage === 'html'
      ? inspectHtml(snippet)
      : codeLanguage === 'css'
        ? inspectCss(snippet)
        : inspectJavaScript(snippet);
    if (issues.length) {
      const header: Record<TutorLanguage, string> = {
        uz: `Koddan ${issues.length} ta ehtimoliy muammo topdim:`,
        ru: `В коде найдено возможных проблем: ${issues.length}.`,
        en: `I found ${issues.length} possible issue(s) in the code:`,
      };
      return {
        text: normalizeTutorReply(`${header[language]}\n${issues.map((issue, index) => `${index + 1}. ${renderIssue(issue, language)}`).join('\n')}\n\n${language === 'uz' ? 'Bu qoidaviy tekshiruv, shuning uchun xulosani brauzerda ham sinab ko‘ring.' : language === 'ru' ? 'Это проверка по правилам; проверьте результат и в браузере.' : 'This is a rule-based check, so verify the result in your browser too.'}`, language),
      };
    }
    const success: Record<TutorLanguage, string> = {
      uz: `${codeLanguage.toUpperCase()} kodini tekshirdim: tanilgan keng tarqalgan xatolar topilmadi. Bu to‘liq kompilyator emas, shuning uchun kodni ishga tushirib natijasini va brauzer Console’ini ham tekshiring.`,
      ru: `Я проверил код ${codeLanguage.toUpperCase()}: известных распространённых ошибок не найдено. Это не полноценный компилятор, поэтому запустите код и проверьте результат и Console браузера.`,
      en: `I checked the ${codeLanguage.toUpperCase()} code and found no common issues covered by these rules. This is not a full compiler, so run it and check the browser Console too.`,
    };
    return { text: normalizeTutorReply(success[language], language) };
  }

  const topic = pickTopic(message);
  if (!topic) return null;
  const link = topic === 'courses'
    ? { href: '/courses', label: language === 'uz' ? 'Kurslarni ko‘rish' : language === 'ru' ? 'Смотреть курсы' : 'Explore courses' }
    : topic === 'challenge'
      ? { href: '/challenge', label: language === 'uz' ? 'Kunlik mashq' : language === 'ru' ? 'Ежедневное задание' : 'Daily challenge' }
      : undefined;
  return {
    text: normalizeTutorReply(answers[topic][language], language),
    ...(link ? { link: { ...link, label: normalizeTutorReply(link.label, language) } } : {}),
  };
}

function normalizeTutorReply(text: string, language: TutorLanguage) {
  return language === 'uz' ? normalizeUzbekLatin(text) : text;
}
