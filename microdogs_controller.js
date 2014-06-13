var BUTTON_TIME = 150;
var YLOGO_PIN = 12;
var SPITTLE_PIN_0 = 11;
var SPITTLE_PIN_1 = 16;
var SPITTLE_PIN_2 = 15;
var MENU_PIN = 22;
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
  gpio.close(MENU_PIN, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(MENU_PIN, 'output', function(err) {
    console.log('opened gpio', err);
  });
  gpio.close(NAV_PIN, function(err) {
    console.log('closed gpio: %s', err);
  });
  gpio.open(NAV_PIN, 'output', function(err) {
    console.log('opened gpio', err);
  });
  gpio.write(MENU_PIN, 1, function() {});
  gpio.write(NAV_PIN, 1, function() {});
};
openGpio();

var MicroDogsController = function() {
  var interval; 
  var spittleState = 0;
  var flashState = 1;
  var status = "";

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
 
  this.getStatus = function() {
    return this.state;
  };
 
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
  
  this.displayState = function(index) {
    var buttonState = 1;
    var self = this;
 
    var clickButton = function(rotations) {
      if (!rotations) return;
      
      buttonState = toggleBit(buttonState);
      gpio.write(NAV_PIN, buttonState, function() {
        setTimeout(_.bind(clickButton, self), BUTTON_TIME);
        rotations -= 1; 
      });       
      CURRENT_INDEX = index;
    }

    clickButton(Math.abs(index - CURRENT_INDEX) * 2);

  };
  
  this.announceDeploy = function (deploy) {
    var self = this;

    clearIntervals(); 
    status = deploy.status;
    switch(status) {
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

  this.setUpScreens = function() {
    var turnOffDefaults = function() {
      var pinQueue = [];
      var unclickButton = function() {
        gpio.write(pinQueue.shift(), 0, function() { 
          if (pinQueue.length == 0) {
            clearInterval(pinQueueWorker);
          }
        });
      };
      // Opens Menu
      pinQueue.push(MENU_PIN);

      /******* Disable Slideshow ********/
      pinQueue = pinQueue.concat([NAV_PIN, MENU_PIN, NAV_PIN, MENU_PIN]);
      
      // Should return to menu after selecting an option
      
      /****** Disable Auto-shut down ********/
      pinQueue = pinQueue.concat([NAV_PIN, NAV_PIN, MENU_PIN, NAV_PIN, MENU_PIN]);    

      // Should return to menu after selecting an option
      // and subsequently after a few seconds, to the first slide.
      var pinQueueWorker = setInterval(function() {
        gpio.write(pinQueue[0], 1, function() {
          setTimeout(unclickButton, BUTTON_TIME); 
        });
      }, BUTTON_TIME * 4);
    };

    setTimeout(_.bind(turnOffDefaults, this), 400);
  };

};

exports.MicroDogsController = MicroDogsController;

