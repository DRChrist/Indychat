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
    },

    //With a callback

    // can: function (testPrivilege, callback) {
    //   'use strict';
    //   User.findOne(this.id)
    //   .populate('roles')
    //   .populate('privileges')
    //   .exec(function(err, user) {
    //     if(err) {
    //       console.serverError(err);
    //       return callback(err);
    //     }
    //     async.each(user.roles, function(role, cb) {
    //       Role.findOne(role.id).populate('privileges').exec(function(err, r) {
    //         if(err) {
    //           console.serverError(err);
    //           return cb(err);
    //         }
    //         for(privilege of r.privileges) {
    //           if (privilege.privilegeName === testPrivilege) {
    //             access = true;
    //           }
    //         }
    //         console.log('access: '+ access);
    //         if(access) {
    //           return cb(access);
    //         } 
    //         // else {
    //         //   console.log('What are we doing down here?');
    //         //   access = _.some(user.privileges, function(privilegeName) { return privilegeName === testPrivilege; });
    //         //     return cb(access);
    //         // }
    //       }); 
    //     });
    //   });
    // },

    //Trying to use the Async library

    can: function (testPrivilege) {
      'use strict';
      var access = false;
      var userId = this.id;
      async.waterfall([
        function(cb) {
          User.findOne(userId)
          .populate('roles')
          .populate('privileges')
          .exec(function(err, user) {
            if(err) {
              console.log('Error finding and populating user');
              return;
            }
            cb(user);
          });
        },
        function(user, cb) {
          async.parallel([
            //Loops through roles and privileges in roles
            function(callback) {
              for(var role of user.roles) {
                Role.findOne(role.id).populate('privileges').exec(function (err, r) {
                  if(err) {
                    console.log('Error finding and populating role');
                    return;
                  }
                  for(var privilege of r.privileges) {
                    if(privilege.privilegeName === testPrivilege) {
                      access = true;
                      console.log('Found it ' + access);
                      return access;
                    }
                  }
                });
              }
              callback();
            },

            //Loops through privileges in user
            function(callback) {
              for(var privilege of user.privileges) {
                if(privilege.privilegeName === testPrivilege) {
                  access = true;
                  return access;
                }
              }
              callback();
            }
            ], function(err) {
              if(err) {
                console.log('Error checking for privilegeName');
                return;
              }
                cb();
            });
          }
      ], function(err) {
        if(err) {
          console.log('Error in can');
          return;
        }
        return access;
      });
      console.log('WOOO, I WIN!');
    },



    //Trying to use promises

    // can: function (privilegeToTest) {
    //   'use strict';
    //   var userId = this.id;
    //   var userPromise = new Promise (function (resolve, reject) {
    //     User.findOne(userId)
    //     .populate('roles')
    //     .populate('privileges')
    //     .exec(function(err, user) {
    //       if(err) {
    //         reject(err);
    //       } else {
    //         resolve(user);
    //       }
    //     });
    //   });

    //   userPromise.then(function(user) {
    //     var privPromise = new Promise (function (resolve, reject) {
    //       for(var role of user.roles) {
    //         Role.findOne(role.id).populate('privileges').exec(function(err, r) {
    //           if(err) {
    //             console.serverError(err);
    //             reject(err);
    //           }
    //           resolve(r.privileges);
    //         });
    //       }
    //     });
    //   }, function(error) {
    //     console.serverError(error);
    //   })
    //   .then(function(privs) {
    //     if(_.some(privs, {'privilegeName': privilegeToTest})){
    //       return true;
    //     }
    //   });
    //   console.log('Here I am!');
    // }

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

};

