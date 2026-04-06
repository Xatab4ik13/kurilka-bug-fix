# KURILKA frontend

## Deploy to Timeweb via GitHub Actions

Workflow file: `.github/workflows/deploy-timeweb.yml`

### Required GitHub Secrets

- `TIMEWEB_SSH_HOST` — IP или домен сервера Timeweb
- `TIMEWEB_SSH_USER` — SSH пользователь
- `TIMEWEB_SSH_PORT` — SSH порт, обычно `22`
- `TIMEWEB_TARGET_DIR` — папка для фронтенда на сервере, например `/var/www/kurilka`
- `TIMEWEB_SSH_PRIVATE_KEY` — приватный SSH ключ для деплоя
- `TIMEWEB_SSH_KNOWN_HOSTS` — optional, вывод `ssh-keyscan` для сервера

### What the workflow does

1. Устанавливает зависимости через Bun
2. Собирает Vite-приложение
3. Подключается по SSH
4. Загружает содержимое `dist/` на сервер через `rsync`

### Server requirements

- На сервере должен быть настроен веб-сервер, который раздаёт `TIMEWEB_TARGET_DIR`
- Для SPA нужен fallback на `index.html`
- SSH пользователь должен иметь доступ на запись в `TIMEWEB_TARGET_DIR`
