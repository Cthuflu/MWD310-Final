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
    conn.query( `SELECT * FROM users WHERE user_name=\'${username}\'`, function (err, user) {
    	if (err) { return done(err); }
      
    	if (!user.length) {
      	return done(null, false, { message: 'Incorrect username.' });
    	}
    	if (user[0].password !== password) {
      	return done(null, false, { message: 'Incorrect password.' });
    	}
    	return done(null, user[0]);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  conn.query(`SELECT * FROM users WHERE id=${id}`,function(err, user) {
    if(err) { return done(err); }
    done(null, user[0]);
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
		res.render('index', 
      { title: 'Hey', 
        projects: qres, 
        user: req.user ? req.user.user_name : null});
	});
});

app.get('/login',function(req, res){
  /*conn.query('SELECT * FROM users', (err, qres, fields)=> {
    if (err) {throw err;}
    //console.log(qres);
  });*/
  if(req.user) {
    res.redirect('/submit');
  } else {
    res.render('login', {title: "ideaShare for sharing ideas: Not powered by wordpress"})
  }
	;
});

app.post('/login',  
  passport.authenticate('local', {  successRedirect: '/submit', 
                                    failureRedirect: '/login' }));

app.get('/submit', verify, function(req, res) {
  res.render('submit', {title: "Submit your bad idea", user: req.user.user_name});
});

/*app.get('*', function(req, res, next) {
  let err = new Error('Page Not Found');
  err.statusCode = 404;
  res.render('error', {error: err})
});*/

app.listen(8080, () => console.log('Listening on port 8080!'))

function verify(req, res, next) {
  console.log(`User request from ${req.ip} for ${req.url}`);
  if(!req.user) { 
    return res.redirect('/login');
  }
  next();
}
