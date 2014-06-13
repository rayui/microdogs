var https = require('https');
var _ = require('underscore');

var HOST_NAME = 'www.yammer.com';
var USER_TOKEN = process.argv[2];
console.log('USER_TOKEN:', USER_TOKEN);

var POLL_INTERVAL = 3010;
var POLL_COUNT = 20;
var THREAD_ID=1254605;
var DEPLOY_BOT_USER_ID=1495663658;

var getMessage = function(onPayload) {
  var options = {
    hostname: HOST_NAME
   , path: '/api/v1/messages/in_group/' + THREAD_ID + '.json?include_counts=true&limit=1&exclude_own_messages_from_unseen=true&threaded=extended' 
   , headers: {
      'Authorization': 'Bearer ' + USER_TOKEN
    }
  };


  https.get(options, function(res) {
    var out = '';

    res.on('data', function(d) {
      out += d;
    });

    res.on('end', function() {
      onPayload(out);
    });

  }).on('error', function(e) {
    console.error(e);
  });
};

// Keep track of likes so we never double count one.
var likeRegistry = {};

var isFromDeployBot = function(payload) {
  if (payload.messages[0].sender_id === 1495663658) {
    return true;
  }
  return false;
}

var processThread = function (onNewDeploy) {
  getMessage(function (payload) {

    var deployStatus;

    try {
      payload = JSON.parse(payload);
    } catch (err) {
      console.log("err: %s payload length: %d,  payload: %s", err, payload.length, payload);
      payload = {};
    }

    if (isFromDeployBot(payload)) {
      if (hasStartedMessage(payload)) {
        if(!hasSuccessReply(payload) && !hasAbortedReply) {
          onNewDeploy({status:"started"});  
        } else if (hasSuccessReply) {
          onNewDeploy({status:"success"});
        } else if (hasAbortedReply) {
          onNewDeploy({status:"aborted"});
        } 
      }  
    } 

  });
};

var pollerHandle;

var start = function (onDeploy) {
  console.log('START POLLER');
  // Run once to make sure we only count brand new notifications
  processThread(function (deployStatus) {
    console.log(deployStatus);
  });

  var feedPoll = function () {
    console.log('polling...');
    processThread(function (deployStatus) {
      onDeploy(deployStatus);
    });
  };

  // Poll and fire shocker until the program exits
  pollerHandle = setInterval(feedPoll, POLL_INTERVAL);
};

var stop = function () {
  clearInterval(pollerHandle);
  console.log('STOP POLLER');
};

module.exports = {
  start: start
, stop: stop
};
