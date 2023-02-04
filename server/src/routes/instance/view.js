const db = require('../../models');
const Profile = db.profile;

module.exports = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: {
        userId: req.user.id,
        name: req.params.name || Date.now(),
      }
    });

    res.json({
      ...profile,
      options: JSON.parse(profile.options),
      form: JSON.parse(profile.form),
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
