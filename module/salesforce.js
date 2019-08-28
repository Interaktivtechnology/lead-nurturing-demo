const jsforce = require('jsforce');
const dotenv = require('dotenv');
const { plainRedisConnection } = require('./redis');

const { parsed: config } = dotenv.config();
const env = process.env.NODE_ENV || config.SF_MODE;

const sfLogin = {
    username: config.SfUsername,
    password: config.SfPassword,
};
const { redisGet, redisSet, redisExpire } = plainRedisConnection();

const loginToSalesforce = (req, res, next) => {
    const conn = new jsforce.Connection({
        loginUrl: env !== 'dev' ? 'https://login.salesforce.com' : 'https://test.salesforce.com',
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

                redisSet('sfToken', JSON.stringify(sfSession));
                redisExpire('sfToken', 60 * 60);
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

const createSfObject = async (req, res, next) => {
    try {
        // if (err) return res.status(503).send({ error: true, status: 503 });
        const reply = await redisGet('sfToken');
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
};


module.exports = {
    loginToSalesforce,
    createSfObject,
};
