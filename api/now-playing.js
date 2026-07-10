const fs = require('fs');
const path = require('path');

// Плейлист читаем один раз при холодном старте функции
const playlist = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'playlist.json'), 'utf-8')
);

const totalDuration = playlist.reduce((sum, t) => sum + t.duration, 0);

module.exports = (req, res) => {
    if (!playlist.length) {
        res.status(500).json({ error: 'Плейлист пуст' });
        return;
    }

    const now = Date.now() / 1000; // секунды
    const elapsed = now % totalDuration; // позиция внутри бесконечно повторяющегося плейлиста

    let cumulative = 0;
    let current = playlist[0];
    let offset = 0;
    let index = 0;

    for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        if (elapsed < cumulative + track.duration) {
            current = track;
            offset = elapsed - cumulative;
            index = i;
            break;
        }
        cumulative += track.duration;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
        file: current.file,
        title: current.title,
        artist: current.artist,
        duration: current.duration,
        offset,                 // с какой секунды нужно начать воспроизведение
        index,
        serverTime: now,        // для компенсации сетевой задержки на клиенте
        nextTrackIn: current.duration - offset // через сколько сек сменится трек
    });
};