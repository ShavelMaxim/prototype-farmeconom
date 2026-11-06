# Аптека рядом — frontend-портфолио

Независимый учебный концепт аптечного магазина для собеседования в Фармэконом. Данные вымышленные; реальные заказы не создаются. Next.js App Router экспортируется в статические файлы для GitHub Pages.

## Возможности

24 товара, поиск с debounce, фильтры и сортировка в URL, прямые страницы товаров, три аптеки с разными ценами и наличием, сохраняемая корзина, демо-оформление. Мобильные фильтры, локальные ошибки с повтором, сохранение выдачи при обновлении, скелетоны и панель демонстрации задержки/ошибки.

## Стек и архитектура

Next.js, TypeScript strict, React, Ant Design/CSS Modules, Redux Toolkit/RTK Query, React Hook Form/Zod, Vitest/Testing Library, Playwright. Версии закреплены в package-lock.json. Node.js 24.

Облегчённая FSD: app (маршруты) → src/widgets → src/features → src/entities → src/shared; src/app собирает провайдеры. Redux хранит корзину и аптеку, RTK Query — результаты адаптеров, URL — фильтры, RHF — форму. Стабильный serverState Provider обеспечивает восстановление корзины при hydration.

HTML и карточки создаются во время сборки. Фильтрация, наличие и демо-оформление выполняются в браузере. Это не серверная защита цены или заказа. Деньги — целые копейки. Данные не сохраняются на сервере, персональные поля отсутствуют.

## Запуск

```powershell
npm ci
npm run dev
```

Для воспроизведения GitHub Pages:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/prototype-farmeconom'
npm run build
npm start
```

Статический просмотр: http://127.0.0.1:3100/prototype-farmeconom/. Для размещения в корне уберите NEXT_PUBLIC_BASE_PATH перед сборкой и запуском. После смены пути нужна пересборка. npm start раздаёт out; сервер Next.js на Pages не запускается.

## Данные и будущий PHP API

По умолчанию RTK Query использует локальные адаптеры с задержкой и моделированием ошибок. NEXT_PUBLIC_API_URL с завершающим / включает HTTP-режим: GET products с q/category/sort/available/pharmacy/demo, POST demo-checkout с pharmacy/pickup/acknowledge/items. Форматы моделей описаны в src/entities/product/model.ts и src/features/checkout/model.ts. PHP/MySQL пока не реализованы; HTTP-режим не проверен с настоящим backend. NEXT_PUBLIC_* доступны браузеру и не должны содержать секреты.

## Проверки

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run check:deployment -- https://shavelmaxim.github.io/prototype-farmeconom/
```

E2E проверяют out на статическом сервере, включая базовый путь, mobile, корзину, URL, ошибки и прямой вход в карточку. Локально нужен Chrome; CI устанавливает Chromium. PLAYWRIGHT_BASE_URL позволяет проверить опубликованный URL без локального сервера. Mobile — эмуляция в Chromium, не Safari.

## Публикация

.github/workflows/pages.yml: push в master или ручной запуск → проверки → сборка с base_path Pages → E2E → upload out → deploy. Settings → Pages → Source: GitHub Actions. Подробности — DEPLOYMENT.md, статус — CONTEXT.md и PLAN.md.

## Ограничения

Нет настоящих лекарственных данных, рекомендаций, оплаты, аккаунтов, админки, PHP/MySQL и интеграции с аптеками. Новые страницы товаров требуют пересборки. robots noindex не ограничивает доступ. Соответствие WCAG и рост конверсии не заявляются.

Сценарий показа: INTERVIEW.md. Перед продолжением читать AGENTS.md, PLAN.md, CONTEXT.md.
