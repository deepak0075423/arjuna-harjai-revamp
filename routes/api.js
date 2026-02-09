const express = require('express');
const router = express.Router();
const store = require('../config/store');

// GET /api/reels.json - matches existing reels.json format
router.get('/reels.json', (req, res) => {
    const reels = store.list('reels', {
        where: r => (r.is_active ?? 1) === 1,
        sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    });

    res.json({
        updatedAt: new Date().toISOString(),
        items: reels.map(r => ({
            src: r.video_path,
            caption: r.caption || '',
            likes: r.likes || null,
            comments: r.comments || null,
            instagram_url: r.instagram_url || null
        }))
    });
});

// GET /api/news.json - matches existing news.json format
router.get('/news.json', (req, res) => {
    const news = store.list('news', {
        where: n => (n.is_active ?? 1) === 1,
        sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(b.date || '').localeCompare(String(a.date || '')),
    });

    res.json({
        updatedAt: new Date().toISOString(),
        items: news.map(n => ({
            title: n.title,
            url: n.url,
            source: n.source || '',
            date: n.date || '',
            image: n.image || ''
        }))
    });
});

module.exports = router;
