/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Passwords = require('machinepack-passwords');

module.exports = {
	
	home: function(req, res) {
		return res.view('homepage');
	},

	validate: function (req, res) {
		User.findOne({username: req.param('username')}).exec(function(err, foundUser) {
			if (err) return res.negotiate(err);
			if (!foundUser) return res.notFound();

			var foundId = foundUser.id;
			var foundUsername = foundUser.username;

			Passwords.checkPassword({
				passwordAttempt: req.param('password'),
				encryptedPassword: foundUser.password
			}).exec({
				error: function (err) {
					return res.negotiate(err);
				},
				incorrect: function () {
					return res.notFound();
				},
				success: function () {
					if(!req.isSocket) {
						console.log('Not a socket');						
						return res.badRequest();
					}
					req.session.userId = foundId;
					var userIds = [];
					User.find().exec(function(err, records) {
						_.forEach(records, function (record) {
							userIds.push(record.id);
						});
						User.subscribe(req, userIds);
					});
					User.message(foundId, {
						username: foundUsername
					}, req);
					return res.json(foundUser);
				}
			});
		});
	},


	register: function (req, res) {
		if(_.isUndefined(req.param('username'))){
			return res.badRequest('Username is required.');
		}
		if(_.isUndefined(req.param('password'))) {
			return res.badRequest('Password is required.');
		}
		if(req.param('password').length < 3) {
			return res.badRequest('Password must be at least 3 characters');
		}
		if(req.param('username').length < 5) {
			return res.badRequest('Username must be at least 5 characters');
		}
		if(!_.isString(req.param('username')) || req.param('username').match(/[^a-z0-9]/i)) {
			return res.badRequest('Invalid username, must contain numbers and letters only');
		} 

		User.create({username: req.param('username'), password: req.param('password')}).exec(function (err, createdUser) {
			if (err) {
				console.log('The error is: ' + err.invalidAttributes);

				if (err.invalidAttributes && err.invalidAttributes.username && err.invalidAttributes.username[0] && err.invalidAttributes.username[0].rule === 'unique') {
					return res.alreadyInUse(err);
				}
				return res.negotiate(err);
			}
			User.publishCreate({ 
				id: createdUser.id, 
				username: createdUser.username 
			}, req);
			return res.json(createdUser);
		});
	}
	

};

