const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as id: " + connection.threadId);
    listItems();
  });

  function listItems(){
    var query = "SELECT item_id, product_name, price FROM products";
    connection.query(query, function(err, res) {
        if (err) throw err;

        const table = new Table({
            head: ['ID', 'Product', 'Price'],
            colWidths: [5, 50, 14]
        });
      for (var i = 0; i < res.length; i++) {
        //console.log("ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Price: $" + res[i].price);
        table.push([res[i].item_id, res[i].product_name, "$" + parseFloat(res[i].price).toFixed(2)]);
      }
      console.log(table.toString());
  });
  connection.end();
}