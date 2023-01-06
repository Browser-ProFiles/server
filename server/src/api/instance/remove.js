const db = require('../../models');
const Profile = db.profile;

module.exports = async (req, res) => {
  try {
    const hasProfile = await Profile.findOne({
      where: {
        userId: req.session.id,
        name: req.params.name,
      },
    });

    if (!hasProfile) {
      res.status(404).send({
        status: 'error',
        error: 'Profile not found.',
      });
    }

    await Profile.destroy({
      where: {
        userId: req.session.id,
        name: req.params.name,
      },
    });

    res.json({
      status: 'success',
    });
  } catch (e) {
    console.log('e', e)

    res.status(400).send({
      status: 'error',
      error: e,
    });
  }
};
