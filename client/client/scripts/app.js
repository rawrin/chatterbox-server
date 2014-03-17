var friends = {};

var createMessage = function(name, text, roomname) {
  return {
    username: name, 
    text: text, 
    roomname: roomname
  };
};

var postFromParse = function(messageObj) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(messageObj),
    contentType: 'application/json',
    success: function () {
      getFromParse();
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

var getFromParse = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: {order: '-createdAt'},
    success: function (data) {
      var result = data.results;

      // optional criteria to filter by
      var criteria = $('#criteria').val();
      var value = $("input[name='value']").val();
      
      // filtering will be determined by whether or not 'value' is not blank
      if (value !== "") {
        result = _.filter(result, function (obj) {
          return obj[criteria] === value;
        });
      }

      // Always want to reset the $messages div to contains no children
      var $messages = $('#messages');
      $messages.children().remove();

      // Create new <ul> element with <li> elements to append to $messages
      var $ul = $('<ul></ul>');
      _.each(result, function(obj) {
        var text = "[" + "<span>" + obj.roomname + "</span>" + "]" + " " + obj.username + " says: " + obj.text;
        var $li = $('<li></li>').text(text);
        
        // special behavior for friends
        if (friends[obj.username]) {
          $li.addClass("friend");
        }
        $ul.append($li);
      });
      $messages.append($ul);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

$(document).ready(function() {
  $('#get').on('click', function () {
    getFromParse(); 
  });
  
  $('#post').on('click', function() {
      var username = $("input[name='username']").val();
      var text = $("input[name='text']").val();
      var roomname = $("input[name='roomname']").val();

      var message = createMessage(username, text, roomname);
      postFromParse(message);
  });

  // Adding a friend
  $('#add').on('click', function () {
    // var results = {};

    // modifying global variable friends!
    var $friendList = $('#friend-list');
    var friendToAdd = $("input[name='add']").val();

    $friendList.children().each(function () {
      friends[$(this).text()] = true;
    });

    $friendList.children().remove();
    if (friendToAdd !== "") {
      friends[friendToAdd] = true;  
    }
    
    _.each(friends, function(value, key) {
      var $li = $('<li></li>').text(key);
      $friendList.append($li);
    });

    // call getFromParse so that refreshed view shows up
    getFromParse();
    // loop through each li element in the 'friend-list' ul element and add text to an array
  });

  // Removing a friend
  $('#remove').on('click', function () {
    var friendToRemove = $("input[name='remove']").val();
    if (friendToRemove !== "") {
      // var results = {};
      
      // modifying global variable friends
      var $friendList = $('#friend-list');
      
      $friendList.children().each(function () {
        friends[$(this).text()] = true;
      });

      delete friends[friendToRemove];

      $friendList.children().remove();
      _.each(friends, function(value, key) {
        var $li = $('<li></li>').text(key);
        $friendList.append($li);
      });

      // call getFromParse so that refreshed view shows up
      getFromParse();
    }
  });
});
