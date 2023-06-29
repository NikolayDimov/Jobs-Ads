const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');
const adController = require('../controllers/adController');
const searchController = require('../controllers/searchController');


module.exports = (app) => {
    app.use(homeController);
    app.use(authController);
    app.use(adController);
    app.use(searchController);


    // 404 page
    app.get('*', (req, res) => {
        res.render('404', { title: 'Page Not Found' });
    });
};





