const store = require('../config/store');

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

function requireGuest(req, res, next) {
    if (req.session.userId) {
        return res.redirect('/admin');
    }
    next();
}

function addUserToLocals(req, res, next) {
    if (req.session.userId) {
        const user = store.getUserById(req.session.userId);
        res.locals.user = user || null;
        res.locals.unreadSubmissions = store.getAdminStats().unread;
    } else {
        res.locals.user = null;
        res.locals.unreadSubmissions = 0;
    }
    res.locals.flash = req.session.flash || {};
    delete req.session.flash;
    next();
}

module.exports = { requireAuth, requireGuest, addUserToLocals };
