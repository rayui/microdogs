var BUTTON_TIME = 750;
var LEDS_PIN = 12;
var MENU_PIN = 16;
var NAV_PIN = 18;
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

var MicroDogsController = function() {
  var interval; 
  var lightState;

  this.yLogoLEDState = 1;

  this.steadyLight = function() {
    this.yLogoLEDState = 1;
    gpio.write(12, this.yLogoLEDState, function() {
      console.log('Enable pin 12 - constant');
    });
  };

  this.flash = function() {
    var self = this;
    this.yLogoLEDState = !this.yLogoLEDState;
    gpio.write(12, this.yLogoLEDState, function() {
      console.log('pin 12 state - ' + self.yLogoLEDState);
    });
  };

  this.announceDeploy = function (deploy) {
    var self = this;
    clearInterval(interval); 
    switch(deploy.status) {
      case "started":
        interval = setInterval(this.flash, 500); 
        break;
      case "failed":
        interval = setInterval(this.flash, 200); 
        break;
      case "successful":

        break;
      case "default":
        this.steadyLight(); 
        break; 
    }     
  };

  this.setUpScreens = function() {
    // Opens Menu
    gpio.write(MENU_PIN, 1, function() {
      console.log('Open menu.');
    });

    /******* Disable Slideshow ********/
    
    gpio.write(NAV_PIN, 1, function() {
      console.log('Navigate to "Slideshow" menu item.');
    });    
    gpio.write(MENU_PIN, 1, function() {
      console.log('Select "Slideshow" menu item.');
    });
    gpio.write(NAV_PIN, 1, function() {
      console.log('Move to "Off" option.');
    });
    gpio.write(MENU_PIN, 1, function() {
      console.log('Select "Off" option.');
    });

    // Should return to menu after selecting an option
    
    /****** Disable Auto-shut down ********/
    gpio.write(NAV_PIN, 1, function() {
      console.log('Navigate next.');
    });
    gpio.write(NAV_PIN, 1, function() {
      console.log('Navigate to "Auto" menu item.');
    });    
    gpio.write(MENU_PIN, 1, function() {
      console.log('Select "Auto" menu item.');
    });  
    gpio.write(NAV_PIN, 1, function() {
      console.log('Move to "Off" option.');
    }); 
    gpio.write(MENU_PIN, 1, function() {
      console.log('Select "Off" option.');
    });   

    // Should return to menu after selecting an option
    // and subsequently after a few seconds, to the first slide.
  };

};

exports.MicroDogsController = MicroDogsController;

