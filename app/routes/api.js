var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var moment = require('moment');
var nodemailer = require('nodemailer');
var generator = require('generate-password');
var connection = require('./db');
module.exports = function(router){
var salt = bcrypt.genSaltSync(10);

router.post('/users', function(req, res){

	var password = req.body.password;
	var email = req.body.email;
	var imie = req.body.imie;
	var nazwisko = req.body.nazwisko;
	var telefon = req.body.telefon;
	var rola = req.body.rola;

	if(imie == null || imie == '' || password == null || password == '' || email == null || email == '' || nazwisko == null || nazwisko == '' || telefon == null || telefon == '' || rola =='' || rola == null){
		res.json({ success: false, message: 'Upewnij się, że podałeś wszystkie dane'});
	}else{
		var hash = bcrypt.hashSync(password, salt);
		password = hash;

		connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy WHERE uzytkownicy.email ='"+email+"'", function(err,result){
		 	if(result.length!=0)
                   {
                      res.json({ success: false, message: 'Podany email jest już zajęty!'});
                   }else{
						connection.query("INSERT INTO "+rola+" (email, password, imie, nazwisko, telefon, id_permission) VALUES ('"+email+"','"+password+"','"+imie+"','"+nazwisko+"','"+telefon+"','1')", function(err, result){
				            res.json({ success: true, message: 'Zarejestrowano! Oczekuj na aktywacje konta przez administratora.'});
				    	});
	};

});
		}});

router.post('/checkemail', function(req, res){
	connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy WHERE uzytkownicy.email ='"+req.body.email+"'", function(err,result){
		if (err) { throw err;}
		
		 	if(result.length!=0){
		 			res.json( {success: false, message: 'Podany email jest już zajęty'});
               }else{
               		res.json( {success: true, message: 'Poprawny email'});
               }
});
});

    router.post('/idkalendarz', function(req, res) {

    	dane = req.body.id;
    	res.json(dane);

    });



router.get('/kalendarz', function(req, resp){

	connection.query(function(error){
			connection.query("SELECT * FROM events where id_instructor='"+dane+"'", function(error, rows, fields, data){
				if(!!error){
					console.log('error in the query');
				}else{
				 resp.json(rows);
				}
			});
		
	});

});
 
router.post('/post', function(req, res) {
  var instruktor = req.body.instruktor;
	var rok = moment(req.body.rok).format('YYYY-MM-DD');
connection.query("SELECT poczatek, koniec FROM events WHERE data='"+rok+"' AND id_instructor='"+instruktor+"' ORDER BY poczatek", function(error, rows, fields){
				if(!!error){
					console.log('error in the query');
				}else{
					res.send(rows);
				}
			});


});

router.post('/post2', function(req, res) {
  try {
        var body = JSON.stringify(req.body)
  } catch (e) {
    console.log('post error: ' + e)
    res.send('post error')
  }
  var rok = req.body[0].rok;

connection.query("SELECT poczatek, koniec FROM events2 WHERE data='"+rok+"' ORDER BY poczatek", function(error, rows, fields){
				if(!!error){
					console.log('error in the query');
				}else{
					var arr = [];
					for (var i = 0; i<rows.length; i++) {
						arr[i] = rows[i];
					}			
					res.send(arr);
				}
			});


});
router.post('/authenticate', function(req, res){
	var password = req.body.password;
	connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy INNER JOIN permissions ON uzytkownicy.id_permission = permissions.id_permission where uzytkownicy.email='"+req.body.email+"'", function(err,result){
		if (err) { throw err;}else{
		
		 	if(result.length!=0)
                   {
                   	var auth = bcrypt.compareSync(password, result[0].password);
                   	if (auth==true) {

                   		var token = jwt.sign({ email: result[0].email, imie: result[0].imie, nazwisko: result[0].nazwisko, permission: result[0].permission, id: result[0].id_user}, secret, { expiresIn: '24h' });
                      	res.json({ success: true, message: 'Zalogowano!', token: token });
                    }else{
                		res.json({ success: false, message: 'Wrong password!'});
                	  }
                	
                   }else{
                   		res.json({ success: false, message: 'Wrong email!'});
  
                   }
               }
               });
});


