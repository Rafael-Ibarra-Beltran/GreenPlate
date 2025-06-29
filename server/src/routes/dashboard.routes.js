const { isLoggedIn, isAdmin } = require('../middleware/auth.middleware.js');
const dashboardController = require('../controllers/dashboard.controller.js');

module.exports = app => {
    const router = require('express').Router();

    router.get('/stats', isLoggedIn, isAdmin, dashboardController.getBasicStats);

    app.use('/api/dashboard', router);
}; 