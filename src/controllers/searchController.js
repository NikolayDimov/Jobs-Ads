const router = require('express').Router();

const { searchJobsByEmail } = require('../services/search');
const { isAuth } = require('../middleware/userSession');
const mapError = require('../util/mapError');
const { getAllAds } = require('../services/adService');


// router.get('/search', isAuth, async (req, res) => {
//     try {
//         const isSearched = !!req.query.search;
//         const ads = isSearched ? await findProductBySearch(req.query) : [];
//         res.render('search', { title: 'Search', ads: ads.myAds, isSearched });
//     } catch (err) {
//         res.render('search', { title: 'Search', ads: [], error: mapError(err) });
//     }
// });




router.get('/search', isAuth, async (req, res) => {
    let searchTextEmail = req.query.search;

    let allJobs = await getAllAds();
    // console.log(allJobs);

    const emailMapper = allJobs.map(x => x.owner.email);
    // console.log(emailMapper);
    // [
    //     'peter@abv.bg',
    //     'peter@abv.bg',
    //     'niki@abv.bg',
    //     'niki@abv.bg',
    //     'niki@abv.bg'
    // ]

    let searchedJobByEmail = await searchJobsByEmail(allJobs, searchTextEmail);

    console.log(searchedJobByEmail);

    res.render('search', { searchedJobByEmail })
});


module.exports = router