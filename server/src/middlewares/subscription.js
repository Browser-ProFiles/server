const db = require('../models');
const User = db.user;

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

        const profiles = await user.getProfiles();
        const subscription = await user.getSubscription();
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