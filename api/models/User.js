/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 /*jshint esversion: 6 */
var Passwords = require('machinepack-passwords');

module.exports = {

  attributes: {
  	username: {
  		type: 'string',
      unique: true,
      required: true
  	},

  	password: {
  		type: 'string',
      required: true
  	},

    roles: {
      collection: 'role',
      via: 'users',
      dominant: true
    },

    privileges: {
      collection: 'privilege',
      via: 'users',
      dominant: true
    },

    rooms: {
      collection: 'room',
      via: 'users',
      dominant: true
    }

  },

  beforeCreate: function(values, cb) {
  	Passwords.encryptPassword({
  		password: values.password
  	}).exec({
  		error: function (err) {
  			return cb(err);
  		},
  		success: function (result) {
  			values.password = result;
  			return cb();
  		}
  	});
  },

  can: function(userId, testPrivilege, callback) {
    User.findOne(userId)
    .populate('roles')
    .populate('privileges')
    .exec(function(err, user) {
      if(err) {
        console.serverError(err);
        return callback(err);
      }
        async.parallel([
        //Loops through roles and privileges in roles
        function(cb) {
          async.each(user.roles, function(role, cb) {
            Role.findOne(role.id).populate('privileges').exec(function (err, r) {
              if(err) {
                console.serverError(err);
                return callback(err);
              }
              async.each(r.privileges, function(privilege) {
                if(privilege.privilegeName === testPrivilege) {
                  return callback(null, true);
                }
              }, function(err) {
                if(err) {
                  console.serverError(err);
                  return callback(err);
                } else {
                  cb();
                }
              });
            });
          }, function(err) {
            if(err) {
              console.serverError(err);
            } else {
              cb();
            }
          });
        },

        //Loops through privileges in user
        function(cb) {
          async.each(user.privileges, function(privilege) {
            if(privilege.privilegeName === testPrivilege) {
              return callback(null, true);
            }
          }, function (err) {
            if(err) {
              console.serverError(err);
            } else {
              cb();
            }
          });
        }
        ], function(err) {
          if(err) {
            console.serverError(err);
            return callback(err);
          }
          return callback(null, false);
        });
    });
  }

};

