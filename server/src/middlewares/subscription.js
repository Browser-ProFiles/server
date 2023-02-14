const db = require('../models');
const User = db.user;
const Subscription = db.subscription;

const hasEnoughSubscription = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            throw new Error(req.appLang === 'en' ? 'User not found' : 'Пользователь не найден');
        }

        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === 'admin') {
                return next();
            }
        }

        let subscriptionId = user.subscriptionId;
        const now = (new Date().getTime()) / 1000;
        if (user.subscriptionActiveUntil <= now) {
            // With max profiles = 2 (free sub)
            subscriptionId = 1;
        }
        const subscription = await Subscription.findByPk(subscriptionId);

        const profiles = await user.getProfiles();
        if (subscription.maxProfiles <= profiles.length) {
            return res.status(403).send({
                status: 'error',
                message: req.appLang === 'en' ?
                    'Too many profiles. Change the subscription' :
                    'Слишком много профилей. Смените подписку.',
            });
        }

        return next();
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: req.appLang === 'en' ? 'Unable to validate User role' : 'Неверная роль пользователя',
        });
    }
};

module.exports = {
    hasEnoughSubscription,
};
