SELECT d.department_id, d.department_name, d.overhead_costs,
SUM(p.product_sales) AS product_sales,
(SUM(p.product_sales) - d.overhead_costs) AS profit
FROM departments d
LEFT JOIN products p
ON d.department_name = p.department_name
GROUP BY d.department_name
ORDER BY department_id ASC;