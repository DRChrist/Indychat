/**
 * RoleController
 *
 * @description :: Server-side logic for managing roles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	buttonClicker: function(req, res) {
		User.findOne(req.session.userId, function(err, foundUser) {
			if(err)  {
				console.log('User not found');
				return res.negotiate(err);
			}
			foundUser.roles.add(1);
			_.forEach(foundUser.roles, function(role) {
				console.log(role);
			});
			_.forEach([1,2,47], function(number) {
				console.log(number);
			});
			foundUser.save(function (err) {
				if(err) {
					console.log('Error saving add');
					return res.negotiate(err);
				}
				return res.ok();
			});
		});
	}
};

