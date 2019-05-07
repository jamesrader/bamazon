const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors/safe");

var numberOfItems = 0;
var itemNums = [];

//var ui = new inquirer.ui.BottomBar();

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  listItems();
});

function listItems(message) {
  var query = "SELECT item_id, product_name, price FROM products";
  connection.query(query, function(err, res) {
    if (err) throw err;

    const table = new Table({
      head: [colors.cyan("ID"), colors.cyan("Product"), colors.cyan("Price")],
      colWidths: [5, 50, 14]
    });
    numberOfItems = res.length;
    for (var i = 0; i < numberOfItems; i++) {
      itemNums.push(parseInt(res[i].item_id));
      table.push([
        res[i].item_id,
        res[i].product_name,
        "$" + parseFloat(res[i].price).toFixed(2)
      ]);
    }
    console.clear();
    console.log(table.toString() +"\n");
    if (message){
      console.log(message);
    }
    purchase(numberOfItems);
  });
}

function purchase(numberOfItems) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "purchaseItem",
        message:
        "Enter the ID of the item you would like to purchase. ('x' to exit.)",
        validate: function(input){
          if (input === "x"){
            connection.end();
            process.exit();
          } else if (itemNums.indexOf(parseInt(input)) > -1){
            return true;
          } else {
            return colors.red("Please choose a valid item ID.");
          }
        }
      },
      {
        type: "input",
        name: "purchaseQuantity",
        message: "Enter the quantity of this item you would like to purchase.",
      }
    ])
    .then(function(answers) {

      var purchaseItem = answers.purchaseItem;
      var purchaseQuantity = parseInt(answers.purchaseQuantity);
      var price = 0;
      var sales = 0;
      connection.query(
        "SELECT stock_quantity, price, product_sales FROM products WHERE ?",
        { item_id: purchaseItem },
        function(error, results, fields) {
          if (error) {
            console.log(error);
            return;
          }
          //console.log(results);
          var availableQuantity = parseInt(results[0].stock_quantity);
          price = results[0].price;
          sales = results[0].product_sales
          if (purchaseQuantity > availableQuantity) {
            switch (availableQuantity) {
              case 0:
                console.log(
                  colors.red(
                    "\nSorry, but your order cannot be filled. That item is not stock. Please try again.\n"
                  )
                );
                //purchase(numberOfItems);
                break;

              case 1:
                console.log(
                  colors.red(
                    "\nSorry, but your order cannot be filled. There is only 1 of that item in stock. Please try again.\n"
                  )
                );
                //purchase(numberOfItems);
                break;

              default:
                console.log(
                  colors.red(
                    "\nSorry, but your order cannot be filled. There are only " +
                      availableQuantity +
                      " of that item in stock. Please try again.\n"
                  )
                );
            }
            purchase(numberOfItems);
          } else {
            var newQuantity = availableQuantity - purchaseQuantity;
            var newSales = sales + (purchaseQuantity * price);

            connection.query(
              "UPDATE products SET ? WHERE ?",
            [{ stock_quantity: newQuantity,
              product_sales: newSales },
              { item_id: purchaseItem,
                item_id: purchaseItem}],
              function(error, results, fields) {
                if (error) {
                  console.log(error);
                  return;
                }
                if (purchaseQuantity === 0){
                  var message = undefined;
                } else {
                var message = colors.green(
                  "\nThank you for your purchase of $" +
                    (parseInt(purchaseQuantity) * parseFloat(price)).toFixed(
                      2
                    ) +
                    "!\n"
                )}
                listItems(message);
              }
            );
          }
        }
      );
    });
}
