const redis = require('redis');
const jsforce = require('jsforce');

const clientRedis = redis.createClient({
    prefix: 'STEPASIA:',
});


const env = process.env.NODE_ENV || 'SANDBOX';
const sfLogin = {
    username: process.env[`STEPASIA_SF_${env}_USERNAME`],
    password: process.env[`STEPASIA_SF_${env}_PASSWORD_TOKEN`],
};

const loginToSalesforce = (req, res, next) => {
    const conn = new jsforce.Connection({
        loginUrl: env !== 'SANDBOX' ? 'https://login.salesforce.com' : 'https://test.salesforce.com',
    });
    conn.login(sfLogin.username, sfLogin.password, (err, result) => {
        try {
            if (err) {
                throw err;
            } else {
                const sfSession = {
                    env,
                    accessToken: conn.accessToken,
                    instanceUrl: conn.instanceUrl,
                    id: result.id,
                    orgId: result.organizationId,
                    issued_at: new Date().getTime(),
                };
                if (req) {
                    req.sfSession = sfSession;
                    req.sfConn = conn;
                }

                clientRedis.set(`sfToken:${env}`, JSON.stringify(sfSession));
                clientRedis.expire(`sfToken:${env}`, 60 * 60);
                // admin.database().ref(`/salesforce-session/${sfSession.env}`).set(sfSession);
                if (typeof next === 'undefined') res.status(200).send(sfSession);
                else next();
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
            });
        }
    });
};


const validateToken = (req, res, next) => {
    const token = req.headers['hash-token'] || req.query.token;

    clientRedis.get(token, (err, reply) => {
        // if (err) return res.status(500).send({ err });
        try {
            if (err) throw err;
            if (reply === null) return res.status(404).send({ status: 404, message: 'Token is not valid, please refresh the page to get new token' });
            req.siteTokenContent = JSON.parse(reply);
            // const ipAddress = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
            // const jsonReply = JSON.parse(reply);
            next();
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
            });
        }
    });
};

const createSfObject = (req, res, next) => {
    clientRedis.get(`sfToken:${env}`, (err, reply) => {
        try {
            // if (err) return res.status(503).send({ error: true, status: 503 });
            if (err) throw err;
            if (reply === null) loginToSalesforce(req, res, next);
            else {
                const sfToken = JSON.parse(reply);
                const conn = new jsforce.Connection({
                    instanceUrl: sfToken.instanceUrl,
                    accessToken: sfToken.accessToken,
                });
                req.sfConn = conn;
                req.sfSession = sfToken;
                next();
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message,
            });
        }
    });
};

const validateTokenAfterLogin = (req, res, next) => {
    const token = req.headers['hash-token'] || req.query.token;
    clientRedis.get(token, (err, reply) => {
        if (err) return res.status(403).send({ err });
        if (reply === null) return res.status(404).send({ status: 404, message: 'Token is not valid, please refresh the page to get new token' });
        const jsonReply = JSON.parse(reply);
        if (jsonReply.userInfo === undefined) return res.send({ status: 403, message: "Forbidden, you're not allowed to visit this page" });
        req.userInfo = jsonReply.userInfo;
        next();
    });
};

module.exports = {
    loginToSalesforce,
    validateToken,
    createSfObject,
    validateTokenAfterLogin,
};
