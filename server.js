require('dotenv').config();

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const sessionConfig = require('./config/session');
const { addUserToLocals } = require('./middleware/auth');
const store = require('./config/store');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple cache-busting token for static assets
app.locals.assetVersion = process.env.ASSET_VERSION || String(Date.now());

// Ensure default admin user exists (username: arjuna, password: 123456)
try {
    const hash = bcrypt.hashSync('123456', 10);
    const { created } = store.ensureDefaultUser({
        username: 'arjuna',
        passwordHash: hash,
        email: process.env.NOTIFICATION_EMAIL || null,
    });
    if (created) console.log('Created default user: arjuna / 123456');
} catch (e) {
    console.error('Failed to ensure default user:', e.message);
}

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (serve the site assets directly from the repo)
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Method override for PUT/DELETE from forms
app.use(methodOverride('_method'));

// Sessions
app.use(sessionConfig);

// Add user to all templates
app.use(addUserToLocals);

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
