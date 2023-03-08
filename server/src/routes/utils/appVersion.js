const { APP_LATEST_VERSION } = require('../../const/appVersion');

module.exports = async (req, res) => {
    return res.json({
        latestVersion: APP_LATEST_VERSION,
    });
}
