const { Schema, model, Types: { ObjectId } } = require('mongoose');

const EMAIL_PATTERN = /^([a-zA-Z]+)@([a-zA-Z]+)\.([a-zA-Z]+)$/; 

// TODO add User properties and validation according to assignment 
const userSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        validate: {
            validator(value) {
                    return EMAIL_PATTERN.test(value);
                },
        message: 'Email must be valid'}, 
        },
    skillDescription: { type: String, required: true, maxlength: [40, 'skillDescription must be at most 40 characters long'] },
    hashedPassword: { type: String, required: true },
    myAds: {type: [ObjectId], ref: 'AdModel', default: []}
});

// Index
userSchema.index({ email: 1 }, {
    unique: true,
    collation: {
        locale: 'en',
        strength: 2
    }
});

const User = model('User', userSchema);

module.exports = User;