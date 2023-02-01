const db = require('../../models');
const User = db.user;

const { hashRijndael, generateUserHash } = require('../../helpers/userHash');
const BROWSER_VERSIONS = require('../../const/browserVersions');

module.exports = async (req, res) => {
    try {
        const user = await User.findOne({
            attributes: ['id', 'username', 'email', 'ip'],
            where: {
                id: req.user.id,
            },
        });

        const userHash = generateUserHash(user);

        const versionsWithRevision = BROWSER_VERSIONS.map((item) => ({
            ...item,
            hash: hashRijndael(item.revision, userHash),
            revision: null,
        }));

        res.json({
            status: 'success',
            versions: versionsWithRevision,
        });
    } catch (e) {
        console.error(e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}