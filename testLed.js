var MicroDogsController = require('./microdogs_controller').MicroDogsController;
var microdogsController = new MicroDogsController();

state = 0;
states = ["successful", "started", "failed"];

microdogsController.setUpScreens();
microdogsController.announceDeploy(state);

setInterval(function() {
  if (state === 2) {
    state = 0;
  } else {
    state++;
  }

  console.log("Announcing state " + states[state]);

  microdogsController.announceDeploy({status:states[state]});

}, 5000);
