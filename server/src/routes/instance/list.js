const db = require('../../models');
const User = db.user;
const Subscription = db.subscription;
const Profile = db.profile;

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id
      },
    });

    if (!user) {
      throw new Error(req.appLang === 'en' ? 'User not found.' : 'Пользователь не найден')
    }

    const subscription = await Subscription.findOne({
      where: {
        id: user.subscriptionId,
      },
    });

    if (!subscription) {
      throw new Error(req.appLang === 'en' ? 'Subscription not found.' : 'Подписка не найдена.')
    }

    const profiles = await Profile.findAll({
      where: {
        userId: user.id
      },
    });

    const realLength = profiles.length;
    profiles.splice(subscription.maxProfiles);

    res.json({
      status: 'success',
      profiles,
      realLength,
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
