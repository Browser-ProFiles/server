const { FingerprintGenerator } = require('fingerprint-generator');

module.exports = async (req, res) => {
    try {
        const device = req.body.fingerprintDevice || 'desktop';
        const os = req.body.fingerprintOs || 'windows'
        const browserName = 'chrome';
        const browserVersion = req.body.fingerprintBrowserVersion || 108;

        const fingerprintGenerator = new FingerprintGenerator();
        const browserFingerprintWithHeaders = fingerprintGenerator.getFingerprint({
            devices: [device],
            operatingSystems: [os],
            httpVersion: '1',
            browsers: [
                {
                    name: browserName,
                    minVersion: browserVersion,
                    maxVersion: browserVersion,
                }
            ],
        });

        // delete browserFingerprintWithHeaders.fingerprint.screen;
        delete browserFingerprintWithHeaders.headers['Accept-Language'];
        if (browserFingerprintWithHeaders.fingerprint.navigator) {
            delete browserFingerprintWithHeaders.fingerprint.navigator.language;
            delete browserFingerprintWithHeaders.fingerprint.navigator.languages;
        }

        res.json({
            status: 'success',
            fingerprint: browserFingerprintWithHeaders,
        });
    } catch (e) {
        console.error(e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}