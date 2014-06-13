var BUTTON_TIME = 750;
var LEDS_PIN = 12;
var MENU_PIN = 16;
var NAV_PIN = 18;

// reference: [fail, success, running/started]
// it starts on scary Sugar (index 0)
var FAILURE_INDEX = 0;
var SUCCESS_INDEX = 1;
var STARTED_INDEX = 2;

// current image index
var CURRENT_INDEX = 0;

// dem Node modules
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
        this.displayState(STARTED_INDEX);
        break;
      case "failed":
        interval = setInterval(this.flash, 200); 
        this.displayState(FAILURE_INDEX);
        break;
      case "successful":
        this.displayState(SUCCESS_INDEX);
        break;
      case "default":
        this.steadyLight(); 
        break; 
    }     
  };

  this.displayState = function(index) {
    var rotations = Math.abs(index - CURRENT_INDEX); // how many rotations to the next image?
    for (var i = 0; i < rotations; i++ ) {
      gpio.write(NAV_PIN, 1, function() {
        console.log('Rotate ' + i);
      });
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

