const AdModel = require('../models/AdModel');


async function getAllAdsForHomePage() {
    return AdModel.find({}).sort({ userCount: -1 }).limit(3).lean();
}


async function getAllAds() {
    return AdModel.find({}).populate('owner').lean();
    // return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

async function getProductAndBidsID(userId) {
    return AdModel.findById(userId).populate('owner').populate('bidder').lean();
}

async function getAdById(adId) {
    return AdModel.findById(adId).populate('owner').populate('userApplied').lean();

    // return await Book.findById(bookId).populate('usersLiked').lean();
    // .populate('usersLiked') -->> когато искаме да извадим масива с usersLiked (кои id-та са харесали пиесата)
}


async function createAd(adData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията
    const pattern = new RegExp(`^${adData.headline}$`, 'i');
    const existing = await AdModel.findOne({ headline: { $regex: pattern } });

    if (existing) {
        throw new Error('A Ad with this title already exists');
    }

    const result = await AdModel.create(adData);
    return result;

    // const result = new AdModel(adData);
    // await result.save();
    // return result;
}

async function editJobAd(adId, currEditedJobAd) {
    const existing = await AdModel.findById(adId);

    existing.headline = currEditedJobAd.headline;
    existing.location = currEditedJobAd.location;
    existing.companyName = currEditedJobAd.companyName;
    existing.description = currEditedJobAd.description;

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(adId) {
    return AdModel.findByIdAndDelete(adId);
}


async function buyGame(userId, gameId) {
    const game = await AdModel.findById(gameId);
    game.boughtBy.push(userId);
    return game.save();

    // same as
    // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
}


async function applyUser(adId, userId) {
    const existing = await AdModel.findById(adId);
    existing.userApplied.push(userId);
    existing.userCount++;
    return existing.save();
}



async function makeABidder(productId, userId) {
    const existing = await AdModel.findById(productId);

    if (existing.bidder.includes(userId)) {
        throw new Error('Cannot Bid twice');
    }

    existing.bidder.push(userId);
    return existing.save();
}

async function placeBid(productId, amount, userId) {
    const existingProduct = await AdModel.findById(productId);

    if (existingProduct.bidder == userId) {
        throw new Error('You are already the highest bidder');
    } else if (existingProduct.owner == userId) {
        throw new Error('You cannot bid for your own auction!');
    } else if (amount <= existingProduct.price) {
        throw new Error('Your bid must be higher than the current price');
    }

    existingProduct.bidder = userId;
    existingProduct.price = amount;

    await existingProduct.save();
}

async function closeAuction(id) {
    const existingProduct = await AdModel.findById(id);

    if (!existingProduct.bidder) {
        throw new Error('Cannot close auction without bidder!');
    }

    existingProduct.closed = true;
    await existingProduct.save();
}

async function getAuctionsByUser(userId) {
    return AdModel.find({ owner: userId, closed: true }).populate('bidder').lean();
}


module.exports = {
    getAllAdsForHomePage,
    createAd,
    getAllAds,
    getAdById,
    applyUser,
    editJobAd,
    deleteById
};






// async function sortByLikes(orderBy) {
//     return ProductModel.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
// }



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }





// async function search(cryptoName, paymentMethod) {
//     let crypto = await Game.find({}).lean();

//     if(cryptoName) {
//         crypto = crypto.filter(x => x.cryptoName.toLowerCase() == cryptoName.toLowerCase())
//     }

//     if(paymentMethod) {
//         crypto = crypto.filter(x => x.paymentMethod == paymentMethod)
//     }

//     return crypto;
// }
