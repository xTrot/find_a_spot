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
    
var UPDATE_MASTERS_START = 
    "UPDATE public.masters"+
    " SET last_edited=current_timestamp,"+
    " seats = CASE slave_id ";
    
var UPDATE_MASTERS_END = 
    " ELSE seats"+
    " END";


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

router.get('/mymasters',function (req,res,next) {
   
   /////////////////////////////////////////////////////////////////////////////////////////////////////// 
});

//========================================================//
//                       GETS END                         //
//========================================================//

//========================================================//
//                      POSTS START                       //
//========================================================//

//                  Post New Room Status
router.post('/master?', function(req, res, next) {
  console.log("Master_id:"+req.query.master_id);
  if(req.query.master_id){
    res.render('index', { title: 'Express' }); 
    
   var cases = "";
   
   var rfs = "";
    
    req.body.forEach(function(element) {
        console.log("RF_ID:"+element.rf_id+", Seats:"+element.seats);
        cases +=" WHEN '"+element.rf_id+"' THEN '"+element.seats+"'\n";
        rfs +="'"+element.rf_id+"', ";
    }, this);
    rfs = rfs.substring(0,rfs.length-2);
    var query_string = UPDATE_MASTERS_START + cases + UPDATE_MASTERS_END + " WHERE master_id=$1 AND slave_id IN("+rfs+");";
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > User Authentication
        var query = client.query(query_string,[req.query.master_id]);
    });
  }else{
    res.redirect('/error');
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
