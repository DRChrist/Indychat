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

    can: function (testPrivilege, cb) {
      'use strict';
      User.findOne(this.id)
      .populate('roles')
      .populate('privileges')
      .exec(function(err, user) {
        if(err) {
          console.serverError(err);
          return cb(err);
        }
        _.forEach(user.roles, function(role) {
          Role.findOne(role.id).populate('privileges').exec(function(err, r) {
            if(err) {
              console.serverError(err);
              return cb(err);
            }
            if(_.some(r.privileges, {'privilegeName': testPrivilege})){
              console.log('You cant handle thruthiness!');
              return cb(true);
            }
          }); 
        });
        if(_.some(user.privileges, {'privilegeName': testPrivilege})) {
          return cb(true);
        }
      });
    },


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