router.post('/wyslij', function(req, res){

connection.query(function(error){
	var table='nie';
			connection.query("SELECT * FROM users  WHERE email ='"+req.body.mail+"'", function(err, rows){
				connection.query("SELECT * FROM instructors  WHERE email ='"+req.body.mail+"'", function(err, rows2){
					connection.query("SELECT * FROM administrators  WHERE email ='"+req.body.mail+"'", function(err, rows3){
						if(rows.length>0) {
							table='users';
						}
						if(rows2.length>0){
							table='instructors';
						} 
						if(rows3.length>0) {
							table='administrators';
						}
						if(table != 'nie'){
						var haslo = generator.generate({
						    ength: 10,
						    numbers: true
						});
						
						var transporter = nodemailer.createTransport({
						    service: 'Gmail',
						    auth: {
						        user: 'naukajazdyzut@gmail.com',
						        pass: 'westpomerania123'
						    }
						});
						transporter.sendMail({
						from: 'naukajazdyzut@gmail.com',
						  to: req.body.mail,
						  subject: 'hello world!',
						  text: 'Twoje tymczasowe hasło to '+haslo
						});
						var hash2 = bcrypt.hashSync(haslo, salt);
						haslo = hash2;
						connection.query("UPDATE "+table+" SET password = '"+haslo+"' WHERE email='"+req.body.mail+"'", function(err, result){
					     });
						 res.json({ success: true, message: "Hasło zresetowane"});
					}else{
						res.json({ success: false, message: "Błędny email"});
					}

						
					});
				});
			});
		
	});

});






router.use(function(req, res, next){
	var token = req.body.token || req.body.query || req.headers['x-access-token'];

	if(token){
		jwt.verify(token, secret, function(err, decoded){
			if (err) {
				res.json({ success: false, message: 'Token invalid'});
			}else{
				req.decoded = decoded;
				next();
			}
		});
	}else{
		res.json({ success: false, message: 'No token provided'});
	}
});

router.post('/me', function(req, res){
	res.send(req.decoded);
});

router.get('/pokazrezerwacje', function(req, res){


	connection.query("SELECT * FROM instructors WHERE email='"+req.decoded.email+"'", function(err,result){
			if (err) throw err;
			if(result.length>0){
				var id = result[0].id_instructor;
				connection.query("SELECT * FROM events INNER JOIN users ON events.id_user = users.id_user WHERE id_instructor='"+id+"'", function(err,result2){
					res.send(result2);
				});
				
			}
	});
});

router.post('/changepassword', function(req, res){

connection.query("SELECT * FROM users WHERE email='"+req.decoded.email+"'", function(err,result){
	if (err) throw err;
	connection.query("SELECT * FROM instructors WHERE email='"+req.decoded.email+"'", function(err,result2){
		if (err) throw err;
		connection.query("SELECT * FROM administrators WHERE email='"+req.decoded.email+"'", function(err,result3){
			if (err) throw err;
			if (result.length>0){
				table5='users';
			}
			if (result2.length>0){
				table5='instructors';
			}
			if (result3.length>0){
				table5='administrators';
			}
			connection.query("SELECT * FROM "+table5+" WHERE email='"+req.decoded.email+"'", function(err,result4){
			if (bcrypt.compareSync(req.body.oldPassword, result4[0].password) == true){
				if (req.body.oldPassword == req.body.newPassword){
					res.json({ success: false, message: "Nowe hasło nie może być takie same"});
				}else{

				if (req.body.newPassword == req.body.confirmednewpassword){
				connection.query("UPDATE "+table5+" SET password = '"+bcrypt.hashSync(req.body.newPassword, salt)+"' WHERE email='"+req.decoded.email+"'", function(err, user){
					if (err) throw err;
					res.json({ success: true, message: "Hasło zostało zmienione"});

				});
				}else{
					res.json({ success: false, message: "Hasła się nie zgadzają"});
				}
			}
			}else{
				res.json({ success: false, message: "Błędne hasło"});
			}


			});
		});
	});
});
	
		});



router.get('/pokaz/:id', function(req, res){
	var id = req.params.id;
	connection.query(function(error){
			connection.query("SELECT * FROM events WHERE id_user='"+req.decoded.id+"' AND id_instructor='"+id+"'", function(error, rows, fields, data){
				if(!!error){
					console.log('error in the query');
				}else{
					if(rows.length>0){
						res.send(rows);
					}else{
						res.json({ success: false, message: "Brak danych"});
					}	
								
				}
			});
		
	});
});

