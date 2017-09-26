module.exports = function(req, res, next) {
	Room.findOne({name: req.param('room')}).exec(function(err, room) {
		if(room.name === 'thespace') {
			var userId = req.session.userId;

			User.can(userId, 'goToSpace', function(err, access) {
				console.log('access is: ' + access);
				if(err) {
					console.serverError(err);
					return res.serverError(err);
				}
				if(access) {
					return next();
				} else {
					return res.forbidden('Access Denied');
				}
			});
		} else {
			return next();
		}
	});			
};