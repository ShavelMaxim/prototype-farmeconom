# Контекст для продолжения

## Цель и решения

Frontend-портфолио к собеседованию в Фармэконом 9 ноября 2026. Самостоятельный учебный концепт «Аптека рядом», вымышленные данные, без настоящих покупок и персональных полей. Пользователь поручил вести работу автономно по плану.

По последнему согласованию хостинг — GitHub Pages, push в master запускает Actions. Next.js App Router сохранён, output: export, trailingSlash: true. Подпапка задаётся NEXT_PUBLIC_BASE_PATH; в Actions она берётся из configure-pages. PHP/MySQL — дополнительный будущий этап после публикации. Vercel больше не используется.

Стек: TypeScript strict, React, Ant Design/CSS Modules, Redux Toolkit/RTK Query, RHF/Zod, Vitest и Playwright, облегчённая FSD. Версии закреплены lockfile.

## Реализация

Каталог из 24 товаров, поиск/категории/сортировка/наличие в URL, статические карточки, три аптеки с разными ценами и остатками, корзина с localStorage, демо-оформление, loading/error/empty states и адаптивность.

Route Handlers удалены для статического хостинга. Каталог и оформление используют локальные queryFn-адаптеры RTK Query, задержку и моделирование ошибки; это не серверная защита заказа. NEXT_PUBLIC_API_URL с завершающим / включает HTTP-режим для будущего PHP API, который ещё не реализован и не проверен. Компоненты зависят от тех же hooks/моделей.

Не удалять стабильный serverState из Providers: он нужен для согласованной hydration и восстановления корзины при прямом входе в статическую карточку.

## Проверки 6 ноября 2026

Успешно: статическая production-сборка с /prototype-farmeconom, TypeScript, ESLint, 16 unit/integration-тестов, 14 Playwright-проверок (7 desktop + 7 mobile), включая прямой вход и обновление карточки, сохранение корзины, ошибки и историю URL. Mobile — эмуляция Chromium, не Safari. После изменения кода проверять затронутые сценарии.

npm start теперь запускает scripts/serve-static.mjs и раздаёт out на 127.0.0.1:3100. Сборка и preview должны получать одинаковый NEXT_PUBLIC_BASE_PATH. PLAYWRIGHT_BASE_URL позволяет тестировать внешнюю ссылку без локального сервера. check:deployment проверяет страницы и JS/CSS с учётом подпапки.

Windows, Node 24.21.0, npm 12.2.0. Генерируемая .next/dev содержала старые типы удалённых API; она очищена, следующая сборка прошла. В CI для браузеров используется Chromium, локально установленный Chrome.

## Git и публикация

Репозиторий: https://github.com/ShavelMaxim/prototype-farmeconom. Ветка master. origin настроен. Исходная версия до перехода сохранена коммитом fbd0ec5. Подключённый MCP GitHub использует verdant-yucca, но штатный Git Credential Manager успешно авторизуется как ShavelMaxim. Не выводить и не сохранять credentials. Вспомогательный API-скрипт находится вне репозитория в work/ и использует credential только в памяти.

.github/workflows/pages.yml: push master / manual → проверки → export → E2E → Pages. checks.yml проверяет PR и push. GitHub Pages пока не настроен (GET pages вернул 404). Следующее действие: commit/push, включение Pages build_type=workflow, проверка workflow и внешнего URL. До подтверждения deployment этап 10 остаётся незавершённым.

README, DEPLOYMENT и INTERVIEW обновлены под Pages. Старый архив ../pharm-demo-source.zip содержит версию до перехода и не отражает текущий код; использовать репозиторий как источник актуальных исходников.
