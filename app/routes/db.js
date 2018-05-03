var mysql = require('mysql');

var connection = mysql.createConnection({

  host     : 'localhost',
  user     : 'admin',
  password : 'admin',
  database : 'test'

});

connection.connect(function(err) {
    if (err) throw err;
});
module.exports = connection;