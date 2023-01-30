const db = require('../../models');
const User = db.user;

const { generateUserHash } = require('../../helpers/userHash');

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({
      attributes: ['id', 'username', 'email', 'ip'],
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      throw new Error('User fetch error.');
    }

    res.json({
      id: user.id,
      username: user.id,
      email: user.id,
      ip: user.ip,
      hash: generateUserHash(user),
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
