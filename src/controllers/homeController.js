const homeController = require('express').Router();

const { getAllAdsForHomePage } = require('../services/adService');

// const { isAuth } = require('../middleware/userSession');
// const preload = require('../middleware/preload');    -->> for SESSION


//TODO replace with real controller by assignment
homeController.get('/', async (req, res) => {
    const homeAds = await getAllAdsForHomePage();
    // console.log(homeAds);
    res.render('home', {title: 'Home Page', homeAds} );
});

module.exports = homeController;


