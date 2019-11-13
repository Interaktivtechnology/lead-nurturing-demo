const redis = require('redis');
const { promisify } = require('util');


const plainRedisConnection = () => {
    const client = redis.createClient({
        prefix: 'STEPASIA:',
    });
    const redisSet = promisify(client.set).bind(client);
    const redisGet = promisify(client.get).bind(client);
    const redisExpire = promisify(client.expire).bind(client);
    const redisDel = promisify(client.del).bind(client);
    const redisKeys = promisify(client.keys.bind(client));
    return { redisSet, redisGet, redisExpire, redisDel, redisKeys };
};

const redisConnection = (req, res, next) => {
    const { redisExpire, redisSet, redisGet, redisDel } = plainRedisConnection();
    req.redisSet = redisSet;
    req.redisGet = redisGet;
    req.redisExpire = redisExpire;
    req.redisDel = redisDel;
    return next();
};


module.exports = {
    redisConnection,
    plainRedisConnection,
};
