const redis = require('redis');
const { promisify } = require('util');
const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

client.on('error', (error) => {
  console.error(error);
  client.end(true);
});

client.on('connect', () => {
  main();
});

async function main() {
  try {
    const val = await getAsync('0');
    console.log(val);
    client.end(true);
  } catch (err) {
    console.error(err);
  }
}