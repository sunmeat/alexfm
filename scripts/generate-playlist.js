// Запускать локально ПЕРЕД деплоем на Vercel:
//   npm install
//   node scripts/generate-playlist.js
//
// Скрипт сканирует папку tracks/, считает длительность каждого файла
// и сохраняет playlist.json в корне проекта. Этот файл нужно закоммитить
// в репозиторий — serverless-функция на Vercel читает его, а не сканирует
// файлы заново (там нет ffmpeg/ffprobe из коробки).

const fs = require('fs');
const path = require('path');
const { parseFile } = require('music-metadata');

const TRACKS_DIR = path.join(__dirname, '..', 'tracks');
const OUTPUT_FILE = path.join(__dirname, '..', 'playlist.json');

async function main() {
    const files = fs.readdirSync(TRACKS_DIR)
        .filter(f => /\.(mp3|m4a|wav|flac)$/i.test(f))
        .sort();

    if (files.length === 0) {
        console.error('В папке tracks нет аудиофайлов!');
        process.exit(1);
    }

    const playlist = [];

    for (const file of files) {
        const filePath = path.join(TRACKS_DIR, file);
        const metadata = await parseFile(filePath);
        const duration = metadata.format.duration;

        if (!duration) {
            console.warn(`Не удалось определить длительность: ${file}, пропускаю`);
            continue;
        }

        playlist.push({
            file,
            title: metadata.common.title || file.replace(/\.[^.]+$/, ''),
            artist: metadata.common.artist || '',
            duration
        });

        console.log(`✓ ${file} — ${duration.toFixed(1)} сек`);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(playlist, null, 2));
    console.log(`\nГотово! ${playlist.length} треков сохранено в playlist.json`);
    console.log('Не забудьте закоммитить playlist.json в репозиторий.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});