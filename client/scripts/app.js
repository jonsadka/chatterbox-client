// define server url
var url = 'https://api.parse.com/1/classes/chatterbox';

var currentRoom = null;
var friends = {};

// app stores all the methods available to act on our data
var app = {};

// init checks data for comprimised messages and returns the non-comprimised ones
app.init = function(dataFromServer){
  // create a test to filter out comprimised messages contained within any message property
  var reducedData = [];
  var reducedRooms = {};
  for( var i = 0, count = dataFromServer.results.length; i < count; i++ ){
    var safe = true;
    for( key in  dataFromServer.results[i] ){
      if ( /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/.test(dataFromServer.results[i][key]) ||
           /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/.test(dataFromServer.results[i][key]) ||
           /((\%3C)|<)[^\n]+((\%3E)|>)/.test(dataFromServer.results[i][key]) ||
           !/[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/.test(dataFromServer.results[i][key])){
           safe = false;
      }
    }
    // if all message properties are safe, save the message and send it to the user
    if(safe){
      reducedData.push( dataFromServer.results[i] );
      reducedRooms[ dataFromServer.results[i].roomname ] = dataFromServer.results[i].roomname;
    }
  }
  var filteredData = {results: reducedData, existingRooms: reducedRooms };
  return filteredData;
};

// send takes in a message object containing username, text, and roomname and ???TBD??
app.send = function( dataToServer, urlLocation ){
  $.ajax({
    url: urlLocation || 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify( dataToServer ),
    contentType: 'application/json',
    success: function ( dataToServer ) {
      console.log('chatterbox: Message sent');
    },
    error: function () {
      console.error('chatterbox: Failed to send message');
    }
  });
};

// retrieve all messages and only display new ones
app.fetch = function( urlLocation ){
  $.ajax({
    url: urlLocation || 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: {order: '-createdAt'},
    contentType: 'application/json',
    success: function ( serverMessages ) {
      // filter through each message and only return safe messages
      var filteredServerMessages = app.init( serverMessages );
      _.each(filteredServerMessages.results, app.addMessage);
      _.each(filteredServerMessages.existingRooms, app.addRoom);
      console.log('chatterbox: Sucessfully retrieved safe messages from server.');
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve messages from server.');
    }
  });
};

// clear all messages, friends, and rooms in browser
app.clearAllContent = function() {
  $('#roomselect').children().remove();
  $('#chats').children().remove();
};

// display all outstanding messages to user
app.addMessage = function( messageToDisplay ) {
  if ( currentRoom === null || currentRoom === messageToDisplay.roomname ){
    // make name bold if in friends list
    if ( messageToDisplay.username === friends[messageToDisplay.username] ){
      var userName =  '<div class="username"><b>' + messageToDisplay.username + '</b></div>';
    } else {
      var userName =  '<div class="username">' + messageToDisplay.username + '</div>';
    }

    var formattedTime = $.timeago(messageToDisplay.createdAt);
    var timeStamp = '<time class="timeago">' + formattedTime + '</time>';
    var roomName =  '<div class="roomname">' + messageToDisplay.roomname + '</div>';
    var text =  '<div class="text">' + messageToDisplay.text + '</div>';

    var newMessage = '<div class="fullmessage">' + userName + ": " +
                                                   text + "</br>" +
                                                   timeStamp + " " +
                                                   roomName +
                                                    '</div>';
    $('#chats').append( newMessage );
  }
};

// add a chat room
app.addRoom = function( roomName ){
  if ( roomName !== undefined){
    var newRoomName = '<div class="roomname">' + roomName + '</div>';
    $('#roomselect').append( newRoomName );
  }
};

// add a friend to the friends object
app.addFriend = function( friendName ) {
// if friend does not exist, add him/her for friends object and append node
  if ( !friends[friendName] ){
    friends[ friendName ] = friendName;
    newFriend = '<div class="friend">' + friendName + '</div>';
    $('#friendslist').append( newFriend );
  }
};

app.handleSubmit = function( userNameToSend, textToSend, roomToSend ){
  // compile message object with username, text, and roomname
  var messageToServer = { username: userNameToSend,
                          text: textToSend,
                          roomname: roomToSend };

  // send the message object
  app.send( messageToServer );
};

// list of listeners when page loads
$(document).ready( function(){

  // clear all existing messages and display new ones
  var refreshContent = function(){
      app.clearAllContent();
      app.fetch( url );
  };

  // once data has been retrieved, add those messages
  refreshContent();

  // add friend when clicking on username
  $('#chats').on('click', '.username', function(){
    app.addFriend( $(this).text() );
    refreshContent();
  });

  // add a new room and set that room to current room
  $('#chatrooms').on('click', '#addnewroom',function(){
    currentRoom = $('#newRoomName').val();
    refreshContent();
  });

  // extract text and pass to handleSubmit to format before sending to server
  $('#send').on('click', 'button',function(){
    var username = $('#currentuser').val();
    var text = $('#message').val();
    app.handleSubmit( username, text, currentRoom );
  });

  // initialize timeago
  jQuery("time.timeago").timeago();

  // click to go into desired chatroom
  $('#roomselect').on('click', '.roomname',function(){
    currentRoom = $(this).text();
    refreshContent();
  });

  $('#chatrooms').on('click', '#showallrooms',function(){
    currentRoom = null;
    refreshContent();
  });

  $('#chats').on('click', '.roomname',function(){
    currentRoom = $(this).text();
    refreshContent();
  });

  // refresh content at specified interval
  setInterval( function(){
    refreshContent();
  }, 5000 );

});
