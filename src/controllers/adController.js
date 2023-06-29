const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { createAd, getAllAds, getAdById, applyUser, editJobAd, deleteById } = require('../services/adService');
const mapErrors = require('../util/mapError');
// const preload = require('../middleware/preload');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Add Ad', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const adData = {
        headline: req.body.headline,
        location: req.body.location,
        companyName: req.body.companyName,
        description: req.body.description,
        owner: req.user._id,
    };

    try {
        // if (Object.values(gameData).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await createAd(adData);
        res.redirect('/catalog');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Add Ad', data: adData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/catalog', async (req, res) => {
    const ads = await getAllAds();
    // console.log(ads);
    res.render('catalog', { title: 'Job Catalog', ads });

    //SORTING by Likes and date
    // if(req.query.orderBy == 'likes') {
    //     const plays = await sortByLikes(req.query.orderBy);
    //     res.render('catalog', { title: 'Theater Catalog', plays });

    // } else {
    //     const plays = await getAllPlays();
    //     res.render('catalog', { title: 'Theater Catalog', plays });
    // }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details', async (req, res) => {
    const currAd = await getAdById(req.params.id);
    // console.log(currAd);
    // {
    //     _id: new ObjectId("648a1a58ae20453fee37a567"),
    //     headline: 'Mid JS Developer',
    //     location: 'Sofia, Bulgaria',
    //     companyName: 'PayHawk',
    //     description: 'We are a digital company that provides cutting edge engineering solutions.',
    //     userApplied: [
    //       {
    //         _id: new ObjectId("648a151b7b80b19657af44b3"),
    //         email: 'niki@abv.bg',
    //         skillDescription: 'dev JS',
    //         hashedPassword: '$2b$10$0odnlumBX08P.Qs6VzPpJedXmNvKlJKxmQnSgcIM.KiZyjhRYBHqi',
    //         __v: 0
    //       },
    //       {
    //         _id: new ObjectId("648a2ab113722361c333833d"),
    //         email: 'mary@abv.bg',
    //         skillDescription: 'Java dev',
    //         hashedPassword: '$2b$10$C1uzo20ITSDWpu6OhBSmSuZwg3VzOwGBniTzwks8RaZ6370G.InZ2',
    //         __v: 0
    //       }
    //     ],
    //     userCount: 2,
    //     owner: {
    //       _id: new ObjectId("648a15c5d0ce970d4c1a4a3e"),
    //       email: 'peter@abv.bg',
    //       skillDescription: 'QA specialist',
    //       hashedPassword: '$2b$10$UqgLKpQ.7Z/G22UzrioeIuiwV0lCFDl0XDdhEq7ezKVZgPli0ecSq',
    //       __v: 0
    //     },
    //     __v: 2
    // }
    const isOwner = currAd.owner._id == req.user?._id;
    const hasApply = currAd.userApplied?.some(id => id == req.user?._id);
    

    res.render('details', { title: 'Pet Details', currAd, isOwner, hasApply });
});



