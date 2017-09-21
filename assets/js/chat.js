$(document).ready(function () {

io.socket.on('message', function (data) {
	showMessage(data.sender, data.message, data.chatroom);
});


io.socket.on('user', function (data) {
	switch(data.verb) {
		case 'message':
			// var div = $('<div style="text-align:center"></div>');
			// div.html('<strong>--- '+data.username+' has logged in ---');

			// $('#chatscreen').append(div);
			alert('--- '+data.username+' has logged in ---');
			console.log(data.username + ' logged in and everyone knows it');
			break;

		case 'created':
			alert('--- '+data.data.name+' has joined us ---');
			console.log(data.data.name + ' was created and everyone knows it');
			break;

		default:
			alert('Not sure what happened here');
			break;
	}
});

$('.send-message').click(function() {
	var messageToSend = $(this).closest('.chatroom').find('.message').val();
	var currentRoomId = $(this).closest('.chatroom').attr('id');
	$(this).closest('.chatroom').find('.message').val('');
	io.socket.post('/chat/sendMessage', {
		message: messageToSend,
		room : currentRoomId
	});
	showMessage('Me', messageToSend, currentRoomId);
});

$('.join-room').click(function() {
	var currentRoomId = $(this).closest('.chatroom').attr('id');
	io.socket.put('/chat/joinRoom', {room: currentRoomId}, function(resData, jwres) {
		if(jwres.statusCode === 401) {
			
		}
		if(jwres.statusCode !== 200) {
			console.log(jwres);
			return;
		}
		$('#'+currentRoomId).find('.message').prop('disabled', false);
		$('#'+currentRoomId).find('.send-message').prop('disabled', false);
		$('#'+currentRoomId).find('.leave-room').prop('disabled', false);
		$('#'+currentRoomId).find('.join-room').prop('disabled', true);
		$('#'+currentRoomId).find('.chatscreen').removeClass('bg-danger');
		return;
	});
});

$('.leave-room').click(function() {
	var currentRoomId = $(this).closest('.chatroom').attr('id');
	io.socket.put('/chat/leaveRoom', {room: currentRoomId}, function(resData, jwres) {
		if(jwres.statusCode !== 200) {
			console.log(jwres);
			return;
		}
		$('#'+currentRoomId).find('.message').prop('disabled', true);
		$('#'+currentRoomId).find('.send-message').prop('disabled', true);
		$('#'+currentRoomId).find('.leave-room').prop('disabled', true);
		$('#'+currentRoomId).find('.join-room').prop('disabled', false);
		$('#'+currentRoomId).find('.chatscreen').addClass('bg-danger');
		return;
	});
});

$('#join-buttonclicker').click(function () {
	io.socket.put('/role/buttonClicker', function (resData, jwres) {
		if(jwres.statusCode !== 200) {
			console.log(jwres);
			return;
		}
		console.log('I became a buttonclicker');
		return;
	});
});


function showMessage(sender, msg, room) {

	// var fromMe = senderId == window.me.id;
	//  var senderName = fromMe ? "Me" : $('#user-'+senderId).text();
	//  var justify = fromMe ? 'right' : 'left';

	//  var div = $('<div style="text-align:'+justify+'"></div>');
	//  div.html('<strong>'+senderName+'</strong>: '+message);
	//  $('#'+roomName).append(div);

	// console.log(window.me.username);

	var div = $('<div style="text-align:left"></div>');
	div.html('<strong>'+sender+'</strong>: '+msg);

	$('#'+room).find('.chatscreen').append(div);
}



  $('.message').keyup(function(e){
    if(e.keyCode === 13) {
   		$(this).closest('.chatroom').find('.send-message').click();
  	}
  	return false;
  });


});



