var express = require('express');
var router = express.Router();

var pg = require('pg');
var path = require('path');
var bcrypt = require('bcrypt');
var connectionString = require(path.join(__dirname, '../', 'config'));

//------- Athentication Function ---------
function checkAuth(req, res, next) {
    if (req.session.user_id) {
        next();
    } else {
        res.redirect('/login');
    }
}


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

var GET_MASTERS_DATA =
    "SELECT slave_id,name,last_edited, seats FROM public.masters" +
    " WHERE master_id=$1";
 
//Check Attachment  
    var CHECK_MASTER =
    "SELECT user_email, master_id FROM public.manage" +
    " WHERE user_email=$1 and master_id=$2";
//  Attach User to Master ID
var SET_MASTER_TO_USER =
    "INSERT INTO public.manage(user_email, master_id)"+
    " VALUES ($1,$2)";
    
//    Attach Master ID to Slaves
var SET_MASTER_TO_SLAVES =
    "INSERT INTO public.masters (slave_id,master_id,seats) VALUES" ;
    
//   Check Users Masters
var CHECK_USER_MASTERS =
    "SELECT "+
    "FROM manage,masters ";
    
var REMOVE_MASTER_FROM_MASTERS = 
"DELETE FROM public.masters" +
" WHERE master_id=$1";

var REMOVE_MASTER_FROM_MANAGE = 
"DELETE FROM public.manage" +
" WHERE master_id=$1";

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

//                     Get Master JSON
router.get('/master', function(req, res, next) {
  if(req.query.master_id){
    console.log("Get:"+req.query.master_id);
  }
  var json = { name:"",
                    timestamp:null,
                    slaves:[]
        };
  var results = []; 
// Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        //console.log("\n\n** 1");
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query(GET_MASTERS_DATA,[req.query.master_id]);
        console.log("Set the query.");
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
            console.log(row);
            
        });
        
        

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            console.log(results);    
        json.name = results[0].name;
        json.timestamp = results[0].last_edited;
        results.forEach(function(element) {
            var temp = element.seats;
            var bits = []; 
        
            //formatting integer to boolean
            for ( i = 11; i >= 0; i--){
            
                //even number % 2 = 0
                
                if (temp % 2 == 0){
                    bits[i] = false;
                }
                else{
                    bits[i] = true;
                }
                
                temp = temp >> 1;
        console.log(temp);
            }
            
                json.slaves.push(bits);
            
        });
        return res.json(json);
            });
    });
 });

//                     Get Add Master
router.get('/addmaster', checkAuth, function(req, res, next) {
  if(req.query.master_id){
          console.log("Get:"+req.query.master_id);
  }
  res.render('addmaster', { title: 'Add Master' });
});

//                      Get Edit Master
router.get('/editmaster', checkAuth, function(req, res, next) {
  if(req.query.master_id){
          console.log("Get:"+req.query.master_id);
  }
  res.render('editmaster', { title: 'Edit Master' });
});
        
//                      Get Remove Master
 router.get('/removemaster', checkAuth, function(req, res, next) {
  if(req.query.master_id){
          console.log("Get: "+req.query.master_id);
  }
  res.render('removemaster', { title: 'Remove Master' });
});
                    
///////////////////////////////////////////////////////////////////////////////////////////////////////
//========================================================//
//                       GETS END                         //
//========================================================//

//========================================================//
//                      POSTS START                       //
//========================================================//

//                  Post New Master's Status
router.post('/master?', function(req, res, next) {
  console.log("Master_id:"+req.query.master_id);
  if(req.query.master_id){
    
   var cases = "";
   
   var rfs = "";
    
    req.body.forEach(function(element) {
        console.log("SLAVE_ID:"+element.slave_id+", Seats:"+element.seats);
        cases +=" WHEN '"+element.slave_id+"' THEN '"+element.seats+"'\n";
        rfs +="'"+element.slave_id+"', ";
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
    res.status(200).json({success: true});
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
                    res.redirect('/addmaster');
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


//              Post Add Master Page
router.post('/addmaster', checkAuth, function(req, res) {

    // Grab data from http request
    var data = {
        master_id: req.body.master_id,
        quantity: req.body.quantity
    };

    console.log(req.body);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        
         client.query(CHECK_MASTER, [req.session.user_email,data.master_id], function(err, result) {
            
            if(err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }
            
            // console.log(result);
            var tempUserID = result.rows[0];

            console.log(tempUserID);
            if(tempUserID){
                res.redirect('/addmaster?error=true');
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

        var query = client.query(SET_MASTER_TO_USER, [req.session.user_email, data.master_id]);
      
        var insert = SET_MASTER_TO_SLAVES;
        // query.on('end',function() {
            for(i =0; i < data.quantity; i++){
             insert += " ('"+i+"','"+data.master_id+"','0')";
             
             if(i != data.quantity-1){
                 insert+= ", ";
                 
                }

            } 
            client.query(insert);
            console.log(insert);
        
        res.redirect('/login');
        done();
        return;
    });
});


//                     Post Remove Master Page
router.post('/removemaster', checkAuth, function(req, res) {
    var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > User Authentication
       client.query(REMOVE_MASTER_FROM_MANAGE, [req.body.master_id]);

        // Stream results back one row at a time
        // query.on('row', function(row) {
        //     results.push(row);
        // });


    });
    
       // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > User Authentication
      var query= client.query(REMOVE_MASTER_FROM_MANAGE, [req.body.master_id]);

        // Stream results back one row at a time
        // query.on('row', function(row) {
        //     results.push(row);
        // });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
           return res.redirect("/");
        });

    });

});



//              Post Edit Master Page
router.post('/editmaster', checkAuth, function(req, res) {

    // Grab data from http request
    var data = {
        master_id: req.body.master_id,
        quantity: req.body.quantity
    };
    console.log(req.body);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        
         client.query(CHECK_MASTER, [req.session.user_email,data.master_id], function(err, result) {
            
            if(err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }
            
            // console.log(result);
            var tempUserID = result.rows[0];

            console.log(tempUserID);
            if(!tempUserID){
                res.redirect('/editmaster?error=true');
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

         var query = client.query(REMOVE_MASTER_FROM_MASTERS, [data.master_id]);
            done();
    });
    
        pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

      
        var insert = SET_MASTER_TO_SLAVES;
        // query.on('end',function() {
            for(i =0; i < data.quantity; i++){
             insert += " ('"+i+"','"+data.master_id+"','0')";
             
             if(i != data.quantity-1){
                 insert+= ", ";
                 
                }

            } 
            client.query(insert);
            console.log(insert);
        
        res.redirect('/login');
        done();
        return;
    }); 
    
});
//========================================================//
//                       POSTS END                        //
//========================================================//


module.exports = router;
