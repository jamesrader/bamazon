const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors/safe");

var numberOfItems = 0;
var updateProduct = "";
var newQuantity = 0;
var availableQuantity = 0;
var inventoryItem = "";

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  chooseCommand();
});

function chooseCommand() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "command",
        choices: [
          { name: "View Products for Sale", value: 1 },
          { name: "View Low Inventory", value: 2 },
          { name: "Add to Inventory", value: 3 },
          { name: "Add New Product", value: 4 },
          { name: "Exit", value: 5 }
        ]
      }
    ])
    .then(function(answers) {

      switch (answers.command) {
        case 1:
          viewProducts("allItems");
          break;

        case 2:
          viewProducts("lowStock");
          break;

        case 3:
          viewProducts("addInventory");
          break;

        case 4:
          addProduct("newItem");
          break;

        case 5:
          connection.end();
      }
    });
}

function viewProducts(option, message) {
  var query =
    "SELECT item_id, product_name, price, stock_quantity FROM products";
  if (option === "lowStock") {
    query += " WHERE stock_quantity < 5";
  }
  connection.query(query, function(err, res) {
    if (err) throw err;

    const table = new Table({
      head: [
        colors.cyan("ID"),
        colors.cyan("Product"),
        colors.cyan("Price"),
        colors.cyan("Inventory")
      ],
      colWidths: [5, 50, 14, 14]
    });
    numberOfItems = res.length;
    for (var i = 0; i < numberOfItems; i++) {
      table.push([
        res[i].item_id,
        res[i].product_name,
        "$" + parseFloat(res[i].price).toFixed(2),
        res[i].stock_quantity
      ]);
    }
    console.clear();
    console.log(table.toString() + "\n");
    if (message) {
      console.log(message);
    }

    if (option === "addInventory") {
      addInventory(numberOfItems);
    } else if (option === "newItem") {
      newItem();
    } else {
      chooseCommand();
    }
  });
}

function addInventory(numberOfItems) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addInventoryItem",
        message:
          "Enter the ID of the item of which you would like to adjust the inventory (1 - " +
          numberOfItems +
          ")."
      }
    ])
    .then(function(answers) {
      inventoryItem = answers.addInventoryItem;
      connection.query(
        "SELECT product_name, stock_quantity FROM products WHERE ?",
        { item_id: inventoryItem },
        function(error, results, fields) {
          if (error) {
            console.log(error);
            return;
          }
          updateProduct = results[0].product_name;
          availableQuantity = parseInt(results[0].stock_quantity);
          updateProductQuantity();
        }
      );
    });
}

function updateProductQuantity() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addInventoryQuantity",
        //message: "Enter the new quantity TO BE ADDED."
        message:
          "Enter the quantity TO BE ADDED (OR SUBTRACTED) to the inventory of: " +
          updateProduct +
          "."
      }
    ])
    .then(function(answers) {
      var addQuantity = parseInt(answers.addInventoryQuantity);
      if (addQuantity === 0) {
        viewProducts();
      } else {
        newQuantity = availableQuantity + addQuantity;
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [{ stock_quantity: newQuantity }, { item_id: inventoryItem }],
          function(error, results, fields) {
            if (error) {
              console.log(error);
              return;
            }
            viewProducts(
              0,
              colors.green(
                updateProduct +
                  " inventory successfully updated to " +
                  newQuantity +
                  ".\n"
              )
            );
          }
        );          
      }
    });
}

function newItem(){
    
}
