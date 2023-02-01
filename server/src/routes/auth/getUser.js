const db = require('../../models');
const User = db.user;
const Subscription = db.subscription;

const { generateUserHash } = require('../../helpers/userHash');

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({
      attributes: [
        'id',
        'username',
        'email',
        'subscriptionId',
        'ip',
        'subscriptionActiveUntil'
      ],
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      throw new Error('User fetch error.');
    }

    if (!user.subscriptionId) {
      throw new Error('Invalid user subscription.');
    }

    const subscription = await Subscription.findOne({
      attributes: ['id', 'name', 'maxProfiles', 'price'],
      where: {
        id: user.subscriptionId,
      },
    });
    console.log('subscription', subscription)

    if (!subscription) {
      throw new Error('Subscription fetch error.');
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      ip: user.ip,
      hash: generateUserHash(user),
      subscription: {
        id: subscription.id,
        name: subscription.name,
        maxProfiles: subscription.maxProfiles,
        price: subscription.price,
        activeUntil: user.subscriptionActiveUntil,
      }
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
