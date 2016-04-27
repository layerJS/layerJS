exports.config = {

  framework: 'jasmine2',
  seleniumAddress: 'http://localhost:4444/wd/hub',
//  specs: ['test/e2e/**/*_spec.js'],
  specs: ['test/e2e/scrolling/*_spec.js'],
  baseUrl: 'file://' + __dirname + '/test/e2e/'.replace(/\\/g, "/"),
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
  multiCapabilities: [{
      'browserName': 'chrome'
    // }, {
    //   'browserName': 'firefox'
    }
    /*,{
      'browserName': 'internet explorer'
    }*/
  ],

  onPrepare: function() {

    // By default, Protractor use data:text/html,<html></html> as resetUrl, but
    // location.replace from the data: to the file: protocol is not allowed
    // (we'll get ‘not allowed local resource’ error), so we replace resetUrl with one
    // with the file: protocol (this particular one will open system's root folder)
    browser.resetUrl = 'file://';
    browser.ignoreSynchronization = true;
  }
}
