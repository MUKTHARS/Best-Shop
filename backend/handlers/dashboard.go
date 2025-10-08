package handlers

import (
	"net/http"
	"stock-management/database"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	db := database.GetDB()
	stats := make(map[string]interface{})

	// Total products
	var totalProducts int
	db.QueryRow("SELECT COUNT(*) FROM products WHERE is_active = true").Scan(&totalProducts)
	stats["total_products"] = totalProducts

	// Total stock value
	var totalStockValue float64
	db.QueryRow("SELECT COALESCE(SUM(current_quantity * selling_price), 0) FROM stock_entries WHERE current_quantity > 0").Scan(&totalStockValue)
	stats["total_stock_value"] = totalStockValue

	// Low stock items
	var lowStockItems int
	db.QueryRow("SELECT COUNT(DISTINCT product_id) FROM stock_entries WHERE current_quantity < 10 AND current_quantity > 0").Scan(&lowStockItems)
	stats["low_stock_items"] = lowStockItems

	// Out of stock items
	var outOfStockItems int
	db.QueryRow("SELECT COUNT(DISTINCT product_id) FROM stock_entries WHERE current_quantity = 0").Scan(&outOfStockItems)
	stats["out_of_stock_items"] = outOfStockItems

	// Today's sales
	var todaySales float64
	db.QueryRow("SELECT COALESCE(SUM(final_amount), 0) FROM sales WHERE DATE(sale_date) = CURDATE()").Scan(&todaySales)
	stats["today_sales"] = todaySales

	// Monthly sales
	var monthlySales float64
	db.QueryRow("SELECT COALESCE(SUM(final_amount), 0) FROM sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())").Scan(&monthlySales)
	stats["monthly_sales"] = monthlySales

	c.JSON(http.StatusOK, stats)
}