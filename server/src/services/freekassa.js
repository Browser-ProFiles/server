const CryptoJS = require('crypto-js');

class FreekassaService {
    getSignature(form, key) {
        let signString = '';

        const keys = Object.keys(form).sort((a, b) => a.localeCompare(b));
        keys.forEach((key, i) => signString += i === 0 ? form[key] : `|${form[key]}`);

        console.log('signString', signString)
        console.log('key', key)

        const hash = CryptoJS.HmacSHA256(signString, key);
        console.log(hash.toString());

        return hash.toString();
    }
}

module.exports = FreekassaService;
