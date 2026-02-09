const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const store = require('../config/store');

function nowIso() {
    return new Date().toISOString();
}

function allocateId(db, table) {
    const next = db.meta.nextIds[table] || 1;
    db.meta.nextIds[table] = next + 1;
    return next;
}

function normalizePath(p) {
    if (!p) return '';
    return String(p).startsWith('/') ? String(p) : `/${p}`;
}

function readJsonIfExists(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

console.log('Seeding JSON database...');

const db = store.createEmptyDb();
const createdAt = nowIso();

// ===================== 1. DEFAULT USER =====================
db.users.push({
    id: allocateId(db, 'users'),
    username: 'arjuna',
    password_hash: bcrypt.hashSync('123456', 10),
    email: process.env.NOTIFICATION_EMAIL || 'mail@aartsense.co.uk',
    reset_token: null,
    reset_token_expiry: null,
    created_at: createdAt,
    updated_at: createdAt,
});
console.log('Created default user: arjuna / 123456');

// ===================== 2. SITE SETTINGS =====================
db.site_settings = {
    hero_title: 'ARJUNA HARJAI',
    hero_subtitle: 'Composer | Singer-Songwriter | Music Producer',
    hero_tagline: 'Where Hindustani Classical Meets Contemporary Soul',
    hero_cta1_text: 'Listen Now',
    hero_cta1_url: '#top-songs',
    hero_cta2_text: 'Get in Touch',
    hero_cta2_url: '#contact',

    about_intro: 'Born into music, shaped by tradition, driven by innovation.',
    about_bio_1: 'Arjuna Harjai is a renowned composer, singer-songwriter, and music producer whose journey began at the tender age of two and a half, when his parents introduced him to the rich traditions of Hindustani classical music.',
    about_bio_2: 'Now based in the UK, Arjuna has carved a distinguished career spanning Bollywood films, advertising, and independent music.',
    about_bio_3: 'His work blends the depth of classical Indian music with contemporary genres, creating a signature sound that is both timeless and modern.',
    about_image: '/assets/images/gallery/about2.jpg',

    stat_1_number: '1000+',
    stat_1_label: 'Ad Jingles',
    stat_2_number: '12+',
    stat_2_label: 'Feature Films',
    stat_3_number: '20+',
    stat_3_label: 'Years Experience',

    social_spotify: 'https://open.spotify.com/artist/6EwLfbS1MI8kZXTIwkGfHN',
    social_apple_music: 'https://music.apple.com/us/artist/arjuna-harjai/678282929',
    social_youtube: 'https://www.youtube.com/@arjunaharjai',
    social_instagram: 'https://www.instagram.com/arjunaharjai',

    contact_email: 'mail@aartsense.co.uk',
    contact_location: 'London, United Kingdom',
    contact_heading: "Let's Create Together",
    contact_description: 'For booking inquiries, collaborations, or press requests, reach out through the form or contact details below.',

    footer_brand_name: 'ARJUNA HARJAI',
    footer_tagline: 'Composer | Singer-Songwriter | Music Producer',
    footer_copyright: `${new Date().getFullYear()} Arjuna Harjai. All rights reserved.`,

    meta_title: 'Arjuna Harjai | Composer & Music Producer',
    meta_description: 'Arjuna Harjai - Composer, Singer-Songwriter & Music Producer.',
};
console.log(`Seeded ${Object.keys(db.site_settings).length} site settings.`);

// ===================== 3. NEWS (from assets/data/news.json if present) =====================
const newsJsonPath = path.join(__dirname, '..', 'assets', 'data', 'news.json');
const newsData = readJsonIfExists(newsJsonPath);
if (newsData && Array.isArray(newsData.items)) {
    newsData.items.forEach((n, i) => {
        db.news.push({
            id: allocateId(db, 'news'),
            title: n.title || '',
            description: n.description || '',
            url: n.url || '',
            image: n.image || '',
            date: n.date || null,
            source: n.source || '',
            sort_order: i + 1,
            is_active: 1,
            created_at: createdAt,
            updated_at: createdAt,
        });
    });
    console.log(`Seeded ${db.news.length} news items from assets/data/news.json`);
} else {
    console.log('No assets/data/news.json found; skipping news seed.');
}

// ===================== 4. REELS (from assets/data/reels.json if present) =====================
const reelsJsonPath = path.join(__dirname, '..', 'assets', 'data', 'reels.json');
const reelsData = readJsonIfExists(reelsJsonPath);
if (reelsData && Array.isArray(reelsData.items)) {
    reelsData.items.forEach((r, i) => {
        db.reels.push({
            id: allocateId(db, 'reels'),
            video_path: normalizePath(r.src),
            instagram_url: r.instagram_url || null,
            caption: r.caption || '',
            likes: r.likes || null,
            comments: r.comments || null,
            sort_order: i + 1,
            is_active: 1,
            created_at: createdAt,
            updated_at: createdAt,
        });
    });
    console.log(`Seeded ${db.reels.length} reels from assets/data/reels.json`);
} else {
    console.log('No assets/data/reels.json found; skipping reels seed.');
}

store.saveDb(db);
console.log(`Done. Wrote ${store.DB_PATH}`);

