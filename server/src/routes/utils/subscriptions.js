const db = require('../../models');
const Subscription = db.subscription;

module.exports = async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            attributes: ['id', 'name', 'maxProfiles', 'price'],
        });

        res.json(subscriptions);
    } catch (e) {
        console.error(e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}