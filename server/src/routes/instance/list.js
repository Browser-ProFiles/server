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
      throw new Error('User not found.')
    }

    const subscription = await Subscription.findOne({
      where: {
        id: user.subscriptionId,
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found.')
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
