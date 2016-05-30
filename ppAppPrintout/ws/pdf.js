var FORMATS, MARGIN_REGEX, ORIENTATIONS, Pdf, crypto, fs, path, _;

_ = require('underscore');

fs = require('fs');

path = require('path');

crypto = require('crypto');

FORMATS = ['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'];

ORIENTATIONS = ['portrait', 'landscape'];

MARGIN_REGEX = /^\d+(in|cm|mm)$/;

Pdf = (function() {
  function Pdf(logger, options, pdfIonicAppArgs) {
    this.logger = logger;
    
    this._pdfIonicAppArgs = pdfIonicAppArgs;

    if (options == null) {
      options = {};
    }
    this._options = _.defaults(options, {
      paperSize: {
        format: 'A4',
        orientation: 'portrait',
        border: '1cm'
      },
      content: '',
      context: {},
      download: false
    });
  }

  // Passing the phantom process and callback...
  Pdf.prototype.generate = function(ph, cb) {
    var e, html, randomToken, timestamp, tmpFileName, tmpFilePath, tmpJSFileName, tmpJSFilePath, _ref;
    this._page = null;
    try {
      
      timestamp = new Date().getTime();
      randomToken = crypto.randomBytes(32).toString('hex');
      filenameprefix = "" + timestamp + "-" + randomToken;
      tmpFileName = filenameprefix + ".pdf";
      tmpFilePath = path.join(__dirname, '../../tmp', tmpFileName);
      this._pdfIonicAppArgs.pdfFileName = tmpFileName;
    
      //tmpJSFileName = filenameprefix + ".js";
      tmpJSFileName = "_pdfIonicAppArgs.js";
      tmpJSFilePath = path.join(__dirname, '../../tmp', tmpJSFileName);

      // Start writing pdfIonicAppArgs Object 
      // a deliberate sync call
      var tmpJSFileHandle = fs.openSync(tmpJSFilePath, 'w+');
      var injectVar = "window._pdfIonicAppArgs = " + JSON.stringify(this._pdfIonicAppArgs) + ";";
      if ( fs.writeSync(tmpJSFileHandle, injectVar) > 0 ) {
        fs.closeSync(tmpJSFileHandle);
      } else {
        throw new Error('Unable to inject PDF Ionic App args');
      }

      return ph.createPage((function(_this) {
        return function(page) {
          _this._page = page;

          var __onConsoleMessage = function(msg, lineNum, sourceId) {
              _this.logger.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
          };

          page.onConsoleMessage(__onConsoleMessage);
          page.set('paperSize', _this._options.paperSize);

            // Currently only a demo, this will be the actual print-out ionic app
             //page.open("file:///C:/repos/ppApp/www/pdf-index.html", function (status) {
            page.open("file:///Users/siddhartham/office_workspace/Pflegeprotokoll/pp-app/www/pdf-index.html", function (status) {
                _this.logger.log("opened app? ", status);
                if (status !== 'success') {
                            _this.logger.log('Unable to load the address!');
                        } else {
                            _this.logger.log("Content set to page with status: " + status);
                              // Render the PDF...
                              setTimeout(function () {
                               return page.render(tmpFilePath, function() {
                                  page.sendEvent('click'); // click to finish....
                                  _this.logger.log('Sent event!! Now ready to finish');
                                   setTimeout(function () {
                                    // and wait..a bit more!!
                                    page.close();
                                   }, 7000);
                                  _this.logger.log("New PDF generated: " + tmpFileName);
                                  return cb(tmpFileName);
                                });
                             }, 20000);
                        }
                });
        };
      })(this));
    } catch (_error) {
      e = _error;
      if ((_ref = this._page) != null) {
        _ref.close();
      }
      throw new Error(e);
    }
  };

  return Pdf;

})();

module.exports = Pdf;
