var Scout = require('zetta-scout');
var util = require('util');
var FonaFMRadio = require('./fona_fm_radio');

var FonaFMRadioScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(FonaFMRadioScout, Scout);

FonaFMRadioScout.prototype.init = function(next) {
  var queries = [
    this.server.where({ type: 'serial' })
  ];

  var self = this;
  this.server.observe(queries, function(serialDevice) {
    self.discover(FonaFMRadio, serialDevice);
  });

  next();
}