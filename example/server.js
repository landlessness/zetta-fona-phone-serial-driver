var zetta = require('zetta');
var SerialDevice = require('zetta-serial-device-driver');
var FonaPhone = require('../index');

zetta()
  .use(SerialDevice, '/dev/ttyO1')
  .use(FonaPhone)
  .listen(1337);
