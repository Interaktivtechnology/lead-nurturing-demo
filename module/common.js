const crypto = require('crypto');

const mcpMID = 3118010007;
const mcpSecret = 3118010007;

const responseFGKeyMCP = (soId, currency, amount, rescode, transid) => {
    const beforeEncrypted = `${mcpSecret}?mid=${mcpMID}&ref=${soId}&cur=${currency}&amt=${amount}&rescode=${rescode}&transid=${transid}`;
    const encrypted = crypto.createHash('md5').update(beforeEncrypted).digest('hex');
    return encrypted.toString();
};

const getRecordTypes = async (req, res, next) => {
    try {
        const { redisGet, redisSet, redisExpire } = req;
        let recordTypes = await redisGet('RecordTypes');
        recordTypes = JSON.parse(recordTypes);
        if (recordTypes === null) {
            recordTypes = await req.sfConn.query('Select Id, Name, SobjectType from RecordType');
            redisSet('RecordTypes', JSON.stringify(recordTypes));
            redisExpire('RecordTypes', 60 * 60 * 24);
        }
        req.recordTypes = recordTypes.records;
        return next();
    } catch (error) {
        return res.status(500).send({ status: 500, messages: error.message });
    }
};

const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

module.exports = {
    responseFGKeyMCP,
    getRecordTypes,
    toUrlEncoded,
};
