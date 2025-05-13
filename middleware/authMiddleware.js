const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }

};

exports.optionalAuth = async (req, res, next) => {

    const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer')) {

            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
            } catch (err) {
                req.user = null;
            }

        } else {
            req.user = null;
        }

        next();

};

exports.requireAdmin = (req, res, next) => {

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    next();

};
