const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const store = require('../config/store');
const { requireAuth } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../middleware/upload');

// All admin routes require auth
router.use(requireAuth);

async function renderAdmin(req, res, viewName, locals = {}) {
    const viewPath = path.join(req.app.get('views'), 'admin', `${viewName}.ejs`);
    const body = await ejs.renderFile(
        viewPath,
        { ...res.locals, ...locals },
        { async: true }
    );

    return res.render('admin/layout', { ...res.locals, ...locals, body });
}

// Helper to set flash messages
function setFlash(req, type, message) {
    req.session.flash = { type, message };
}

// Helper to get settings as object
function getSettings() {
    return store.getSettings();
}

// Helper to upsert settings
function saveSetting(key, value) {
    store.setSetting(key, value || '');
}

function isCmsUploadedFile(urlPath) {
    const base = path.basename(String(urlPath || ''));
    return /^\d{13}-\d+\.[a-z0-9]+$/i.test(base);
}

// ===================== DASHBOARD =====================
router.get('/', (req, res) => {
    const stats = store.getAdminStats();
    const recentSubmissions = store.listRecentSubmissions(5);
    renderAdmin(req, res, 'dashboard', { pageTitle: 'Dashboard', currentPage: 'dashboard', stats, recentSubmissions })
        .catch(() => res.status(500).send('Failed to render admin dashboard'));
});

// ===================== HERO =====================
router.get('/hero', (req, res) => {
    renderAdmin(req, res, 'hero', { pageTitle: 'Hero Section', currentPage: 'hero', settings: getSettings() })
        .catch(() => res.status(500).send('Failed to render hero page'));
});

router.post('/hero', (req, res) => {
    const fields = ['hero_title', 'hero_subtitle', 'hero_tagline', 'hero_cta1_text', 'hero_cta1_url', 'hero_cta2_text', 'hero_cta2_url'];
    fields.forEach(f => saveSetting(f, req.body[f]));
    setFlash(req, 'success', 'Hero section updated successfully');
    res.redirect('/admin/hero');
});

// ===================== ABOUT =====================
router.get('/about', (req, res) => {
    renderAdmin(req, res, 'about', { pageTitle: 'About', currentPage: 'about', settings: getSettings() })
        .catch(() => res.status(500).send('Failed to render about page'));
});

router.post('/about', uploadImage.single('about_image'), (req, res) => {
    const fields = [
        'about_intro', 'about_bio_1', 'about_bio_2', 'about_bio_3',
        'stat_1_number', 'stat_1_label', 'stat_2_number', 'stat_2_label',
        'stat_3_number', 'stat_3_label'
    ];
    fields.forEach(f => saveSetting(f, req.body[f]));

    if (req.file) {
        saveSetting('about_image', '/assets/uploads/' + req.file.filename);
    }

    setFlash(req, 'success', 'About section updated successfully');
    res.redirect('/admin/about');
});

// ===================== AWARDS =====================
router.get('/awards', (req, res) => {
    const awards = store.list('awards', { sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) });
    renderAdmin(req, res, 'awards', { pageTitle: 'Awards', currentPage: 'awards', awards })
        .catch(() => res.status(500).send('Failed to render awards page'));
});

router.get('/awards/new', (req, res) => {
    renderAdmin(req, res, 'award-form', { pageTitle: 'Add Award', currentPage: 'awards', award: null })
        .catch(() => res.status(500).send('Failed to render award form'));
});

router.post('/awards', (req, res) => {
    const { year, tag, title, description } = req.body;
    const maxOrder = store.maxSortOrder('awards');
    store.insert('awards', { year, tag, title, description, sort_order: maxOrder + 1 });
    setFlash(req, 'success', 'Award added successfully');
    res.redirect('/admin/awards');
});

router.get('/awards/:id/edit', (req, res) => {
    const award = store.getRow('awards', req.params.id);
    if (!award) return res.redirect('/admin/awards');
    renderAdmin(req, res, 'award-form', { pageTitle: 'Edit Award', currentPage: 'awards', award })
        .catch(() => res.status(500).send('Failed to render award form'));
});

router.post('/awards/:id', (req, res) => {
    const { year, tag, title, description } = req.body;
    store.updateRow('awards', req.params.id, { year, tag, title, description });
    setFlash(req, 'success', 'Award updated successfully');
    res.redirect('/admin/awards');
});

router.post('/awards/:id/delete', (req, res) => {
    store.deleteRow('awards', req.params.id);
    setFlash(req, 'success', 'Award deleted');
    res.redirect('/admin/awards');
});

