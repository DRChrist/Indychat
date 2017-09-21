/**
 * ChatController
 *
 * @description :: Server-side logic for managing chats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	chatroom: function(req, res) {
		User.findOne(req.session.userId, function(err, user) {
			if(err) {
				console.log('Error: ' + err);
				return res.negotiate(err);
			} 
			if(!user) {
				console.log('Session might be terminated.');
				return res.view('homepage');
			}
			return res.view('chatroom');
		});
	},

	sendMessage: function(req, res) {
		if(!req.isSocket) {
			return res.badRequest('Sockets only.');
		}

		User.findOne(req.session.userId, function(err, foundUser) {
			if(err) {
				console.log('Error: '+ err);
				return res.negotiate(err);
			}
			if(!foundUser) {
				console.log('Session terminated');
				return res.redirect('/');
			}
			if(!req.isSocket) return res.negotiate(err);
			var room = req.param('room');
			sails.sockets.broadcast(room, 'message', {sender: foundUser.username, message: req.param('message'), chatroom: room}, req);
		});
	},

	// joinRoom: function(req, res) {
	// 	if(!req.isSocket) {
	// 		return res.badRequest('Sockets only.');
	// 	}
		
	// 	User.findOne(req.session.userId, function(err, user) {
	// 		if(err) {
	// 			console.log('Error :' + err);
	// 			return res.negotiate(err);
	// 		}
	// 		if(!user) {
	// 			console.log('Session might be terminated.');
	// 			return res.view('homepage');
	// 		}
	// 		var room = req.param('room');
	// 		var role = foundUser.populate
	// 		if(room === 'thespace' && user.roles[0].name !== 'buttonclicker') {
	// 			console.log('You are not a buttonclicker');
	// 			return res.negotiate(err);
	// 		}
	// 		sails.sockets.join(req, room, function(err) {
	// 			if(err) {
	// 				console.log('Not joining ' + room);
	// 				return res.serverError(err);
	// 			} 
	// 			return res.ok();
	// 		});
	// 	});
	// },

	// joinRoom: function(req, res) {
	// 	if(!req.isSocket) {
	// 		return res.badRequest('Sockets only.');
	// 	}
		
	// 	User.findOne(req.session.userId)
	// 	.populate('roles')
	// 	.populate('privileges')
	// 	.exec(function(err, user) {
	// 		_.forEach(user.roles, function(role) {
	// 			Role.findOne(role.id).populate('privileges').exec(function(err, role) {
	// 				if(err) {
	// 					console.log('Error :' + err);
	// 					return res.negotiate(err);
	// 				}
	// 				if(!user) {
	// 					console.log('Session might be terminated.');
	// 					return res.view('homepage');
	// 				}
	// 				var room = req.param('room');
	// 				if(room === 'thespace' && !user.can('goToSpace')) {
	// 					console.log('Access denied!');
	// 					console.log(room);
	// 					console.log(user.can('goToSpace'));
	// 					return res.send(401);
	// 				}

	// 				sails.sockets.join(req, room, function(err) {
	// 					if(err) {
	// 						console.log('Not joining ' + room);
	// 						return res.serverError(err);
	// 					} 
	// 					return res.ok();
	// 				});
	// 			});
	// 		});
	// 	});
	// },

	joinRoom: function(req, res) {
		if(!req.isSocket) {
			return res.badRequest('Sockets only.');
		}
		
		User.findOne(req.session.userId, function(err, user) {
			if(err) {
				console.log('Error :' + err);
				return res.negotiate(err);
			}
			if(!user) {
				console.log('Session might be terminated.');
				return res.view('homepage');
			}
			var room = req.param('room');
			// if(room === 'thespace' && !user.can('goToSpace')) {
			// 	console.log(user.can('goToSpace'));
			// 	console.log('NOPE!');
			// 	return res.send(401);
			// }
			user.can('goToSpace', function(access) {
				if(!access && room === 'thespace') {
					console.log('Access denied!');
					console.log(room + ' ' + access);
					return res.send(401);
				} else {
					sails.sockets.join(req, room, function(err) {
						if(err) {
							console.log('Not joining ' + room);
							return res.serverError(err);
						} 
						return res.ok();
					});
				}
			});
		});
	},

	leaveRoom: function(req, res) {
		if(!req.isSocket) {
			return res.badRequest('Sockets only.');
		}
		var room = req.param('room');
		sails.sockets.leave(req, room, function(err) {
			if(err) {
				console.log('Not leaving ' + room);
				return res.serverError(err);
			}
			return res.ok();
		});
	}

};

