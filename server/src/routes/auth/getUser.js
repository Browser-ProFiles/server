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
      throw new Error(req.appLang === 'en' ? 'User fetch error.' : 'Пользователь не найден');
    }

    if (!user.subscriptionId) {
      throw new Error(req.appLang === 'en' ? 'Invalid user subscription.' : 'Некорректная подиска');
    }

    const subscription = await Subscription.findOne({
      attributes: ['id', 'name', 'maxProfiles', 'price'],
      where: {
        id: user.subscriptionId,
      },
    });

    if (!subscription) {
      throw new Error(req.appLang === 'en' ? 'Subscription fetch error.' : 'Не найдена подписка.');
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
