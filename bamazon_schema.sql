DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
item_id INTEGER AUTO_INCREMENT NOT NULL PRIMARY KEY,
product_name VARCHAR(50) NOT NULL,
department_name VARCHAR(30) NOT NULL,
price DECIMAL(7,2) NOT NULL,
stock_quantity INTEGER(5) NOT NULL
);

INSERT into products (product_name, department_name, price, stock_quantity)
VALUES ("Alienware 17-inch Laptop", "computers", 1550.00, 2),
("HP 15-inch Laptop", "computers", 1199.99, 15),
("U of A Coding Bootcamp Mousepad", "computers", 4.50, 1000),
("Samsung Q80 65-inch 4K QLED TV", "tv/video", 2499.99, 3),
("Sony Streaming WiFi Blu-Ray Player", "tv/video", 69.99, 75),
("Microsoft Xbox One X 1TB Gaming Console", "video games", 449.00, 15),
("Micrsoft Xbox One Wireless Controller", "video games", 59.99, 20),
("Rocket League - Xbox One", "video games", 24.99, 5),
("Denon AVRS940H Receiver", "audio", 449.99, 1),
("AKG K240 MKII Stereo Headphones", "audio", 149.00, 4);


SELECT * FROM products;