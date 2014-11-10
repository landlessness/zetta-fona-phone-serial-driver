var Device = require('zetta-device');
var util = require('util');

var FonaPhone = module.exports = function() {
  Device.call(this);
  this._serialDevice = arguments[0];
  
  this.volume = null;
  this.audioModeCode = null;
  this.audioMode = null;
  
  this._audioModesMap = {
    0: 'headset',
    1: 'external'
  };

};
util.inherits(FonaPhone, Device);

FonaPhone.prototype.init = function(config) {

  config
  .name('Adafruit Fona Phone')
  .type('fona-phone')
  .state('waiting')
  .when('waiting', { allow: ['call', 'pick-up', 'set-volume', 'get-volume', 'get-audio-mode', 'set-audio-mode', 'play-toolkit-tone', 'set-mic-mode-level']})
  .when('playing-toolkit-tone', {allow: ['stop-toolkit-tone']})
  .when('calling', { allow: ['hang-up']})
  .when('ringing', { allow: ['pick-up', 'hang-up']})
  .when('talking', { allow: ['hang-up', 'set-volume', 'get-volume', 'get-audio-mode', 'set-audio-mode', 'set-mic-mode-level']})
  .map('hang-up', this.hangUp)
  .map('pick-up', this.pickUp)
  .map('stop-toolkit-tone', this.stopToolkitTone)
  .map('play-toolkit-tone', this.playToolkitTone, [{
    name: 'tone',
    type: 'range',
    text: 'Tone (1-8,16-20)',
    min: 1,
    max: 20,
    step: 1
    // this is really two ranges. 1-8 and 16-20.
    // +STTONE: (0-1),(1-8,16-20),(10-15300000)
  },{
    name: 'length',
    text: 'Length in Milliseconds',
    type: 'range',
    min: 10,
    max: 15300000,
    step: 1
  }])
  .map('set-mic-mode-level', this.setMicModeLevel, [{
    name: 'mode', title: 'Mic Mode', type: 'radio', 
          value: [{value: 0, text: this._audioModesMap[0]},
                  {value: 1, text: this._audioModesMap[1]}]
  },{
    name: 'level', title: 'Mic Gain', type: 'range',
    min: 0,
    max: 15,
    step: 1
  }])
  .map('set-audio-mode', this.setAudioMode, [{
    name: 'mode', title: 'Audio Mode', type: 'radio', 
          value: [{value: 0, text: this._audioModesMap[0]},
                  {value: 1, text: this._audioModesMap[1]}]
    }])
  .map('get-audio-mode', this.getAudioMode)
  .map('set-volume', this.setVolume, [{
    name: 'volume',
    type: 'range',
    min: 0,
    max: 100,
    step: 1}])
  .map('get-volume', this.getVolume)
  .map('call', this.callPhone, [{
    name: 'phoneNumber',
    title: 'Phone Number to Call',
    type: 'text'}])
  
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

FonaPhone.prototype.setVolume = function(volume, taskIsDone) {
  this.log('setVolume');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'setting-volume'},
    command: 'AT+CLVL=' + volume,
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function(match) {
      self.state = 'waiting';
      taskIsDone();
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
};

FonaPhone.prototype.getVolume = function(taskIsDone) {
  this.log('getVolume');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'getting-volume'},
    command: 'AT+CLVL?',
    regexp: /^$/
  },
  {
    regexp: /\+CLVL: (\d+)/,
    onMatch: function(match) {
      self.volume = match[1];
      self.state = 'waiting';
      taskIsDone();
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
};

FonaPhone.prototype.setAudioMode = function(mode, taskIsDone) {
  this.log('setAudioMode');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'setting-audio-mode'},
    command: 'AT+CHFA=' + mode,
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function(match) {
      self.state = 'waiting';
      taskIsDone();
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
};

FonaPhone.prototype.getAudioMode = function(taskIsDone) {
  this.log('getAudioMode');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'getting-audio-mode'},
    command: 'AT+CHFA?',
    regexp: /^$/
  },
  {
    regexp: /\+CHFA: (\d+)/,
    onMatch: function(match) {
      self.audioModeCode = match[1];
      self.audioMode = self._audioModesMap[match[1]];
      self.state = 'waiting';
      taskIsDone();
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
};

FonaPhone.prototype.playToolkitTone = function(tone, length, taskIsDone) {
  this.log('playToolkitTone');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'playing-toolkit-tone';},
    command: ['AT+STTONE=1',tone,length].join(','),
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function() {
      taskIsDone();
      setTimeout(function(){
        self.state = 'waiting';
      }, length);
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
}

FonaPhone.prototype.stopToolkitTone = function(taskIsDone) {
  this.log('stopToolkitTone');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'stopping-toolkit-tone'},
    command: 'AT+STTONE=0',
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function(match) {
      self.state = 'waiting';
      taskIsDone();
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
}
FonaPhone.prototype.setMicModeLevel = function(mode, level, taskIsDone) {
  this.log('setMicModeLevel');

  var self = this;
  
  var tasks = [
  {
    before: function() {self.state = 'setting-mic-mode-level';},
    command: 'AT+CMIC='+ [mode,level].join(','),
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function() {
      self.state = 'waiting';
      taskIsDone();
    }
  }
  ];

  this._serialDevice.enqueue(tasks);
}