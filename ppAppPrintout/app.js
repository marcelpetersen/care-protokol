var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var server = null;
var gracefullyExiting = false;
var app = express();
var port = 4999;
var baseUrl = 'http://localhost:4999';

console.log("Starting pp-App print application on port " + port);

handleTearDown = function() {
  gracefullyExiting = true;
  console.info('Attempting gracefully shutdown of server, waiting for remaining connections to complete.');
  server.close(function() {
    console.info('No more connections, shutting down server.');
    return process.exit();
  });
  return setTimeout(function() {
    console.error('Could not close connections in time, forcefully shutting down.');
    return process.exit(1);
  }, 30 * 1000);
};

process.on('SIGINT', handleTearDown);

process.on('SIGTERM', handleTearDown);

app.set('port', port);
app.set('baseUrl', baseUrl);
app.enable('trust proxy');
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, Origin');
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  } else {
    return next();
  }
});
app.use(function(req, res, next) {
if (!gracefullyExiting) {
  return next();
}
res.setHeader('Connection', 'close');
return res.status(502).send({
  message: 'Server is in the process of restarting.'
});
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

require('./routes')(app, console);

if (__filename === process.argv[1]) {
  server = app.listen(port);
  console.info("Listening on http://localhost:" + port);
} else {
  console.info("Module is being required, skipping server start...");
}

module.exports = app;