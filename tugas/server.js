const { createServer } = require('http');
const url = require('url');
const { stdout } = require('process');
const { uploadService, readService } = require('./storage-service');

const server = createServer((req, res) => {
  let method = req.method;
  // route service
  let message = 'tidak ditemukan data';
  let statusCode = 200;
  const uri = url.parse(req.url, true);
  const respond = () => {
    res.statusCode = statusCode;
    res.write(message);
    res.end();
  };
  switch (true) {
    case uri.pathname === '/pekerjaan/store':
      if (method === 'POST') {
        uploadService(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    case /^\/read\/\w+/.test(uri.pathname):
      if (method === 'GET') {
        readService(req, res);
      } else {
        message = 'Method tidak tersedia';
        respond();
      }
      break;
    default:
      statusCode = 404;
      respond();
  }
});

function serve() {
  const PORT = 9999;
  server.listen(PORT, () => {
    stdout.write(`server listening on port ${PORT}\n`);
  });
}

module.exports = {
  serve,
};
