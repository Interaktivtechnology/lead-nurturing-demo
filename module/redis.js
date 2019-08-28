const redis = require('redis');
const { promisify } = require('util');


const env = process.env.NODE_ENV || 'dev';
const prefix = `ln-demo:${env}:`;

const plainRedisConnection = () => {
    const client = redis.createClient({
        prefix,
    });
    const redisSet = promisify(client.set).bind(client);
    const redisGet = promisify(client.get).bind(client);
    const redisExpire = promisify(client.expire).bind(client);
    const redisDel = promisify(client.del).bind(client);
    const redisKeys = promisify(client.keys.bind(client));
    const redisHset = promisify(client.hset).bind(client);
    const redisHgetAll = promisify(client.hgetall).bind(client);
    const redisHget = promisify(client.hget).bind(client);
    return {
        redisSet,
        redisGet,
        redisExpire,
        redisDel,
        redisKeys,
        redisHset,
        redisHgetAll,
        redisHget,
    };
};

const redisConnection = (req, res, next) => {
    const {
        redisExpire, redisSet, redisGet, redisDel, redisHset, redisHget, redisHgetAll, redisKeys,
    } = plainRedisConnection();
    req.redisSet = redisSet;
    req.redisGet = redisGet;
    req.redisExpire = redisExpire;
    req.redisDel = redisDel;
    req.redisHset = redisHset;
    req.redisHget = redisHget;
    req.redisHgetAll = redisHgetAll;
    req.redisKeys = redisKeys;
    return next();
};


module.exports = {
    redisConnection,
    plainRedisConnection,
    redisPrefix: prefix,
};
