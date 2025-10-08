package handlers

import (
	"net/http"
	"log"
	"stock-management/database"
	"stock-management/models"
	"stock-management/utils"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.BindJSON(&req); err != nil {
		log.Printf("❌ Login request bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	log.Printf("🔐 Login attempt for user: %s", req.Username)

	db := database.GetDB()
	user, err := models.GetUserByUsername(db, req.Username)
	if err != nil {
		log.Printf("❌ User not found: %s, error: %v", req.Username, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	log.Printf("✅ User found: %s, role: %s", user.Username, user.Role)

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		log.Printf("❌ Invalid password for user: %s", req.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		log.Printf("❌ JWT generation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Update last login
	models.UpdateUserLastLogin(db, user.ID)

	// Remove password from response
	user.Password = ""

	log.Printf("✅ Login successful for user: %s", user.Username)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}
func GetProfile(c *gin.Context) {
	userID := c.GetInt("user_id")
	
	db := database.GetDB()
	user, err := models.GetUserByID(db, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}