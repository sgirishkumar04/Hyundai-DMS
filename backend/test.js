const http = require('http');

const loginData = JSON.stringify({ email: "admin@hyundaisouth.com", password: "Password123" });

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    console.log("Logged in, token:", token.substring(0, 10) + "...");
    
    // Now request reports
    const repOptions = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/reports/monthly-bookings',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    };
    const repReq = http.request(repOptions, repRes => {
      let repData = '';
      repRes.on('data', chunk => repData += chunk);
      repRes.on('end', () => {
        console.log("Reports status:", repRes.statusCode);
        console.log("Reports response:", repData);
      });
    });
    repReq.end();
  });
});
req.write(loginData);
req.end();
