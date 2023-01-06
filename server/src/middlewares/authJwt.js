const jwt = require('jsonwebtoken');
const config = require('../config/auth.js');
const db = require('../models');
const User = db.user;

const verifyToken = (req, res, next) => {
    let token = req.session.token;

    if (!token) {
        return res.status(403).send({
            message: 'No token provided!',
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!',
            });
        }
        req.userId = decoded.id;
        next();
    });
};

const hasEnoughSubscription = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === 'admin') {
                return next();
            }
        }

        const profiles = await user.getProfiles();
        console.log('profiles', profiles)
        const subscription = await user.getSubscription();
        console.log('subscription', subscription)
        if (subscription.maxProfiles < profiles.length) {
            return res.status(403).send({
                message: 'Too many profiles. Change the subscription',
            });
        }

        return next();
    } catch (error) {
        return res.status(500).send({
            message: 'Unable to validate User role!',
        });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === 'admin') {
                return next();
            }
        }

        return res.status(403).send({
            message: 'Require Admin Role!',
        });
    } catch (error) {
        return res.status(500).send({
            message: 'Unable to validate User role!',
        });
    }
};

module.exports = {
    verifyToken,
    hasEnoughSubscription,
    isAdmin,
};