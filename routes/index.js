const express = require('express');
const router = express.Router();
const store = require('../config/store');
const { sendContactNotification } = require('../config/email');

// GET / - Home page
router.get('/', (req, res) => {
    const { settings, awards, songs, news, brandsAll, youtubeVideos, reels } = store.getHomeData();

    res.render('index', {
        settings,
        awards,
        songs,
        news,
        brands: {
            row1: brandsAll.filter(b => b.row_group === 'brands_row1'),
            row2: brandsAll.filter(b => b.row_group === 'brands_row2'),
            films_row1: brandsAll.filter(b => b.row_group === 'films_row1'),
            films_row2: brandsAll.filter(b => b.row_group === 'films_row2'),
        },
        youtubeVideos,
        reels,
    });
});

// POST /contact
router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const submission = store.addContactSubmission({ name, email, subject, message });

        // Send email notification (non-blocking)
        sendContactNotification({ id: submission.id, name, email, subject, message })
            .catch(err => console.error('Email send error:', err));

        res.json({ success: true, message: 'Thank you! Your message has been sent.' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
