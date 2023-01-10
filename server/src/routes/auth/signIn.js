const db = require('../../models');
const User = db.user;

const JwtService = require('../../services/jwt');

const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username,
            },
        });

        if (!user) {
            return res.status(404).send({ message: 'User Not found.' });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: 'Invalid Password!',
            });
        }

        const roles = await user.getRoles();

        const token = JwtService.sign({
            id: user.id,
            username: user.username,
            roles,
        }, {
            expiresIn: 86400 * 7 * 31, // 1 month
        });

        return res.status(200).send({
            token,
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};
