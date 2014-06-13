$(function () {
  // Deliberately Global
  $body = $('body');
  $actualNumShocks = $('#actual-number-shocks');
  $actualMeter = $('#actual-meter');
  $shockerList = $('#shocker-list');
  $shockerLeaderboard = $('#shocker-leaderboard');
  var userLikeCounts = {};


  var shockItemTemplate = '<li>{{name}} liked your message.</li>';

  var LeaderBoard = Backbone.View.extend({
    id: 'leaderboard-list'
  , tagName: 'ul'
  , template: '{{#users}}<li>{{name}} <span class="num-likes">{{count}}</span></li>{{/users}}'
  
  , render: function() {
      var users = _.map(this.collection, function (user) { return user; });
      users = _.sortBy(users, function (user) { return user.count * -1; });

      var templateData = {
        users: users
      };

      this.$el.html(Mustache.render(this.template, templateData));
      return this;
    }
  });

  // Deliberately Global
  leaderBoard = new LeaderBoard({
    id: 'leaderboard-list'
  , collection: userLikeCounts
  });

  $shockerLeaderboard.append(leaderBoard.el);

  var shocksBeforeShow = 5;

  // Setup socket and update dashboard on new likes
  var socket = io.connect(window.location.origin);

  socket.on('shocks', function (like) {
    console.log(like);

    if (userLikeCounts[like.id]) {
      userLikeCounts[like.id].count += 1;
    } else {
      like.count = 1;
      userLikeCounts[like.id] = like;
    }

    var sum = _.reduce(userLikeCounts, function(memo, like){ return memo + like.count; }, 0);


    if (sum >= shocksBeforeShow) {
      $body.removeClass('starter');
    }

    $actualNumShocks.html(sum);
    $actualMeter.attr('value', sum);

    $shockerList.prepend(Mustache.render(shockItemTemplate, like));

    leaderBoard.render();
  });

  socket.on('shocker', function (state) {
    console.log(state)
    if (state.on) {
      console.log('Shocker on');
      $body.addClass('shocker');
    } else {
      console.log('Shocker off');
      $body.removeClass('shocker');
    }
  });
});