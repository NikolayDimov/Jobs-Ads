const AdModel = require('../models/AdModel');


// async function findProductBySearch({ search }) {
//     const ads = AdModel
//         .findOne({ email: { $regex: search, $options: 'i' } })
//         .populate('myAds', ['headline', 'companyName']) 
//         .lean();
//     return ads;
// }

async function searchJobByOwner (parameter) {
    return AdModel.find({}).populate('owner').lean();

}


// Search
async function searchJobsByEmail (allJobs, searchTextEmail) {
    return AdModel.find({ allJobs: searchTextEmail}).lean();
    
}

module.exports = {
    searchJobsByEmail
}