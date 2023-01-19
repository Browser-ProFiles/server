const { FingerprintGenerator } = require('fingerprint-generator');

module.exports = async (req, res) => {
    try {
        const device = req.body.fingerprintDevice || 'desktop';
        const os = req.body.fingerprintOs || 'windows'
        const browserName = 'chrome';
        const browserVersion = 108;
        console.log('os', os)

        const fingerprintGenerator = new FingerprintGenerator();
        const browserFingerprintWithHeaders = fingerprintGenerator.getFingerprint({
            devices: [device],
            operatingSystems: [os],
            browsers: [
                {
                    name: browserName,
                    minVersion: browserVersion,
                    maxVersion: browserVersion,
                }
            ],
        });

        delete browserFingerprintWithHeaders.fingerprint.screen;
        delete browserFingerprintWithHeaders.headers['accept-language'];

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