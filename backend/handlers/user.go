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

func Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
		Role     string `json:"role" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		log.Printf("❌ Register request bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := database.GetDB()

	// Check if user already exists
	existingUser, _ := models.GetUserByUsername(db, req.Username)
	if existingUser != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("❌ Password hashing error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	// Create user
	query := `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, req.Username, req.Email, hashedPassword, req.Role)
	if err != nil {
		log.Printf("❌ User creation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	userID, _ := result.LastInsertId()

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user_id": userID,
	})
}

func GetUsers(c *gin.Context) {
	db := database.GetDB()

	query := `SELECT id, username, email, role, is_active, last_login, created_at, updated_at 
	          FROM users WHERE is_active = true ORDER BY created_at DESC`
	
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("❌ Get users error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch users"})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		var lastLogin sql.NullTime
		
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Role,
			&user.IsActive,
			&lastLogin,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			log.Printf("❌ User scan error: %v", err)
			continue
		}

		if lastLogin.Valid {
			user.LastLogin = &lastLogin.Time
		}

		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}