router.get('/pokaz', function(req, res){

connection.query(function(error){
			connection.query("SELECT * FROM events WHERE id_user='"+req.decoded.id+"' AND cast(data AS DATE)>CURDATE()", function(error, rows, fields, data){
				if(!!error){
					console.log('error in the query');
				}else{
					if(rows.length>0){
						res.send(rows);
					}
								
				}
			});
		
	});

});



router.get('/pokazuzytkownika', function(req, res){

connection.query(function(error){
			connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy WHERE uzytkownicy.email ='"+req.decoded.email+"'", function(error, rows, fields, data){
				if(!!error){
					console.log('error in the query');
				}else{
					if(rows.length>0){
						res.send(rows);
					}else{
						res.json({ success: false, message: "Brak danych"});
					}	
								
				}
			});
		
	});

});


router.post('/usun', function(req, res){

connection.query(function(error){
			connection.query("DELETE FROM events WHERE id_event = '"+req.body.idev+"'", function(error, rows, fields, data){
				if(!!error){
					console.log('error in the query');
				}else{
					res.json({ success: true, message: "usunieto"});
				}
			});
		
	});



	});



router.post('/wybierz', function(req, res){

	var data = moment(req.body.date).format('YYYY-MM-DD');
	connection.query(function(error){
		connection.query("SELECT * FROM events", function(error, rows, fields){
				if(!!error){
					console.log('error in the query');
				}
			});
		
	});
});

router.post('/data', function(req, res){
	var id_instr = req.body.instruktor;

    var data = moment(req.body.date).format('YYYY-MM-DD');
 
	var start = req.body.start;
	var end = req.body.end;
	var x = parseInt(req.body.start, 10);
    var x2 = parseInt(req.body.end, 10)
    var start_date = data+" "+start;
    var end_date =  data+" "+end;
    var text = req.decoded.imie+" "+req.decoded.nazwisko;

	var poczatek=req.body.start;
	var koniec=req.body.end;


	var tabpoczatek =[];
	var tabkoniec = [];
	var msg = 1;
connection.query("SELECT * from events inner JOIN users on events.id_user = users.id_user where email ='"+req.decoded.email+"' AND data = '"+data+"'", function(err,events){

	for (var i=0; i<events.length; i++){
		var pocz = parseInt(events[i].poczatek, 10);
		var kon = parseInt(events[i].koniec, 10);
		var ile=0;
		for (var j=pocz; j<kon;j++){
				tabpoczatek[i+ile]=parseInt(events[i+ile].poczatek, 10);
				ile++;
		}
		ile=0;
		for (var k=pocz+1; k<=kon;k++){
				tabkoniec[i+ile]=parseInt(events[i+ile].koniec, 10);
				ile++;
		}
	}

	for (var o=0; o<tabpoczatek.length; o++){
			if(x == tabpoczatek[o]){
				msg = 0;
				break;
			}else{
				for (var m=0; m<=tabkoniec.length; m++){
					if(x2 == tabkoniec[m]){
						msg = 0;
						break;
					}else{
						msg = 1;
					}
				}
			}
	}

if (msg == 0){
	res.json({ success: false, message: 'Nie możesz posiadać dwóch rezerwacji w tym samym terminie u różnych instruktorów'});
}else if((x2<=x || (x2-x)>3)){

	res.json({ success: false, message: 'Nieprawidłowa godzina'});
}else{

    if(req.body.date == null || req.body.start == null || req.body.end == null){
		res.json({ success: false, message: 'Upewnij się, że podałeś wszystkie dane'});
	}else{
		connection.query("SELECT start_date from events where start_date='"+start_date+"' AND id_instructor='"+id_instr+"'", function(err,result){
		 	if(result.length!=0)
                   {
                      res.json({ success: false, message: 'Podana data początkowa jest już zajęta'});
                   }else{
		connection.query("SELECT end_date from events where end_date='"+end_date+"' AND id_instructor='"+id_instr+"'", function(err,result){
		 	if(result.length!=0)
                   {
                      res.json({ success: false, message: 'Podana data końcowa jest już zajęta'});
                   }else{
	 connection.query("INSERT INTO events (start_date, end_date, text, poczatek, data, koniec, id_user, id_instructor) VALUES ('"+start_date+"','"+end_date+"','"+text+"','"+poczatek+"','"+data+"','"+koniec+"','"+req.decoded.id+"', '"+id_instr+"')", function(err, result){
            res.json({ success: true, message: x2});

     });
	};
});
		}});
		}}
		});
	});


