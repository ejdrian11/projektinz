var mysql = require('mysql');

var connection = mysql.createConnection({

  host     : 'www.db4free.net',
  user     : 'projektinzadmin',
  password : 'admin500',
  database : 'projektinz'

});

connection.connect(function(err) {
    if (err) throw err;
});
module.exports = connection;