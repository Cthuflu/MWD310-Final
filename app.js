var express = require('express'),
	mysql = require('mysql'),
	pug = require('pug'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	session = require("express-session"),
  bodyParser = require("body-parser");
  //cookieParser = require("cookie-parser"); // didn't help

var app = express();

var conn = mysql.createConnection({
  host     : 'vulcan.mwd.hartford.edu',
  database : 'groupNaN',
  user     : 'groupNaN_user', 
  password : 'groupNaN' // Hey look a plaintext password
});

//app.use(cookieParser("pug"));
app.use(session({ secret: "pug", saveUninitialized: true, resave: false, cookie: { maxAge: null } }));
app.use(bodyParser.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'user_name',
    passwordField: 'password'
  }, function(username, password, done) {
    console.log(`username: ${username} password: ${password}`);
    conn.query( `SELECT * FROM users WHERE user_name=\'${username}\'`, function (err, user) {
      console.log(user[0]);
    	if (err) { return done(err); }
      
    	if (!user.length) {
        console.log('no user')
      	return done(null, false, { message: 'Incorrect username.' });
    	}
      console.log(`${user[0].password} !== ${password} : ${(user[0].password !== password)}`)
    	if (user[0].password !== password) {
        console.log('incorrect password')
      	return done(null, false, { message: 'Incorrect password.' });
    	}
      console.log("Success?")
    	return done(null, user[0]);
    });
  }
));

passport.serializeUser(function(user, done) {
  console.log("Serialize");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("Deserialize");
  conn.query(`SELECT id FROM users WHERE id=${id}`,function(user) {
  	console.log(user);
    done(null, user);
  })
});

// App
app.set('views', './view');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/',function(req,res){
	conn.query('SELECT * FROM projects', (err, qres, fields)=> {
		if (err) {throw err;}
		console.log(qres);
		res.render('index', {title: 'Hey', message: 'Hello there!', submessage: 'This is a subtitle'});
	});
});

app.get('/login',function(req, res){
  /*conn.query('SELECT * FROM users', (err, qres, fields)=> {
    if (err) {throw err;}
    //console.log(qres);
  });*/
	res.render('login', {title: "ideaShare for sharing ideas: Not powered by wordpress"});
});

app.post('/login', 
  function(req, res, next){ console.log(req.body); next(); }, 
  passport.authenticate('local', {  successRedirect: '/submit', 
                                    failureRedirect: '/login' }));

app.get('/submit', verify, function(req, res) {
  console.log("Submit page!")
  res.send('submission page');
});

/*app.get('*', function(req, res, next) {
  let err = new Error('Page Not Found');
  err.statusCode = 404;
  res.render('error', {error: err})
});*/

app.listen(8080, () => console.log('Listening on port 8080!'))

function verify(req, res, next) {
  console.log(`User request from ${req.ip} for ${req.url} by ${req.user}`);
  if(!req.user) { 
    return res.status(418).send('<h1>418: I\'m a teapot</h1>');
  }
  next();
}
