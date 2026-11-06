# GitHub Pages

Репозиторий: https://github.com/ShavelMaxim/prototype-farmeconom
Ветка публикации: master. Workflow: .github/workflows/pages.yml.

## Настройка

Settings → Pages → Build and deployment → Source: GitHub Actions. После push в master workflow выполняет npm ci, typecheck, lint, unit-тесты, статическую сборку и E2E; затем публикует out. Подпапка определяется через actions/configure-pages и не зашита в исходники. Для PR checks.yml проверяет код без публикации.

Права deploy: pages: write, id-token: write. Environment: github-pages. Публикация получает артефакт только после успешных проверок. Секреты демо не нужны.

Ожидаемый URL (до проверки не считать опубликованным): https://shavelmaxim.github.io/prototype-farmeconom/

## Проверка

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/prototype-farmeconom'
npm run build
npm run test:e2e
npm start
```

Просмотр: http://127.0.0.1:3100/prototype-farmeconom/.

```powershell
npm run check:deployment -- https://shavelmaxim.github.io/prototype-farmeconom/
$env:PLAYWRIGHT_BASE_URL='https://shavelmaxim.github.io/prototype-farmeconom/'
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

Smoke проверяет страницы и JS/CSS. E2E проверяют клиентские моки и оформление: HTTP API на Pages отсутствует. Для статической версии используется npm start (скрипт serve-static.mjs), а не next start.

## Будущий backend

NEXT_PUBLIC_API_URL включает HTTP-адаптер RTK Query. PHP потребуется разместить отдельно от Pages и настроить HTTPS/CORS. Браузерная проверка цены не заменяет серверную в настоящем магазине. PHP/MySQL отложены до завершения публикации.

Фактический статус — CONTEXT.md. Успешная локальная сборка не доказывает успешный deployment.
