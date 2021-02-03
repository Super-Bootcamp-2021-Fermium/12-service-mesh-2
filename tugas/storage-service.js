const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const Busboy = require('busboy');
const url = require('url');
const { Writable } = require('stream');
const { setData, getData } = require('./redis');

function randomFileName(mimetype) {
  return (
    new Date().getTime() +
    '-' +
    Math.round(Math.random() * 1000) +
    '.' +
    mime.extension(mimetype)
  );
}

async function postService(req, res) {
  const busboy = new Busboy({ headers: req.headers });
  let obj = {};
  let data = JSON.parse(await getData('data'));

  if (!data) {
    data = { data: [] };
  }

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        {
          const destname = randomFileName(mimetype);
          const store = fs.createWriteStream(
            path.resolve(__dirname, `./file-storage/${destname}`)
          );
          file.on('error', abort);
          store.on('error', abort);
          file.pipe(store);
        }
        break;
      default: {
        const noop = new Writable({
          write(chunk, encding, callback) {
            setImmediate(callback);
          },
        });
        file.pipe(noop);
      }
    }
  });

  busboy.on('field', async (fieldname, val) => {
    obj[`${fieldname}`] = val;
  });
  busboy.on('finish', async () => {
    data.data.push(obj);
    await setData('data', JSON.stringify(data));
    console.log('data berhasil disimpan');
    res.end();
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

async function readService(req, res) {
  const data = await getData('data');
  res.setHeader('Content-Type', 'application/json');
  res.write(data);
  res.statusCode = 200;
  res.end();
}

async function deleteService(req, res) {
  const uri = url.parse(req.url, true);
  const data = JSON.parse(await getData('data'));
  const name = uri.pathname.replace('/pekerja/delete/', '');
  if (!name) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }

  for (let i = 0; i < data.data.length; i++) {
    if (data.data[i].nama === name) {
      data.data.splice(i, 1);
    }
  }

  await setData('data', JSON.stringify(data));
  res.statusCode = 200;
  res.end();
}

module.exports = {
  postService,
  readService,
  deleteService,
};
