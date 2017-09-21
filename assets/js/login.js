$(document).ready(function () {

	var $username = $('#username');
	var $password = $('#password');
	var $alert = $('#login-alert');

	$('#loginform').on('submit', login);
	

 $username.on('change', function() {
 	var str = $(this).val();
 	if(str.match(/[^a-z0-9]/i)) {
 		$(this).closest('.form-group').find('.help-block').show();
 		$(this).closest('.form-group').find('.help-block').text('Username contains only numbers and letters');
 		$(this).closest('.form-group').find('.help-block').removeClass('bg-success');
 		$(this).closest('.form-group').find('.help-block').addClass('bg-danger');
 	} else if (str.length < 5) {
 		$(this).closest('.form-group').find('.help-block').show();
 		$(this).closest('.form-group').find('.help-block').text('Username is at least five characters');
 		$(this).closest('.form-group').find('.help-block').removeClass('bg-success');
 		$(this).closest('.form-group').find('.help-block').addClass('bg-danger');
 	} else {
 		$(this).closest('.form-group').find('.help-block').hide();
 	}
 });



	function login (event) {
			'use strict';
			event.preventDefault();

		var nameInput = $username.val();
		var passwordInput = $password.val();

		io.socket.put('/user/validate', { 
			username: nameInput, 
			password: passwordInput 
		}, function (resData, jwres) {
			if(jwres.statusCode === 200) {				
					window.me = resData;
					window.location = '/chat/chatroom';
					return;
			}
			if(jwres.statusCode === 400 || 403) {
				console.log('Invalid login');
				$alert.slideToggle();
				setTimeout(function () {
					$alert.slideToggle();
				}, 3000);
				return;
			} else {
				console.log('An unexpected error occurred');
				return;
			}
		});
	}

});