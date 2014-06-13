
var BUTTON_TIME = 750;
var _ = require('underscore');
var gpio = require('pi-gpio');

var openGpio = function() {
  gpio.close(12, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(12, 'output', function(err) {
    console.log('opened gpio', err);
  });
};
openGpio();

var MicroDogsController = function(socket) {
  var interval; 
  var lightState;
  this.socket = socket;

  this.steadyLight = function() {
    yLogoLEDState = 1;
    gpio.write(12, yLogoLEDState, function() {
      console.log('Enable pin 12 - constant');
    });
  };

  this.flash = function() {
    yLogoLEDState = !yLogoLEDState;
    gpio.write(12, yLogoLEDState, function() {
      console.log('pin 12 state - ' + yLogoLEDState);
    });
  };

  this.announceDeploy = function (deploy) {
    var self = this;
    clearInterval(interval); 
    switch(deploy.status) {
      case: "started":
        interval = setInterval(this.flash, 500); 
        break;
      case "failed":
        interval = setInterval(this.flash, 200); 
        break;
      case "successful":
      case "default":
        this.steadyLight(); 
        break; 
    }     
  };

  

};

exports.MicroDogsController = MicroDogsController;

