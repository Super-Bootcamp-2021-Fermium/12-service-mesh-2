const redis = require('redis');
const { promisify } = require('util');
const client = redis.createClient();

const startRedis = promisify(client.on).bind(client);
const getData = promisify(client.get).bind(client);
const setData = promisify(client.set).bind(client);
const delData = promisify(client.del).bind(client);

module.exports = {
  startRedis,
  setData,
  getData,
  delData,
};
