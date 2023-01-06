const db = require('../../models');
const Profile = db.profile;

export default async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      userId: req.user.id,
    });

    res.json({
      status: 'success',
      profiles,
    });
  } catch (e) {
    console.log('e', e)

    res.status(400).send({
      status: 'error',
      error: e,
    });
  }
};
