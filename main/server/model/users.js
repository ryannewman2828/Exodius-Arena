var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var DAY_IN_WEEK = 7;

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	username: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	friends: [String],
	credits: Number,
	hash: String,
	salt: String
});

userSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.verifyPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
	return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + DAY_IN_WEEK);

	// TODO: Move SECRET to an external file or the database itself
	return jwt.sign({
		_id: this._id,
		email: this.email,
		name: this.name,
		exp: parseInt(expiry.getTime() / 1000)
	}, "SECRET");
};

module.exports = mongoose.model('User', userSchema);
