const db = require('../../models');
const Profile = db.profile;

module.exports = async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      where: {
        userId: req.user.id
      },
    });

    res.json({
      status: 'success',
      profiles,
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
