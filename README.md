# Telegram Bot for video download
Телеграм бот, позволяющий скачивать видео из ютуба, вк и дзен.

# Особенности
- Бот может взаимодействовать сразу с большим количеством людей
- Размер скачиваемых видео увеличен до 2 ГБ
- Кеширование отправленных видео (при повторной отправке той же ссылки пользователю моментально будет отправлено видео)
- Возможность скачивания видео из:
  - YouTube | YouTube Shorts (https://youtube.com)
  - VK | VK Clips (https://vk.com)
  - Zen (https://dzen.ru)

## Требования:
- Linux
- NodeJS 18.18.0 (https://nodejs.org/en)
- FFmpeg и FFprobe (https://www.ffmpeg.org/)

# Установка
#### Заполнить .env.example и переименовать его в .env
- BOT_TOKEN - токен бота.
- API_ID и API_HASH - читать [тут](https://core.telegram.org/api/obtaining_api_id).

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
