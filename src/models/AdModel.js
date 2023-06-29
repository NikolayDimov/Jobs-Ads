const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const adSchema = new Schema({
    headline: { type: String, required: [true, 'Headline is required'], minlength: [4, 'Headline must be at least 4 characters long'] },
    location: { type: String, required: [true, 'Location is required'], minlength: [8, 'Location must be at least 8 characters long'] },
    companyName: { type: String, required: [true, 'Company Name is required'], minlength: [3, 'Company Name must be at least 3 characters long'] },
    description: { type: String, required: [true, 'Description is required'], maxlength: [150, 'Location must be at most 150 characters long'] },
    userApplied: { type: [ObjectId], ref: 'User', default: [] },
    userCount: { type: Number, default: 0 },
    owner: { type: ObjectId, ref: 'User', required: true },
});


const AdModel = model('Ad', adSchema);

module.exports = AdModel;