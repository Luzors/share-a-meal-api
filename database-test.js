//get client 
const mysql = require('mysql2');

//Create connection to database
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'sharemeal',
    port: 3306
  });

//simple querry
connection.query(
    'SELECT `id`, `name` FROM `meal`',
    function (err, results, fields){
        if(err) {
            console.log(err.sqlMessage, ' ', err.errno, ' ', err.con)
        }
        
    }
)

  