// ===================== SONGS =====================
router.get('/songs', (req, res) => {
    const songs = store.list('songs', { sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) });
    renderAdmin(req, res, 'songs', { pageTitle: 'Songs', currentPage: 'songs', songs })
        .catch(() => res.status(500).send('Failed to render songs page'));
});

router.get('/songs/new', (req, res) => {
    renderAdmin(req, res, 'song-form', { pageTitle: 'Add Song', currentPage: 'songs', song: null })
        .catch(() => res.status(500).send('Failed to render song form'));
});

router.post('/songs', (req, res) => {
    const { name, category, spotify_embed_url } = req.body;
    const maxOrder = store.maxSortOrder('songs');
    store.insert('songs', {
        name,
        category,
        spotify_embed_url,
        sort_order: maxOrder + 1,
        is_active: 1
    });
    setFlash(req, 'success', 'Song added successfully');
    res.redirect('/admin/songs');
});

router.get('/songs/:id/edit', (req, res) => {
    const song = store.getRow('songs', req.params.id);
    if (!song) return res.redirect('/admin/songs');
    renderAdmin(req, res, 'song-form', { pageTitle: 'Edit Song', currentPage: 'songs', song })
        .catch(() => res.status(500).send('Failed to render song form'));
});

router.post('/songs/:id', (req, res) => {
    const { name, category, spotify_embed_url } = req.body;
    store.updateRow('songs', req.params.id, {
        name,
        category,
        spotify_embed_url,
    });
    setFlash(req, 'success', 'Song updated successfully');
    res.redirect('/admin/songs');
});

router.post('/songs/:id/delete', (req, res) => {
    store.deleteRow('songs', req.params.id);
    setFlash(req, 'success', 'Song deleted');
    res.redirect('/admin/songs');
});

// ===================== NEWS =====================
router.get('/news', (req, res) => {
    const news = store.list('news', {
        sort: (a, b) =>
            (a.sort_order || 0) - (b.sort_order || 0) ||
            String(b.date || '').localeCompare(String(a.date || '')),
    });
    renderAdmin(req, res, 'news', { pageTitle: 'News', currentPage: 'news', news })
        .catch(() => res.status(500).send('Failed to render news page'));
});

router.get('/news/new', (req, res) => {
    renderAdmin(req, res, 'news-form', { pageTitle: 'Add News', currentPage: 'news', article: null })
        .catch(() => res.status(500).send('Failed to render news form'));
});

router.post('/news', uploadImage.single('image_file'), (req, res) => {
    const { title, description, url, image_url, date, source } = req.body;
    const image = req.file ? '/assets/uploads/' + req.file.filename : (image_url || '');
    const maxOrder = store.maxSortOrder('news');
    store.insert('news', {
        title,
        description,
        url,
        image,
        date: date || null,
        source,
        sort_order: maxOrder + 1,
        is_active: 1,
    });
    setFlash(req, 'success', 'News article added successfully');
    res.redirect('/admin/news');
});

router.get('/news/:id/edit', (req, res) => {
    const article = store.getRow('news', req.params.id);
    if (!article) return res.redirect('/admin/news');
    renderAdmin(req, res, 'news-form', { pageTitle: 'Edit News', currentPage: 'news', article })
        .catch(() => res.status(500).send('Failed to render news form'));
});

router.post('/news/:id', uploadImage.single('image_file'), (req, res) => {
    const { title, description, url, image_url, date, source } = req.body;
    const existing = store.getRow('news', req.params.id);
    const image = req.file ? '/assets/uploads/' + req.file.filename : (image_url || existing.image || '');
    store.updateRow('news', req.params.id, { title, description, url, image, date: date || null, source });
    setFlash(req, 'success', 'News article updated successfully');
    res.redirect('/admin/news');
});

router.post('/news/:id/delete', (req, res) => {
    store.deleteRow('news', req.params.id);
    setFlash(req, 'success', 'News article deleted');
    res.redirect('/admin/news');
});

// ===================== BRANDS =====================
router.get('/brands', (req, res) => {
    const brands = store.list('brands', {
        sort: (a, b) =>
            String(a.row_group || '').localeCompare(String(b.row_group || '')) ||
            (a.sort_order || 0) - (b.sort_order || 0),
    });
    const grouped = {
        brands_row1: brands.filter(b => b.row_group === 'brands_row1'),
        brands_row2: brands.filter(b => b.row_group === 'brands_row2'),
        films_row1: brands.filter(b => b.row_group === 'films_row1'),
        films_row2: brands.filter(b => b.row_group === 'films_row2'),
    };
    renderAdmin(req, res, 'brands', { pageTitle: 'Brands', currentPage: 'brands', grouped })
        .catch(() => res.status(500).send('Failed to render brands page'));
});

