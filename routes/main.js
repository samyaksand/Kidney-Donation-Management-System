require('dotenv').config();
//Import and create router object on which we will create all the routes
const router = require('express').Router();
const authenticateToken = require('../middleware/auth');
const mysql = require('mysql');
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	port: 8111,
	password: '',
	database: 'organdonation'
});

router.get('/', (req, res) => {
	res.render('index');
});

router.get('/logind', (req, res) => {
	res.render('logind', { message: '' });
});

router.get('/loginad', (req, res) => {
	res.render('logina', { message: '' });
});

router.get('/admin', authenticateToken, (req, res) => {
	if (req.user) {
		db.query('SELECT * FROM deletionreason', async (err, results) => {
			if (err) {
				console.log(err);
				res.sendStatus(404);
			} else if (results.length > 0) {
				console.log(results);
				res.render('admin', { mu: '', md: '', mo: '', users: results });
			} else {
				let users = [];
				res.render('admin', { mu: 'Updated Successfully', md: '', mo: '', users: users });
			}
		});
	} else {
		res.render('logina', {
			message: 'Login first'
		});
	}
});

router.get('/donor', authenticateToken, (req, res) => {
	if (req.user) {
		res.render('donor', { md: '', mw: '', user: req.user.user.Username });
	} else {
		res.status(400).render('logind', {
			message: 'Login first'
		});
	}
});

router.get('/organavail', (req, res) => {
	let results = [];
	res.render('organavail', { results: results, message: '' });
});

router.get('/register', (req, res) => {
	res.render('donorfillup', { message: '' });
});

router.get('/logout', authenticateToken, async (req, res) => {
	try {
		res.clearCookie('jwt');
		console.log('successfully logged out');
		res.redirect('/');
	} catch (err) {
		console.log(err);
	}
});

// to use this router, we need to export it
module.exports = router;
