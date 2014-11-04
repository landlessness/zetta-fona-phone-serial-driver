var Device = require('zetta-device');
var util = require('util');

var FonaFMRadio = module.exports = function() {
  Device.call(this);
  this._serialDevice = arguments[0];
  this.volume = null;
};
util.inherits(FonaFMRadio, Device);

FonaFMRadio.prototype.init = function(config) {

  config
  .name('Adafruit Fona FMRadio')
  .type('fona-fm-radio')
  .monitor('volume')
  .state('waiting')
  .when('waiting', { allow: ['send-sms', 'read-sms']})
  .when('sending-sms', { allow: ['read-sms']})
  .when('reading-sms', { allow: ['send-sms']})
  .map('read-sms', this.readSMS, [
    { name: 'messageIndex', title: 'Message Index', type: 'range',
      min: 1, step: 1}])
  .map('send-sms', this.sendSMS, [
    { name: 'phoneNumber', title: 'Phone Number to Send SMS', type: 'text'},
    { name: 'message', title: 'Body of the SMS', type: 'text'},
    ]);

  var self = this;
  this._requestVitals();
  setInterval(function() {
    self._requestVitals();
  }, 60000);

};

FONA.prototype._requestFMVolume = function() {
  var self = this;
  this._serialDevice.enqueueSimple('AT+FMVOLUME?', /^\+FMVOLUME: (\d+)/, function (matches) {
    self.fmVolume = matches[1][1]
  });
}

FONA.prototype._requestVitals = function(context) {
  this._requestFMVolume();
}