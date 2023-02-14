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

    let subscriptionActiveUntil = user.subscriptionActiveUntil;
    let subscriptionId = user.subscriptionId;
    const now = (new Date().getTime()) / 1000;
    if (user.subscriptionActiveUntil <= now) {
      // With max profiles = 2 (free sub)
      subscriptionId = 1;

      const newDate = Number(user.subscriptionActiveUntil) + (10 * 365 * 24 * 60 * 60);
      subscriptionActiveUntil = newDate;
    }

    const subscription = await Subscription.findOne({
      attributes: ['id', 'name', 'maxProfiles', 'price'],
      where: {
        id: subscriptionId,
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
        activeUntil: subscriptionActiveUntil,
      }
    });
  } catch (e) {
    console.error(e)

    res.status(401).send({
      status: 'error',
      message: e,
    });
  }
};
