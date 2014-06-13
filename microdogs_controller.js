var BUTTON_TIME = 250;
var YLOGO_PIN = 12;
var SPITTLE_PIN_0 = 11;
var SPITTLE_PIN_1 = 16;
var SPITTLE_PIN_2 = 15;
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
  gpio.close(YLOGO_PIN, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(YLOGO_PIN, 'output', function(err) {
    console.log('opened gpio', err);
  });
  gpio.close(SPITTLE_PIN_0, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(SPITTLE_PIN_0, 'output', function(err) {
    console.log('opened gpio', err);
  });
  gpio.close(SPITTLE_PIN_1, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(SPITTLE_PIN_1, 'output', function(err) {
    console.log('opened gpio', err);
  });
  gpio.close(SPITTLE_PIN_2, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(SPITTLE_PIN_2, 'output', function(err) {
    console.log('opened gpio', err);
  });
};
openGpio();

var MicroDogsController = function() {
  var interval; 
  var spittleState = 0;
  var flashState = 1;

  var clearIntervals = function() {
    clearInterval(interval);
  }

  var toggleBit = function(bit) {
    return bit = 1 - bit;
  }

  var dcmp = function(a, b) {
    if (a === b) {
      return 1;
    }
    return 0;
  }

  this.steadyLight = function() {
    gpio.write(YLOGO_PIN, 1, function() {
      console.log('Enable pin  ' + YLOGO_PIN + ' - constant');
    });
    gpio.write(SPITTLE_PIN_0, 1, function() {
      console.log('Enable pin  ' + YLOGO_PIN + ' - constant');
    });
    gpio.write(SPITTLE_PIN_1, 1, function() {
      console.log('Enable pin  ' + YLOGO_PIN + ' - constant');
    });
    gpio.write(SPITTLE_PIN_2, 1, function() {
      console.log('Enable pin  ' + YLOGO_PIN + ' - constant');
    });
  
  };

  this.cycleSpittle = function() {
    spittleState++; 
    if (spittleState > 2) {
      spittleState = 0;
    } 
    gpio.write(YLOGO_PIN, 1, function() {
      console.log('pin ' + YLOGO_PIN + ' state - 1');
    });
    gpio.write(SPITTLE_PIN_0, dcmp(spittleState, 0), function() {
      console.log('pin ' + SPITTLE_PIN_0 + ' state - ' + dcmp(spittleState, 0));
    });
    gpio.write(SPITTLE_PIN_1, dcmp(spittleState, 1), function() {
      console.log('pin ' + SPITTLE_PIN_1 + ' state - ' + dcmp(spittleState, 1));
    });
    gpio.write(SPITTLE_PIN_2, dcmp(spittleState, 2), function() {
      console.log('pin ' + SPITTLE_PIN_2 + ' state - ' + dcmp(spittleState, 2));
    });
  };

  this.failureFlash = function() {
    flashState = toggleBit(flashState); 
    gpio.write(YLOGO_PIN, flashState, function() {
      console.log('pin ' + YLOGO_PIN + ' state - 1');
    });
    gpio.write(SPITTLE_PIN_0, flashState, function() {
      console.log('pin ' + SPITTLE_PIN_0 + ' state - ' + flashState);
    });
    gpio.write(SPITTLE_PIN_1, flashState, function() {
      console.log('pin ' + SPITTLE_PIN_1 + ' state - ' + flashState);
    });
    gpio.write(SPITTLE_PIN_2, flashState, function() {
      console.log('pin ' + SPITTLE_PIN_2 + ' state - ' + flashState);
    });
  };
  
  this.announceDeploy = function (deploy) {
    var self = this;
    clearIntervals(); 
    switch(deploy.status) {
      case "started":
        spittleState = 0;
        interval = setInterval(this.cycleSpittle, 500); 
        this.displayState(STARTED_INDEX);
        break;
      case "failed":
        interval = setInterval(this.failureFlash, 200); 
        this.displayState(FAILURE_INDEX);
        break;
      default:
        this.steadyLight(); 
        this.displayState(SUCCESS_INDEX);
        break; 
    }     
  };

  this.displayState = function(index) {
    var buttonState = 0;
    
    var clickButton = function(rotations) {
      if (!rotations) return;
      
      buttonState = toggleBit(buttonState);
      gpio.write(NAV_PIN, buttonState, function() {
        setTimeout(clickButton, BUTTON_TIME);
        rotations -= 1; 
      });       
    }

    clickButton(Math.abs(index - CURRENT_INDEX) * 2);

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

