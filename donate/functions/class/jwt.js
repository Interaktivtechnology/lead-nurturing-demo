const { readFileSync } = require('fs');

const jwt = require('jsonwebtoken');


// You can generate public and private key here http://travistidwell.com/jsencrypt/demo/ 

class JWT {
    constructor() {
        this.privateKey = readFileSync(process.env.STEPASIA_PRIVATE_KEY);
        this.publicKey = readFileSync(process.env.STEPASIA_PUBLIC_KEY);
    }

    sign(fingerPrint, userAgent) {
        const token = jwt.sign({ fingerPrint, userAgent }, this.privateKey, {
            issuer: fingerPrint,
            subject: 'signIn',
            audience: userAgent,
            expiresIn: '12h',
            algorithm: 'RS256',
        });
        return token;
    }

    verify(token, fingerPrint, userAgent) {
        const result = jwt.verify(token, this.publicKey, {
            issuer: fingerPrint,
            subject: 'signIn',
            audience: userAgent,
            expiresIn: '12h',
            algorithm: 'RS256',
        });
        return result;
    }

    static decode(token) {
        return jwt.decode(token);
    }
}

module.exports = JWT;
