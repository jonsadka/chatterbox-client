// define server url
var url = 'https://api.parse.com/1/classes/chatterbox';

var friends = {};

// app stores all the methods available to act on our data
var app = {};

// init checks data for comprimised messages and returns the non-comprimised ones
app.init = function(dataFromServer){
  // create a test to filter comprimised messages

  return dataFromServer;
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
    // data: JSON.stringify(data),
    contentType: 'application/json',
    success: function ( serverMessages ) {
      // return safe messages
      var filteredServerMessages = app.init( serverMessages );

      // continue to append each message to the DOM
      each(filteredServerMessages, app.addMessage( singleFilteredMessage ));
      console.log('chatterbox: Sucessfully retrieved messages from server.');
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve messages from server.');
    }
  });
};

// clear all messages in browser
app.clearMessages = function() {
  $('#chats').children().remove();
}

// display all outstanding messages to user
app.addMessage = function( messageToDisplay ) {
  var userName =  '<div class="username">' + messageToDisplay.username + '</div>';
  var roomName =  '<div class="roomname">' + messageToDisplay.roomname + '</div>';
  var text =  '<div class="text">' + messageToDisplay.text + '</div>';

  var newMessage = '<div>' + userName + ' in ' +
                             roomName + ': ' +
                             text + '</div>';
  $('#chats').prepend( newMessage );
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

app.handleSubmit = function( textToSend ){
  // compile message object with username, text, and roomname
  var messageToServer = { username: undefined,
                          text: textToSend,
                          roomname: undefined };

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
  $('#send .submit').on('submit', function(){
    var text = $('#message').val();
    app.handleSubmit( text );
  });

  // have a listener to clear all messages using app.clearMessages

  // have a listener to add a chat room using app.addRoom
});
