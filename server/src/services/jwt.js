const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const privateKey = fs.readFileSync(path.join(__dirname, '../config/keys/private.key'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, '../config/keys/public.key'), 'utf8');

class JwtService {
    sign(payload) {
        return jwt.sign(payload, privateKey, authConfig.jwt);
    }

    verify(token) {
        try {
            return jwt.verify(token, publicKey, authConfig.jwt);
        } catch(error) {
            return false;
        }
    }

    decode(token) {
        return jwt.decode(token, { complete: true });
    }
}

module.exports = new JwtService();