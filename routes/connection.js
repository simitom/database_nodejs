var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var pg =require('pg');
var bodyParser = require('body-parser');
var cache = require('../models/cache');
var exphbs  = require('express3-handlebars');


/* GET tablenames listing. */
router.post('/', function(req, res, next) {

     console.log(req);

     if(req.body.connections=='sqlite3'){
        var knex = require('knex')({
            client: req.body.connections,
            connection: {
                filename: "C:/sqlite/"+ req.body.database_name +".sqlite"
            }
        });

     cache.connectionObj=knex;
    } 

    else if(req.body.connections=='pg'){

        var pg = require('knex')({
            client: req.body.connections ,
            connection: {
            host: "localhost",
            port:"5432",
            user: "postgres",
            password: "1234",
            database:req.body.database_name
            }, 
            searchPath: 'knex,public'
        });

    cache.connectionObj=pg;
    }


     cache.dbname= req.body.database_name;
     cache.db= req.body.connections;


    if(req.body.connections=='sqlite3'){
     knex.select().table('sqlite_master').where('type','table').then(function(rows){
        console.log(rows);
        cache.tables= rows;
        res.render('table', {
            tablenames: rows,
            db_name: cache.dbname,
            db_connection: cache.db,
            title: 'Table list'
        });
     });
    }

    else if(req.body.connections=='pg'){
        pg.select('table_name as tbl_name').table('information_schema.tables').where('table_schema','public').then(function(rows){
        console.log(rows);
        cache.tables= rows;
        res.render('table', {
            tablenames: rows,
            db_name: cache.dbname,
            db_connection: cache.db,
            title: 'Table list'
        });
        });
    }
});


//get table details
router.get('/details/:tbl', function(req, res, next) {

     console.log(req);	

     var knex= cache.connectionObj;

     knex.select('*').from(req.params.tbl).then(function(rows){
        console.log(rows);

    //get primary key details
     if (req.params.tbl=='student'){
        primary_key='id';
     } 	
    else if (req.params.tbl=='employee'){
        primary_key='Employee_id';

     } else if (req.params.tbl=='employee_details'){
        primary_key='Employee_id';
     }
    console.log(primary_key);


    cache.pkcol= primary_key;
    cache.current_table= req.params.tbl;

        res.render('details', {
            rows: rows,                                                                                                                        
            db_name: cache.dbname,
            db_connection: cache.db,
            tablenames: cache.tables,
            current_table: req.params.tbl,
            title: 'Table Details',
            pkcol: primary_key
        });
     });   
});


//view individual records
router.get('/views/:pkval', function(req, res, next){
    console.log(req);	

    var knex= cache.connectionObj;
    knex.select('*').from(cache.current_table).where(cache.pkcol,req.params.pkval).then(function(rows){
 		console.log(rows);
 		res.render('views', {
 			rows: rows,
 			db_name: cache.dbname,
 			title: 'Table: '+cache.current_table,
            tablenames: cache.tables
 		});
 	});   
 });


//delete the records  
router.get('/delete/:pkval', function(req, res, next){
    console.log(req);	

    var knex= cache.connectionObj;
    knex.delete('*').from(cache.current_table).where(cache.pkcol,req.params.pkval).then(function(rows){
 		console.log(rows);
 		res.redirect('/connection/details/' + cache.current_table);
 	});   
 });
 

//getting edit form
router.get('/edit/:pkval', function(req, res, next){
    console.log(req);	

    var knex= cache.connectionObj;
    knex.select('*').from(cache.current_table).where(cache.pkcol,req.params.pkval).then(function(rows){
 		console.log(rows);
 		res.render('edit', {
 			rows: rows,
 			db_name: cache.dbname,
 			title: 'Table: '+cache.current_table,
 			pkval: req.params.pkval,
 			pkcol: primary_key,
            tablenames: cache.tables

 		});
 	});   
 });


//post the edit form
router.post('/edit/:pkval', function(req, res, next){
    console.log(req.body.tablerow);	
         
    var knex= cache.connectionObj;
        console.log(knex(cache.current_table)
        .where(cache.pkcol, '=', req.params.pkval)
        .update(req.body.tablerow).toString());

        knex(cache.current_table)
        .where(cache.pkcol, '=', req.params.pkval)
        .update(req.body.tablerow).then(function(rows){
         console.log(rows);
            
        knex.select('*').from(cache.current_table).where(cache.pkcol,req.params.pkval).then(function(rows){
            console.log(rows);
 		
            res.redirect('/connection/details/' + cache.current_table);
        });  
        });
 });


//getting add form
router.get('/add', function(req, res, next){
    console.log(req);	

    var knex= cache.connectionObj;
    knex.select('*').from(cache.current_table).limit(1).then(function(rows){
 		console.log(rows);
 		res.render('add', {
 			rows: rows,
 			db_name: cache.dbname,
 			title: 'Table: '+cache.current_table,
 			pkval: req.params.pkval,
 			pkcol: primary_key,
            tablenames: cache.tables
 		});
 	});   
 });


//post the add form
router.post('/add', function(req, res, next){
    console.log(req.body.tablerow);	
    
    var knex= cache.connectionObj;
    knex(cache.current_table).insert(req.body.tablerow).limit(1).then(function(rows){
 		console.log(rows);
 		
        res.redirect('/connection/details/' + cache.current_table);
 	});   
 });




module.exports = router;
