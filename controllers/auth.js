require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	port: 8111,
	user: process.env.DATABASE_USER,
	database: process.env.DATABASE
});

// exports.details = async (req,res) => {
//     try {
//         let fname = req.body.firstname;
//         let lname = req.body.lastname;
//         let name = fname + " " +  lname;
//         let username = req.body.username;
//         if(username === ''){
//             return res.render("donorfillup",{
//                 message : 'Username is needed'
//             });
//         }
//         else{
//             db.query('SELECT * FROM donor WHERE Username = ?',[username], async (err,results)=>{
//                 if(err){
//                     console.log(err);
//                 }else if(results.length > 0){
//                     return res.render("donorfillup",{
//                         message : 'Username already exist'
//                     });
//                 }else{
//                     username = 'DN' + username;
//                     console.log(req.user.user.Email);
//                     db.query('UPDATE donor SET ? WHERE Email = ?', [{
//                         Name : name, Hospital : req.body.hospital, Username : username,
//                         Personal_Doctor : req.body.doctor, Gender : req.body.gender,
//                         Address : req.body.address, State : req.body.state, City : req.body.city,
//                         Contact : req.body.contact, DOB : req.body.dob, Ailments : req.body.disease
//                     }, req.user.user.Email], async (err,result) => {
//                         if(err){
//                             console.log(err);
//                         }else{
//                             console.log(result);
//                             console.log('Successfully updated');
//                             // const accessToken = jwt.sign({user:user}, process.env.ACCESS_TOKEN);
//                            // res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
//                             res.redirect("/donorfillup");
//                         }
//                     });

//                 }
//             });
//         }

//     } catch (error) {
//         console.log(error);
//     }
// };

exports.register = async (req, res) => {
	try {
		let email = req.body.email;
		let password = req.body.password;
		let confirmpassword = req.body.confirmpassword;
		let fname = req.body.firstname;
		let lname = req.body.lastname;
		let name = fname + ' ' + lname;
		let username = req.body.username;
		if (username === '') {
			return res.render('donorfillup', {
				message: 'Username is needed'
			});
		}
		username = 'DN' + username;
		db.query('SELECT * FROM donor where Username=?', [ username ], async (err, resuse) => {
			if (err) {
				console.log(err);
				res.sendStatus(404);
			} else if (resuse.length > 0) {
				return res.render('donorfillup', {
					message: 'Username is already exists'
				});
			} else {
				db.query('SELECT * FROM donor where email=?', [ email ], async (err, results) => {
					if (err) {
						console.log(err);
					}
					if (results.length > 0) {
						return res.render('donorfillup', {
							message: 'Email already in use!!'
						});
					} else if (password !== confirmpassword) {
						return res.render('donorfillup', {
							message: 'Passwords do not match!'
						});
					}

					let hashedPassword = await bcrypt.hash(password, 8);
					console.log(hashedPassword);

					let user = {
						Name: name,
						Hospital: req.body.hospital,
						Username: username,
						Password: hashedPassword,
						Personal_Doctor: req.body.doctor,
						Gender: req.body.gender,
						Email: req.body.email,
						Address: req.body.address,
						State: req.body.state,
						City: req.body.city,
						Contact: req.body.contact,
						DOB: req.body.dob,
						Ailments: req.body.disease
					};
					db.query(
						'INSERT INTO nextofkin SET ?',
						{ Name: req.body.nameofkin, Contact: req.body.kincontact, Username: username },
						async (err, result) => {
							if (err) {
								console.log(err);
							} else {
								console.log(result);
							}
						}
					);
					db.query('INSERT INTO donor SET ?', user, (err, results) => {
						if (err) {
							console.log(err);
						} else {
							console.log(user);
							const accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN);
							res.cookie('jwt', accessToken, { secure: true, httpOnly: true });
							console.log('Passwords Match');
							res.redirect('/donor');
						}
					});
				});
			}
		});
	} catch (error) {
		console.log(error);
	}
};

