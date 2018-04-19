var express = require('express');
var mysql = require('mysql');
var pug = require('pug');

var app = express();

app.set('views', './view');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/',function(req,res){
	res.render('index', {title: 'Hey', message: 'Hello there!', submessage: 'This is a subtitle'});
});

app.listen(8080, () => console.log('Listening on port 8080!'))