router.post('/instructor', function(req, res){
connection.query("SELECT imie, nazwisko from instructors where id_instructor='"+req.body.id_instructor+"'", function(err,result){
		if (err) throw err;
		
		 	if(result.length!=0)
               {
                  	res.send(result[0]);
               }
           });


});

router.get('/permission', function(req, res){
connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy WHERE uzytkownicy.email ='"+req.decoded.email+"'", function(err,result){
		if (err) throw err;
		
		 	if(result.length!=0)
               {
                  	res.json({ success: true, permission: req.decoded.permission});	
               }else{
               		res.json({ success: false, message: 'nie znaleziono użytkownika'});
               }
           });


});


router.get('/managment', function(req, res){
	connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy INNER JOIN permissions ON uzytkownicy.id_permission = permissions.id_permission where uzytkownicy.email='"+req.decoded.email+"'", function(err,result){
		if (err) throw err;
			
			if(result.length==0){
				res.json({ success:false, message: "Nie znaleziono użytkownika"});
			}else{

		 	if(result[0].permission === 'admin')
               {
               		connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy INNER JOIN permissions ON uzytkownicy.id_permission = permissions.id_permission", function(err,users){
               			res.json({ success:true, users: users, permission: result[0].permission});
               		})
               }else{
               		res.json({ success:false, message: "brak uprawnien"});
               }
           }
           });
});

router.delete('/managment/:email', function(req, res){
	var deleteuser = req.params.email;
	
var table3;
connection.query("SELECT * FROM users WHERE email='"+deleteuser+"'", function(err,result){
	if (err) throw err;
	connection.query("SELECT * FROM instructors WHERE email='"+deleteuser+"'", function(err,result2){
		if (err) throw err;
		connection.query("SELECT * FROM administrators WHERE email='"+deleteuser+"'", function(err,result3){
			if (err) throw err;
			if (result.length>0){
				table3='users';
			}
			if (result2.length>0){
				table3='instructors';
			}
			if (result3.length>0){
				table3='administrators';
			}

			connection.query("DELETE FROM "+table3+" WHERE email = '"+deleteuser+"'", function(err,users){
				res.json({ success:true});
			});
		});
	});
});
               		
               			

});

router.put('/changedane', function(req, res){
	var tabled;
    connection.query("SELECT * FROM users where email='"+req.decoded.email+"'", function(err,result4){
		if (err) throw err;
		connection.query("SELECT * FROM instructors where email='"+req.decoded.email+"'", function(err,result2){
			if (err) throw err;
			connection.query("SELECT * FROM administrators where email='"+req.decoded.email+"'", function(err,result3){
				if (err) throw err;
				if (result4.length>0){
					tabled="users";
				}
				if (result2.length>0){
					tabled="instructors";
				}
				if (result3.length>0){
					tabled="administrators";
				}
				
				 connection.query("UPDATE "+tabled+" SET imie = '"+req.body.newImie+"', nazwisko = '"+req.body.newNazwisko+"', telefon = '"+req.body.newTelefon+"' WHERE email='"+req.decoded.email+"'", function(err){
				 	if (err) throw err;
				 	res.json({success: true, message: 'Dane zmienione' });
			
				});
			});
		});
	});
							
});


router.get('/getdane', function(req, res){
	var tabled2;

    connection.query("SELECT * FROM users where email = '"+req.decoded.email+"'", function(err,result4){
		if (err) throw err;
		connection.query("SELECT * FROM instructors where email = '"+req.decoded.email+"'", function(err,result2){
			if (err) throw err;
			connection.query("SELECT * FROM administrators where email = '"+req.decoded.email+"'", function(err,result3){
				if (err) throw err;
				if (result4.length>0){
					tabled2="users";
				}
				if (result2.length>0){
					tabled2="instructors";
				}
				if (result3.length>0){
					tabled2="administrators";
				}
				
				connection.query("SELECT imie, nazwisko, telefon FROM "+tabled2+" where email = '"+req.decoded.email+"'", function(err,dane){

					res.json(dane );
					
				});
				 
			});
		});
	});
							
});


