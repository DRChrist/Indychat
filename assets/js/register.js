$(document).ready(function() {
	
	var $username = $('#register-username');
	var $password = $('#register-password');
	var $confirmpassword = $('#extra-password');
	var $alert = $('#register-alert');

	$username.on('change', function() {
		var str = $(this).val();
	 	if(str.match(/[^a-z0-9]/i)) {
	 		$(this).closest('.form-group').find('.help-block').text('Username must contain only numbers and letters');
	 		$(this).closest('.form-group').find('.help-block').removeClass('bg-success');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-danger');
	 	} else if (str.length < 5) {
	 		$(this).closest('.form-group').find('.help-block').text('Username must be at least five characters');
	 		$(this).closest('.form-group').find('.help-block').removeClass('bg-success');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-danger');
	 	} else {
	 		$(this).closest('.form-group').find('.help-block').text('OK');
	 		$(this).closest('.form-group').find('.help-block').removeClass('bg-danger');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-success');
	 	}
	});

	$password.on('change', function() {
		var str = $(this).val();
		if(str.length < 3) {
			$(this).closest('.form-group').find('.help-block').text('Password must be at least three characters.');
			$(this).closest('.form-group').find('.help-block').removeClass('bg-success');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-danger');
		} else {
			$(this).closest('.form-group').find('.help-block').text('OK');
	 		$(this).closest('.form-group').find('.help-block').removeClass('bg-danger');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-success');
		}
	});

	$confirmpassword.on('change', function() {
		var str = $(this).val();
		if(str !== $password.val()) {
			$(this).closest('.form-group').find('.help-block').text('Passwords must match.');
			$(this).closest('.form-group').find('.help-block').removeClass('bg-success');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-danger');
		} else {
			$(this).closest('.form-group').find('.help-block').text('OK');
	 		$(this).closest('.form-group').find('.help-block').removeClass('bg-danger');
	 		$(this).closest('.form-group').find('.help-block').addClass('bg-success');
		}
	});

	$('#register-user').submit(function (event) {
		'use strict';
		event.preventDefault();

		var $nameInput = $('#register-username').val();
		var $passInput = $('#register-password').val();

		io.socket.post('/user/register', {
			username: $nameInput,
			password: $passInput
		}, function(resData, jwres) {
			if(jwres.statusCode === 409) {
				console.log('Username already in use');
				$alert.text('Username already taken');
				$alert.slideToggle();
				setTimeout(function() {
					$alert.slideToggle();
				}, 3000);
				return;
			} 
			if(jwres.statusCode !== 200) {
				$alert.text('Invalid parameters');
				$alert.slideToggle();
				setTimeout(function () {
					$alert.slideToggle();
				}, 3000);
				console.error(jwres);
				return;
			}
			window.me = resData;
			window.location = '/user/home';
			return;
		});
	});
});