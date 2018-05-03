var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var connection = require('./app/routes/db');
var path = require('path');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api', appRoutes);

connection.connect(function(err){
	if(err){
		console.log('Not connected' + err);
	}else{
		console.log('Successfully connected');
	}
});

app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
})

app.listen(port, function(){
	console.log('Running at port ' + port);
});

