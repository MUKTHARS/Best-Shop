package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"stock-management/database"
	"time"
	"github.com/gin-gonic/gin"
)

type SaleRequest struct {
	CustomerName    string  `json:"customer_name"`
	CustomerContact string  `json:"customer_contact"`
	TotalAmount     float64 `json:"total_amount"`
	DiscountAmount  float64 `json:"discount_amount"`
	TaxAmount       float64 `json:"tax_amount"`
	FinalAmount     float64 `json:"final_amount"`
	PaymentMethod   string  `json:"payment_method"`
	Items           []SaleItemRequest `json:"items"`
	Notes           string  `json:"notes"`
}

type SaleItemRequest struct {
	ProductID    int     `json:"product_id"`
	Quantity     int     `json:"quantity"`
	UnitPrice    float64 `json:"unit_price"`
	StockEntryID int     `json:"stock_entry_id"`
}

func CreateSale(c *gin.Context) {
	var saleReq SaleRequest
	if err := c.BindJSON(&saleReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	userID := c.GetInt("user_id")
	saleNumber := fmt.Sprintf("SALE-%d", time.Now().Unix())

	db := database.GetDB()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start transaction"})
		return
	}

	// Insert sale
	result, err := tx.Exec(`
		INSERT INTO sales (sale_number, customer_name, customer_contact, total_amount, discount_amount, tax_amount, final_amount, payment_method, sold_by, notes)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		saleNumber, saleReq.CustomerName, saleReq.CustomerContact, saleReq.TotalAmount, 
		saleReq.DiscountAmount, saleReq.TaxAmount, saleReq.FinalAmount, saleReq.PaymentMethod, 
		userID, saleReq.Notes)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create sale: " + err.Error()})
		return
	}

	saleID, _ := result.LastInsertId()

	// Insert sale items and update stock
	for _, item := range saleReq.Items {
		// Check stock availability
		var currentQuantity int
		err := tx.QueryRow("SELECT current_quantity FROM stock_entries WHERE id = ?", item.StockEntryID).Scan(&currentQuantity)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock entry"})
			return
		}

		if currentQuantity < item.Quantity {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
			return
		}

		// Insert sale item
		totalPrice := item.UnitPrice * float64(item.Quantity)
		_, err = tx.Exec(`
			INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price, stock_entry_id)
			VALUES (?, ?, ?, ?, ?, ?)`,
			saleID, item.ProductID, item.Quantity, item.UnitPrice, totalPrice, item.StockEntryID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add sale item: " + err.Error()})
			return
		}

		// Update stock quantity
		_, err = tx.Exec(`
			UPDATE stock_entries 
			SET current_quantity = current_quantity - ? 
			WHERE id = ?`,
			item.Quantity, item.StockEntryID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update stock: " + err.Error()})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":          saleID,
		"sale_number": saleNumber,
		"message":     "Sale completed successfully",
	})
}

func GetSales(c *gin.Context) {
	db := database.GetDB()
	
	rows, err := db.Query(`
		SELECT s.id, s.sale_number, s.customer_name, s.customer_contact, s.total_amount, 
		       s.discount_amount, s.tax_amount, s.final_amount, s.payment_method, 
		       s.payment_status, s.sold_by, s.sale_date, s.notes,
		       u.username as sold_by_name
		FROM sales s
		LEFT JOIN users u ON s.sold_by = u.id
		ORDER BY s.sale_date DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var sales []map[string]interface{}
	for rows.Next() {
		var sale struct {
			ID             int       `json:"id"`
			SaleNumber     string    `json:"sale_number"`
			CustomerName   string    `json:"customer_name"`
			CustomerContact string   `json:"customer_contact"`
			TotalAmount    float64   `json:"total_amount"`
			DiscountAmount float64   `json:"discount_amount"`
			TaxAmount      float64   `json:"tax_amount"`
			FinalAmount    float64   `json:"final_amount"`
			PaymentMethod  string    `json:"payment_method"`
			PaymentStatus  string    `json:"payment_status"`
			SoldBy         int       `json:"sold_by"`
			SaleDate       time.Time `json:"sale_date"`
			Notes          string    `json:"notes"`
			SoldByName     string    `json:"sold_by_name"`
		}
		
		if err := rows.Scan(
			&sale.ID, &sale.SaleNumber, &sale.CustomerName, &sale.CustomerContact,
			&sale.TotalAmount, &sale.DiscountAmount, &sale.TaxAmount, &sale.FinalAmount,
			&sale.PaymentMethod, &sale.PaymentStatus, &sale.SoldBy, &sale.SaleDate, &sale.Notes,
			&sale.SoldByName,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sales = append(sales, map[string]interface{}{
			"id":              sale.ID,
			"sale_number":     sale.SaleNumber,
			"customer_name":   sale.CustomerName,
			"customer_contact": sale.CustomerContact,
			"total_amount":    sale.TotalAmount,
			"discount_amount": sale.DiscountAmount,
			"tax_amount":      sale.TaxAmount,
			"final_amount":    sale.FinalAmount,
			"payment_method":  sale.PaymentMethod,
			"payment_status":  sale.PaymentStatus,
			"sold_by":         sale.SoldBy,
			"sale_date":       sale.SaleDate,
			"notes":           sale.Notes,
			"sold_by_name":    sale.SoldByName,
		})
	}

	c.JSON(http.StatusOK, sales)
}

func GetSaleDetails(c *gin.Context) {
	saleID := c.Param("id")
	
	db := database.GetDB()
	
	// Get sale info
	var sale struct {
		ID             int       `json:"id"`
		SaleNumber     string    `json:"sale_number"`
		CustomerName   string    `json:"customer_name"`
		CustomerContact string   `json:"customer_contact"`
		TotalAmount    float64   `json:"total_amount"`
		DiscountAmount float64   `json:"discount_amount"`
		TaxAmount      float64   `json:"tax_amount"`
		FinalAmount    float64   `json:"final_amount"`
		PaymentMethod  string    `json:"payment_method"`
		PaymentStatus  string    `json:"payment_status"`
		SoldBy         int       `json:"sold_by"`
		SaleDate       time.Time `json:"sale_date"`
		Notes          string    `json:"notes"`
		SoldByName     string    `json:"sold_by_name"`
	}
	
	err := db.QueryRow(`
		SELECT s.id, s.sale_number, s.customer_name, s.customer_contact, s.total_amount, 
		       s.discount_amount, s.tax_amount, s.final_amount, s.payment_method, 
		       s.payment_status, s.sold_by, s.sale_date, s.notes,
		       u.username as sold_by_name
		FROM sales s
		LEFT JOIN users u ON s.sold_by = u.id
		WHERE s.id = ?`, saleID).Scan(
		&sale.ID, &sale.SaleNumber, &sale.CustomerName, &sale.CustomerContact,
		&sale.TotalAmount, &sale.DiscountAmount, &sale.TaxAmount, &sale.FinalAmount,
		&sale.PaymentMethod, &sale.PaymentStatus, &sale.SoldBy, &sale.SaleDate, &sale.Notes,
		&sale.SoldByName,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Get sale items
	rows, err := db.Query(`
		SELECT si.id, si.product_id, si.quantity, si.unit_price, si.total_price,
		       p.item_id, p.item_name, p.model, p.color, p.size
		FROM sale_items si
		JOIN products p ON si.product_id = p.id
		WHERE si.sale_id = ?`, saleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var items []map[string]interface{}
	for rows.Next() {
		var item struct {
			ID        int     `json:"id"`
			ProductID int     `json:"product_id"`
			Quantity  int     `json:"quantity"`
			UnitPrice float64 `json:"unit_price"`
			TotalPrice float64 `json:"total_price"`
			ItemID    string  `json:"item_id"`
			ItemName  string  `json:"item_name"`
			Model     string  `json:"model"`
			Color     string  `json:"color"`
			Size      string  `json:"size"`
		}
		
		if err := rows.Scan(
			&item.ID, &item.ProductID, &item.Quantity, &item.UnitPrice, &item.TotalPrice,
			&item.ItemID, &item.ItemName, &item.Model, &item.Color, &item.Size,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		items = append(items, map[string]interface{}{
			"id":          item.ID,
			"product_id":  item.ProductID,
			"quantity":    item.Quantity,
			"unit_price":  item.UnitPrice,
			"total_price": item.TotalPrice,
			"item_id":     item.ItemID,
			"item_name":   item.ItemName,
			"model":       item.Model,
			"color":       item.Color,
			"size":        item.Size,
		})
	}

	response := map[string]interface{}{
		"sale":  sale,
		"items": items,
	}

	c.JSON(http.StatusOK, response)
}