router.get('/catalog/:id/apply', async (req, res) => {
    const adApplicant = await getAdById(req.params.id);

    // If the currently logged-in user is not the author (the user that is not the creator) and has not applied for this ad, 
    // he should see the [Apply now!] button and paragraph [Hurry up, {total number of candidates} people have already applied.].
    if(adApplicant.owner._id != req.user._id && adApplicant.userApplied.map(x => x.toString()).includes(req.user._id.toString()) == false) {
        await applyUser(req.params.id, req.user._id);
    }
    // if-a работи и без map() и toString()

    res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    try {
        const currAd = await getAdById(req.params.id);
        
        if (currAd.owner._id != req.user._id) {
            throw new Error('Cannot edit JobAd that you are not owner');
        }

        res.render('edit', { title: 'Edit JobAd Info', currAd });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const currJobOwner = await getAdById(req.params.id);
    
    if (currJobOwner.owner._id != req.user._id) {
        throw new Error('Cannot edit JobAd that you are not owner');
    }

    const adId = req.params.id;
   
    const currJobAd = {
        headline: req.body.headline,
        location: req.body.location,
        companyName: req.body.companyName,
        description: req.body.description,
    };
    
    try {
        await editJobAd(adId, currJobAd);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
  

        res.render('edit', { title: 'Edit Pet Info', currJobAd, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    try {
        const currJobAd = await getAdById(req.params.id);
        // console.log(currProduct);
        if (currJobAd.owner._id != req.user._id) {
            throw new Error('Cannot delete Pet that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/catalog');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
});



module.exports = router;



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });


// router.post('/catalog/:id/bid', isAuth, async (req, res) => {
//     const productId = req.params.id;
//     const amount = Number(req.body.bidAmount);
    
//     try {
//         await placeBid(productId, amount, req.user._id);
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);
        
//     } finally {
//         res.redirect(`/catalog/${req.params.id}/details`);
//     }
// });



// router.get('/catalog/:id/close', isAuth, async (req, res) => {
//     const id = req.params.id;

//     try {
//         await closeAuction(id);
//         res.redirect('/profile');
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);

//         res.redirect(`/catalog/${req.params.id}/details`);

//     }
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.user._id);
//     // console.log(auctions);
    
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const wishedBooksByUser = await getBookByUser(req.user._id);
//     // console.log(wishedBooksByUser);
//     // [
//     //     {
//     //       _id: new ObjectId("648091d0032c4e9b82cc7e62"),
//     //       title: 'Book 4 Study',
//     //       author: 'Peter Smart',
//     //       genre: 'Study',
//     //       stars: 5,
//     //       image: 'http://localhost:3000/static/image/book-4.png',
//     //       review: 'Study hard',
//     //       owner: new ObjectId("64806aec16e81be6c406baed"),
//     //       __v: 2,
//     //       usersWished: [ new ObjectId("64806822e1b2ccc415e315ef") ]
//     //     }
//     // ]

//     // Можем да добавим обекта в res.locals.името на обекта
//     // template profile -->> {{#each wishedBooks}}
//     res.locals.wishedBooks = wishedBooksByUser;
//     res.render('profile', { title: 'Profile Page'});

//     // or
//     // template profile -->> {#each user.wishedBooksByUser}}
//     // res.render('profile', {
//     //     title: 'Profile Page',
//     //     user: Object.assign({ wishedBooksByUser }, req.user)
//     // });
// });


// router.get('/search', isAuth, async (req, res) => {
//     const { cryptoName, paymentMethod } = req.query;
//     const crypto = await search(cryptoName, paymentMethod);

//     const paymentMethodsMap = {
//         "crypto-wallet": 'Crypto Wallet',
//         "credit-card": 'Credit Card',
//         "debit-card": 'Debit Card',
//         "paypal": 'PayPal',
//     };

//     const paymentMethods = Object.keys(paymentMethodsMap).map(key => ({
//         value: key, 
//         label: paymentMethodsMap[key] ,
//         isSelected: crypto.paymentMethod == key
//     }));


//     res.render('search', { crypto, paymentMethods });
// });





















//-------------------------------------------------------

// console.log(ads);;
// [
//     {
//       _id: new ObjectId("648a1a58ae20453fee37a567"),
//       headline: 'Mid JS Developer',
//       location: 'Sofia, Bulgaria',
//       companyName: 'PayHawk',
//       description: 'We are a digital company that provides cutting edge engineering solutions.',
//       userApplied: [],
//       userCount: 0,
//       owner: new ObjectId("648a15c5d0ce970d4c1a4a3e"),
//       __v: 0
//     }
// ]


//----------------------------------------------------------------

// router.post('/edit/:id'...
// console.log(req.body);
// {
//     start: 'Sofia',
//     end: 'Pamporovo',
//     date: '21.05.2023',
//     time: '18:00',
//     carImage: 'https://mobistatic3.focus.bg/mobile/photosmob/711/1/big1/11684336382439711_41.jpg',
//     carBrand: 'Infinity',
//     seats: '3',
//     price: '35',
//     description: 'Ski trip for the weekend.'
// }