# VANTAGE

Аналитика Dota 2. Личный инструмент, русский интерфейс, тёмная тема.

Документация проекта: [`CLAUDE.md`](CLAUDE.md), [`docs/PLAN.md`](docs/PLAN.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DESIGN.md`](docs/DESIGN.md), [`docs/FEATURES.md`](docs/FEATURES.md).

## Запуск

Нужен Node.js 20 или новее. Проверить в PowerShell: `node -v`. Если команды нет, поставить LTS с nodejs.org.

```
npm install
npm run dev
```

Откроется на http://localhost:5173

Этого достаточно. `vercel dev` использовать не нужно: он ломает Vite на разборе `index.html`. Запросы к Stratz в деве обрабатывает встроенный плагин из `vite.config.ts`, он читает ключ из `.env.local`. На проде тот же путь `/api/stratz` обслуживает функция из папки `api/`.

## Команды

```
npm run dev         дев-сервер
npm run build       продакшн-сборка в dist
npm run preview     посмотреть собранное
npm run test        тесты
npm run typecheck   проверка типов
```

## Переменные окружения

Файл `.env.local` уже лежит рядом и в git не попадает.

```
STRATZ_API_KEY        ключ Stratz, читает только серверная функция
VITE_DEFAULT_STEAM_ID стартовый профиль на главной
```

На Vercel те же переменные задаются в Settings → Environment Variables. `STRATZ_API_KEY` там без префикса `VITE_`, иначе ключ уедет в клиентский бандл.

## Первая заливка на GitHub

```
git init
git add .
git commit -m "VANTAGE 2.0: каркас"
git branch -M main
git remote add origin https://github.com/daqubuwu/VANTAGE2.git
git push -u origin main
```

`.gitignore` уже исключает `node_modules`, `dist` и `.env.local`. Ключ Stratz в репозиторий не попадёт.
