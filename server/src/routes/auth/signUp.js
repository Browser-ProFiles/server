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
            throw new Error(req.appLang === 'en' ? 'Username required.' : 'Логин обязателен.');
        }

        if (username.length < 4 || username.length > 255) {
            throw new Error(
                req.appLang === 'en' ?
                    'Incorrect username length (should be between 4 and 255).' :
                    'Некорректная длина логина (должна быть между 4 и 255).'
            );
        }

        if (!email) {
            throw new Error(req.appLang === 'en' ? 'E-mail required.' : 'E-mail обязателен');
        }

        if (email.length > 128) {
            throw new Error(req.appLang === 'en' ? 'Too long email.' : 'Слишком длинный E-mail');
        }

        if (!/@gmail\.com$/.test(req.body.email)) {
            throw new Error(req.appLang === 'en' ? 'Only gmail emails can be used.' : 'Почта не gmail');
        }

        if (!password) {
            throw new Error(req.appLang === 'en' ? 'Password required.' : 'Пароль обязателен.');
        }

        if (password.length < 4 || password.length > 255) {
            throw new Error(
                req.appLang === 'en' ?
                    'Incorrect password length (should be between 4 and 255).' :
                    'Неверная длина пароля (должна быть между 4 и 255)'
            );
        }

        // Password
        const passwordHash = bcrypt.hashSync(req.body.password, 8);

        // +10 years of free sub
        const subscriptionActiveUntil = new Date();
        subscriptionActiveUntil.setFullYear(subscriptionActiveUntil.getFullYear() + 10);
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

        try {
            await sendConfirmMail(req.body.email, token, req.appLang);
        } catch (e) {
            console.error('send email error', e)
        }

        res.send({ message: req.appLang === 'en' ? 'User registered successfully' : 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
