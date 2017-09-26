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


	joinRoom: function(req, res) {
		if(!req.isSocket) {
			return res.badRequest('Sockets only.');
		}
		
		User.findOne(req.session.userId)
		.populate('rooms')
		.exec(function(err, user) {
			if(err) {
				return res.negotiate(err);
			}
			if(!user) {
				console.log('Session might be terminated.');
				return res.view('homepage');
			}
			Room.findOne({name: req.param('room')}).exec(function(err, room) {
				user.rooms.add(room.id);
				user.save(function(err) {
					if(err) {
						return res.serverError(err);
					}
					console.log(user.username +  ' added to ' + room.name);
					sails.sockets.join(req, room.name, function(err) {
						if(err) {
							console.log('Not joining ' + room.name);
							return res.serverError(err);
						} 
						return res.ok();
					});
				});
			});
		});
	},

	leaveRoom: function(req, res) {
		if(!req.isSocket) {
			return res.badRequest('Sockets only.');
		}

		User.findOne(req.session.userId)
		.exec(function(err, user) {
			if(err) {
				return res.negotiate(err);
			}
			if(!user) {
				console.log('Session might be terminated');
				return res.view('homepage');
			}
		
			Room.findOne({name: req.param('room')}).exec(function(err, room) {
				user.rooms.remove(room.id);
				user.save(function(err) {
				if(err) {
					return res.serverError(err);
				}
					console.log(user.username +  ' removed from ' + room.name);
					sails.sockets.leave(req, room, function(err) {
						if(err) {
							console.log('Not leaving ' + room);
							return res.serverError(err);
						}
						return res.ok();
					});
				});
			});
		});
	}

};

