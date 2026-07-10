// Проксирует запрос к lrclib.net (бесплатный сервис синхронизированных текстов).
// Ключ не нужен. Если ничего не найдено — просто возвращаем { found: false }.

module.exports = async (req, res) => {
  const artist = (req.query.artist || '').trim();
  const title = (req.query.title || '').trim();

  if (!title) {
    res.status(200).json({ found: false });
    return;
  }

  try {
    const params = new URLSearchParams({
      artist_name: artist,
      track_name: title
    });

    const response = await fetch(`https://lrclib.net/api/search?${params}`, {
      headers: { 'User-Agent': 'AlexFM-Radio (https://alexfm.vercel.app)' }
    });

    if (!response.ok) {
      res.status(200).json({ found: false });
      return;
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      res.status(200).json({ found: false });
      return;
    }

    // предпочитаем результат с синхронизированным текстом
    const match = results.find(r => r.syncedLyrics) || results.find(r => r.plainLyrics) || null;

    if (!match) {
      res.status(200).json({ found: false });
      return;
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json({
      found: true,
      synced: match.syncedLyrics || null,
      plain: match.plainLyrics || null
    });
  } catch (err) {
    res.status(200).json({ found: false });
  }
};
