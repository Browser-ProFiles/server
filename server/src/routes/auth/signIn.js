const bcrypt = require('bcryptjs');

const JwtService = require('../../services/jwt');

const { STATUS_ACTIVE } = require('../../const/userStatus');

const db = require('../../models');
const User = db.user;

module.exports = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                username: req.body.username,
            },
        });

        if (!user) {
            return res.status(404).send({
                message: req.appLang === 'en' ? 'User not found' : 'Пользователь не найден'
            });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: req.appLang === 'en' ? 'User not found' : 'Пользователь не найден',
            });
        }

        if (user.status !== STATUS_ACTIVE) {
            return res.status(401).send({
                message: req.appLang === 'en' ? 'Account email not confirmed.' : 'Аккаунт не подтвержден. Проверьте свою почту.',
            });
        }

        const roles = await user.getRoles();

        const token = JwtService.sign({
            id: user.id,
            username: user.username,
            email: user.email,
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
