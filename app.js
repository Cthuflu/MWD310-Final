var express = require('express');
var mysql = require('mysql');

var app = express()

app.get('/',function(req,res){
	res.send("alive");
});

app.listen(8080, () => console.log('Listening on port 8080!'))
