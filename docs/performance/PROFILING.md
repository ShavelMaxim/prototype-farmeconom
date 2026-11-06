# Профилирование JavaScript и рендеринга

## Методика

Контроль — приложение c084021 с инструментальным включением productionBrowserSourceMaps. Его out сохранён до исправлений. Обе сборки раздавались тем же scripts/serve-static.mjs по одному localhost URL, с одинаковым basePath. Lighthouse13.6, стандартный mobile профиль и чистый кеш; по3 последовательных прогона, без одновременных build/тестов. Сервер не сжимает HTML/JS, поэтому абсолютные числа нельзя напрямую сравнивать с GitHub Pages.

CPU: Chrome DevTools Protocol, sampling1ms, CPU slowdown4x, viewport412×823, DPR1,75, новый browser context, кеш выключен. Окно: навигация → networkidle → наличие кнопки каталога → 1s стабилизации. Сохранены cpuprofile, trace и summary с исходниками из source maps. Inclusive time источников перекрывается — эти значения нельзя складывать.

## Найденные причины и исправления

1. **Каталог строился в браузере.** useSearchParams под Suspense не давал готового каталога в HTML: 0 article и скелетон. Заменён на useSyncExternalStore с известным server snapshot и синхронизацией History/popstate. В первоначальном исправлении 24 article уже были в HTML, но оставались скрыты root loading/Suspense. Лишние оболочки главной удалены; сейчас каталог читается даже без JavaScript.
2. **Повторный рендер и CSS-in-JS.** Профиль показал renderWithHooks/commitMutationEffects, @ant-design/cssinjs/useGlobalCache, genStyleUtils и stylis. Готовые демо-данные заново проходили fake cold query, переключая кнопки через fetching. Теперь демо-store синхронно получает inventory/default catalog до рендера. HTTP-режим никогда не seed статическими ценами. ProductCard мемоизирован для неизменённых props.
3. **Intl.NumberFormat на каждую цену.** CPU-профиль указывает на money в product/model.ts. Форматтер теперь создаётся один раз на модуль; формат рублей и хранение копеек сохранены.
4. **Фоновый prefetch.** Trace фиксировал RSC-загрузки корзины/карточек до первого клика, около72КБ на страницу. Prefetch ссылок выключен. Переходы остаются клиентскими; запрос страницы переносится на переход — это компромисс между cold start и первым открытием страницы.
5. **Неиспользуемые держатели AntD App.** Исходник antd/es/app/App.js создаёт useMessage/useNotification/useModal. В проекте нет вызовов их App API. Убрана только обёртка App; ConfigProvider, Registry и используемые компоненты остались. Начальный JS дополнительно уменьшился примерно на71,5КБ без сжатия относительно промежуточной версии.

## Финальное сравнение: медиана3 Lighthouse-прогонов

| Метрика                  | До          | После       |
| ------------------------ | ----------- | ----------- |
| Performance              | 44 (43–45)  | 67 (65–69)  |
| LCP                      | 9,12s       | 2,41s       |
| TBT                      | 3398ms      | 1972ms      |
| CLS                      | 0           | 0           |
| Начальные запросы        | 34          | 20          |
| JS transferSize без gzip | 1156258байт | 1084364байт |

Сырые файлы: profiles/before-lighthouse-1..3.json и profiles/after-lighthouse-1..3.json. stage1-* — первый эксперимент, где оставались root loading/prefetch. stage2-* — промежуточная версия с глобальным AntD App: медиана70, LCP2,27s, TBT1428ms,22запроса. Не выбираем лучший промежуточный балл как результат финальной версии: балл колеблется, final67 при меньшем количестве JS/запросов. Выигрыш относительно контроля виден во всех финальных прогонах, но это не полевые данные.

## Один диагностический CPU trace до/после

| Метрика          | До     | После  |
| ---------------- | ------ | ------ |
| ScriptDuration   | 3,272s | 1,071s |
| TaskDuration     | 7,823s | 4,429s |
| UpdateLayoutTree | 518ms  | 115ms  |
| Paint            | 430ms  | 96ms   |
| Layout           | 1043ms | 1092ms |

Это одиночные профили, не статистика каждой функции. Layout не улучшился — браузер сразу получает все карточки. Не заявлять ускорение всех стадий. cpuprofile открывается в DevTools JavaScript profiler/Performance, trace — в Performance. В source maps Next/Turbopack есть предупреждения для части колонок Lighthouse; сопоставление не идеально, исходные метрики и trace сохранены.

## Воспроизведение

```powershell
$env:PROFILE_BUILD='true'
$env:NEXT_PUBLIC_BASE_PATH='/prototype-farmeconom'
npm run build
npm start
```

В другом терминале из проекта:

```powershell
node scripts/profile-page.mjs after out
node node_modules/lighthouse/cli/index.js http://127.0.0.1:3100/prototype-farmeconom/ --only-categories=performance --output=json --output-path=docs/performance/profiles/after-lighthouse-1.json --chrome-flags="--headless --no-sandbox" --quiet
```

Повторить Lighthouse3раза последовательно с разными файлами. Не запускать build/тесты одновременно. STATIC_DIRECTORY выбирает сохранённый контрольный out. Для обычной production-сборки удалить PROFILE_BUILD: source maps по умолчанию выключены.

## Проверки и ограничения

Защита: HTML каталога без JS, query-события/popstate, прежние фильтры/Back/корзина/hydration/axe. Используется пустой browser context и демо-каталог. Лабораторный CPU slowdown и localhost не описывают всех пользователей; TBT не равен полевому INP. Результаты обычной production-сборки и внешних проверок дополняются в CONTEXT.md.
