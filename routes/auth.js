require('dotenv').config();
const router = require('express').Router();
const authController = require('../controllers/auth');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');

router.post('/loginad', authController.loginad);
router.post('/logind', authController.logind);
router.post('/register', authController.register);
router.post('/organavail', authController.organavail);
router.post('/update', authenticateToken, authController.update);
router.post('/delete', authenticateToken, authController.delete);
router.post('/dupdate', authenticateToken, authController.dupdate);
router.post('/withdraw', authenticateToken, authController.withdraw);
router.post('/addorgan', authenticateToken, authController.addorgan);

module.exports = router;
