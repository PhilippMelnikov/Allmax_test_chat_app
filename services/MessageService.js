const Message = require('../models/Message');
/**
 * get messages
 */
module.exports.getMessages = () => {
    return new Promise((resolve, reject) => {
        Message.find().populate('user').exec((err, messages) => {
            if (err) {
                return reject(err);
            }
            return resolve(messages);
        })
    });
}

/**
 * save message in database
 * @param {object} user - User object
 * @param {string} msg - Message text
 */
module.exports.saveMessage = (user, msg) => {
    return new Promise((resolve, reject) => {
        const messageObject = new Message({
            user: user._id,
            date: Date.now(),
            text: msg
        });
        messageObject.save((err) => {
            if (err) {
                return reject(err);
            }
            return resolve(messageObject);
        });
    });
}