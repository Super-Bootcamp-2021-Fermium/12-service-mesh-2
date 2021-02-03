const { startRedis } = require('./redis');
const { serve } = require('./server');

async function main() {
  await startRedis('connect');
  serve();
}

main();
