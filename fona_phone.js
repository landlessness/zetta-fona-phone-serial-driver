var Device = require('zetta-device');
var util = require('util');

var FonaPhone = module.exports = function() {
  Device.call(this);
  this._serialDevice = arguments[0];
};
util.inherits(FonaPhone, Device);

FonaPhone.prototype.init = function(config) {

  config
  .name('Adafruit Fona Phone')
  .type('fona-phone')
  .state('waiting')
  .when('waiting', { allow: ['call', 'pick-up']})
  .when('calling', { allow: ['hang-up']})
  .when('ringing', { allow: ['pick-up', 'hang-up']})
  .when('talking', { allow: ['hang-up']})
  .map('hang-up', this.hangUp, [])
  .map('pick-up', this.pickUp, [])
  .map('call', this.callPhone, [
    { name: 'phoneNumber', title: 'Phone Number to Call', type: 'text'}])
  
  this._listenForIncomingCall();
  
};

FonaPhone.prototype.callPhone = function(phoneNumber, taskIsDone) {
  this.log('call #phoneNumber: ' + phoneNumber);

  var self = this;

  var tasks = [
  {
    before: function() {self.state = 'calling'},
    command: 'ATD' + phoneNumber + ';',
    regexp: /^$/
  },
  {
    regexp: /OK/
  }
  ];

  this._serialDevice.enqueue(tasks, null, function() {
    taskIsDone();
  });
};

FonaPhone.prototype.hangUp = function(taskIsDone) {
  this.log('hangUp');

  var self = this;
  
  var tasks = [
  {    
    before: function() {self.state = 'hanging-up'},
    command: 'ATH0',
    regexp: /^$/
  },
  {
    regexp: /OK/
  }
  ];

  this._serialDevice.enqueue(tasks, null, function() {
    self.state = 'waiting';
    taskIsDone();
  });
};

FonaPhone.prototype._listenForIncomingCall = function() {
  this.log('_listenForIncomingCall');
  var self = this;
  
  
  // TODO: set a timeout so that if the phone stops
  // ringing and we haven't answered that 
  // we reset state to waiting
  var task = {
    perennial: true,
    before: function() {self.state = 'ringing'},
    regexp: /^RING$/
  };

  this._serialDevice.enqueue(task);
}

FonaPhone.prototype.pickUp = function(taskIsDone) {
  this.log('pickUp');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'picking-up'},
    command: 'ATA',
    regexp: /^$/
  },
  {
    regexp: /OK/
  }
  ];

  this._serialDevice.enqueue(tasks, null, function() {
    self.state = 'talking';
    taskIsDone();
  });
};
