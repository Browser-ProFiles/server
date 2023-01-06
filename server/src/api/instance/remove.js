const db = require('../../models');
const Profile = db.profile;

module.exports = async (req, res) => {
  try {
    const hasProfile = await Profile.findOne({
      where: {
        userId: req.user.id,
        name: req.params.name,
      },
    });

    if (!hasProfile) {
      res.status(404).send({
        status: 'error',
        message: 'Profile not found.',
      });
    }

    await Profile.destroy({
      where: {
        userId: req.user.id,
        name: req.params.name,
      },
    });

    res.json({
      status: 'success',
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
