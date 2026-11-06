# Профилирование JavaScript и рендеринга

## Что измерялось

Контрольная версия — c084021 (приложение до текущих исправлений), с единственным инструментальным изменением: PROFILE_BUILD=true включает productionBrowserSourceMaps. Её out сохранён отдельно перед изменениями. Обе сборки раздавались тем же scripts/serve-static.mjs на одном localhost URL, с одинаковым basePath. Lighthouse 13.6.0, мобильный профиль по умолчанию, чистый кеш, по 3 последовательных прогона; одновременно не запускались build и тесты. Локальный сервер не сжимает HTML, поэтому абсолютные значения нельзя сравнивать с прежними одиночными замерами GitHub Pages.

Для CPU использован Chrome DevTools Protocol: sampling 1 мс, CPU slowdown 4x, viewport 412×823, DPR1,75, новый browser context и выключенный кеш. Окно: навигация → networkidle → наличие кнопки каталога → 1 секунда стабилизации. Сохраняются cpuprofile, trace и summary с источниками из source maps. Inclusive time разных источников перекрывается; эти значения нельзя складывать.

## Подтверждённые причины

1. **CSR bailout каталога.** useSearchParams под Suspense не позволял отдать готовый каталог: исходный HTML содержал 0 article и скелетон. После перехода на useSyncExternalStore появились 24 article, но loading/Suspense ещё удерживали их в скрытом streaming-контейнере. Удалены лишние оболочки главной; сейчас 24 карточки видны даже при отключённом JavaScript.
2. **Повторные рендеры и CSS-in-JS.** Контрольный CPU-профиль показывает React renderWithHooks/commitMutationEffects, @ant-design/cssinjs/useGlobalCache, genStyleUtils и stylis. При холодном старте готовые демо-данные заново проходили искусственный запрос и переключали все кнопки через fetching-состояния. Теперь store демо-режима синхронно получает inventory и default catalog; HTTP-режим не инициализируется статическими ценами. ProductCard мемоизирован, ввод поискового черновика не требует рендера неизменённых карточек.
3. **Создание Intl.NumberFormat для каждой цены.** В CPU-профиле заметен money из product/model.ts. Теперь форматтер создаётся один раз на модуль, формат денег и копейки не изменены.
4. **Фоновый prefetch до первого действия.** Network trace фиксировал RSC-загрузки корзины и товаров, около 72 КБ на отдельную страницу. У ссылок установлен prefetch=false. Переходы остаются клиентскими, но код/данные запрашиваются при переходе; это осознанный компромисс между холодной загрузкой и скоростью первого перехода.

## Lighthouse: одинаковые условия, медиана трёх прогонов

| Метрика           | До         | После      |
| ----------------- | ---------- | ---------- |
| Performance       | 44 (43–45) | 70 (69–71) |
| LCP               | 9,12 с     | 2,27 с     |
| TBT               | 3398 мс    | 1428 мс    |
| CLS               | 0          | 0          |
| Начальные запросы | 34         | 22         |

Сырые данные: profiles/before-lighthouse-1..3.json и profiles/after-lighthouse-1..3.json. stage1-* содержит промежуточный эксперимент без окончательного устранения loading-оболочек и prefetch; он сохранён, чтобы не скрывать неудачную промежуточную проверку.

## CPU/рендеринг: один диагностический trace до и после

| Метрика          | До      | После   |
| ---------------- | ------- | ------- |
| ScriptDuration   | 3,272 с | 1,069 с |
| TaskDuration     | 7,823 с | 4,370 с |
| UpdateLayoutTree | 518 мс  | 101 мс  |
| Paint            | 430 мс  | 82 мс   |
| Layout           | 1043 мс | 1309 мс |

Это единичные профили, не статистическая оценка каждой функции. Layout не улучшился: теперь браузер сразу получает весь каталог. Не заявлять, что ускорены все стадии рендеринга. Полные trace и cpuprofile доступны в profiles; cpuprofile открывается в DevTools Performance/JavaScript profiler, trace — в Performance.

## Воспроизведение

```powershell
$env:PROFILE_BUILD='true'
$env:NEXT_PUBLIC_BASE_PATH='/prototype-farmeconom'
npm run build
npm start
```

В другом терминале из папки проекта:

```powershell
node scripts/profile-page.mjs after out
node node_modules/lighthouse/cli/index.js http://127.0.0.1:3100/prototype-farmeconom/ --only-categories=performance --output=json --output-path=docs/performance/profiles/after-lighthouse-1.json --chrome-flags="--headless --no-sandbox" --quiet
```

Повторить Lighthouse три раза последовательно с разными выходными файлами. Не запускать тесты/сборку одновременно. STATIC_DIRECTORY позволяет раздавать сохранённую контрольную сборку. Для обычной production-сборки удалить PROFILE_BUILD: source maps по умолчанию выключены.

## Ограничения и защита от регрессий

Это лабораторные данные на одном компьютере; замедление CPU и localhost не описывают всех пользователей. TBT не равен полевому INP. Source maps Next/Turbopack выдают предупреждения для части колонок при обработке Lighthouse — сопоставление не идеально; числовые метрики и сам trace сохранены без ручной коррекции.

Новые проверки: каталог читается без JavaScript, синхронизация query через собственное событие/popstate, прежние фильтры/Back/корзина/hydration/axe. Скрипт не собирает персональные данные, использует пустой browser context и демонстрационный каталог. Фактический результат production CI и внешней проверки дополняется в CONTEXT.md.
