const db = require('../../models');
const Profile = db.profile;

module.exports = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.user.id,
      name: req.params.name || Date.now(),
    });

    res.json({
      profile,
    });
  } catch (e) {
    console.log('e', e)

    res.status(400).send({
      status: 'error',
      error: e,
    });
  }
};
