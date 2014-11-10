var Scout = require('zetta-scout');
var util = require('util');
var FonaPhone = require('./fona_phone');

var FonaPhoneScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(FonaPhoneScout, Scout);

FonaPhoneScout.prototype.init = function(next) {
  var FonaPhoneQuery = this.server.where({type: 'fona-phone'});
  var serialDeviceQuery = this.server.where({ type: 'serial' });
  
  var self = this;

  this.server.observe(serialDeviceQuery, function(serialDevice) {
    self.server.find(FonaPhoneQuery, function(err, results) {
      if (results[0]) {
        self.provision(results[0], FonaPhone, serialDevice);
      } else {
        self.discover(FonaPhone, serialDevice);
      }
      next();
    });
  });
}