router.post('/brands', (req, res) => {
    const { name, row_group } = req.body;
    const maxOrder = store.maxSortOrder('brands', { where: b => b.row_group === row_group });
    store.insert('brands', { name, row_group, sort_order: maxOrder + 1 });
    setFlash(req, 'success', 'Brand added successfully');
    res.redirect('/admin/brands');
});

router.post('/brands/:id/delete', (req, res) => {
    store.deleteRow('brands', req.params.id);
    setFlash(req, 'success', 'Brand deleted');
    res.redirect('/admin/brands');
});

// ===================== YOUTUBE =====================
router.get('/youtube', (req, res) => {
    const videos = store.list('youtube_videos', { sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) });
    renderAdmin(req, res, 'youtube', { pageTitle: 'YouTube', currentPage: 'youtube', videos })
        .catch(() => res.status(500).send('Failed to render youtube page'));
});

router.get('/youtube/new', (req, res) => {
    renderAdmin(req, res, 'youtube-form', { pageTitle: 'Add YouTube Video', currentPage: 'youtube', video: null })
        .catch(() => res.status(500).send('Failed to render youtube form'));
});

router.post('/youtube', (req, res) => {
    const { title, subtitle, embed_url } = req.body;
    const maxOrder = store.maxSortOrder('youtube_videos');
    store.insert('youtube_videos', { title, subtitle, embed_url, sort_order: maxOrder + 1, is_active: 1 });
    setFlash(req, 'success', 'YouTube video added successfully');
    res.redirect('/admin/youtube');
});

router.get('/youtube/:id/edit', (req, res) => {
    const video = store.getRow('youtube_videos', req.params.id);
    if (!video) return res.redirect('/admin/youtube');
    renderAdmin(req, res, 'youtube-form', { pageTitle: 'Edit YouTube Video', currentPage: 'youtube', video })
        .catch(() => res.status(500).send('Failed to render youtube form'));
});

router.post('/youtube/:id', (req, res) => {
    const { title, subtitle, embed_url } = req.body;
    store.updateRow('youtube_videos', req.params.id, { title, subtitle, embed_url });
    setFlash(req, 'success', 'YouTube video updated successfully');
    res.redirect('/admin/youtube');
});

router.post('/youtube/:id/delete', (req, res) => {
    store.deleteRow('youtube_videos', req.params.id);
    setFlash(req, 'success', 'YouTube video deleted');
    res.redirect('/admin/youtube');
});

// ===================== REELS =====================
router.get('/reels', (req, res) => {
    const reels = store.list('reels', { sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) });
    renderAdmin(req, res, 'reels', { pageTitle: 'Reels', currentPage: 'reels', reels })
        .catch(() => res.status(500).send('Failed to render reels page'));
});

router.get('/reels/new', (req, res) => {
    renderAdmin(req, res, 'reel-form', { pageTitle: 'Add Reel', currentPage: 'reels', reel: null })
        .catch(() => res.status(500).send('Failed to render reel form'));
});

router.post('/reels', uploadVideo.single('video'), (req, res) => {
    const { instagram_url, caption, likes, comments } = req.body;
    if (!req.file) {
        setFlash(req, 'error', 'Please upload a video file');
        return res.redirect('/admin/reels/new');
    }
    const video_path = '/assets/videos/' + req.file.filename;
    const maxOrder = store.maxSortOrder('reels');
    store.insert('reels', {
        video_path,
        instagram_url,
        caption,
        likes,
        comments,
        sort_order: maxOrder + 1,
        is_active: 1,
    });
    setFlash(req, 'success', 'Reel added successfully');
    res.redirect('/admin/reels');
});

router.get('/reels/:id/edit', (req, res) => {
    const reel = store.getRow('reels', req.params.id);
    if (!reel) return res.redirect('/admin/reels');
    renderAdmin(req, res, 'reel-form', { pageTitle: 'Edit Reel', currentPage: 'reels', reel })
        .catch(() => res.status(500).send('Failed to render reel form'));
});

