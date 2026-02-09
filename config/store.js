const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const TMP_PATH = path.join(__dirname, '..', 'data', 'db.json.tmp');

function nowIso() {
    return new Date().toISOString();
}

function createEmptyDb() {
    return {
        meta: {
            version: 1,
            updatedAt: nowIso(),
            nextIds: {
                users: 1,
                awards: 1,
                songs: 1,
                news: 1,
                brands: 1,
                youtube_videos: 1,
                reels: 1,
                contact_submissions: 1,
            },
        },
        users: [],
        site_settings: {},
        awards: [],
        songs: [],
        news: [],
        brands: [],
        youtube_videos: [],
        reels: [],
        contact_submissions: [],
    };
}

function ensureDbDir() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadDb() {
    ensureDbDir();
    if (!fs.existsSync(DB_PATH)) return createEmptyDb();
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    if (!raw.trim()) return createEmptyDb();
    const parsed = JSON.parse(raw);
    // Shallow-migrate missing fields
    const empty = createEmptyDb();
    const db = { ...empty, ...parsed };
    db.meta = { ...empty.meta, ...(parsed.meta || {}) };
    db.meta.nextIds = { ...empty.meta.nextIds, ...((parsed.meta && parsed.meta.nextIds) || {}) };
    return db;
}

function saveDb(db) {
    ensureDbDir();
    db.meta = db.meta || {};
    db.meta.version = 1;
    db.meta.updatedAt = nowIso();
    fs.writeFileSync(TMP_PATH, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(TMP_PATH, DB_PATH);
}

function nextId(db, table) {
    const next = db.meta.nextIds[table] || 1;
    db.meta.nextIds[table] = next + 1;
    return next;
}

function findById(list, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return list.find(item => item.id === numericId) || null;
}

function ensureDefaultUser({ username, passwordHash, email = null }) {
    const db = loadDb();
    const existing = db.users.find(u => u.username === username);
    if (existing) return { user: existing, created: false };
    const createdAt = nowIso();
    const user = {
        id: nextId(db, 'users'),
        username,
        password_hash: passwordHash,
        email,
        reset_token: null,
        reset_token_expiry: null,
        created_at: createdAt,
        updated_at: createdAt,
    };
    db.users.push(user);
    saveDb(db);
    return { user, created: true };
}

// ===================== USERS =====================
function getUserById(id) {
    const db = loadDb();
    return findById(db.users, id);
}

function getUserByUsername(username) {
    const db = loadDb();
    return db.users.find(u => u.username === username) || null;
}

function updateUser(id, patch) {
    const db = loadDb();
    const user = findById(db.users, id);
    if (!user) return null;
    Object.assign(user, patch, { updated_at: nowIso() });
    saveDb(db);
    return user;
}

function getUserByValidResetToken(token, atIso = nowIso()) {
    const db = loadDb();
    return (
        db.users.find(u => u.reset_token === token && u.reset_token_expiry && u.reset_token_expiry > atIso) ||
        null
    );
}

// ===================== SETTINGS =====================
function getSettings() {
    const db = loadDb();
    return db.site_settings || {};
}

function setSetting(key, value) {
    const db = loadDb();
    db.site_settings = db.site_settings || {};
    db.site_settings[key] = value || '';
    saveDb(db);
}

function setSettings(pairs) {
    const db = loadDb();
    db.site_settings = db.site_settings || {};
    for (const [key, value] of Object.entries(pairs)) {
        db.site_settings[key] = value || '';
    }
    saveDb(db);
}

// ===================== GENERIC LIST HELPERS =====================
function list(table, { where = null, sort = null } = {}) {
    const db = loadDb();
    let items = Array.isArray(db[table]) ? [...db[table]] : [];
    if (where) items = items.filter(where);
    if (sort) items.sort(sort);
    return items;
}

function getRow(table, id) {
    const db = loadDb();
    return findById(db[table] || [], id);
}

function insert(table, row) {
    const db = loadDb();
    const createdAt = nowIso();
    const toInsert = { ...row, id: nextId(db, table), created_at: createdAt, updated_at: createdAt };
    db[table].push(toInsert);
    saveDb(db);
    return toInsert;
}

function updateRow(table, id, patch) {
    const db = loadDb();
    const item = findById(db[table], id);
    if (!item) return null;
    Object.assign(item, patch, { updated_at: nowIso() });
    saveDb(db);
    return item;
}

function deleteRow(table, id) {
    const db = loadDb();
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const before = db[table].length;
    db[table] = db[table].filter(item => item.id !== numericId);
    const deleted = before !== db[table].length;
    saveDb(db);
    return deleted;
}

function maxSortOrder(table, { where = null } = {}) {
    const items = list(table, { where });
    return items.reduce((max, item) => Math.max(max, item.sort_order || 0), 0);
}

// ===================== DOMAIN QUERIES =====================
function getHomeData() {
    const settings = getSettings();
    const awards = list('awards', { sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) });
    const songs = list('songs', {
        where: s => (s.is_active ?? 1) === 1,
        sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    });
    const news = list('news', {
        where: n => (n.is_active ?? 1) === 1,
        sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(b.date || '').localeCompare(String(a.date || '')),
    });
    const brandsAll = list('brands', {
        sort: (a, b) => String(a.row_group || '').localeCompare(String(b.row_group || '')) || (a.sort_order || 0) - (b.sort_order || 0),
    });
    const youtubeVideos = list('youtube_videos', {
        where: v => (v.is_active ?? 1) === 1,
        sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    });
    const reels = list('reels', {
        where: r => (r.is_active ?? 1) === 1,
        sort: (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    });

    return {
        settings,
        awards,
        songs,
        news,
        brandsAll,
        youtubeVideos,
        reels,
    };
}

function getAdminStats() {
    const db = loadDb();
    const unread = (db.contact_submissions || []).filter(s => (s.is_read ?? 0) === 0).length;
    return {
        awards: (db.awards || []).length,
        songs: (db.songs || []).length,
        news: (db.news || []).length,
        brands: (db.brands || []).length,
        youtube: (db.youtube_videos || []).length,
        reels: (db.reels || []).length,
        submissions: (db.contact_submissions || []).length,
        unread,
    };
}

function listRecentSubmissions(limit = 5) {
    return list('contact_submissions', {
        sort: (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')),
    }).slice(0, limit);
}

function addContactSubmission({ name, email, subject, message }) {
    return insert('contact_submissions', {
        name,
        email,
        subject,
        message,
        is_read: 0,
    });
}

module.exports = {
    DB_PATH,
    createEmptyDb,
    loadDb,
    saveDb,
    ensureDefaultUser,

    getUserById,
    getUserByUsername,
    getUserByValidResetToken,
    updateUser,

    getSettings,
    setSetting,
    setSettings,

    list,
    getRow,
    insert,
    updateRow,
    deleteRow,
    maxSortOrder,

    getHomeData,
    getAdminStats,
    listRecentSubmissions,
    addContactSubmission,
};
