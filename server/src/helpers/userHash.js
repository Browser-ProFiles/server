const crypto = require('crypto');
const Rijndael = require('rijndael-js');

const hashRijndael = (word, key) => {
    const cipher = new Rijndael(key, 'cbc');
    const ciphertext = Buffer.from(cipher.encrypt(word, 256, key));
    return ciphertext.toString('base64');
}

const generateHash = (str) =>
    crypto.createHash('md5')
        .update(str)
        .digest('hex');

const generateUserHash = (user) => {
    return generateHash(`${user.id}@${user.username}@${user.email}@${user.id}`);
}

module.exports = {
    hashRijndael,
    generateUserHash,
    generateHash,
}