package handlers

import (
	"database/sql"
	"log"
	"net/http"
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

	log.Printf("🔐 Login attempt for identifier: %s", req.Username)

	// Use enhanced login check that handles credential updates
	user, err := utils.EnhancedLoginCheck(req.Username, req.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("❌ User not found: %s", req.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		log.Printf("❌ Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Check if user is active
	if !user.IsActive {
		log.Printf("❌ User account inactive: %s", user.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is inactive"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		log.Printf("❌ Token generation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Update last login
	err = models.UpdateUserLastLogin(database.GetDB(), user.ID)
	if err != nil {
		log.Printf("⚠️ Could not update last login: %v", err)
	}

	log.Printf("✅ Login successful for user: %s, role: %s", user.Username, user.Role)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
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

func ResetPassword(c *gin.Context) {
	var req struct {
		UserID      int    `json:"user_id" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		log.Printf("❌ Reset password request bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	log.Printf("🔄 Password reset requested for user ID: %d", req.UserID)

	err := utils.ResetUserPassword(req.UserID, req.NewPassword)
	if err != nil {
		log.Printf("❌ Password reset failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	log.Printf("✅ Password reset successful for user ID: %d", req.UserID)
	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
} 

// func ResetPassword(c *gin.Context) {
// 	var req struct {
// 		UserID      int    `json:"user_id" binding:"required"`
// 		NewPassword string `json:"new_password" binding:"required"`
// 	}

// 	if err := c.BindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
// 		return
// 	}

// 	err := utils.ResetUserPassword(req.UserID, req.NewPassword)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
// }