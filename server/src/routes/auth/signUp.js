const bcrypt = require('bcryptjs');
const db = require('../../models');
const User = db.user;

module.exports = async (req, res) => {
    try {
        const ip = req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            ip,
        });

        // user has role = 1
        await user.setRoles([1]);
        await user.setSubscription([1]);

        res.send({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