router.get('/edit/:email', function(req, res){
	var editUser = req.params.email;
	var table6;
	connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy INNER JOIN permissions ON uzytkownicy.id_permission = permissions.id_permission where uzytkownicy.email='"+req.decoded.email+"'", function(err,result){
		if (err) throw err;
		if(result.length==0){
				res.json({ success:false, message: "Nie znaleziono użytkownika"});
			}else{

		 	if(result[0].permission === 'admin')
               {
               		connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy INNER JOIN permissions ON uzytkownicy.id_permission = permissions.id_permission where uzytkownicy.email='"+editUser+"'", function(err, user){
               			if (err) throw err;
               			if(user.length==0){
               				res.json({ success: false, message: "Nie znaleziono użytkownika"});
               			}else{
               				connection.query("SELECT * FROM users INNER JOIN permissions ON users.id_permission = permissions.id_permission where users.email='"+editUser+"'", function(err,result4){
								if (err) throw err;
								connection.query("SELECT * FROM instructors INNER JOIN permissions ON instructors.id_permission = permissions.id_permission where instructors.email='"+editUser+"'", function(err,result2){
									if (err) throw err;
									connection.query("SELECT * FROM administrators INNER JOIN permissions ON administrators.id_permission = permissions.id_permission where administrators.email='"+editUser+"'", function(err,result3){
										if (err) throw err;
										if (result4.length>0){
											table6="kursant";
										}
										if (result2.length>0){
											table6="instructor";
										}
										if (result3.length>0){
											table6="administrator";

										}
								res.json({ success: true, user: user, typkonta: table6 });
									});
								});
							});
							
               			}
               		})
               }else{
               		res.json({ success:false, message: "brak uprawnien"});
               }
           }
	});

});


router.put('/edit', function(req, res){
	var editUser = req.body.email;
	if (req.body.imie) var newImie = req.body.imie;
	if (req.body.nazwisko) var newNazwisko = req.body.nazwisko;
	if (req.body.email) var newEmail = req.body.email;
	if (req.body.permission) var newPermission = req.body.permission;
	var newidpermission;
	var table2;
var newid;
var table4;
	switch(newPermission){
		case 'user': newidpermission=2; table4="users";newid='id_user';break;
		case 'instructor': newidpermission=3;table4="instructors";newid='id_instructor';break;
		case 'admin': newidpermission=4;table4="administrators";newid='id_administrator';break;
	}



connection.query("SELECT * FROM (SELECT * FROM users UNION SELECT * FROM instructors UNION SELECT * FROM administrators) as uzytkownicy INNER JOIN permissions ON uzytkownicy.id_permission = permissions.id_permission where uzytkownicy.email='"+req.decoded.email+"'", function(err,user){
if(user[0].permission === 'admin'){
connection.query("SELECT * FROM users WHERE email='"+editUser+"'", function(err,result){
	if (err) throw err;
	connection.query("SELECT * FROM instructors WHERE email='"+editUser+"'", function(err,result2){
		if (err) throw err;
		connection.query("SELECT * FROM administrators WHERE email='"+editUser+"'", function(err,result3){
			if (err) throw err;
			if (result.length>0){
				table2='users';
				
			}
			if (result2.length>0){
				table2='instructors';
				
			}
			if (result3.length>0){
				table2='administrators';
				
			}

if (newImie){
	connection.query("UPDATE "+table2+" SET imie = '"+newImie+"' WHERE email='"+editUser+"'", function(err,result){
		if (err) throw err;
		 });
}
if (newNazwisko){
	connection.query("UPDATE "+table2+" SET nazwisko = '"+newNazwisko+"' WHERE email='"+editUser+"'", function(err,result){
		if (err) throw err;
		 });
}
if (newEmail){
	connection.query("UPDATE "+table2+" SET email = '"+newEmail+"' WHERE email='"+editUser+"'", function(err,result){
		if (err) throw err;
		 });
}
if(newPermission){
	if((table2==='users' && newidpermission == 2) || (table2==='instructors' && newidpermission == 3) || (table2==='administrators' && newidpermission == 4)){
	connection.query("UPDATE "+table2+" SET id_permission = '"+newidpermission+"' WHERE email='"+editUser+"'", function(err,result){
	});
}else{
	connection.query("SELECT MAX("+newid+") as max FROM "+table4+"", function(err,result){
		var max = result[0].max + 1;
		connection.query("INSERT INTO "+table4+" select "+max+", email, password, imie, nazwisko, telefon, "+newidpermission+" from "+table2+" where email = '"+editUser+"'", function(err,result){
			connection.query("DELETE FROM "+table2+" where email = '"+editUser+"'", function(err,result){
		});
		});
	});
}
}

	res.json({ success: true, message: 'Zaktualizowano'});
		});
	});
});
}else{
	res.json({ success: false, message: "Brak uprawnień"});
}
});
});
	return router;
};


