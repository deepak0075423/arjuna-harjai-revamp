const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const store = require('../config/store');
const { requireGuest } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../config/email');

// GET /login
router.get('/login', requireGuest, (req, res) => {
    res.render('auth/login', { error: null });
});

// POST /login
router.post('/login', requireGuest, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('auth/login', { error: 'Please enter username and password' });
    }

    const user = store.getUserByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    req.session.save(() => {
        res.redirect('/admin');
    });
});

// POST /logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// GET /forgot-password
router.get('/forgot-password', requireGuest, (req, res) => {
    res.render('auth/forgot-password', { error: null, success: null });
});

// POST /forgot-password
router.post('/forgot-password', requireGuest, (req, res) => {
    const { username } = req.body;

    const user = store.getUserByUsername(username);
    if (!user) {
        return res.render('auth/forgot-password', {
            error: 'No account found with that username',
            success: null
        });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    store.updateUser(user.id, { reset_token: token, reset_token_expiry: expiry });

    if (user.email) {
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
        sendPasswordResetEmail(user.email, resetUrl);
    }

    res.render('auth/forgot-password', {
        error: null,
        success: `Password reset link has been generated. ${user.email ? 'Check your email.' : ''} Reset token: ${token}`
    });
});

// GET /reset-password/:token
router.get('/reset-password/:token', requireGuest, (req, res) => {
    const user = store.getUserByValidResetToken(req.params.token, new Date().toISOString());

    if (!user) {
        return res.render('auth/forgot-password', {
            error: 'Invalid or expired reset token',
            success: null
        });
    }

    res.render('auth/reset-password', { token: req.params.token, error: null });
});

// POST /reset-password/:token
router.post('/reset-password/:token', requireGuest, (req, res) => {
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 4) {
        return res.render('auth/reset-password', {
            token: req.params.token,
            error: 'Password must be at least 4 characters'
        });
    }

    if (password !== confirmPassword) {
        return res.render('auth/reset-password', {
            token: req.params.token,
            error: 'Passwords do not match'
        });
    }

    const user = store.getUserByValidResetToken(req.params.token, new Date().toISOString());

    if (!user) {
        return res.render('auth/forgot-password', {
            error: 'Invalid or expired reset token',
            success: null
        });
    }

    const hash = bcrypt.hashSync(password, 10);
    store.updateUser(user.id, {
        password_hash: hash,
        reset_token: null,
        reset_token_expiry: null,
    });

    res.render('auth/login', { error: null, success: 'Password reset successfully. Please login.' });
});

module.exports = router;
