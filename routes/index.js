var express = require('express');
var router = express.Router();

//========================================================//
//                       GETS START                       //
//========================================================//

//                     Get Index Page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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
router.post('/room?', function(req, res, next) {
  if(req.query.room_id){
    console.log("Post:"+req.query.room_id);
  }
  res.render('index', { title: 'Express' });
});

//========================================================//
//                       POSTS END                        //
//========================================================//


module.exports = router;
