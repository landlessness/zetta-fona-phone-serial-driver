var Device = require('zetta-device');
var util = require('util');

var FonaPhone = module.exports = function() {
  Device.call(this);
  this._serialDevice = arguments[0];
  this.volume = null;
};
util.inherits(FonaPhone, Device);

FonaPhone.prototype.init = function(config) {

  config
  .name('Adafruit Fona Phone')
  .type('fona-phone')
  .monitor('volume')
  .state('waiting')
  .when('waiting', { allow: ['call-phone']})
  .map('call-phone', this.callPhone, [
    { name: 'number', title: 'Phone Number to Call', type: 'text'}]);

  var self = this;

};

FONA.prototype.callPhone = function(number, cb) {
  var self = this;
  this._serialDevice.enqueueSimple('AT+FMVOLUME?', /^\+FMVOLUME: (\d+)/, function (matches) {
    self.fmVolume = matches[1][1]
  });
}