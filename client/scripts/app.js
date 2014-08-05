// define server url
var url = 'https://api.parse.com/1/classes/chatterbox';

var friends = {};

// app stores all the methods available to act on our data
var app = {};

// init checks data for comprimised messages and returns the non-comprimised ones
app.init = function(dataFromServer){
  // create a test to filter out comprimised messages contained within any message property
  var reducedData = [];
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
    if(safe) reducedData.push( dataFromServer.results[i] );
  }
  var filteredData = {results: reducedData};
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
      console.log('chatterbox: Sucessfully retrieved safe messages from server.');
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve messages from server.');
    }
  });
};

// clear all messages in browser
app.clearMessages = function() {
  $('#chats').children().remove();
};

// display all outstanding messages to user
app.addMessage = function( messageToDisplay ) {
  var userName =  '<div class="username">' + messageToDisplay.username + '</div>';
  var roomName =  '<div class="roomname">' + messageToDisplay.roomname + '</div>';
  var text =  '<div class="text">' + messageToDisplay.text + '</div>';

  var newMessage = '<div class="fullmessage">' + messageToDisplay.createdAt +
                                                 userName + ' in ' +
                                                 roomName + ': ' +
                                                 text + '</div>';
  $('#chats').append( newMessage );
};

// add a chat room
app.addRoom = function( roomName ){
  var newRoomName = '<div>' + roomName + '</div>';
  $('#roomSelect').append( newRoomName );
};

// add a friend to the friends object
app.addFriend = function( userNameNode ) {
  friends[ userNameNode ] = userNameNode; //C NEED TO REFORMAT
};

app.handleSubmit = function( userNameToSend, textToSend, roomToSend ){
  // compile message object with username, text, and roomname
  var messageToServer = { username: userNameToSend,
                          text: textToSend,
                          roomname: roomToSend };

  // send the message object
  app.send( messageToServer );
};

$(document).ready( function(){


  // once data has been retrieved, add those messages
  app.fetch( url );

  // add friend when clicking on username
  $('#chats').on('click', '.username', function(){
    app.addFriend( $(this) );
  });

  // extract text and pass to handleSubmit to format before sending to server
  $('#send').on('click', 'button',function(){
    var username = $('#currentuser').val();
    var text = $('#message').val();
    app.handleSubmit( username, text, "room" );
  });

  setInterval( function(){
    app.clearMessages();
    app.fetch(url);
  }, 3000 );

  // have a listener to clear all messages using app.clearMessages

  // have a listener to add a chat room using app.addRoom
});
