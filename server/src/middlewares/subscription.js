const db = require('../models');
const User = db.user;

const hasEnoughSubscription = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            throw new Error('User not found.');
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
                message: 'Too many profiles. Change the subscription',
            });
        }

        return next();
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: 'Unable to validate User role!',
        });
    }
};

module.exports = {
    hasEnoughSubscription,
};