const { STATUS_ACTIVE } = require('../../const/userStatus');

const db = require('../../models');
const User = db.user;

module.exports = async (req, res) => {
    try {
        const token = req.body?.token || '';

        const user = await User.findOne({
            where: {
                confirmToken: token,
            },
        });

        if (!user) {
            throw new Error('Invalid token.');
        }

        await user.update({
            status: STATUS_ACTIVE,
            confirmToken: null,
        });

        res.send({
            status: 'success',
            message: 'Email confirmed successfully!',
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
