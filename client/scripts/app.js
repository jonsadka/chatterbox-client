// define server url
var url = 'https://api.parse.com/1/classes/chatterbox';

var friends = {};

// app stores all the methods available to act on our data
var app = {};

// init checks data for our tests and returns it only if data is returned in our expected form
app.init = function(dataFromServer){return dataFromServer;};

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
      app.init( serverMessages );
      console.log('chatterbox: Sucessfully retrieved messages from server.');
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve messages from server.');
    }
  });
};

// clear all messages in browser
app.clearMessages = function() {
  $( document ).ready( function() {
    $('#chats').children().remove();
  } );
}

// display all outstanding messages to user
app.addMessage = function( messageToDisplay ) {
  $( document ).ready( function() {
    var userName =  '<div class="username">' + messageToDisplay.username + '</div>';
    var roomName =  '<div class="roomname">' + messageToDisplay.roomname + '</div>';
    var text =  '<div class="text">' + messageToDisplay.text + '</div>';

    var newMessage = '<div>' + userName + ' in ' +
                               roomName + ': ' +
                               text + '</div>';
    $('#chats').prepend( newMessage );
  });
};

// add a chat room
app.addRoom = function( roomName ){
  $(document).ready( function(){
    var newRoomName = '<div>' + roomName + '</div>';
    $('#roomSelect').append( newRoomName );
  });
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
}

$(document).ready( function(){

  // add friend when clicking on username
  $('#chats').on('click', '.username', function(){
    app.addFriend( $(this) );
  });

  // extract text and pass to handleSubmit to format before sending to server
  $('#send .submit').on('submit', function(){
    var text = $('#message').val();
    app.handleSubmit( text );
  });
});


// var message = {
//   'username': 'shawndrost',
//   'text': 'trololo',
//   'roomname': '4chan'
// };
