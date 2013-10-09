// Thanks http://stackoverflow.com/questions/14588032/mongoose-password-hashing

var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt'),
    config   = require('../config.json')

var UserSchema = mongoose.Schema({
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },

});

UserSchema.pre("save", function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(config.salt_work_factor, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();

        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("User", UserSchema);