router.post('/reels/:id', uploadVideo.single('video'), (req, res) => {
    const { instagram_url, caption, likes, comments } = req.body;
    const existing = store.getRow('reels', req.params.id);
    if (!existing) {
        setFlash(req, 'error', 'Reel not found');
        return res.redirect('/admin/reels');
    }

    let video_path = existing.video_path;
    if (req.file) {
        video_path = '/assets/videos/' + req.file.filename;
        // Delete old video if it was an uploaded one (not original)
        if (existing.video_path.startsWith('/assets/videos/') && isCmsUploadedFile(existing.video_path)) {
            const oldPath = path.join(__dirname, '..', existing.video_path.replace(/^\//, ''));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
    }

    store.updateRow('reels', req.params.id, { video_path, instagram_url, caption, likes, comments });
    setFlash(req, 'success', 'Reel updated successfully');
    res.redirect('/admin/reels');
});

router.post('/reels/:id/delete', (req, res) => {
    const reel = store.getRow('reels', req.params.id);
    if (reel) {
        store.deleteRow('reels', req.params.id);
        // Only delete uploaded videos (contain timestamp dash pattern)
        if (reel.video_path.startsWith('/assets/videos/') && isCmsUploadedFile(reel.video_path)) {
            const filePath = path.join(__dirname, '..', reel.video_path.replace(/^\//, ''));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
    setFlash(req, 'success', 'Reel deleted');
    res.redirect('/admin/reels');
});

// ===================== CONTACT INFO =====================
router.get('/contact-info', (req, res) => {
    renderAdmin(req, res, 'contact-info', { pageTitle: 'Contact Info', currentPage: 'contact-info', settings: getSettings() })
        .catch(() => res.status(500).send('Failed to render contact info page'));
});

router.post('/contact-info', (req, res) => {
    const fields = [
        'contact_heading',
        'contact_description',
        'contact_email',
        'contact_location',
        'social_spotify',
        'social_apple_music',
        'social_youtube',
        'social_instagram'
    ];
    fields.forEach(f => saveSetting(f, req.body[f]));
    setFlash(req, 'success', 'Contact info updated successfully');
    res.redirect('/admin/contact-info');
});

// ===================== CONTACT SUBMISSIONS =====================
router.get('/submissions', (req, res) => {
    const submissions = store.list('contact_submissions', {
        sort: (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')),
    });
    renderAdmin(req, res, 'submissions', { pageTitle: 'Submissions', currentPage: 'submissions', submissions })
        .catch(() => res.status(500).send('Failed to render submissions page'));
});

router.post('/submissions/:id/read', (req, res) => {
    store.updateRow('contact_submissions', req.params.id, { is_read: 1 });
    res.redirect('/admin/submissions');
});

router.post('/submissions/:id/delete', (req, res) => {
    store.deleteRow('contact_submissions', req.params.id);
    setFlash(req, 'success', 'Submission deleted');
    res.redirect('/admin/submissions');
});

// ===================== FOOTER =====================
router.get('/footer', (req, res) => {
    renderAdmin(req, res, 'footer', { pageTitle: 'Footer', currentPage: 'footer', settings: getSettings() })
        .catch(() => res.status(500).send('Failed to render footer page'));
});

router.post('/footer', (req, res) => {
    const fields = ['footer_brand_name', 'footer_tagline', 'footer_copyright'];
    fields.forEach(f => saveSetting(f, req.body[f]));
    setFlash(req, 'success', 'Footer updated successfully');
    res.redirect('/admin/footer');
});

// ===================== SETTINGS =====================
router.get('/settings', (req, res) => {
    renderAdmin(req, res, 'settings', { pageTitle: 'Settings', currentPage: 'settings', settings: getSettings() })
        .catch(() => res.status(500).send('Failed to render settings page'));
});

router.post('/settings/site', (req, res) => {
    const fields = ['meta_title', 'meta_description', 'meta_keywords', 'canonical_url', 'og_image', 'robots_meta', 'google_site_verification'];
    fields.forEach(f => saveSetting(f, req.body[f]));
    setFlash(req, 'success', 'SEO settings updated successfully');
    res.redirect('/admin/settings');
});

router.post('/settings/password', (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;

    const user = store.getUserById(req.session.userId);
    if (!user) {
        setFlash(req, 'error', 'User not found');
        return res.redirect('/login');
    }

    if (!bcrypt.compareSync(current_password, user.password_hash)) {
        setFlash(req, 'error', 'Current password is incorrect');
        return res.redirect('/admin/settings');
    }

    if (new_password.length < 4) {
        setFlash(req, 'error', 'New password must be at least 4 characters');
        return res.redirect('/admin/settings');
    }

    if (new_password !== confirm_password) {
        setFlash(req, 'error', 'New passwords do not match');
        return res.redirect('/admin/settings');
    }

    const hash = bcrypt.hashSync(new_password, 10);
    store.updateUser(req.session.userId, { password_hash: hash });

    setFlash(req, 'success', 'Password changed successfully');
    res.redirect('/admin/settings');
});

module.exports = router;
