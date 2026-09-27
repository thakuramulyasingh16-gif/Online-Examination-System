const http = require('http');

const test = (loginId, password) => {
  const data = JSON.stringify({ loginId, password });
  const req = http.request({
    hostname: '::1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log(`Login ID: ${loginId}, Password: ${password}`);
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
    });
  });
  req.on('error', e => console.error(e));
  req.write(data);
  req.end();
};

test('admin', '123456');
test('admin', 'wrongpass');
