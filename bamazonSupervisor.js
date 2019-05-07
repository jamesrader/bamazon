const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");
const colors = require("colors/safe");

var numberOfItems = 0;
var updateProduct = "";
var newQuantity = 0;
var availableQuantity = 0;
var inventoryItem = "";
var itemToDelete = 0;

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
          { name: "View Product Sales by Department", value: 1 },
          { name: "Create New Department", value: 2 },
          { name: "Exit", value: 3 }
        ]
      }
    ])
    .then(function(answers) {
      switch (answers.command) {
        case 1:
          viewDepartments();
          break;

        case 2:
          viewDepartments("newDepartment");
          break;

        case 3:
          connection.end();
          process.exit();
      }
    });
}

function viewDepartments(option, message) {
  //var query = "SELECT d.department_id, d.department_name, d.overhead_costs, SUM(p.product_sales) AS product_sales, (SUM(p.product_sales) - d.overhead_costs) AS profit FROM departments d LEFT JOIN products p ON d.department_name = p.department_name GROUP BY d.department_name ORDER BY department_id ASC";

  var query = "SELECT d.department_id, d.department_name, d.overhead_costs, ";
  query += "SUM(p.product_sales) AS product_sales, ";
  query += "(SUM(p.product_sales) - d.overhead_costs) AS profit ";
  query += "FROM departments d ";
  query += "LEFT JOIN products p ON d.department_name = p.department_name ";
  query += "GROUP BY d.department_name ORDER BY department_id ASC";

  connection.query(query, function(err, res) {
    if (err) throw err;
    const table = new Table({
      head: [
        colors.cyan("ID"),
        colors.cyan("Department"),
        colors.cyan("Overhead Costs"),
        colors.cyan("Sales"),
        colors.cyan("Profit")
      ],
      colWidths: [5, 20, 20, 20, 20]
    });
    numberOfItems = res.length;
    for (var i = 0; i < numberOfItems; i++) {
        var profit = parseFloat(res[i].profit).toFixed(2);

        if (profit < 0) {
            var profitString = colors.red("-$" + profit.toString().slice(1));
        } else {
            profitString = colors.green(profit.toString());
        }

      table.push([
        res[i].department_id,
        res[i].department_name,
        "$" + parseFloat(res[i].overhead_costs).toFixed(2),
        "$" + parseFloat(res[i].product_sales).toFixed(2),
        //"$" + parseFloat(res[i].profit).toFixed(2)
        profitString
      ]);
    }
    console.clear();
    console.log(table.toString() + "\n");
    if (message) {
      console.log(message);
    }

    if (option === "newDepartment") {
      newDepartment();
    } else {
      chooseCommand();
    }
  });
}

function newDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDepartment",
        message: "Enter the name of the new department."
      },
      {
        type: "input",
        name: "newCosts",
        message: "Enter the overhead costs for this department."
      }
    ])
    .then(function(answers) {
      var newItem = answers.newItem;
      var newDepartment = "Other";
      var newPrice = parseFloat(answers.newPrice.replace("$", "")).toFixed(2);
      var newQuantity = parseInt(answers.newQuantity);
      connection.query(
        "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?)",
        [[newItem, newDepartment, newPrice, newQuantity]],
        function(error, results, fields) {
          if (error) {
            console.log(error);
            return;
          }
          viewProducts(0, colors.green(newItem + " added successfully!\n"));
        }
      );
    });
}