package handlers

import (
	"net/http"
	"stock-management/database"
	"stock-management/models"

	"github.com/gin-gonic/gin"
)

func GetBrands(c *gin.Context) {
	db := database.GetDB()
	brands, err := models.GetAllBrands(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, brands)
}

func CreateBrand(c *gin.Context) {
	var brand models.Brand
	if err := c.BindJSON(&brand); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := database.GetDB()
	if err := models.CreateBrand(db, &brand); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, brand)
}