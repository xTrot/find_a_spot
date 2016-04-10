var express = require('express');
var router = express.Router();

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
router.post('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});


//                     Post Register Page
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

//========================================================//
//                       POSTS END                        //
//========================================================//


module.exports = router;
