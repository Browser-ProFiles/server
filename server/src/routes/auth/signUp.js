const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { STATUS_DRAFT } = require('../../const/userStatus');

const { sendConfirmMail } = require('../../services/mail');

const db = require('../../models');
const User = db.user;

const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

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

        // Password
        const passwordHash = bcrypt.hashSync(req.body.password, 8);

        // FREE TRIAL 1 month
        const subscriptionActiveUntil = new Date();
        subscriptionActiveUntil.setMonth(subscriptionActiveUntil.getMonth() + 1);
        const activeTimeSeconds = Math.round(subscriptionActiveUntil.getTime() / 1000);

        // Confirm token
        const token = md5(`${req.body.username}_${ip}_${req.body.email}_${password}`).substring(0, 32);

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: passwordHash,

            subscriptionId: 1,
            subscriptionActiveUntil: String(activeTimeSeconds),

            status: STATUS_DRAFT,
            confirmToken: token,

            ip,
        });

        // user has role = 1
        await user.setRoles([1]);
        await user.setSubscription([1]);

        await sendConfirmMail(req.body.email, token);

        res.send({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
