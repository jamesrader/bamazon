const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('cli-table');
const colors = require('colors/safe');

var numberOfItems = 0;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    //console.log("Connected as id: " + connection.threadId);
    listItems();
  });

  function listItems(){
    var query = "SELECT item_id, product_name, price FROM products";
    connection.query(query, function(err, res) {
        if (err) throw err;

        const table = new Table({
            head: [colors.cyan('ID'), colors.cyan('Product'), colors.cyan('Price')],
            colWidths: [5, 50, 14]
        });
        numberOfItems = res.length
      for (var i = 0; i < numberOfItems; i++) {
        //console.log("ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Price: $" + res[i].price);
        table.push([res[i].item_id, res[i].product_name, "$" + parseFloat(res[i].price).toFixed(2)]);
      }
      console.clear();
      console.log(table.toString());
      purchase(numberOfItems);
  });


}

function purchase(numberOfItems){
    inquirer
      .prompt([
        {
          type: "input",
          name: "purchaseItem",
          message: "Enter the ID of the item you would like to purchase (1 - " + numberOfItems + ")."
        },
        {
            type: "input",
            name: "purchaseQuantity",
            message: "Enter the quantity of this item you would like to purchase."
        }
      ])
      .then(function(answers) {
        var purchaseItem = answers.purchaseItem;
        var purchaseQuantity = answers.purchaseQuantity;
        connection.query(
          "SELECT stock_quantity FROM products WHERE ?",
          {"item_id": purchaseItem},
          function(error, results, fields) {
            if (error) {
              console.log(error);
              return;
            }
            console.log(results);
            if (purchaseQuantity > results[0].stock_quantity){
                console.log(colors.red("Sorry, but there is not enough available product to fill your order. Please try again."));
                purchase();
            } else {
            connection.end();
            }
          }
        );
      });
}