package handlers

import (
	"fmt"
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

	c.JSON(http.StatusCreated, subcategory)
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

	// Use a flexible struct that can handle NULL values
	var updateData struct {
		ItemID           string  `json:"item_id"`
		ItemName         string  `json:"item_name"`
		CategoryID       *int    `json:"category_id"`       // Use pointer to handle NULL
		SubcategoryID    *int    `json:"subcategory_id"`    // Use pointer to handle NULL  
		BrandID          *int    `json:"brand_id"`          // Use pointer to handle NULL
		Model            string  `json:"model"`
		Color            string  `json:"color"`
		Size             string  `json:"size"`
		MRP              float64 `json:"mrp"`
		SellingPrice     float64 `json:"selling_price"`
		CostPrice        float64 `json:"cost_price"`
		SKU              string  `json:"sku"`
		Barcode          string  `json:"barcode"`
		ImageURL         string  `json:"image_url"`
		Description      string  `json:"description"`
		LowStockThreshold int    `json:"low_stock_threshold"`
	}

	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Get the existing product first to preserve foreign key relationships
	db := database.GetDB()
	existingProduct, err := models.GetProductByID(db, productID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Create updated product with preserved foreign keys
	updatedProduct := models.Product{
		ID:               productID,
		ItemID:           updateData.ItemID,
		ItemName:         updateData.ItemName,
		CategoryID:       existingProduct.CategoryID, // Preserve existing category
		SubcategoryID:    existingProduct.SubcategoryID, // Preserve existing subcategory
		BrandID:          existingProduct.BrandID, // Preserve existing brand
		Model:            updateData.Model,
		Color:            updateData.Color,
		Size:             updateData.Size,
		MRP:              updateData.MRP,
		SellingPrice:     updateData.SellingPrice,
		CostPrice:        updateData.CostPrice,
		SKU:              updateData.SKU,
		Barcode:          updateData.Barcode,
		ImageURL:         updateData.ImageURL,
		Description:      updateData.Description,
		LowStockThreshold: updateData.LowStockThreshold,
		IsActive:         existingProduct.IsActive,
	}

	// Only update foreign keys if new values are provided
	if updateData.CategoryID != nil {
		updatedProduct.CategoryID = *updateData.CategoryID
	}
	if updateData.SubcategoryID != nil {
		updatedProduct.SubcategoryID = *updateData.SubcategoryID
	}
	if updateData.BrandID != nil {
		updatedProduct.BrandID = *updateData.BrandID
	}

	if err := models.UpdateProduct(db, &updatedProduct); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedProduct)
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