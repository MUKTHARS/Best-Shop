package handlers

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"stock-management/database"
	"stock-management/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetSubcategories(c *gin.Context) {
    categoryIDStr := c.Param("id")
    categoryID, err := strconv.Atoi(categoryIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
        return
    }

    db := database.GetDB()
    subcategories, err := models.GetSubcategoriesByCategory(db, categoryID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, subcategories)
}

func CreateSubcategory(c *gin.Context) {
	var subcategory models.Subcategory
	if err := c.BindJSON(&subcategory); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := database.GetDB()
	if err := models.CreateSubcategory(db, &subcategory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the created subcategory with 201 status
	c.JSON(http.StatusCreated, gin.H{
		"message": "Subcategory created successfully",
		"data": subcategory,
	})
}

func GetProducts(c *gin.Context) {
	db := database.GetDB()
	products, err := models.GetAllProducts(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func CreateProduct(c *gin.Context) {
	
	var product models.Product
	if product.SKU == "" {
    // Generate a unique SKU using timestamp and random number
    timestamp := time.Now().Unix()
    random := rand.Intn(1000)
    product.SKU = fmt.Sprintf("SKU-%d-%d", timestamp, random)
}
	
	if err := c.BindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := database.GetDB()
	if err := models.CreateProduct(db, &product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, product)
}


func UpdateProduct(c *gin.Context) {
    productIDStr := c.Param("id")
    productID, err := strconv.Atoi(productIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    var req struct {
        ItemID            string  `json:"item_id"`
        ItemName          string  `json:"item_name"`
        CategoryID        *int    `json:"category_id"`  
        SubcategoryID     *int    `json:"subcategory_id"` 
        BrandID           *int    `json:"brand_id"`      
        Model             string  `json:"model"`
        Color             string  `json:"color"`
        Size              string  `json:"size"`
        Mrp               float64 `json:"mrp"`
        SellingPrice      float64 `json:"selling_price"`
        CostPrice         float64 `json:"cost_price"`
        Sku               string  `json:"sku"`
        Barcode           string  `json:"barcode"`
        Description       string  `json:"description"`
        LowStockThreshold int     `json:"low_stock_threshold"`
        IsActive          *bool   `json:"is_active"` // Change to pointer to handle false values properly
    }

    if err := c.BindJSON(&req); err != nil {
        log.Printf("❌ Update product request bind error: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    db := database.GetDB()

    // First, get the current product to preserve is_active if not provided
    var currentIsActive bool
    err = db.QueryRow("SELECT is_active FROM products WHERE id = ?", productID).Scan(&currentIsActive)
    if err != nil {
        log.Printf("❌ Error fetching current product: %v", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    // Use provided is_active value or keep current one
    isActive := currentIsActive
    if req.IsActive != nil {
        isActive = *req.IsActive
    }

    // First, verify that the brand_id exists in brands table if it's provided
    if req.BrandID != nil && *req.BrandID > 0 {
        var brandExists bool
        err := db.QueryRow("SELECT COUNT(*) > 0 FROM brands WHERE id = ? AND is_active = true", *req.BrandID).Scan(&brandExists)
        if err != nil {
            log.Printf("❌ Brand verification error: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
            return
        }
        if !brandExists {
            log.Printf("❌ Brand ID does not exist: %d", *req.BrandID)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Brand ID does not exist"})
            return
        }
    }

    // Verify category_id exists if provided
    if req.CategoryID != nil && *req.CategoryID > 0 {
        var categoryExists bool
        err := db.QueryRow("SELECT COUNT(*) > 0 FROM categories WHERE id = ? AND is_active = true", *req.CategoryID).Scan(&categoryExists)
        if err != nil {
            log.Printf("❌ Category verification error: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
            return
        }
        if !categoryExists {
            log.Printf("❌ Category ID does not exist: %d", *req.CategoryID)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Category ID does not exist"})
            return
        }
    }

    // Verify subcategory_id exists if provided
    if req.SubcategoryID != nil && *req.SubcategoryID > 0 {
        var subcategoryExists bool
        err := db.QueryRow("SELECT COUNT(*) > 0 FROM subcategories WHERE id = ? AND is_active = true", *req.SubcategoryID).Scan(&subcategoryExists)
        if err != nil {
            log.Printf("❌ Subcategory verification error: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subcategory ID"})
            return
        }
        if !subcategoryExists {
            log.Printf("❌ Subcategory ID does not exist: %d", *req.SubcategoryID)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Subcategory ID does not exist"})
            return
        }
    }

    // Build update query
    query := `UPDATE products SET 
        item_id = ?, item_name = ?, model = ?, color = ?, size = ?, 
        mrp = ?, selling_price = ?, cost_price = ?, sku = ?, barcode = ?, 
        description = ?, low_stock_threshold = ?, is_active = ?, updated_at = NOW()`

    var args []interface{}
    args = append(args, req.ItemID, req.ItemName, req.Model, req.Color, req.Size,
        req.Mrp, req.SellingPrice, req.CostPrice, req.Sku, req.Barcode,
        req.Description, req.LowStockThreshold, isActive) // Use the properly handled isActive value

    // Handle nullable foreign keys - only set if they exist and are valid
    if req.CategoryID != nil && *req.CategoryID > 0 {
        query += ", category_id = ?"
        args = append(args, *req.CategoryID)
    } else {
        query += ", category_id = NULL"
    }

    if req.SubcategoryID != nil && *req.SubcategoryID > 0 {
        query += ", subcategory_id = ?"
        args = append(args, *req.SubcategoryID)
    } else {
        query += ", subcategory_id = NULL"
    }

    if req.BrandID != nil && *req.BrandID > 0 {
        query += ", brand_id = ?"
        args = append(args, *req.BrandID)
    } else {
        query += ", brand_id = NULL"
    }

    query += " WHERE id = ?"
    args = append(args, productID)

    result, err := db.Exec(query, args...)
    if err != nil {
        log.Printf("❌ Product update error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    rowsAffected, _ := result.RowsAffected()
    if rowsAffected == 0 {
        log.Printf("❌ No product found with ID: %d", productID)
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    log.Printf("✅ Product updated successfully: ID %d, is_active: %t", productID, isActive)
    c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
}

func DeleteProduct(c *gin.Context) {
	productIDStr := c.Param("id")
	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	db := database.GetDB()
	if err := models.DeleteProduct(db, productID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}