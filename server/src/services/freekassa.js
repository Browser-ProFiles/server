const crypto = require('crypto');
const CryptoJS = require('crypto-js');

class FreekassaService {
    getSignatureSha256(form, key) {
        let signString = '';

        const keys = Object.keys(form).sort((a, b) => a.localeCompare(b));
        keys.forEach((key, i) => signString += i === 0 ? form[key] : `|${form[key]}`);

        console.log('signString', signString)
        console.log('key', key)

        const hash = CryptoJS.HmacSHA256(signString, key);
        console.log(hash.toString());

        return hash.toString();
    }

    getSignature(shopId, amount, secret, currency, paymentId) {
        const str = `${shopId}:${amount}:${secret}:${currency}:${paymentId}`;
        console.log('str', str)
        return crypto.createHash('md5').update(str).digest('hex');
    }
}

module.exports = FreekassaService;
