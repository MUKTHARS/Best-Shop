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