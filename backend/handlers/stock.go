package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"stock-management/config"
	"stock-management/database"
	"stock-management/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetStockEntries(c *gin.Context) {
	db := database.GetDB()
	entries, err := models.GetAllStockEntries(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func CreateStockEntry(c *gin.Context) {
	var entry models.StockEntry
	if err := c.BindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userID := c.GetInt("user_id")
	entry.AddedBy = userID

	db := database.GetDB()
	if err := models.CreateStockEntry(db, &entry); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, entry)
}

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image uploaded"})
		return
	}

	// Check file size
	if file.Size > config.GetMaxFileSize() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	// Create uploads directory if not exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create upload directory"})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := strconv.FormatInt(int64(file.Size), 10) + "_" + strconv.FormatInt(makeTimestamp(), 10) + ext
	filepath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save image"})
		return
	}

	imageURL := "/uploads/" + filename
	c.JSON(http.StatusOK, gin.H{"imageUrl": imageURL})
}

func makeTimestamp() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}