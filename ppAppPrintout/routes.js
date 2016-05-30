var Pdf, fs, path, phantom, pkg, _;

_ = require('underscore');

fs = require('fs');

path = require('path');

phantom = require('phantom');

pkg = require('../package.json');

Pdf = require('./ws/pdf');

module.exports = function(app, logger) {
  var createPdf, downloadPdf, filePath, loadPdf, port, renderPdf, _ph, _phIsStarting, _port;
  _ph = null;
  _phIsStarting = false;
  port = app.get('port');
  _port = port-1;

  filePath = function(name) {
    return path.join(__dirname, '../tmp', name);
  };
  createPdf = function(payload, cb) {
    var pdf;
    pdf = new Pdf(logger, payload.pdfRenderOptions, payload.pdfIonicAppArgs);
    return pdf.generate(_ph, function(tmpFileName) {
      var renderOrDownload;
      if (pdf._options.download) {
        renderOrDownload = 'download';
      } else {
        renderOrDownload = 'render';
      }
      return cb(tmpFileName, renderOrDownload);
    });
  };
  loadPdf = function(fileName, res, cb) {
    var requestedPath;
    requestedPath = filePath(fileName);
    return fs.readFile(requestedPath, function(err, data) {
      if (err) {
        logger.warn("File " + fileName + " not found");
        return res.status(404).end();
        //return res.send(404);
      } else {
        return cb(data);
      }
    });
  };
  renderPdf = function(fileName, res) {
    return loadPdf(fileName, res, function(data) {
      res.type('application/pdf');
      return res.send(data);
    });
  };
  downloadPdf = function(fileName, res) {
    return loadPdf(fileName, res, function(data) {
      return res.download(filePath(fileName), fileName);
    });
  };

  // Check for phantom on all
  app.all('*', function(req, res, next) {
    var phantomOpts;
    /*if (_ph) {
      logger.info('Phantom process already running...');
      return next();
    } else */if (!_phIsStarting) {
      _phIsStarting = true;
      phantomOpts = {
        port: _port
      };
      return phantom.create("--web-security=no", "--ignore-ssl-errors=yes", "--local-storage-path=. --debug=yes", phantomOpts, function(ph) {
        _ph = ph;
        _port = _port - 1;
        _phIsStarting = false;
        logger.info("New phantom process created on port " + phantomOpts.port);
        return next();
      });
    }
  });

  app.get('/', function(req, res, next) {
    return res.json(_.omit(pkg, 'devDependencies'));
  });

  app.post('/pdf', function(req, res, next) {   
    // validate req.body here
    createPdf({pdfRenderOptions: {}, pdfIonicAppArgs: req.body}, function(tmpFileName) {
      // Mail queue...
      // user signed Request e-mail
      
     // _ph.exit(0);
    });
    return res.send('Got that!!');
  });
 
   // Render
  app.get('/pdf/render', function(req, res, next) {
    return createPdf({pdfRenderOptions: {}, pdfIonicAppArgs: req.body}, function(tmpFileName) {
      return renderPdf(tmpFileName, res);
    });
  });


   // Download
  return app.get('/pdf/download', function(req, res, next) {
    return createPdf({pdfRenderOptions: {}, pdfIonicAppArgs: req.body}, function(tmpFileName) {
      return downloadPdf(tmpFileName, res);
    });
  });
};
