//jshint esversion:6
require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql');
const cookieParser = require('cookie-parser');

const session = require('express-session');

const bodyParser = require('body-parser');

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	port: 8111,
	password: '',
	database: 'organdonation'
});

db.connect((err) => {
	if (err) {
		console.log(err);
	} else {
		console.log('Database connected!');
	}
});

app.use(
	session({
		secret: 'I am inevitible',
		resave: false,
		saveUninitialized: false
	})
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use('/', require('./routes/main'));

app.use('/auth', require('./routes/auth'));

app.listen(3000, function() {
	console.log('Server started at port 3000');
});
