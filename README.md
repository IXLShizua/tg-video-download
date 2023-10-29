# Telegram Bot for video download
Телеграм бот, позволяющий скачивать видео из ютуба, вк и яндекс дзен.

# Особенности
- Бот может взаимодействовать сразу с большим количеством людей
- Размер скачиваемых видео увеличен до 2 ГБ
- Возможность скачивания видео из:
  - YouTube | YouTube Shorts
  - VK | VK Clips
  - Yandex Zen

## Требования:
- NodeJS >= 18.18.0 (https://nodejs.org/en)
- yt-dlp (https://github.com/yt-dlp/yt-dlp)

# Установка
### Заполнить .env.example и переименовать его в .env
- BOT_TOKEN - токен бота.
- API_ID и API_HASH - читать [тут](https://core.telegram.org/api/obtaining_api_id)

Для установки всех зависимостей:
```
npm install
```
Для сборки:
```
npm build
```
Для запуска:
```
npm start
```
