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

};

