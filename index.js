var Scout = require('zetta-scout');
var util = require('util');
var FonaPhone = require('./fona_phone');

var FonaPhoneScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(FonaPhoneScout, Scout);

FonaPhoneScout.prototype.init = function(next) {
  var queries = [
    this.server.where({ type: 'fona-phone' })
  ];

  var self = this;
  this.server.observe(queries, function(serialDevice) {
    self.discover(FonaPhone, serialDevice);
  });

  next();
}