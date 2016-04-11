var express = require('express');
var router = express.Router();

var pg = require('pg');
var path = require('path');
var bcrypt = require('bcrypt');
var connectionString = require(path.join(__dirname, '../', 'config'));

// ------------------   Query Start   ----------------------

var CHECK_USER =
    "SELECT user_email FROM public.users" +
    " WHERE user_email=$1";
    
var NEW_USER =
    "INSERT INTO public.users(user_email, user_pass)" +
    " VALUES($1, $2)";
    
var USER_LOGIN = 
    "SELECT user_email,user_pass FROM public.users"+
    " WHERE user_email=$1";


// ------------------    Query End    ----------------------

//========================================================//
//                       GETS START                       //
//========================================================//

//                     Get Index Page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Find-A-Spot' });
});

//                     Get Login Page
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

//                     Get Register Page
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

//                     Get Room JSON
router.get('/room?', function(req, res, next) {
  if(req.query.room_id){
    console.log("Get:"+req.query.room_id);
  }
  res.render('index', { title: 'Room JSON' });
});

//========================================================//
//                       GETS END                         //
//========================================================//

//========================================================//
//                      POSTS START                       //
//========================================================//

//                  Post New Room Status
router.post('/room?', function(err, req, res, next) {
  if(req.query.room_id){
    console.log("Post:"+req.query.room_id);
    console.log("Body:"+req.body[0].rf_id+","+req.body[0].seats);
    console.log("Body:"+req.body[1].rf_id+","+req.body[1].seats);
    res.render('index', { title: 'Express' });
    
    req.body.forEach(function(element) {
      
    }, this);
    
  }else{
    err.status = 404;
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  }
});

//                     Post Login Page
router.post('/login', function(req, res) {
    var results = [];
    
    // Grab data from http request
    var data = {
        email: req.body.email,
        password: req.body.password
    };

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > User Authentication
        var query = client.query(USER_LOGIN, [data.email]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            if (results[0]) {
                if(bcrypt.compareSync(data.password, results[0].user_pass)){
                    console.log("User: "+results[0].user_email+" Authenticated");
                    req.session.user_email = results[0].user_email;
                    res.redirect('/manage');
                }else {
                    res.redirect('/login?error=true');
            }
            }; 
        });

    });

});

//                     Post Register Page
router.post('/register', function(req, res) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    // Grab data from http request
    var data = {
        email: req.body.email,
        password: hash
    };

    console.log(data);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        
        client.query(CHECK_USER, [data.email], function(err, result) {
            
            if(err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }
            
            console.log(result);
            var tempUserID = result.rows[0];

            console.log(tempUserID);
            if(tempUserID){
                res.redirect('/register?error=true');
                done();
                return;
            }
        });
    });

     pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        client.query(NEW_USER, [data.email, data.password]);
        res.redirect('/login');
        done();
        return;
    });
});

//========================================================//
//                       POSTS END                        //
//========================================================//


module.exports = router;
