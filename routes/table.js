var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');



router.post('/', function(req, res, next) {

 console.log(req);	
 var knex = require('knex')({
  client: req.body.connections,
  connection: {
    filename: "C:/sqlite/employeeinfo.sqlite"
  }
});
 
 knex.select().table('sqlite_master').where('type','table').then(function(rows){
 	console.log(rows);
 	res.render('table', {
 		rows: rows
 	});
 });
});

module.exports = router;