exports.loginad = async (req, res) => {
	try {
		const { username, password } = req.body;

		db.query('SELECT * FROM admin where AdminID=?', [ username ], async (err, results) => {
			if (err) {
				console.log(err);
			} else {
				if (results.length === 0) {
					res.status(401).render('logina', {
						message: 'Invalid ID'
					});
				} else {
					// console.log(await bcrypt.compare(password, results[0].Password));
					if (password === results[0].Password) {
						const user = results[0];
						console.log(user);
						const accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN);
						res.cookie('jwt', accessToken, { secure: true, httpOnly: true });
						res.redirect('/admin');
					} else {
						res.status(401).render('logina', {
							message: 'Incorrect password'
						});
					}
				}
			}
		});
	} catch (error) {
		console.log(error);
	}
};

exports.logind = async (req, res) => {
	try {
		const { email, password } = req.body;

		db.query('SELECT * FROM donor where email=?', [ email ], async (err, results) => {
			if (err) {
				console.log(err);
			} else {
				if (results.length === 0) {
					res.status(401).render('logind', {
						message: 'Invalid email'
					});
				} else {
					if (await bcrypt.compare(password, results[0].Password)) {
						const user = results[0];
						const accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN);
						res.cookie('jwt', accessToken, { secure: true, httpOnly: true });
						console.log('Passwords Match');
						res.redirect('/donor');
					} else {
						res.status(401).render('logind', {
							message: 'Incorrect password'
						});
					}
				}
			}
		});
	} catch (error) {
		console.log(error);
	}
};

