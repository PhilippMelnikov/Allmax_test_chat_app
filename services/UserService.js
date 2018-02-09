const User = require('../models/User');
const namor = require('namor');
/**
 * get or create user
 * @param {string} ip - User ip
 */
module.exports.getOrCreateUser = (ip) => {
    return new Promise((resolve, reject) => {
        User.findOne({ IP: ip }).exec((err, user) => {
            if (err) {
                return reject(err);
            }
            if (user) {
                return resolve(user);
            }
            const userObject = new User({
                IP: ip,
                name: namor.generate(),
            });
            userObject.save((saveError) => {
                if (saveError) {
                    return reject(saveError);
                }
                return resolve(userObject);
            });
        })
    });
};