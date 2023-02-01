const bcrypt = require('bcryptjs');
const db = require('../../models');
const User = db.user;

module.exports = async (req, res) => {
    try {
        const ip = req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;

        const username = req.body?.username || '';
        const email = req.body?.email || '';
        const password = req.body?.password || '';

        if (!username) {
            throw new Error('Username required.');
        }

        if (username.length < 4 || username.length > 255) {
            throw new Error('Incorrect username length (should be between 4 and 255).');
        }

        if (!email) {
            throw new Error('E-mail required.');
        }

        if (email.length > 128) {
            throw new Error('Too long email.');
        }

        if (!/@gmail\.com$/.test(req.body.email)) {
            throw new Error('Only gmail emails can be used.');
        }

        if (!password) {
            throw new Error('Password required.');
        }

        if (password.length < 4 || password.length > 255) {
            throw new Error('Incorrect password length (should be between 4 and 255).');
        }

        // FREE TRIAL 1 month
        const subscriptionActiveUntil = new Date();
        subscriptionActiveUntil.setMonth(subscriptionActiveUntil.getMonth() + 1);
        const activeTimeSeconds = Math.round(subscriptionActiveUntil.getTime() / 1000);

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            subscriptionId: 1,
            subscriptionActiveUntil: String(activeTimeSeconds),
            ip,
        });

        // user has role = 1
        await user.setRoles([1]);
        await user.setSubscription([1]);

        res.send({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
