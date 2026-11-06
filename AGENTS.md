# Правила проекта

Перед работой читать PLAN.md и CONTEXT.md. Обновлять их после каждого законченного этапа и перед завершением ответа. Не выдавать запланированное за реализованное. Сохранять принятый стек; новые зависимости добавлять только при конкретной необходимости.

## Цель

К понедельнику 9 ноября 2026 подготовить frontend-портфолио: независимый учебный концепт аптечного магазина для собеседования в Фармэконом. Русский интерфейс, Ангарск, демонстрационные товары и аптеки. Не официальный сайт, не реальная торговля и не медицинские рекомендации.

## Стек и границы

- Next.js App Router, TypeScript strict, совместимая актуальная React.
- Ant Design с nextjs-registry, русской локалью и общей темой. CSS Modules для собственной компоновки. Без Tailwind и без Vite как сборщика приложения.
- Redux Toolkit: корзина и аптека. RTK Query: клиентские HTTP-запросы. Создавать store на экземпляр Provider, не глобальный singleton.
- React Hook Form + Zod владеют состоянием и валидацией форм. Не дублировать их в Ant Form.
- FSD: app → widgets → features → entities → shared; root app содержит тонкие Next.js маршруты, src/app — провайдеры. Без циклических и восходящих runtime-импортов. Единственное исключение: shared/lib/store-hooks.ts использует type-only RootState/AppDispatch из композиции store в app.
- Публикация: статический экспорт Next.js на GitHub Pages, workflow после push в master. Локальные адаптеры RTK Query используют общий repository; Route Handlers удалены по согласованному переходу на Pages. NEXT_PUBLIC_API_URL — точка подключения будущего PHP API. PHP/MySQL — будущий этап. Не добавлять реальную оплату, аккаунты, аналитику или передачу персональных данных.
- Денежные значения хранить в копейках, форматировать через Intl. Проверять цены и наличие по выбранной аптеке. Проверять входные данные API через Zod.

## Поведение

- Первичная загрузка: скелетоны соответствуют геометрии контента. Повторная: сохранять старые данные, отмечать обновление и не позволять действовать по устаревшему наличию.
- Поиск с debounce; запрос/категория/сортировка в URL. Back/Forward сохраняют смысл состояния. Доступная кнопка очистки.
- Ошибки локальны, есть повтор; пустые состояния предлагают конкретное действие.
- Корзина мгновенно обновляется, сохраняется локально после hydration; повреждённые данные хранилища не ломают приложение. До восстановления не перезаписывать сохранённое.
- Интерактивные элементы имеют имена, формы — связанные подписи. Видимый focus, reduced motion, мобильный layout без горизонтального скролла.
- В демо нельзя изображать реальный заказ. Не запрашивать телефон/адрес: форма использует только неперсональные поля получения и подтверждение демонстрационного режима.

## Проверка и завершение

- Проверять typecheck, unit/integration tests и production build. E2E — основной путь, URL-навигация, ошибки API и восстановление корзины. Не объявлять браузерную проверку выполненной без запуска.
- После проверки публиковать только завершённую версию с учётом совместимости хостинга с настоящим Next.js. Не заменять Next.js другим runtime ради публикации.
- В отчёте указывать выполненные этапы из 10, оставшиеся, команды проверок и ограничения. Не обещать срок без оговорки о рисках.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