exports.update = async (req, res) => {
	try {
		let username = req.body.donor_up;
		db.query('SELECT * FROM donor WHERE Username = ?', [ username ], async (err, results) => {
			if (err) {
				res.sendStatus(404);
			} else if (results.length > 0) {
				let field = req.body.field;
				let newVal = String(req.body.newvalue);
				if (field === 'Password') {
					newVal = await bcrypt.hash(newVal, 8);
					console.log(newVal);
				}
				let sql = 'UPDATE donor SET ' + field + ' = ?  WHERE Username = ?';
				if (field === 'Ailments') {
					sql = "UPDATE donor SET Ailments = CONCAT(Ailments , ' ', ? ) WHERE Username = ?";
				}
				db.query(sql, [ newVal, username ], async (err, result) => {
					if (err) {
						console.log(err);
					} else {
						console.log(result);
						db.query('SELECT * FROM deletionreason', async (err, results) => {
							if (err) {
								console.log(err);
								res.sendStatus(404);
							} else if (results.length > 0) {
								console.log(results);
								res.render('admin', { mu: 'Updated Successfully', md: '', mo: '', users: results });
							} else {
								let users = [];
								res.render('admin', { mu: 'Updated Successfully', md: '', mo: '', users: users });
							}
						});
					}
				});
			} else {
				let users = [];
				return res.render('admin', { mu: 'Invalid DonorID', md: '', mo: '', users: users });
			}
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(404);
	}
};

exports.delete = async (req, res) => {
	try {
		const username = req.body.donor_del;
		db.query('SELECT * from donor WHERE Username = ?', [ username ], async (err, results) => {
			if (err) {
				res.sendStatus(404);
				console.log(err);
			} else {
				db.query('SELECT * FROM deletionreason', async (err, resu) => {
					if (err) {
						console.log(err);
						res.sendStatus(404);
					} else {
						let users = [];
						if (resu.length > 0) {
							console.log(resu);
							users = resu;
						}
						if (results.length > 0) {
							db.query('DELETE FROM donor WHERE Username = ?', [ username ], async (err, result) => {
								if (err) {
									console.log(err);
								} else {
									console.log(result);
									db.query(
										'DELETE FROM deletionreason where Username = ?',
										[ username ],
										async (err, result) => {
											if (err) {
												console.log(err);
											} else {
												db.query('SELECT * FROM deletionreason', async (err, upres) => {
													if (err) {
														console.log(err);
														res.sendStatus(404);
													} else if (upres.length > 0) {
														users = upres;
														return res.render('admin', {
															mu: '',
															md: 'Deleted Successfully',
															mo: '',
															users: users
														});
													} else {
														user = [];
														return res.render('admin', {
															mu: '',
															md: 'Deleted Successfully',
															mo: '',
															users: users
														});
													}
												});
											}
										}
									);
								}
							});
						} else {
							res.render('admin', { mu: '', md: 'No such username exists', mo: '', users: users });
						}
					}
				});
			}
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(404);
	}
};

exports.dupdate = async (req, res) => {
	try {
		let username = req.body.donorid;
		let field = req.body.field;
		let newVal = String(req.body.newvalue);
		if (field === 'Contact' || field === 'Ailments' || field === 'Password') {
			if (field === 'Password') {
				newVal = await bcrypt.hash(newVal, 8);
				console.log(newVal);
			}
			let sql = 'UPDATE donor SET ' + field + ' = ?  WHERE Username = ?';
			if (field === 'Ailments') {
				sql = "UPDATE donor SET Ailments = CONCAT(Ailments , ' ', ? ) WHERE Username = ?";
			}
			db.query(sql, [ newVal, username ], async (err, result) => {
				if (err) {
					console.log(err);
				} else {
					console.log(result);
					res.render('donor', { md: 'Updated Succesfully', mw: '', user: req.user.user.Username });
				}
			});
		} else {
			if (field === 'KContact') {
				field = 'Contact';
			}
			let sql1 = 'UPDATE nextofkin SET ' + field + ' = ? WHERE Username = ?';
			db.query(sql1, [ newVal, username ], async (err, result) => {
				if (err) {
					console.log(err);
				} else {
					console.log(result);
					res.render('donor', { md: 'Updated Succesfully', mw: '', user: req.user.user.Username });
				}
			});
		}
	} catch (error) {
		console.log(error);
		res.sendStatus(404);
	}
};

exports.withdraw = async (req, res) => {
	try {
		let username = req.body.donorid;
		let reason = req.body.reason;
		db.query('INSERT INTO deletionreason SET ?', { Username: username, Reason: reason }, (err, result) => {
			if (err) {
				console.log(err);
				res.sendStatus(404);
			} else {
				console.log(result);
				res.render('donor', { md: '', mw: 'Withdraw request Sent', user: req.user.user.Username });
			}
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(404);
	}
};

exports.addorgan = async (req, res) => {
	try {
		let username = req.body.donorid;
		db.query('SELECT * from donor WHERE Username = ?', [ username ], async (err, results) => {
			if (err) {
				res.sendStatus(404);
				console.log(err);
			} else {
				if (results.length > 0) {
					let organ = req.body.organ;
					let procdate = req.body.ProDate;
					let hospital = req.body.Hospital;
					db.query(
						'INSERT INTO organs SET ?',
						{
							Organ_name: organ,
							Donor_username: username,
							Hospital: hospital,
							Procurement_Date: procdate
						},
						async (err, result) => {
							if (err) {
								console.log(err);
								res.sendStatus(404);
							} else {
								console.log(result);
								res.render('admin', { mu: '', md: '', mo: 'Successfully added organ', users: [] });
							}
						}
					);
				} else {
					res.render('admin', { mu: '', md: '', mo: 'No such username exists', users: results });
				}
			}
		});
	} catch (error) {
		console.log(error);
	}
};

exports.organavail = async (req, res) => {
	try {
		let organ = req.body.organ;
		let city = req.body.city;
		db.query(
			'SELECT S.Organ_name,S.City,S.Address, S.Contact_Number,S.Hospital from (SELECT * from organs NATURAL JOIN hospitaldetails) as S where S.Organ_name = ? AND S.City = ?',
			[ organ, city ],
			async (err, results) => {
				if (err) {
					res.sendStatus(404);
				} else {
					if (results.length > 0) {
						console.log(results);
						res.render('organavail', { results: results, message: 'Results found' });
					} else {
						let results = [];
						res.render('organavail', { results: results, message: 'No results available in this city!!' });
					}
				}
			}
		);
	} catch (error) {
		console.log(error);
	}
};
